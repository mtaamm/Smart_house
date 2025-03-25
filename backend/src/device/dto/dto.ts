export class Device {
  device_id: number;
  device_type: string;
  device_name: string;
  color: string;
  status: any;
  floor_id: number;
  room_id: number;
  x: number | null;
  y: number | null;
}

export class ApiResponse<T> {
  status: 'successful' | 'unsuccessful';
  message: string;
  data: T | null;
}

export class DeviceDetail {
  device: Device;
  logs: ControlLog[];
}

export class ControlLog {
  time: string;
  action: string;
}

export class ApiResponse2 {
  status: string;
  message: string;
}
