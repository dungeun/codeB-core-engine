const fs = require('fs');
const path = require('path');

function copyDefaultImages() {
  console.log('🖼️  기본 이미지 복사 중...\n');
  
  const imageDir = path.join(__dirname, '../public/images/campaigns');
  
  // 기본 이미지 경로
  const defaultThumb = path.join(imageDir, 'campaign_1_thumb.jpg');
  const defaultDetail = path.join(imageDir, 'campaign_1_detail.jpg');
  
  if (!fs.existsSync(defaultThumb) || !fs.existsSync(defaultDetail)) {
    console.error('❌ 기본 이미지가 없습니다!');
    return;
  }
  
  let copiedCount = 0;
  
  // 10번부터 50번까지
  for (let i = 10; i <= 50; i++) {
    const thumbPath = path.join(imageDir, `campaign_${i}_thumb.jpg`);
    const detailPath = path.join(imageDir, `campaign_${i}_detail.jpg`);
    
    // 썸네일이 없으면 복사
    if (!fs.existsSync(thumbPath) || fs.statSync(thumbPath).size === 0) {
      fs.copyFileSync(defaultThumb, thumbPath);
      console.log(`✓ campaign_${i}_thumb.jpg 생성`);
      copiedCount++;
    }
    
    // 상세 이미지가 없으면 복사
    if (!fs.existsSync(detailPath) || fs.statSync(detailPath).size === 0) {
      fs.copyFileSync(defaultDetail, detailPath);
      console.log(`✓ campaign_${i}_detail.jpg 생성`);
      copiedCount++;
    }
  }
  
  // 결과 확인
  const files = fs.readdirSync(imageDir);
  const thumbCount = files.filter(f => f.includes('_thumb.jpg')).length;
  const detailCount = files.filter(f => f.includes('_detail.jpg')).length;
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ 이미지 복사 완료!');
  console.log('='.repeat(50));
  console.log(`📁 위치: ${imageDir}`);
  console.log(`🖼️  썸네일: ${thumbCount}/50개`);
  console.log(`📄 상세이미지: ${detailCount}/50개`);
  console.log(`📋 새로 생성된 파일: ${copiedCount}개`);
}

// 실행
copyDefaultImages();