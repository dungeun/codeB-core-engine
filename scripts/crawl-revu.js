const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

// 이미지 다운로드를 위한 함수
async function downloadImage(url, filename) {
  try {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    const outputPath = path.join(__dirname, '../public/crawled-images', filename);
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, Buffer.from(buffer));
    return `/crawled-images/${filename}`;
  } catch (error) {
    console.error(`이미지 다운로드 실패: ${url}`, error);
    return url;
  }
}

async function crawlRevuCampaigns() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // 카테고리 페이지 접속
    console.log('카테고리 페이지 접속 중...');
    await page.goto('https://www.revu.net/category/%EC%A0%9C%ED%92%88', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // 페이지 로딩 대기
    await page.waitForSelector('.campaign-item', { timeout: 10000 });
    
    // 캠페인 목록 가져오기
    console.log('캠페인 목록 수집 중...');
    const campaigns = await page.evaluate(() => {
      const items = document.querySelectorAll('.campaign-item');
      const campaignData = [];
      
      // 최대 50개까지만
      const maxItems = Math.min(items.length, 50);
      
      for (let i = 0; i < maxItems; i++) {
        const item = items[i];
        const link = item.querySelector('a');
        const thumbnail = item.querySelector('img');
        const title = item.querySelector('.campaign-title, h3, h4');
        const brand = item.querySelector('.brand-name, .company');
        
        if (link && link.href) {
          campaignData.push({
            url: link.href,
            thumbnail: thumbnail ? thumbnail.src : '',
            title: title ? title.textContent.trim() : '',
            brand: brand ? brand.textContent.trim() : ''
          });
        }
      }
      
      return campaignData;
    });

    console.log(`${campaigns.length}개의 캠페인 발견`);
    
    // 상세 페이지 크롤링
    const detailedCampaigns = [];
    
    for (let i = 0; i < campaigns.length; i++) {
      const campaign = campaigns[i];
      console.log(`[${i + 1}/${campaigns.length}] ${campaign.title} 크롤링 중...`);
      
      try {
        // 상세 페이지 접속
        await page.goto(campaign.url, {
          waitUntil: 'networkidle2',
          timeout: 30000
        });
        
        // 잠시 대기
        await page.waitForTimeout(1000);
        
        // 상세 정보 추출
        const details = await page.evaluate(() => {
          // 제목
          const titleEl = document.querySelector('h1, .campaign-title, .title');
          const title = titleEl ? titleEl.textContent.trim() : '';
          
          // 브랜드명
          const brandEl = document.querySelector('.brand-name, .company-name, .brand');
          const brand = brandEl ? brandEl.textContent.trim() : '';
          
          // 설명
          const descEl = document.querySelector('.campaign-description, .description, .content');
          const description = descEl ? descEl.textContent.trim() : '';
          
          // 이미지들
          const images = [];
          const imageEls = document.querySelectorAll('.campaign-images img, .product-images img, .detail-images img');
          imageEls.forEach(img => {
            if (img.src && !img.src.includes('placeholder')) {
              images.push(img.src);
            }
          });
          
          // 캠페인 정보
          const infoItems = {};
          const infoEls = document.querySelectorAll('.campaign-info li, .info-item, .detail-item');
          infoEls.forEach(el => {
            const text = el.textContent.trim();
            if (text.includes('모집인원')) infoItems.participants = text;
            if (text.includes('신청기간')) infoItems.period = text;
            if (text.includes('발표일')) infoItems.announcement = text;
            if (text.includes('카테고리')) infoItems.category = text;
            if (text.includes('플랫폼')) infoItems.platform = text;
            if (text.includes('미션')) infoItems.mission = text;
          });
          
          // 제공 내역
          const provideItems = [];
          const provideEls = document.querySelectorAll('.provide-list li, .provide-item');
          provideEls.forEach(el => {
            const text = el.textContent.trim();
            if (text) provideItems.push(text);
          });
          
          return {
            title,
            brand,
            description,
            images,
            info: infoItems,
            provides: provideItems
          };
        });
        
        // 이미지 다운로드
        const downloadedImages = [];
        for (let j = 0; j < Math.min(details.images.length, 5); j++) {
          const imageUrl = details.images[j];
          const filename = `campaign_${i + 1}_image_${j + 1}.jpg`;
          const localPath = await downloadImage(imageUrl, filename);
          downloadedImages.push(localPath);
        }
        
        // 썸네일 다운로드
        let thumbnailPath = campaign.thumbnail;
        if (campaign.thumbnail) {
          const thumbnailFilename = `campaign_${i + 1}_thumbnail.jpg`;
          thumbnailPath = await downloadImage(campaign.thumbnail, thumbnailFilename);
        }
        
        detailedCampaigns.push({
          id: i + 1,
          url: campaign.url,
          thumbnail: thumbnailPath,
          ...details,
          images: downloadedImages,
          crawledAt: new Date().toISOString()
        });
        
        // 요청 간격 두기
        await page.waitForTimeout(2000);
        
      } catch (error) {
        console.error(`캠페인 크롤링 실패: ${campaign.url}`, error);
        detailedCampaigns.push({
          id: i + 1,
          url: campaign.url,
          thumbnail: campaign.thumbnail,
          title: campaign.title,
          brand: campaign.brand,
          error: error.message,
          crawledAt: new Date().toISOString()
        });
      }
    }
    
    // 결과 저장
    const outputPath = path.join(__dirname, '../public/crawled-campaigns.json');
    await fs.writeFile(outputPath, JSON.stringify(detailedCampaigns, null, 2));
    
    console.log(`\n크롤링 완료! ${detailedCampaigns.length}개의 캠페인 데이터 저장됨`);
    console.log(`저장 위치: ${outputPath}`);
    
    // 요약 출력
    console.log('\n--- 크롤링 요약 ---');
    console.log(`총 캠페인 수: ${detailedCampaigns.length}`);
    console.log(`성공: ${detailedCampaigns.filter(c => !c.error).length}`);
    console.log(`실패: ${detailedCampaigns.filter(c => c.error).length}`);
    
    return detailedCampaigns;
    
  } catch (error) {
    console.error('크롤링 중 오류 발생:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

// 실행
if (require.main === module) {
  crawlRevuCampaigns()
    .then(() => {
      console.log('\n크롤링 프로세스 완료');
      process.exit(0);
    })
    .catch(error => {
      console.error('크롤링 실패:', error);
      process.exit(1);
    });
}

module.exports = { crawlRevuCampaigns };