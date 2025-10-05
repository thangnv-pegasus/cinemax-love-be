import { slugifyCustom } from "../../src/common/helpers/generate-data"
import { PrismaClient } from "@prisma/client"

export async function seedCategories(prisma: PrismaClient) {
 const categories = [
    { name: 'Hành Động' },
    { name: 'Phiêu Lưu' },
    { name: 'Khoa Học Viễn Tưởng' },
    { name: 'Kinh Dị' },
    { name: 'Tâm Lý' },
    { name: 'Tình Cảm' },
    { name: 'Hài Hước' },
    { name: 'Hoạt Hình' },
    { name: 'Gia Đình' },
    { name: 'Học Đường' },
    { name: 'Âm Nhạc' },
    { name: 'Chiến Tranh' },
    { name: 'Tội Phạm' },
    { name: 'Hình Sự' },
    { name: 'Thần Thoại' },
    { name: 'Cổ Trang' },
    { name: 'Dã Sử' },
    { name: 'Kỳ Ảo' },
    { name: 'Thể Thao' },
    { name: 'Lãng Mạn' },
    { name: 'Chính Kịch' },
    { name: 'Giật Gân' },
    { name: 'Phim Ngắn' },
    { name: 'Phim Tài Liệu' },
    { name: 'Phim Thời Trang' },
    { name: 'Phim Ẩm Thực' },
    { name: 'Siêu Anh Hùng' },
    { name: 'Zombie' },
    { name: 'Trinh Thám' },
    { name: 'Khoa Học' },
    { name: 'Kịch Tính' },
    { name: 'Du Hành Thời Gian' },
    { name: 'Vũ Trụ' },
    { name: 'Giả Tưởng' },
    { name: 'Tuổi Teen' },
    { name: 'Đam Mỹ' },
    { name: 'Bách Hợp' },
    { name: 'Phim Thảm Họa' },
    { name: 'Phim Sinh Tồn' },
    { name: 'Phim Đua Xe' },
    { name: 'Phim Lịch Sử' },
    { name: 'Phim Nghệ Thuật' },
    { name: 'Phim Kinh Điển' },
    { name: 'Phim Hài Đen' },
    { name: 'Phim Giả Tài Liệu' },
    { name: 'Phim Ca Nhạc' },
    { name: 'Phim Gia Tộc' },
    { name: 'Phim Học Đường' },
    { name: 'Phim Đa Vũ Trụ' },
  ]

  for (const c of categories) {
    await prisma.category.upsert({
      where: { name: c.name },
      update: {},
      create: {
        name: c.name,
        slug: slugifyCustom(c.name, { lower: true, strict: true, locale: "vi" }),
      },
    })
  }

}