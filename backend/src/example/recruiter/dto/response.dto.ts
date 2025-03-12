import { RecruiterInfoDto } from './info.dto';

export class RecruiterInfoResponseDto{
  data: RecruiterInfoDto;
  status: string;
}

export class MessageResponseDto{
  status: string;
  message: string;
}