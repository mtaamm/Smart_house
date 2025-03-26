import { ApiProperty } from '@nestjs/swagger';

export class ControlDeviceDto {
  @ApiProperty({ description: 'User ID of the requester' })
  uid: string;

  @ApiProperty({ description: 'ID of the house' })
  house_id: string;

  @ApiProperty({ description: 'ID of the device to control' })
  device_id: number;

  @ApiProperty({ description: 'Action to perform on the device' })
  action: string;
}

export class UpdateDevicePositionDto {
  @ApiProperty({ description: 'User ID of the requester' })
  uid: string;

  @ApiProperty({ description: 'ID of the house' })
  house_id: string;

  @ApiProperty({ description: 'ID of the device to update' })
  device_id: number;

  @ApiProperty({ description: 'ID of the floor where the device is located' })
  floor_id: number;

  @ApiProperty({ description: 'ID of the room where the device is located' })
  room_id: number;

  @ApiProperty({ description: 'X-coordinate of the device' })
  x: number | null;

  @ApiProperty({ description: 'Y-coordinate of the device' })
  y: number | null;
}

export class AddDeviceDto {
  @ApiProperty({ description: 'User ID of the requester' })
  uid: string;

  @ApiProperty({ description: 'ID of the house' })
  house_id: string;

  @ApiProperty({ description: 'Name of the device' })
  name: string;

  @ApiProperty({ description: 'Type of the device (e.g., rgb, fan)' })
  type: string;

  @ApiProperty({ description: 'Color of the device in hex format' })
  color: string;

  @ApiProperty({ description: 'ID of the floor where the device is located' })
  floor_id: number;

  @ApiProperty({ description: 'ID of the room where the device is located' })
  room_id: number;

  @ApiProperty({ description: 'X-coordinate of the device' })
  x: number | null;

  @ApiProperty({ description: 'Y-coordinate of the device' })
  y: number | null;
}

export class DeleteDeviceDto {
  @ApiProperty({ description: 'User ID of the requester' })
  uid: string;

  @ApiProperty({ description: 'ID of the house' })
  house_id: string;

  @ApiProperty({ description: 'ID of the device to delete' })
  device_id: number;
}