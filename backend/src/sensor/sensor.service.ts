import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Sensor, SensorDetail, SensorLog } from './dto/dto';
import hardware from 'src/hardware/hardware';

const prisma = new PrismaClient();

@Injectable()
export class SensorService {
  async getDevicesByHouseId(house_id: string): Promise<Sensor[]> {
    const sensors = await prisma.sensor.findMany({
      where: { house_id },
    });

    const sensorList = await Promise.all(sensors.map(async (sensor) => {
      // const value = await this.getSensorValue(house_id, sensor.sensor_id, sensor.type);
      // await prisma.sensor_log.create({
      //   data: {
      //     house_id: house_id,
      //     sensor_id: sensor.sensor_id,
      //     value: JSON.stringify(value),
      //     time: new Date(),
      //   },
      // });
      return {
        sensor_id: sensor.sensor_id,
        sensor_type: sensor.type,
        sensor_name: sensor.name,
        color: sensor.color,
        value: {}, // thay bằng value khi fix xong hardware
        floor_id: sensor.floor_id,
        room_id: sensor.room_id ? sensor.room_id : null,
        x: sensor.x,
        y: sensor.y,
      };
    }));

    return sensorList;
  }

  private async getSensorValue(house_id: string, sensor_id: number, sensor_type: string): Promise<any> {
    switch (sensor_type) {
      case 'temp_humi':
        return await hardware.getTempHumi(house_id, sensor_id);
      case 'light':
        return await hardware.getLight(house_id, sensor_id);
      default:
        return {};
    }
  }

  async getSensorDetail(house_id: string, sensor_id: number): Promise<SensorDetail | null> {
    const sensor = await prisma.sensor.findFirst({
      where: { house_id, sensor_id },
    });

    if (!sensor) {
      return null;
    }

    // const value = await this.getSensorValue(house_id, sensor_id, sensor.type);
    // if (value) {
    //   await prisma.sensor_log.create({
    //     data: {
    //       house_id: house_id,
    //       sensor_id: sensor_id,
    //       value: JSON.stringify(value),
    //       time: new Date(),
    //     },
    //   });
    // }

    const logs = await prisma.sensor_log.findMany({
      where: { house_id, sensor_id },
      orderBy: { time: 'desc' },
    });

    const sensorLogs: SensorLog[] = logs.map(log => ({
      time: log.time.toISOString(),
      value: log.value,
    }));

    return {
      sensor: {
        sensor_id: sensor.sensor_id,
        sensor_type: sensor.type,
        sensor_name: sensor.name,
        color: sensor.color,
        value: {}, // thay bằng value khi fix xong hardware
        floor_id: sensor.floor_id,
        room_id: sensor.room_id ? sensor.room_id : null,
        x: sensor.x,
        y: sensor.y,
      },
      logs: sensorLogs,
    };
  }

  async addSensor(house_id: string, name: string, type: string, color: string, floor_id: number, room_id: number, x: number | null, y: number | null): Promise<boolean> {
    room_id = room_id === -1 ? null : room_id;
    x = x === -1 ? null : x;
    y = y === -1 ? null : y;

    if (room_id === null && (x === null || y === null)) {
      throw new Error('room_id and (x, y) cannot be both null');
    }

    const newSensor = await prisma.sensor.create({
      data: {
        house_id,
        name,
        type,
        color,
        floor_id,
        room_id,
        x,
        y,
        init_time: new Date(),
      },
    });

    if (newSensor) {
      const action = `Thêm sensor vào lúc ${new Date().toISOString()}, vị trí floor(${floor_id}), room(${room_id}), x(${x}), y(${y})`;
      await prisma.sensor_log.create({
        data: {
          house_id,
          sensor_id: newSensor.sensor_id,
          value: action,
          time: new Date(),
        },
      });
    }

    return !!newSensor;
  }

  async updateSensorPosition(house_id: string, sensor_id: number, floor_id: number, room_id: number, x: number | null, y: number | null): Promise<boolean> {
    room_id = room_id === -1 ? null : room_id;
    x = x === -1 ? null : x;
    y = y === -1 ? null : y;

    const sensor = await prisma.sensor.findFirst({
      where: { house_id, sensor_id },
    });

    if (!sensor) {
      throw new Error('Sensor not found');
    }

    const updatedSensor = await prisma.sensor.update({
      where: { sensor_id_house_id: { sensor_id, house_id } },
      data: {
        floor_id,
        room_id,
        x,
        y,
      },
    });

    if (updatedSensor) {
      const action = `Thay đổi vị trí đến floor(${floor_id}), room(${room_id}), x(${x}), y(${y})`;
      await prisma.sensor_log.create({
        data: {
          house_id,
          sensor_id,
          value: action,
          time: new Date(),
        },
      });
    }

    return !!updatedSensor;
  }

  async deleteSensor(house_id: string, sensor_id: number): Promise<boolean> {
    const sensor = await prisma.sensor.findFirst({
      where: { house_id, sensor_id },
    });

    if (!sensor) {
      throw new Error('Sensor not found');
    }

    const deletedSensor = await prisma.sensor.delete({
      where: { sensor_id_house_id: { sensor_id, house_id } },
    });

    return !!deletedSensor;
  }
}