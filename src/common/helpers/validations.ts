import { FileTypeValidator, MaxFileSizeValidator } from "@nestjs/common"

export const VALIDATION_FILE_SIZE = (maxSize: number) => {
  return new MaxFileSizeValidator({ maxSize: maxSize * 1024 * 1024 }) // MB
}

export const VALIDATION_FILE_TYPE = (fileType: string) => {
  return new FileTypeValidator({ fileType: new RegExp(fileType) });
} // ví dụ: /(jpg|jpeg|png|pdf)$/ // chỉ cho jpg, png, pdf