export class Device {
  device_id: number;
  device_type: string;
  device_name: string;
  color: string;
  status: any;
}

export class Sensor {
  sensor_id: number;
  sensor_type: string;
  sensor_name: string;
  color: string;
  value: any;
}

export class Room {
  room_id: number;
  name: string;
  length: number;
  width: number;
  x: number;
  y: number;
  color: string;
  devices: Device[];
  sensors: Sensor[];
}

export class FloorDevice {
  device_id: number;
  device_type: string;
  device_name: string;
  color: string;
  status: any;
  x: number;
  y: number;
}

export class FloorSensor {
  sensor_id: number;
  sensor_type: string;
  sensor_name: string;
  color: string;
  value: any;
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

export class ApiResponse2 {
  status: string;
  message: string;
}

export class HouseMember {
  uid: string;
  name: string;
  age: number;
  phone_number: string;
  email: string;
}
