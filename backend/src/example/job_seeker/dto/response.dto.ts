import { InfoDto} from './index';

export class InfoResponseDto{
  data: InfoDto;
  status: string;
}

export class MessageResponseDto{
  status: string;
  message: string;
}
