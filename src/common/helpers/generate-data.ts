export function slugifyCustom(text: string, p0: { lower: boolean; strict: boolean; locale: string; }): string {
  return text
    .toLowerCase()
    .normalize('NFD')              // bỏ dấu tiếng Việt
    .replace(/[\u0300-\u036f]/g, '') 
    .replace(/[^a-z0-9]+/g, '-')   // thay ký tự đặc biệt bằng "-"
    .replace(/^-+|-+$/g, '')       // bỏ "-" đầu/cuối
}
