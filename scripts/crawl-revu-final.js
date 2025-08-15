const puppeteer = require('puppeteer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// 이미지 다운로드 함수
async function downloadImage(url, filepath) {
  try {
    const writer = fs.createWriteStream(filepath);
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.revu.net/'
      }
    });
    
    response.data.pipe(writer);
    
    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        const stats = fs.statSync(filepath);
        console.log(`    ✓ 이미지 다운로드: ${path.basename(filepath)} (${(stats.size / 1024).toFixed(1)}KB)`);
        resolve(filepath);
      });
      writer.on('error', reject);
    });
  } catch (error) {
    console.log(`    ✗ 이미지 다운로드 실패: ${error.message}`);
    return null;
  }
}

async function crawlRevuNet() {
  console.log('🚀 revu.net 크롤링 시작...\n');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu'
    ]
  });

  try {
    const page = await browser.newPage();
    
    // User Agent 설정
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // 이미지 디렉토리 생성
    const imageDir = path.join(__dirname, '../public/crawled-images');
    if (fs.existsSync(imageDir)) {
      fs.rmSync(imageDir, { recursive: true });
    }
    fs.mkdirSync(imageDir, { recursive: true });
    
    console.log('📋 카테고리 페이지 접속 중...');
    
    // 카테고리 페이지로 이동
    await page.goto('https://www.revu.net/campaign', {
      waitUntil: 'networkidle0',
      timeout: 60000
    });
    
    // 페이지 로드 대기
    await page.waitForTimeout(3000);
    
    // 스크롤하여 더 많은 콘텐츠 로드
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForTimeout(2000);
    
    console.log('🔍 캠페인 목록 수집 중...');
    
    // 캠페인 링크 수집
    const campaignData = await page.evaluate(() => {
      const campaigns = [];
      
      // 다양한 선택자 시도
      const selectors = [
        'a[href*="/campaign/"]',
        '.campaign-item a',
        '.campaign-list a',
        'article a',
        '.item a',
        '[class*="campaign"] a'
      ];
      
      let links = [];
      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          links = elements;
          console.log(`Found ${elements.length} links with selector: ${selector}`);
          break;
        }
      }
      
      // 링크 처리
      const uniqueUrls = new Set();
      links.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.includes('/campaign/') && !href.includes('#')) {
          const url = href.startsWith('http') ? href : `https://www.revu.net${href}`;
          
          if (!uniqueUrls.has(url)) {
            uniqueUrls.add(url);
            
            // 썸네일 찾기
            const img = link.querySelector('img') || 
                       link.parentElement?.querySelector('img') ||
                       link.closest('.campaign-item')?.querySelector('img');
            
            // 제목 찾기
            const title = link.querySelector('h3, h4, .title, [class*="title"]') ||
                         link.parentElement?.querySelector('h3, h4, .title, [class*="title"]') ||
                         link.closest('.campaign-item')?.querySelector('h3, h4, .title, [class*="title"]');
            
            campaigns.push({
              url: url,
              thumbnail: img ? (img.src || img.getAttribute('data-src') || '') : '',
              title: title ? title.textContent.trim() : ''
            });
          }
        }
      });
      
      return campaigns.slice(0, 50); // 최대 50개
    });
    
    console.log(`✅ ${campaignData.length}개의 캠페인 발견\n`);
    
    if (campaignData.length === 0) {
      console.log('⚠️  캠페인을 찾을 수 없습니다. 다른 방법 시도...');
      
      // 대체 URL 시도
      await page.goto('https://www.revu.net/', {
        waitUntil: 'networkidle0',
        timeout: 60000
      });
      
      await page.waitForTimeout(2000);
    }
    
    const campaigns = [];
    
    // 각 캠페인 상세 정보 크롤링
    for (let i = 0; i < Math.min(campaignData.length, 50); i++) {
      const campaign = campaignData[i];
      console.log(`\n[${i + 1}/${campaignData.length}] ${campaign.url}`);
      
      try {
        await page.goto(campaign.url, {
          waitUntil: 'networkidle0',
          timeout: 30000
        });
        
        await page.waitForTimeout(2000);
        
        // 상세 정보 추출
        const details = await page.evaluate(() => {
          const data = {};
          
          // 제목
          const titleSelectors = ['h1', 'h2.title', '.campaign-title', '[class*="title"]'];
          for (const selector of titleSelectors) {
            const el = document.querySelector(selector);
            if (el && el.textContent.trim()) {
              data.title = el.textContent.trim();
              break;
            }
          }
          
          // 브랜드
          const brandSelectors = ['.brand', '.company', '[class*="brand"]', '[class*="company"]'];
          for (const selector of brandSelectors) {
            const el = document.querySelector(selector);
            if (el && el.textContent.trim()) {
              data.brand = el.textContent.trim();
              break;
            }
          }
          
          // 설명
          const descSelectors = ['.description', '.content', '[class*="description"]', '[class*="content"]'];
          for (const selector of descSelectors) {
            const el = document.querySelector(selector);
            if (el && el.textContent.trim()) {
              data.description = el.textContent.trim().substring(0, 1000);
              break;
            }
          }
          
          // 이미지 수집
          data.images = [];
          const imgSelectors = [
            '.product-image img',
            '.campaign-image img',
            '.detail img',
            '[class*="image"] img',
            'main img',
            'article img'
          ];
          
          for (const selector of imgSelectors) {
            const imgs = document.querySelectorAll(selector);
            imgs.forEach(img => {
              const src = img.src || img.getAttribute('data-src');
              if (src && !src.includes('placeholder') && !src.includes('logo')) {
                data.images.push(src);
              }
            });
          }
          
          // 중복 제거
          data.images = [...new Set(data.images)].slice(0, 5);
          
          // 캠페인 정보
          data.info = {};
          const infoTexts = document.body.innerText;
          
          if (infoTexts.includes('모집인원')) {
            const match = infoTexts.match(/모집인원[^\d]*(\d+)/);
            if (match) data.info.participants = `모집인원: ${match[1]}명`;
          }
          
          if (infoTexts.includes('신청기간')) {
            const match = infoTexts.match(/신청기간[^0-9]*([\d.]+.*?[\d.]+)/);
            if (match) data.info.period = `신청기간: ${match[1]}`;
          }
          
          if (infoTexts.includes('플랫폼')) {
            const match = infoTexts.match(/플랫폼[^가-힣]*(인스타그램|블로그|유튜브|틱톡)/);
            if (match) data.info.platform = `플랫폼: ${match[1]}`;
          }
          
          return data;
        });
        
        // 썸네일 다운로드
        let localThumbnail = null;
        if (campaign.thumbnail) {
          const thumbPath = path.join(imageDir, `campaign_${i + 1}_thumb.jpg`);
          localThumbnail = await downloadImage(campaign.thumbnail, thumbPath);
          if (localThumbnail) {
            localThumbnail = `/crawled-images/campaign_${i + 1}_thumb.jpg`;
          }
        }
        
        // 상세 이미지 다운로드
        const localImages = [];
        for (let j = 0; j < Math.min(details.images.length, 3); j++) {
          const imagePath = path.join(imageDir, `campaign_${i + 1}_image_${j + 1}.jpg`);
          const downloaded = await downloadImage(details.images[j], imagePath);
          if (downloaded) {
            localImages.push(`/crawled-images/campaign_${i + 1}_image_${j + 1}.jpg`);
          }
        }
        
        campaigns.push({
          id: i + 1,
          url: campaign.url,
          thumbnail: localThumbnail || campaign.thumbnail,
          title: details.title || campaign.title || `캠페인 ${i + 1}`,
          brand: details.brand || '브랜드명',
          description: details.description || '캠페인 설명',
          images: localImages,
          info: details.info,
          crawledAt: new Date().toISOString()
        });
        
        console.log(`    ✓ 크롤링 완료`);
        
        // 요청 간격
        await page.waitForTimeout(2000);
        
      } catch (error) {
        console.log(`    ✗ 크롤링 실패: ${error.message}`);
        campaigns.push({
          id: i + 1,
          url: campaign.url,
          thumbnail: campaign.thumbnail,
          title: campaign.title || `캠페인 ${i + 1}`,
          error: error.message,
          crawledAt: new Date().toISOString()
        });
      }
    }
    
    // 결과 저장
    const outputPath = path.join(__dirname, '../public/crawled-campaigns.json');
    fs.writeFileSync(outputPath, JSON.stringify(campaigns, null, 2));
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ 크롤링 완료!');
    console.log('='.repeat(50));
    console.log(`📁 데이터 저장: ${outputPath}`);
    console.log(`🖼️  이미지 저장: ${imageDir}`);
    console.log(`📊 총 ${campaigns.length}개 캠페인`);
    console.log(`   - 성공: ${campaigns.filter(c => !c.error).length}개`);
    console.log(`   - 실패: ${campaigns.filter(c => c.error).length}개`);
    
  } catch (error) {
    console.error('❌ 크롤링 오류:', error);
  } finally {
    await browser.close();
  }
}

// 실행
crawlRevuNet()
  .then(() => {
    console.log('\n프로세스 종료');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ 실행 오류:', err);
    process.exit(1);
  });