import { UploadedFile } from "@nestjs/common"
import { IsString } from "class-validator"
import { MutableFile } from "megajs"

export class UploadFilmDto {
  @IsString()
  filename: string
}