import { IsNumber, IsString } from "class-validator";

export class CreateHistoryDto {
  @IsString()
  episodeId: string;
}