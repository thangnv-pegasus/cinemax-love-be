import { Type } from "class-transformer";
import { IsArray, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateFilmDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  original_name: string;

  @IsString()
  quality: string;

  @IsString()
  director: string;

  @IsString()
  casts: string;

  @IsNumber()
  @Type(() => Number)
  type: number;

  @IsNumber()
  @IsOptional()
  total_episodes: number;

  @IsString()
  @IsOptional()
  time: string;

  @IsNumber()
  @Type(() => Number)
  country_id: number;

  @IsNumber({}, { each: true })
  @IsArray()
  @Type(() => Number)
  category_ids: number[];  

}