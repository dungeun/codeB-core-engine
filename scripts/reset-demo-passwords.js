const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function resetDemoPasswords() {
  try {
    console.log('🔑 데모 계정 비밀번호 재설정 시작...\n');
    
    // 모든 사용자에게 동일한 비밀번호 설정
    const newPassword = 'password123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // 관리자를 제외한 모든 사용자 업데이트
    const result = await prisma.user.updateMany({
      where: {
        type: {
          in: ['BUSINESS', 'INFLUENCER']
        }
      },
      data: {
        password: hashedPassword
      }
    });
    
    console.log(`✓ ${result.count}개의 계정 비밀번호가 'password123'으로 설정되었습니다.`);
    
    // 현재 사용자 목록 확인
    const users = await prisma.user.findMany({
      where: {
        type: {
          in: ['BUSINESS', 'INFLUENCER']
        }
      },
      select: {
        email: true,
        name: true,
        type: true
      },
      orderBy: {
        type: 'asc'
      }
    });
    
    console.log('\n📝 현재 데모 계정 목록:');
    console.log('='.repeat(50));
    
    const influencers = users.filter(u => u.type === 'INFLUENCER');
    const businesses = users.filter(u => u.type === 'BUSINESS');
    
    console.log(`\n인플루언서 (${influencers.length}명):`);
    influencers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`);
    });
    
    console.log(`\n비즈니스 (${businesses.length}명):`);
    businesses.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`);
    });
    
    console.log('\nℹ️  모든 계정의 비밀번호: password123');
    console.log('\n✅ 비밀번호 재설정 완료!');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 실행
resetDemoPasswords();