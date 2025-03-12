export class DeviceDTO {
  device_id: number;
  device_type: string;
  device_name: string;
  status: string;
}

export class SensorDTO {
  sensor_id: number;
  sensor_type: string;
  sensor_name: string;
  value: any;
}

export class RoomDTO {
  room_id: number;
  length: number;
  width: number;
  x: number;
  y: number;
  devices: DeviceDTO[];
  sensors: SensorDTO[];
}

export class FloorDeviceDTO {
  device: DeviceDTO;
  x: number;
  y: number;
}

export class FloorSensorDTO {
  sensor: SensorDTO;
  x: number;
  y: number;
}

export class FloorDTO {
  floor_id: number;
  rooms: RoomDTO[];
  devices: FloorDeviceDTO[];
  sensors: FloorSensorDTO[];
}

export class HouseDTO {
  house_id: string;
  length: number;
  width: number;
  floors: FloorDTO[];
}


export class ApiResponseDTO<T> {
  status: 'successful' | 'unsuccessful';
  message: string;
  data: T | null;
}
