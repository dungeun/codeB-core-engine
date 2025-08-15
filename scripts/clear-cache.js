const redis = require('redis');

async function clearCache() {
  const client = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  });

  try {
    await client.connect();
    console.log('Redis 연결됨');
    
    // 모든 캐시 키 삭제
    const keys = await client.keys('*');
    if (keys.length > 0) {
      await client.del(keys);
      console.log(`${keys.length}개의 캐시 삭제됨`);
    } else {
      console.log('삭제할 캐시가 없음');
    }
    
  } catch (error) {
    console.error('Redis 연결 실패:', error.message);
    console.log('Redis가 실행중이지 않거나 연결할 수 없습니다.');
  } finally {
    await client.quit();
  }
}

clearCache();