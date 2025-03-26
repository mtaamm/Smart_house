import { ApiProperty } from '@nestjs/swagger';

export class SignUpParam {
    @ApiProperty()
    username: string;

    @ApiProperty()
    password: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    age: number;

    @ApiProperty()
    phone_number: string;

    @ApiProperty()
    email: string;
}

export class verifyRequestCode{
    @ApiProperty()
    uid: string; 

    @ApiProperty()
    houseId: string;
}

export class verifyHouse {
    @ApiProperty()
    uid: string; 

    @ApiProperty()
    house_id: string;

    @ApiProperty()
    code: string;
}

export class LoginReq {
    @ApiProperty()
    username: string;
    @ApiProperty()
    password: string;
}

export class Logout{
    @ApiProperty()
    uid: string;
}

export class UserInfUpdateReq {
    @ApiProperty()
    uid: string | null;

    @ApiProperty()
    name: string | null;

    @ApiProperty()
    age: number | null;

    @ApiProperty()
    phone_number: string | null;

    @ApiProperty()
    email: string | null;    
}