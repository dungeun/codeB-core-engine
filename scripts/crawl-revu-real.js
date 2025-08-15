const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const http = require('http');

// 이미지 다운로드 함수
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = require('fs').createWriteStream(filepath);
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(filepath);
      });
    }).on('error', (err) => {
      require('fs').unlink(filepath, () => {});
      reject(err);
    });
  });
}

async function crawlRevu() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    // User Agent 설정
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    console.log('1. 카테고리 페이지 접속 중...');
    await page.goto('https://www.revu.net/category/%EC%A0%9C%ED%92%88', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    // 스크롤하여 더 많은 콘텐츠 로드
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForTimeout(2000);

    console.log('2. 캠페인 목록 수집 중...');
    
    // 캠페인 링크 수집
    const campaignLinks = await page.evaluate(() => {
      const links = [];
      const items = document.querySelectorAll('a[href*="/campaign/"]');
      
      items.forEach(item => {
        const href = item.getAttribute('href');
        if (href && href.includes('/campaign/') && !links.includes(href)) {
          // 썸네일 찾기
          const img = item.querySelector('img') || item.closest('article')?.querySelector('img');
          const title = item.querySelector('h3, h4, .title') || item.closest('article')?.querySelector('h3, h4, .title');
          
          links.push({
            url: href.startsWith('http') ? href : `https://www.revu.net${href}`,
            thumbnail: img ? (img.src || img.dataset.src) : '',
            title: title ? title.textContent.trim() : ''
          });
        }
      });
      
      return links.slice(0, 50); // 최대 50개
    });

    console.log(`${campaignLinks.length}개의 캠페인 발견\n`);

    // 이미지 저장 디렉토리 생성
    const imageDir = path.join(__dirname, '../public/crawled-images');
    await fs.mkdir(imageDir, { recursive: true });

    const campaigns = [];
    
    // 각 캠페인 상세 정보 수집
    for (let i = 0; i < campaignLinks.length; i++) {
      const campaign = campaignLinks[i];
      console.log(`[${i + 1}/${campaignLinks.length}] 크롤링: ${campaign.url}`);
      
      try {
        await page.goto(campaign.url, {
          waitUntil: 'networkidle2',
          timeout: 30000
        });
        
        await page.waitForTimeout(1000);
        
        // 상세 정보 추출
        const details = await page.evaluate(() => {
          const data = {};
          
          // 제목
          const titleEl = document.querySelector('h1, h2.title, .campaign-title');
          data.title = titleEl ? titleEl.textContent.trim() : '';
          
          // 브랜드
          const brandEl = document.querySelector('.brand, .company, [class*="brand"]');
          data.brand = brandEl ? brandEl.textContent.trim() : '';
          
          // 설명
          const descEl = document.querySelector('.description, .content, [class*="description"]');
          data.description = descEl ? descEl.textContent.trim() : '';
          
          // 이미지 수집
          data.images = [];
          const imgEls = document.querySelectorAll('.product-image img, .campaign-image img, .detail img, main img');
          imgEls.forEach(img => {
            const src = img.src || img.dataset.src;
            if (src && !src.includes('placeholder') && !data.images.includes(src)) {
              data.images.push(src);
            }
          });
          
          // 캠페인 정보
          data.info = {};
          const infoEls = document.querySelectorAll('.info-item, .campaign-info li, [class*="info"] li');
          infoEls.forEach(el => {
            const text = el.textContent.trim();
            if (text.includes('모집인원')) data.info.participants = text;
            if (text.includes('신청기간')) data.info.period = text;
            if (text.includes('발표')) data.info.announcement = text;
            if (text.includes('플랫폼')) data.info.platform = text;
            if (text.includes('카테고리')) data.info.category = text;
          });
          
          return data;
        });
        
        // 썸네일 다운로드
        let localThumbnail = campaign.thumbnail;
        if (campaign.thumbnail) {
          try {
            const thumbPath = path.join(imageDir, `campaign_${i + 1}_thumb.jpg`);
            await downloadImage(campaign.thumbnail, thumbPath);
            localThumbnail = `/crawled-images/campaign_${i + 1}_thumb.jpg`;
            console.log(`  ✓ 썸네일 다운로드 완료`);
          } catch (err) {
            console.log(`  ✗ 썸네일 다운로드 실패: ${err.message}`);
          }
        }
        
        // 상세 이미지 다운로드 (최대 3개)
        const localImages = [];
        for (let j = 0; j < Math.min(details.images.length, 3); j++) {
          try {
            const imgPath = path.join(imageDir, `campaign_${i + 1}_image_${j + 1}.jpg`);
            await downloadImage(details.images[j], imgPath);
            localImages.push(`/crawled-images/campaign_${i + 1}_image_${j + 1}.jpg`);
            console.log(`  ✓ 이미지 ${j + 1} 다운로드 완료`);
          } catch (err) {
            console.log(`  ✗ 이미지 ${j + 1} 다운로드 실패: ${err.message}`);
          }
        }
        
        campaigns.push({
          id: i + 1,
          url: campaign.url,
          thumbnail: localThumbnail,
          title: details.title || campaign.title,
          brand: details.brand,
          description: details.description,
          images: localImages,
          info: details.info,
          crawledAt: new Date().toISOString()
        });
        
        // 요청 간격
        await page.waitForTimeout(2000);
        
      } catch (error) {
        console.log(`  ✗ 크롤링 실패: ${error.message}`);
        campaigns.push({
          id: i + 1,
          url: campaign.url,
          thumbnail: campaign.thumbnail,
          title: campaign.title,
          error: error.message,
          crawledAt: new Date().toISOString()
        });
      }
    }
    
    // 결과 저장
    const outputPath = path.join(__dirname, '../public/crawled-campaigns.json');
    await fs.writeFile(outputPath, JSON.stringify(campaigns, null, 2));
    
    console.log(`\n✅ 크롤링 완료!`);
    console.log(`📁 데이터 저장: ${outputPath}`);
    console.log(`🖼️  이미지 저장: ${imageDir}`);
    console.log(`📊 총 ${campaigns.length}개 캠페인 (성공: ${campaigns.filter(c => !c.error).length})`);
    
  } catch (error) {
    console.error('크롤링 오류:', error);
  } finally {
    await browser.close();
  }
}

// 실행
if (require.main === module) {
  crawlRevu()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { crawlRevu };