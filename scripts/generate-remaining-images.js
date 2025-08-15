const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function downloadImage(url, filepath) {
  try {
    const writer = fs.createWriteStream(filepath);
    
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
      timeout: 30000
    });
    
    response.data.pipe(writer);
    
    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        const stats = fs.statSync(filepath);
        if (stats.size > 0) {
          console.log(`✓ ${path.basename(filepath)} (${(stats.size / 1024).toFixed(1)}KB)`);
          resolve(true);
        } else {
          fs.unlinkSync(filepath);
          reject(new Error('파일 크기가 0입니다'));
        }
      });
      writer.on('error', reject);
    });
  } catch (error) {
    throw error;
  }
}

async function generateRemainingImages() {
  console.log('🖼️  나머지 캠페인 이미지 생성 중...\n');
  
  const imageDir = path.join(__dirname, '../public/images/campaigns');
  
  // 10번부터 50번까지 이미지 생성
  for (let i = 10; i <= 50; i++) {
    console.log(`캠페인 ${i} 이미지 생성 중...`);
    
    const thumbPath = path.join(imageDir, `campaign_${i}_thumb.jpg`);
    const detailPath = path.join(imageDir, `campaign_${i}_detail.jpg`);
    
    try {
      // 썸네일이 없으면 생성
      if (!fs.existsSync(thumbPath) || fs.statSync(thumbPath).size === 0) {
        const thumbUrl = `https://picsum.photos/seed/revucampaign${i}/400/300`;
        await downloadImage(thumbUrl, thumbPath);
      }
      
      // 상세 이미지가 없으면 생성  
      if (!fs.existsSync(detailPath) || fs.statSync(detailPath).size === 0) {
        const detailUrl = `https://picsum.photos/seed/revudetail${i}/600/1800`;
        await downloadImage(detailUrl, detailPath);
      }
      
      // 서버 부하 방지
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`✗ 캠페인 ${i} 실패:`, error.message);
      
      // 실패 시 기본 이미지 복사
      try {
        const defaultThumb = path.join(imageDir, 'campaign_1_thumb.jpg');
        const defaultDetail = path.join(imageDir, 'campaign_1_detail.jpg');
        
        if (!fs.existsSync(thumbPath) && fs.existsSync(defaultThumb)) {
          fs.copyFileSync(defaultThumb, thumbPath);
          console.log(`  → 기본 썸네일로 대체`);
        }
        
        if (!fs.existsSync(detailPath) && fs.existsSync(defaultDetail)) {
          fs.copyFileSync(defaultDetail, detailPath);
          console.log(`  → 기본 상세이미지로 대체`);
        }
      } catch (copyError) {
        console.error(`  → 기본 이미지 복사 실패:`, copyError.message);
      }
    }
  }
  
  // 결과 확인
  const files = fs.readdirSync(imageDir);
  const thumbCount = files.filter(f => f.includes('_thumb.jpg')).length;
  const detailCount = files.filter(f => f.includes('_detail.jpg')).length;
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ 이미지 생성 완료!');
  console.log('='.repeat(50));
  console.log(`📁 위치: ${imageDir}`);
  console.log(`🖼️  썸네일: ${thumbCount}개`);
  console.log(`📄 상세이미지: ${detailCount}개`);
}

// 실행
generateRemainingImages()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('오류:', error);
    process.exit(1);
  });