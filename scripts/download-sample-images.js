const https = require('https');
const fs = require('fs');
const path = require('path');

// 이미지 다운로드 함수
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        const stats = fs.statSync(filepath);
        console.log(`✓ ${path.basename(filepath)} (${(stats.size / 1024).toFixed(1)}KB)`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

async function downloadSampleImages() {
  console.log('샘플 이미지 다운로드 시작...\n');
  
  const imageDir = path.join(__dirname, '../public/images/sample');
  
  // 디렉토리 확인
  if (!fs.existsSync(imageDir)) {
    fs.mkdirSync(imageDir, { recursive: true });
  }
  
  // 다운로드할 이미지 목록
  const campaigns = [
    { id: 1, category: 'beauty' },
    { id: 2, category: 'fashion' },
    { id: 3, category: 'food' },
    { id: 4, category: 'lifestyle' },
    { id: 5, category: 'tech' }
  ];
  
  for (const campaign of campaigns) {
    console.log(`\n캠페인 ${campaign.id} 이미지 다운로드 중...`);
    
    try {
      // 썸네일 (400x300)
      const thumbUrl = `https://picsum.photos/seed/${campaign.category}${campaign.id}/400/300`;
      const thumbPath = path.join(imageDir, `campaign_${campaign.id}_thumb.jpg`);
      await downloadImage(thumbUrl, thumbPath);
      
      // 상세 이미지 3개 (800x600)
      for (let i = 1; i <= 3; i++) {
        const imageUrl = `https://picsum.photos/seed/${campaign.category}${campaign.id}img${i}/800/600`;
        const imagePath = path.join(imageDir, `campaign_${campaign.id}_image_${i}.jpg`);
        await downloadImage(imageUrl, imagePath);
        
        // 서버 부하 방지
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
    } catch (error) {
      console.error(`✗ 캠페인 ${campaign.id} 다운로드 실패:`, error.message);
    }
  }
  
  console.log('\n✅ 이미지 다운로드 완료!');
  
  // 다운로드된 파일 확인
  const files = fs.readdirSync(imageDir);
  const totalSize = files.reduce((sum, file) => {
    const stats = fs.statSync(path.join(imageDir, file));
    return sum + stats.size;
  }, 0);
  
  console.log(`\n📊 다운로드 요약:`);
  console.log(`- 총 파일 수: ${files.length}개`);
  console.log(`- 총 용량: ${(totalSize / 1024 / 1024).toFixed(2)}MB`);
  console.log(`- 저장 위치: ${imageDir}`);
}

// 실행
if (require.main === module) {
  downloadSampleImages()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('오류:', error);
      process.exit(1);
    });
}

module.exports = { downloadSampleImages };