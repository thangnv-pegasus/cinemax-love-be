import { ROLE } from "@/common/constants/user";
import { Equals, IsNumber, IsString, Length, Max, MaxLength, Min, MinLength } from "class-validator";

export class RegisterDto {
  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(20)
  password: string;

  @IsString()
  @MinLength(6)
  @MaxLength(20)
  confirm_password: string;

  @IsNumber()
  @Min(0)
  @Max(1)
  role: number = ROLE.USER; // Default role is USER (0)
}
