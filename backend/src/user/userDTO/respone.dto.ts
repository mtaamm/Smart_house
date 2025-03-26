export class Login {
    uid: string;
    own_house: boolean; 
    root_owner: boolean;
}

export class UserInf {
    uid: string;
    house_id: string | null;
    root_owner: boolean;
    name: string;
    age: number | null;
    phone_number: string | null;
    email: string;
}

export class NotiInf {
    total: number;
        unread: number;
        notices: Array<{
            id: string;
            time: string;
            content: string;
            read: boolean;
        }>
}

export class UsrInfUpdateRes {
    uid: string;
    house_id: string | null;
    root_owner: boolean;
    name: string;
    age: number | null;
    phone_number: string | null;
    email: string;
}

export class ApiResponse<T> {
    status: string;
    message: string;
    data: T | null;
}