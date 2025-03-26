import { ApiProperty } from '@nestjs/swagger';

export class AddSensorDto {
  @ApiProperty({ description: 'User ID of the requester' })
  uid: string;

  @ApiProperty({ description: 'ID of the house' })
  house_id: string;

  @ApiProperty({ description: 'Name of the sensor' })
  name: string;

  @ApiProperty({ description: 'Type of the sensor (e.g., temp_humi, light)' })
  type: string;

  @ApiProperty({ description: 'Color of the sensor in hex format' })
  color: string;

  @ApiProperty({ description: 'ID of the floor where the sensor is located' })
  floor_id: number;

  @ApiProperty({ description: 'ID of the room where the sensor is located' })
  room_id: number;

  @ApiProperty({ description: 'X-coordinate of the sensor' })
  x: number | null;

  @ApiProperty({ description: 'Y-coordinate of the sensor' })
  y: number | null;
}

export class UpdateSensorPositionDto {
  @ApiProperty({ description: 'User ID of the requester' })
  uid: string;

  @ApiProperty({ description: 'ID of the house' })
  house_id: string;

  @ApiProperty({ description: 'ID of the sensor to update' })
  sensor_id: number;

  @ApiProperty({ description: 'ID of the floor where the sensor is located' })
  floor_id: number;

  @ApiProperty({ description: 'ID of the room where the sensor is located' })
  room_id: number;

  @ApiProperty({ description: 'X-coordinate of the sensor' })
  x: number | null;

  @ApiProperty({ description: 'Y-coordinate of the sensor' })
  y: number | null;
}

export class DeleteSensorDto {
  @ApiProperty({ description: 'User ID of the requester' })
  uid: string;

  @ApiProperty({ description: 'ID of the house' })
  house_id: string;

  @ApiProperty({ description: 'ID of the sensor to delete' })
  sensor_id: number;
}