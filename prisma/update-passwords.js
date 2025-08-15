const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function updatePasswords() {
  console.log('🔐 Updating test user passwords...')
  
  const updates = [
    { email: 'user@example.com', password: 'user123!' },
    { email: 'business@company.com', password: 'business123!' },
    { email: 'admin@linkpick.co.kr', password: 'admin123!' }
  ]
  
  for (const { email, password } of updates) {
    const hashedPassword = await bcrypt.hash(password, 10)
    
    try {
      const user = await prisma.user.update({
        where: { email },
        data: { password: hashedPassword }
      })
      console.log(`✅ Updated ${email} with new password hash`)
    } catch (error) {
      console.log(`❌ Failed to update ${email}:`, error.message)
    }
  }
  
  console.log('\n📝 Testing updated passwords...')
  
  for (const { email, password } of updates) {
    const user = await prisma.user.findUnique({
      where: { email }
    })
    
    if (user) {
      const isValid = await bcrypt.compare(password, user.password)
      console.log(`   ${email}: ${isValid ? '✅ Valid' : '❌ Invalid'}`)
    }
  }
}

updatePasswords()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })