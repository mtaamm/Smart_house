import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { HouseDTO } from './dto/response.dto';

const prisma = new PrismaClient();

@Injectable()
export class HouseService {
  async getHouseMap(): Promise<HouseDTO | null> {
    try {
      const house = await prisma.house.findFirst({
        include: {
          floor: {
            include: {
              room: { include: { device: true, sensor: true } },
              device: true,
              sensor: true,
            },
          },
        },
      });

      if (!house) return null;

      return {
        house_id: house.house_id,
        length: house.length,
        width: house.width,
        floors: house.floor.map((floor) => ({
          floor_id: floor.floor_id,
          rooms: floor.room.map((room) => ({
            room_id: room.room_id,
            length: room.length,
            width: room.width,
            x: room.x,
            y: room.y,
            devices: room.device.map((device) => ({
              device_id: device.device_id,
              device_type: device.type,
              device_name: device.name,
              status: device.status,
            })),
            sensors: room.sensor.map((sensor) => ({
              sensor_id: sensor.sensor_id,
              sensor_type: sensor.type,
              sensor_name: sensor.name,
              value: {}, // Xử lý dữ liệu sensor sau
            })),
          })),
          devices: floor.device.map((device) => ({
            device: {
              device_id: device.device_id,
              device_type: device.type,
              device_name: device.name,
              status: device.status,
            },
            x: device.x,
            y: device.y,
          })),
          sensors: floor.sensor.map((sensor) => ({
            sensor: {
              sensor_id: sensor.sensor_id,
              sensor_type: sensor.type,
              sensor_name: sensor.name,
              value: {}, // Xử lý dữ liệu sensor sau
            },
            x: sensor.x,
            y: sensor.y,
          })),
        })),
      };
    } catch (error) {
      console.error('Error fetching house map:', error);
      return null;
    }
  }
}
