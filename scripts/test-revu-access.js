const axios = require('axios');

async function testAccess() {
  try {
    console.log('revu.net 접속 테스트...\n');
    
    // HTTPS 설정 무시 (테스트용)
    const https = require('https');
    const agent = new https.Agent({
      rejectUnauthorized: false
    });
    
    const response = await axios.get('https://www.revu.net/category/%EC%A0%9C%ED%92%88', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      httpsAgent: agent,
      timeout: 10000
    });
    
    console.log('상태 코드:', response.status);
    console.log('Content-Type:', response.headers['content-type']);
    console.log('HTML 길이:', response.data.length);
    
    // HTML에서 캠페인 링크 찾기
    const campaignRegex = /href="([^"]*\/campaign\/\d+[^"]*)"/g;
    const matches = [...response.data.matchAll(campaignRegex)];
    
    console.log(`\n발견된 캠페인 링크: ${matches.length}개`);
    
    // 첫 5개 링크 출력
    matches.slice(0, 5).forEach((match, i) => {
      console.log(`${i + 1}. ${match[1]}`);
    });
    
  } catch (error) {
    console.error('접속 실패:', error.message);
    if (error.response) {
      console.error('응답 상태:', error.response.status);
    }
  }
}

testAccess();