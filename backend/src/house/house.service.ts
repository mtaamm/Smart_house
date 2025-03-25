import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { House } from './dto/response.dto';
import hardware from 'src/hardware/hardware';

const prisma = new PrismaClient();

@Injectable()
export class HouseService {

  async getHouseMap(house_id: string): Promise<House | null> {
    try {
      const house = await prisma.house.findFirst({
        where: { house_id: house_id },
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
        floors: await Promise.all(house.floor.map(async (floor) => ({
          floor_id: floor.floor_id,
          rooms: await Promise.all(floor.room.map(async (room) => ({
            room_id: room.room_id,
            length: room.length,
            width: room.width,
            x: room.x,
            y: room.y,
            color: room.color,
            devices: await Promise.all(room.device.map(async (device) => ({
              device_id: device.device_id,
              device_type: device.type,
              device_name: device.name,
              color: device.color,
              status: await hardware.getStatus(house.house_id, device.device_id),
            }))),
            sensors: await Promise.all(room.sensor.map(async (sensor) => ({
              sensor_id: sensor.sensor_id,
              sensor_type: sensor.type,
              sensor_name: sensor.name,
              color: sensor.color,
              value: sensor.type === 'temperature_humidity'
                ? await hardware.getTempHumi(house.house_id, sensor.sensor_id)
                : sensor.type === 'light'
                ? await hardware.getLight(house.house_id, sensor.sensor_id)
                : {},
            }))),
          }))),
          devices: await Promise.all(floor.device.map(async (device) => ({
            device: {
              device_id: device.device_id,
              device_type: device.type,
              device_name: device.name,
              color: device.color,
              status: await hardware.getStatus(house.house_id, device.device_id),
            },
            x: device.x,
            y: device.y,
          }))),
          sensors: await Promise.all(floor.sensor.map(async (sensor) => ({
            sensor: {
              sensor_id: sensor.sensor_id,
              sensor_type: sensor.type,
              sensor_name: sensor.name,
              color: sensor.color,
              value: sensor.type === 'temperature_humidity'
                ? await hardware.getTempHumi(house.house_id, sensor.sensor_id)
                : sensor.type === 'light'
                ? await hardware.getLight(house.house_id, sensor.sensor_id)
                : {},
            },
            x: sensor.x,
            y: sensor.y,
          }))),
        }))),
      };
    } catch (error) {
      console.error('Error fetching house map:', error);
      return null;
    }
  }
  
}