import { PrismaClient } from '@prisma/client'
import { seedUsers } from './seeds/user.seeding'
import { seedCategories } from './seeds/category.seeding'
import { seedCountries } from './seeds/country.seeding'

const prisma = new PrismaClient()

async function main() {
  await seedUsers(prisma)
  await seedCategories(prisma)
  await seedCountries(prisma)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
