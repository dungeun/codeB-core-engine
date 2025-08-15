const fs = require('fs').promises;
const path = require('path');
const https = require('https');

// Placeholder 이미지 다운로드
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = require('fs').createWriteStream(filepath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      require('fs').unlink(filepath, () => {}); // 에러 시 파일 삭제
      reject(err);
    });
  });
}

async function createPlaceholderImages() {
  const imageDir = path.join(__dirname, '../public/images/sample');
  await fs.mkdir(imageDir, { recursive: true });
  
  console.log('Placeholder 이미지 생성 중...');
  
  // 첫 5개 캠페인에 대한 이미지 생성
  for (let i = 1; i <= 5; i++) {
    // 썸네일
    const thumbPath = path.join(imageDir, `campaign_${i}_thumb.jpg`);
    const thumbUrl = `https://picsum.photos/seed/campaign${i}/400/300`;
    
    try {
      await downloadImage(thumbUrl, thumbPath);
      console.log(`✓ 캠페인 ${i} 썸네일 생성`);
    } catch (error) {
      console.error(`✗ 캠페인 ${i} 썸네일 실패:`, error.message);
    }
    
    // 상세 이미지 3개
    for (let j = 1; j <= 3; j++) {
      const imagePath = path.join(imageDir, `campaign_${i}_image_${j}.jpg`);
      const imageUrl = `https://picsum.photos/seed/campaign${i}img${j}/800/600`;
      
      try {
        await downloadImage(imageUrl, imagePath);
        console.log(`✓ 캠페인 ${i} 이미지 ${j} 생성`);
      } catch (error) {
        console.error(`✗ 캠페인 ${i} 이미지 ${j} 실패:`, error.message);
      }
      
      // 서버 부하 방지를 위한 대기
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  console.log('\n✅ Placeholder 이미지 생성 완료!');
}

// 실행
if (require.main === module) {
  createPlaceholderImages()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('오류 발생:', error);
      process.exit(1);
    });
}

module.exports = { createPlaceholderImages };