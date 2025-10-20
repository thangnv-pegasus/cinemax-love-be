import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const lastNames = [
  "Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan", "Vũ",
  "Võ", "Đặng", "Bùi", "Đỗ", "Hồ", "Ngô", "Dương", "Đinh"
];

const middleNames = [
  "Văn", "Thị", "Hữu", "Minh", "Ngọc", "Thanh", "Hoàng", "Tấn",
  "Phúc", "Trọng", "Hải", "Thu", "Quốc", "Gia", "Nhật"
];

const firstNames = [
  "An", "Bình", "Cường", "Dũng", "Giang", "Hà", "Hùng", "Khoa", "Linh",
  "Lan", "Mai", "Nam", "Oanh", "Phương", "Quân", "Sơn", "Thảo", "Trang",
  "Tú", "Vy"
];

const admin = (password: string) => ({
    email: 'admin@gmail.com',
    name: 'Admin',
    password,
    role: 1, // ADMIN
    created_at: new Date(),
    updated_at: new Date(),
})

function randomName() {
  const last = lastNames[Math.floor(Math.random() * lastNames.length)];
  const middle = middleNames[Math.floor(Math.random() * middleNames.length)];
  const first = firstNames[Math.floor(Math.random() * firstNames.length)];
  return `${last} ${middle} ${first}`;
}

export async function seedUsers(prisma: PrismaClient) {
  const password = await bcrypt.hash('admin123123', 10)
  const users: any = [];
  users.push(admin(password))
  const now = new Date();
  for (let i = 1; i <= 29; i++) {
    const name = randomName();
    const email = `user${i}@example.com`;
    const userPass = await bcrypt.hash('123456', 10)
    users.push({
      name,
      email,
      password: userPass,
      role: 0,
      created_at: now,
      updated_at: now,
    });
  }
  await prisma.user.createMany({
    data: users
  });
}