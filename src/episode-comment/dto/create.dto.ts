import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateCommentDto {
  @IsNumber()
  @Type(() => Number)
  episodeId: number;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsNumber()
  @Type(() => Number)
  userId: number;
}