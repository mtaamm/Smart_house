import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class PutInfoRequestDto {

  @IsString()
  name: string;

  @IsOptional()
  sex: string;

  @IsOptional()
  day_of_birth: string;

  @IsString()
  @IsNotEmpty()
  phone_number: string;

  @IsOptional()
  address: string;

  @IsOptional()
  about_me: string;
}

export class PutFileRequestDto {

  @IsOptional()
  @IsString()
  fileValidationError: string;

}

