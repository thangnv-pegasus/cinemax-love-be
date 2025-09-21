import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

export async function seedUsers(prisma: PrismaClient) {
  const password = await bcrypt.hash('admin123123', 10)
  await prisma.user.create({
    data: {
      email: 'admin@gmail.com',
      name: 'Admin',
      password,
      role: 1, // ADMIN
      created_at: new Date(),
      updated_at: new Date(),
    },
  });
}