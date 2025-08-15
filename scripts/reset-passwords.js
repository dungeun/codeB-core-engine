const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetPasswords() {
  try {
    // 모든 사용자의 패스워드를 재설정
    const users = [
      { email: 'user@example.com', password: 'user123!' },
      { email: 'business@company.com', password: 'business123!' },
      { email: 'admin@linkpick.co.kr', password: 'admin123!' }
    ];

    for (const userData of users) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = await prisma.user.updateMany({
        where: { email: userData.email },
        data: { password: hashedPassword }
      });

      console.log(`Updated password for ${userData.email}: ${user.count} record(s) updated`);
    }

    console.log('All passwords have been reset successfully!');
  } catch (error) {
    console.error('Error resetting passwords:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetPasswords();