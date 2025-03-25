export class Device {
  device_id: number;
  device_type: string;
  device_name: string;
  status: any;
}

export class Sensor {
  sensor_id: number;
  sensor_type: string;
  sensor_name: string;
  value: any;
}

export class Room {
  room_id: number;
  length: number;
  width: number;
  x: number;
  y: number;
  devices: Device[];
  sensors: Sensor[];
}

export class FloorDevice {
  device: Device;
  x: number;
  y: number;
}

export class FloorSensor {
  sensor: Sensor;
  x: number;
  y: number;
}

export class Floor {
  floor_id: number;
  rooms: Room[];
  devices: FloorDevice[];
  sensors: FloorSensor[];
}

export class House {
  house_id: string;
  length: number;
  width: number;
  floors: Floor[];
}


export class ApiResponse<T> {
  status: 'successful' | 'unsuccessful';
  message: string;
  data: T | null;
}
