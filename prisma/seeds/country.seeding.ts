import { PrismaClient } from "@prisma/client"
import slugify from "slugify"

export async function seedCountries(prisma: PrismaClient) { 

  const countries = [
    { name: 'Hoa Kỳ' },
    { name: 'Anh' },
    { name: 'Pháp' },
    { name: 'Đức' },
    { name: 'Ý' },
    { name: 'Tây Ban Nha' },
    { name: 'Ấn Độ' },
    { name: 'Nhật Bản' },
    { name: 'Hàn Quốc' },
    { name: 'Trung Quốc' },
    { name: 'Canada' },
    { name: 'Úc' },
    { name: 'New Zealand' },
    { name: 'Mexico' },
    { name: 'Brazil' },
    { name: 'Argentina' },
    { name: 'Nga' },
    { name: 'Thái Lan' },
    { name: 'Việt Nam' },
    { name: 'Singapore' },
    { name: 'Hồng Kông' },
    { name: 'Đài Loan' },
    { name: 'Philippines' },
    { name: 'Indonesia' },
    { name: 'Malaysia' },
    { name: 'Thổ Nhĩ Kỳ' },
    { name: 'Iran' },
    { name: 'Ai Cập' },
    { name: 'Nam Phi' },
    { name: 'Nigeria' },
    { name: 'Thụy Điển' },
    { name: 'Na Uy' },
    { name: 'Phần Lan' },
    { name: 'Đan Mạch' },
    { name: 'Hà Lan' },
    { name: 'Bỉ' },
    { name: 'Thụy Sĩ' },
    { name: 'Áo' },
    { name: 'Ba Lan' },
    { name: 'Cộng Hòa Séc' },
    { name: 'Hungary' },
    { name: 'Hy Lạp' },
    { name: 'Israel' },
    { name: 'UAE' },
    { name: 'Ả Rập Saudi' },
  ]

  for (const c of countries) {
    await prisma.country.upsert({
      where: { 
        name: c.name
       },
      update: {},
      create: {
        name: c.name,
        slug: slugify(c.name, { lower: true, strict: true, locale: "vi" }),
      },
    })
  }
}