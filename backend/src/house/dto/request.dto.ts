import { ApiProperty } from '@nestjs/swagger';

export class Device {
  @ApiProperty({ description: 'Unique ID of the device' })
  device_id: number;

  @ApiProperty({ description: 'Type of the device (e.g., rgb, fan)' })
  device_type: string;

  @ApiProperty({ description: 'Name of the device' })
  device_name: string;

  @ApiProperty({ description: 'Color of the device in hex format' })
  color: string;
}

export class Sensor {
  @ApiProperty({ description: 'Unique ID of the sensor' })
  sensor_id: number;

  @ApiProperty({ description: 'Type of the sensor (e.g., temp_humi, light)' })
  sensor_type: string;

  @ApiProperty({ description: 'Name of the sensor' })
  sensor_name: string;

  @ApiProperty({ description: 'Color of the sensor in hex format' })
  color: string;
}

export class Room {
  @ApiProperty({ description: 'Unique ID of the room' })
  room_id: number;

  @ApiProperty({ description: 'Name of the room' })
  name: string;

  @ApiProperty({ description: 'Length of the room in meters' })
  length: number;

  @ApiProperty({ description: 'Width of the room in meters' })
  width: number;

  @ApiProperty({ description: 'X-coordinate of the room' })
  x: number;

  @ApiProperty({ description: 'Y-coordinate of the room' })
  y: number;

  @ApiProperty({ description: 'Color of the room in hex format' })
  color: string;

  @ApiProperty({ description: 'List of devices in the room', type: () => [Device] })
  devices: Device[];

  @ApiProperty({ description: 'List of sensors in the room', type: () => [Sensor] })
  sensors: Sensor[];
}

export class FloorDevice {
  @ApiProperty({ description: 'Unique ID of the device' })
  device_id: number;

  @ApiProperty({ description: 'Type of the device (e.g., rgb, fan)' })
  device_type: string;

  @ApiProperty({ description: 'Name of the device' })
  device_name: string;

  @ApiProperty({ description: 'Color of the device in hex format' })
  color: string;

  @ApiProperty({ description: 'X-coordinate of the device on the floor' })
  x: number;

  @ApiProperty({ description: 'Y-coordinate of the device on the floor' })
  y: number;
}

export class FloorSensor {
  @ApiProperty({ description: 'Unique ID of the sensor' })
  sensor_id: number;

  @ApiProperty({ description: 'Type of the sensor (e.g., temp_humi, light)' })
  sensor_type: string;

  @ApiProperty({ description: 'Name of the sensor' })
  sensor_name: string;

  @ApiProperty({ description: 'Color of the sensor in hex format' })
  color: string;

  @ApiProperty({ description: 'X-coordinate of the sensor on the floor' })
  x: number;

  @ApiProperty({ description: 'Y-coordinate of the sensor on the floor' })
  y: number;
}

export class Floor {
  @ApiProperty({ description: 'Unique ID of the floor' })
  floor_id: number;

  @ApiProperty({ description: 'List of rooms on the floor', type: () => [Room] })
  rooms: Room[];

  @ApiProperty({ description: 'List of devices on the floor', type: () => [FloorDevice] })
  devices: FloorDevice[];

  @ApiProperty({ description: 'List of sensors on the floor', type: () => [FloorSensor] })
  sensors: FloorSensor[];
}

export class HouseCreate {
  @ApiProperty({ description: 'User ID of the house owner' })
  uid: string;

  @ApiProperty({ description: 'Length of the house in meters' })
  length: number;

  @ApiProperty({ description: 'Width of the house in meters' })
  width: number;

  @ApiProperty({ description: 'List of floors in the house', type: () => [Floor] })
  floors: Floor[];
}

export class HouseUpdate {
  @ApiProperty({ description: 'User ID of the house owner' })
  uid: string;

  @ApiProperty({ description: 'Unique ID of the house' })
  house_id: string;

  @ApiProperty({ description: 'Length of the house in meters' })
  length: number;

  @ApiProperty({ description: 'Width of the house in meters' })
  width: number;

  @ApiProperty({ description: 'List of floors in the house', type: () => [Floor] })
  floors: Floor[];
}

export class DeleteMemberDto {
  @ApiProperty({ description: 'User ID of the requester' })
  uid: string;

  @ApiProperty({ description: 'ID of the house' })
  house_id: string;

  @ApiProperty({ description: 'ID of the member to delete' })
  member_id: string;
}

export class AddMemberDto {
  @ApiProperty({ description: 'User ID of the requester' })
  uid: string;

  @ApiProperty({ description: 'ID of the house' })
  house_id: string;

  @ApiProperty({ description: 'UID of the member to add' })
  member_uid: string;
}