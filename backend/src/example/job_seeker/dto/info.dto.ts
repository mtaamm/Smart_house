import { IsEmail, IsOptional, IsString } from "class-validator";

export class InfoDto {

  @IsString()
  name: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsOptional()
  avatar_url: string

  @IsOptional()
  cv: string;

  @IsOptional()
  sex: string;

  @IsOptional()
  day_of_birth: Date;

  @IsOptional()
  phone_number: string;

  @IsOptional()
  address: string;

  @IsOptional()
  about_me: string;

}
