import { IsString } from "class-validator"

export class UploadFilmDto {
  @IsString()
  filename: string
}