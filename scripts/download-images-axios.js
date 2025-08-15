const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function downloadImage(url, filepath) {
  const writer = fs.createWriteStream(filepath);
  
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream'
  });
  
  response.data.pipe(writer);
  
  return new Promise((resolve, reject) => {
    writer.on('finish', () => {
      const stats = fs.statSync(filepath);
      console.log(`✓ ${path.basename(filepath)} (${(stats.size / 1024).toFixed(1)}KB)`);
      resolve();
    });
    writer.on('error', reject);
  });
}

async function downloadAllImages() {
  console.log('샘플 이미지 다운로드 시작...\n');
  
  const imageDir = path.join(__dirname, '../public/images/sample');
  
  // 기존 파일 삭제
  if (fs.existsSync(imageDir)) {
    fs.rmSync(imageDir, { recursive: true });
  }
  fs.mkdirSync(imageDir, { recursive: true });
  
  // 5개 캠페인의 이미지 다운로드
  for (let i = 1; i <= 5; i++) {
    console.log(`\n캠페인 ${i} 이미지 다운로드 중...`);
    
    try {
      // 썸네일
      const thumbUrl = `https://picsum.photos/seed/campaign${i}/400/300`;
      const thumbPath = path.join(imageDir, `campaign_${i}_thumb.jpg`);
      await downloadImage(thumbUrl, thumbPath);
      
      // 상세 이미지 3개
      for (let j = 1; j <= 3; j++) {
        const imageUrl = `https://picsum.photos/seed/camp${i}img${j}/800/600`;
        const imagePath = path.join(imageDir, `campaign_${i}_image_${j}.jpg`);
        await downloadImage(imageUrl, imagePath);
        
        // 대기
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
    } catch (error) {
      console.error(`✗ 캠페인 ${i} 실패:`, error.message);
    }
  }
  
  // 결과 확인
  const files = fs.readdirSync(imageDir);
  const totalSize = files.reduce((sum, file) => {
    const stats = fs.statSync(path.join(imageDir, file));
    return sum + stats.size;
  }, 0);
  
  console.log('\n✅ 다운로드 완료!');
  console.log(`\n📊 요약:`);
  console.log(`- 파일 수: ${files.length}개`);
  console.log(`- 총 용량: ${(totalSize / 1024 / 1024).toFixed(2)}MB`);
  console.log(`- 위치: ${imageDir}`);
  
  // 첫 번째 캠페인 정보 출력
  console.log('\n📸 이미지 구성:');
  console.log('- 썸네일: campaign_X_thumb.jpg (400x300)');
  console.log('- 상세 이미지1: campaign_X_image_1.jpg (800x600)');
  console.log('- 상세 이미지2: campaign_X_image_2.jpg (800x600)');
  console.log('- 상세 이미지3: campaign_X_image_3.jpg (800x600)');
}

// 실행
downloadAllImages()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('오류:', error);
    process.exit(1);
  });