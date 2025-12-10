import { Type } from "class-transformer";
import { IsNumber } from "class-validator";

export class CreateWishlistItemDto {
  @IsNumber()
  @Type(() => Number)
  filmId: number;

  @IsNumber()
  @Type(() => Number)
  userId: number;
}