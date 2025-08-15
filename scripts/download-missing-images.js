const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function downloadImage(url, filepath, retries = 3) {
  for (let i = 0; i < retries; i++) {
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
      console.log(`  재시도 ${i + 1}/${retries}: ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  return false;
}

async function downloadMissingImages() {
  console.log('🔍 누락된 이미지 확인 중...\n');
  
  const imageDir = path.join(__dirname, '../public/images/campaigns');
  const missingImages = [];
  
  // 50개 캠페인 확인
  for (let i = 1; i <= 50; i++) {
    const thumbPath = path.join(imageDir, `campaign_${i}_thumb.jpg`);
    const detailPath = path.join(imageDir, `campaign_${i}_detail.jpg`);
    
    if (!fs.existsSync(thumbPath) || fs.statSync(thumbPath).size === 0) {
      missingImages.push({ 
        type: 'thumb', 
        id: i, 
        path: thumbPath,
        url: `https://picsum.photos/seed/revuthumb${i}/400/300`
      });
    }
    
    if (!fs.existsSync(detailPath) || fs.statSync(detailPath).size === 0) {
      missingImages.push({ 
        type: 'detail', 
        id: i, 
        path: detailPath,
        url: `https://picsum.photos/seed/revudetail${i}/600/1800`
      });
    }
  }
  
  console.log(`📊 누락된 이미지: ${missingImages.length}개\n`);
  
  // 누락된 이미지 다운로드
  for (const img of missingImages) {
    console.log(`캠페인 ${img.id} ${img.type === 'thumb' ? '썸네일' : '상세'} 이미지 다운로드 중...`);
    
    const success = await downloadImage(img.url, img.path);
    if (!success) {
      console.log(`✗ 실패: campaign_${img.id}_${img.type}.jpg`);
    }
    
    // 대기
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // 최종 확인
  console.log('\n📊 최종 확인...');
  let thumbCount = 0;
  let detailCount = 0;
  
  for (let i = 1; i <= 50; i++) {
    const thumbPath = path.join(imageDir, `campaign_${i}_thumb.jpg`);
    const detailPath = path.join(imageDir, `campaign_${i}_detail.jpg`);
    
    if (fs.existsSync(thumbPath) && fs.statSync(thumbPath).size > 0) thumbCount++;
    if (fs.existsSync(detailPath) && fs.statSync(detailPath).size > 0) detailCount++;
  }
  
  console.log(`\n✅ 완료!`);
  console.log(`- 썸네일 이미지: ${thumbCount}/50개`);
  console.log(`- 상세 이미지: ${detailCount}/50개`);
}

// 실행
downloadMissingImages()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('오류:', error);
    process.exit(1);
  });