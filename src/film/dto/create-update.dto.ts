import { Type } from "class-transformer";
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";

class EpisodeDto {
  @IsString()
  source: string;

  @IsString()
  source_type: string;
}

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

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  total_episodes?: number;

  @IsOptional()
  @IsString()
  time?: string;

  @IsNumber()
  @Type(() => Number)
  country_id: number;

  @IsArray()
  @Type(() => Number)
  @IsNumber({}, { each: true })
  category_ids: number[];

  @IsOptional()
  @IsString()
  thumbnail?: string;

  @IsOptional()
  @IsString()
  poster?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EpisodeDto)
  @IsOptional()
  episodes: EpisodeDto[];
}
