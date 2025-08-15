const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanUsers() {
  try {
    console.log('🧹 사용자 정리 시작...\n');
    
    // 1. 모든 사용자 조회
    const allUsers = await prisma.user.findMany({
      include: {
        profile: true,
        businessProfile: true
      }
    });
    
    console.log(`전체 사용자 수: ${allUsers.length}명`);
    
    // 2. 외국인 이름 패턴 (영어 이름)
    const foreignNamePattern = /^[A-Za-z\s]+$/;
    
    // 3. 사용자 분류
    const adminUsers = allUsers.filter(u => u.type === 'ADMIN');
    const foreignUsers = allUsers.filter(u => 
      u.type !== 'ADMIN' && foreignNamePattern.test(u.name)
    );
    const domesticUsers = allUsers.filter(u => 
      u.type !== 'ADMIN' && !foreignNamePattern.test(u.name)
    );
    
    console.log(`\n분류 결과:`);
    console.log(`- 관리자: ${adminUsers.length}명`);
    console.log(`- 외국인 사용자: ${foreignUsers.length}명`);
    console.log(`- 국내 사용자: ${domesticUsers.length}명`);
    
    // 4. 외국인 사용자 전체 삭제
    if (foreignUsers.length > 0) {
      console.log(`\n외국인 사용자 ${foreignUsers.length}명 삭제 중...`);
      const foreignUserIds = foreignUsers.map(u => u.id);
      
      await prisma.user.deleteMany({
        where: {
          id: { in: foreignUserIds }
        }
      });
      console.log(`✓ 외국인 사용자 삭제 완료`);
    }
    
    // 5. 국내 사용자 중 30명만 남기고 삭제
    if (domesticUsers.length > 30) {
      const usersToKeep = domesticUsers.slice(0, 30);
      const usersToDelete = domesticUsers.slice(30);
      const deleteIds = usersToDelete.map(u => u.id);
      
      console.log(`\n국내 사용자 중 ${usersToDelete.length}명 삭제 중...`);
      await prisma.user.deleteMany({
        where: {
          id: { in: deleteIds }
        }
      });
      console.log(`✓ 국내 사용자 정리 완료 (30명 유지)`);
    }
    
    // 6. 남은 사용자들에게 핸드폰 번호 추가
    console.log(`\n남은 사용자들에게 핸드폰 번호 추가 중...`);
    
    const remainingUsers = await prisma.user.findMany({
      where: {
        type: { not: 'ADMIN' }
      },
      include: {
        profile: true,
        businessProfile: true
      }
    });
    
    // 한국 핸드폰 번호 생성 함수
    function generatePhoneNumber() {
      const prefix = '010';
      const middle = Math.floor(Math.random() * 9000) + 1000;
      const last = Math.floor(Math.random() * 9000) + 1000;
      return `${prefix}-${middle}-${last}`;
    }
    
    // 한국 주소 샘플
    const addresses = [
      '서울특별시 강남구 테헤란로 123',
      '서울특별시 서초구 서초대로 456',
      '서울특별시 송파구 올림픽로 789',
      '서울특별시 마포구 와우산로 234',
      '서울특별시 성동구 왕십리로 567',
      '경기도 성남시 분당구 판교역로 123',
      '경기도 수원시 영통구 광교중앙로 456',
      '부산광역시 해운대구 마린시티로 789',
      '인천광역시 연수구 송도과학로 234',
      '대구광역시 수성구 범어로 567'
    ];
    
    let updatedCount = 0;
    
    for (const user of remainingUsers) {
      const phone = generatePhoneNumber();
      const address = addresses[Math.floor(Math.random() * addresses.length)];
      
      if (user.type === 'INFLUENCER') {
        // 인플루언서는 profile 업데이트
        if (user.profile) {
          await prisma.profile.update({
            where: { id: user.profile.id },
            data: {
              phone: user.profile.phone || phone,
              address: user.profile.address || address
            }
          });
        } else {
          // profile이 없으면 생성
          await prisma.profile.create({
            data: {
              userId: user.id,
              phone: phone,
              address: address
            }
          });
        }
        updatedCount++;
      } else if (user.type === 'BUSINESS') {
        // 비즈니스는 businessProfile 업데이트
        if (user.businessProfile) {
          await prisma.businessProfile.update({
            where: { id: user.businessProfile.id },
            data: {
              businessAddress: user.businessProfile.businessAddress || address
            }
          });
        }
        // 비즈니스도 profile에 phone 추가
        if (user.profile) {
          await prisma.profile.update({
            where: { id: user.profile.id },
            data: {
              phone: user.profile.phone || phone
            }
          });
        } else {
          await prisma.profile.create({
            data: {
              userId: user.id,
              phone: phone
            }
          });
        }
        updatedCount++;
      }
    }
    
    console.log(`✓ ${updatedCount}명의 사용자에게 연락처/주소 추가 완료`);
    
    // 7. 최종 결과 확인
    const finalUsers = await prisma.user.findMany({
      where: {
        type: { not: 'ADMIN' }
      },
      include: {
        profile: true,
        _count: {
          select: {
            campaigns: true,
            applications: true
          }
        }
      }
    });
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 최종 사용자 현황');
    console.log('='.repeat(50));
    
    const influencers = finalUsers.filter(u => u.type === 'INFLUENCER');
    const businesses = finalUsers.filter(u => u.type === 'BUSINESS');
    
    console.log(`\n인플루언서 (${influencers.length}명):`);
    influencers.forEach(u => {
      console.log(`- ${u.name} (${u.email}) - 📞 ${u.profile?.phone || '없음'}`);
    });
    
    console.log(`\n비즈니스 (${businesses.length}명):`);
    businesses.forEach(u => {
      console.log(`- ${u.name} (${u.email}) - 📞 ${u.profile?.phone || '없음'}`);
    });
    
    console.log('\n✅ 사용자 정리 완료!');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 실행
cleanUsers();