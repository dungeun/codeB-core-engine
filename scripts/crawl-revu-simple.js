const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const path = require('path');

// 이미지 다운로드 함수
async function downloadImage(url, filename) {
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    });
    
    const outputPath = path.join(__dirname, '../public/crawled-images', filename);
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, response.data);
    
    return `/crawled-images/${filename}`;
  } catch (error) {
    console.error(`이미지 다운로드 실패: ${url}`, error.message);
    return url;
  }
}

// 대기 함수
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function crawlRevuCampaigns() {
  try {
    console.log('revu.net 캠페인 크롤링 시작...\n');
    
    // 1. 카테고리 페이지에서 캠페인 목록 가져오기
    console.log('카테고리 페이지 접속 중...');
    const listResponse = await axios.get('https://www.revu.net/category/%EC%A0%9C%ED%92%88', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    });
    
    const $ = cheerio.load(listResponse.data);
    const campaigns = [];
    
    // 캠페인 목록 파싱
    $('.campaign-item, .list-item, article').each((index, element) => {
      if (index >= 50) return false; // 최대 50개
      
      const $item = $(element);
      const link = $item.find('a').first().attr('href');
      const thumbnail = $item.find('img').first().attr('src');
      const title = $item.find('h3, h4, .title').first().text().trim();
      
      if (link) {
        const fullUrl = link.startsWith('http') ? link : `https://www.revu.net${link}`;
        campaigns.push({
          url: fullUrl,
          thumbnail: thumbnail || '',
          title: title || ''
        });
      }
    });
    
    console.log(`${campaigns.length}개의 캠페인 발견\n`);
    
    // 2. 각 캠페인 상세 페이지 크롤링
    const detailedCampaigns = [];
    
    for (let i = 0; i < campaigns.length; i++) {
      const campaign = campaigns[i];
      console.log(`[${i + 1}/${campaigns.length}] 크롤링 중: ${campaign.title}`);
      
      try {
        await delay(1500); // 서버 부하 방지
        
        const detailResponse = await axios.get(campaign.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
          }
        });
        
        const $detail = cheerio.load(detailResponse.data);
        
        // 상세 정보 추출
        const title = $detail('h1, .campaign-title').first().text().trim() || campaign.title;
        const brand = $detail('.brand-name, .company').first().text().trim() || '';
        const description = $detail('.campaign-description, .description, .content').first().text().trim() || '';
        
        // 이미지 수집
        const images = [];
        $detail('.campaign-images img, .detail-images img, .product-images img').each((idx, img) => {
          if (idx < 5) { // 최대 5개
            const src = $(img).attr('src');
            if (src && !src.includes('placeholder')) {
              images.push(src.startsWith('http') ? src : `https://www.revu.net${src}`);
            }
          }
        });
        
        // 캠페인 정보
        const info = {};
        $detail('.campaign-info li, .info-item').each((idx, el) => {
          const text = $(el).text().trim();
          if (text.includes('모집인원')) info.participants = text;
          if (text.includes('신청기간')) info.period = text;
          if (text.includes('발표일')) info.announcement = text;
          if (text.includes('카테고리')) info.category = text;
          if (text.includes('플랫폼')) info.platform = text;
        });
        
        // 이미지 다운로드
        const downloadedImages = [];
        
        // 썸네일 다운로드
        let thumbnailPath = campaign.thumbnail;
        if (campaign.thumbnail) {
          const thumbnailFilename = `campaign_${i + 1}_thumbnail.jpg`;
          thumbnailPath = await downloadImage(campaign.thumbnail, thumbnailFilename);
        }
        
        // 상세 이미지 다운로드
        for (let j = 0; j < images.length; j++) {
          const filename = `campaign_${i + 1}_image_${j + 1}.jpg`;
          const localPath = await downloadImage(images[j], filename);
          downloadedImages.push(localPath);
        }
        
        detailedCampaigns.push({
          id: i + 1,
          url: campaign.url,
          thumbnail: thumbnailPath,
          title,
          brand,
          description: description.substring(0, 500) + (description.length > 500 ? '...' : ''),
          images: downloadedImages,
          info,
          crawledAt: new Date().toISOString()
        });
        
      } catch (error) {
        console.error(`  └─ 실패: ${error.message}`);
        detailedCampaigns.push({
          id: i + 1,
          url: campaign.url,
          thumbnail: campaign.thumbnail,
          title: campaign.title,
          error: error.message,
          crawledAt: new Date().toISOString()
        });
      }
    }
    
    // 3. 결과 저장
    const outputPath = path.join(__dirname, '../public/crawled-campaigns.json');
    await fs.writeFile(outputPath, JSON.stringify(detailedCampaigns, null, 2));
    
    console.log(`\n✅ 크롤링 완료!`);
    console.log(`📁 저장 위치: ${outputPath}`);
    console.log(`📊 총 ${detailedCampaigns.length}개 캠페인`);
    console.log(`✓ 성공: ${detailedCampaigns.filter(c => !c.error).length}개`);
    console.log(`✗ 실패: ${detailedCampaigns.filter(c => c.error).length}개`);
    
    return detailedCampaigns;
    
  } catch (error) {
    console.error('크롤링 중 오류 발생:', error);
    throw error;
  }
}

// 테스트용 단일 캠페인 크롤링
async function crawlSingleCampaign(url) {
  try {
    console.log(`단일 캠페인 크롤링: ${url}\n`);
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    
    const campaign = {
      url,
      title: $('h1, .campaign-title').first().text().trim(),
      brand: $('.brand-name, .company').first().text().trim(),
      description: $('.campaign-description, .description').first().text().trim(),
      images: []
    };
    
    // 이미지 수집
    $('.campaign-images img, .detail-images img').each((idx, img) => {
      if (idx < 5) {
        const src = $(img).attr('src');
        if (src) {
          campaign.images.push(src.startsWith('http') ? src : `https://www.revu.net${src}`);
        }
      }
    });
    
    console.log('크롤링 결과:', JSON.stringify(campaign, null, 2));
    return campaign;
    
  } catch (error) {
    console.error('크롤링 실패:', error);
    throw error;
  }
}

// 실행
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args[0] === 'test') {
    // 테스트: 단일 캠페인 크롤링
    crawlSingleCampaign('https://www.revu.net/campaign/1188560')
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  } else {
    // 전체 크롤링
    crawlRevuCampaigns()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  }
}

module.exports = { crawlRevuCampaigns, crawlSingleCampaign };