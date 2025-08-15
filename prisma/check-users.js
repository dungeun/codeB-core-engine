const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Checking users in database...')
  
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      type: true,
      status: true,
      verified: true,
      password: true
    }
  })
  
  console.log(`\nFound ${users.length} users:`)
  users.forEach(user => {
    console.log(`\n📧 Email: ${user.email}`)
    console.log(`   Name: ${user.name}`)
    console.log(`   Type: ${user.type}`)
    console.log(`   Status: ${user.status}`)
    console.log(`   Verified: ${user.verified}`)
    console.log(`   Password hash: ${user.password.substring(0, 20)}...`)
  })
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })