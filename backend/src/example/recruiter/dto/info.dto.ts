import { IsEmail, IsOptional, IsString } from "class-validator";

export class RecruiterInfoDto {

    @IsString()
    @IsOptional()
    company: string;

    @IsString()
    @IsEmail()
    email: string;

    @IsOptional()
    logo_url: string

    @IsOptional()
    business_field: string;

    @IsOptional()
    company_size: string;

    @IsOptional()
    date_of_establishment: Date;

    @IsOptional()
    phone_number: string;

    @IsOptional()
    address: string;
}