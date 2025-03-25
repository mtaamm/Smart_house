export class Sensor {
  sensor_id: number;
  sensor_type: string;
  sensor_name: string;
  color: string;
  value: any;
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

export class SensorDetail {
  sensor: Sensor;
  logs: SensorLog[];
}

export class SensorLog {
  time: string;
  value: any;
}

export class ApiResponse2 {
  status: string;
  message: string;
}