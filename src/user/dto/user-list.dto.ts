import { IsNumber, IsOptional, IsString } from "class-validator";

export class UserListDto { 
  @IsNumber()
  @IsOptional()
  page = 1;

  @IsNumber()
  @IsOptional()
  limit = 10;

  @IsString()
  @IsOptional()
  search?: string;
}