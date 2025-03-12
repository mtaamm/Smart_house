// src/recruiter/dto/get-post-details.dto.ts
import { IsString, IsNotEmpty, IsUUID, IsIn, IsOptional} from 'class-validator';

export class PutInfoRequestDto {

  @IsString()
  @IsOptional()
  company: string;

  @IsOptional()
  company_size: string;

  @IsOptional()
  date_of_establishment: string;

  @IsOptional()
  phone_number: string;

  @IsOptional()
  address: string;

  @IsOptional()
  business_field: string;
}

export class PutFileRequestDto {

  @IsOptional()
  @IsString()
  fileValidationError: string;
  
}
