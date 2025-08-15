const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function testLogin() {
  console.log('🔐 Testing login for user@example.com...')
  
  // Find user
  const user = await prisma.user.findUnique({
    where: { email: 'user@example.com' }
  })
  
  if (!user) {
    console.log('❌ User not found')
    return
  }
  
  console.log('✅ User found:', user.email)
  console.log('   Password hash:', user.password)
  
  // Test password
  const testPasswords = ['user123!', 'user123', 'password123', 'test123']
  
  for (const password of testPasswords) {
    const isValid = await bcrypt.compare(password, user.password)
    console.log(`   Testing "${password}": ${isValid ? '✅ Valid' : '❌ Invalid'}`)
  }
  
  // Generate a new hash for comparison
  const newHash = await bcrypt.hash('user123!', 10)
  console.log('\n📝 New hash for "user123!":')
  console.log('   ', newHash)
}

testLogin()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })