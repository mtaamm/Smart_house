import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Device, DeviceDetail, ControlLog } from './dto/dto';
import hardware from 'src/hardware/hardware';

const prisma = new PrismaClient();

@Injectable()
export class DeviceService {
  async getDevicesByHouseId(house_id: string): Promise<Device[]> {
    const devices = await prisma.device.findMany({
      where: { house_id },
    });

    const deviceList = await Promise.all(devices.map(async (device) => ({
      device_id: device.device_id,
      device_type: device.type,
      device_name: device.name,
      color: device.color,
      status: {}, //await hardware.getStatus(house_id, device.device_id),
      floor_id: device.floor_id,
      room_id: device.room_id ? device.room_id : null,
      x: device.x,
      y: device.y,
    })));

    return deviceList;
  }

  async getDeviceById(house_id: string, device_id: number): Promise<DeviceDetail> {
    const device = await prisma.device.findFirst({
      where: { house_id, device_id },
    });

    if (!device) {
      return null;
    }

    const logs = await prisma.control_log.findMany({
      where: { house_id, device_id },
      orderBy: { time: 'desc' },
    });

    const controlLogs: ControlLog[] = logs.map(log => ({
      time: log.time.toISOString(),
      action: log.action,
    }));

    const result: DeviceDetail = {
      device: {
        device_id: device.device_id,
        device_type: device.type,
        device_name: device.name,
        color: device.color,
        status: {},//await hardware.getStatus(house_id, device.device_id),
        floor_id: device.floor_id,
        room_id: device.room_id ? device.room_id : null,
        x: device.x,
        y: device.y,
      },
      logs: controlLogs,
    };

    return result;
  }

  async controlDevice(house_id: string, device_id: number, action: string): Promise<boolean> {
    const device = await prisma.device.findFirst({
      where: { house_id, device_id },
    });
  
    if (!device) {
      throw new Error('Device not found');
    }
  
    let type = device.type;
    let on: boolean;
    let lock: boolean = false;
  
    if (type === 'door') {
      if (action !== 'LOCK' && action !== 'UNLOCK') {
        throw new Error('Invalid action for door');
      }
      lock = action === 'LOCK';
    } else {
      if (action !== 'ON' && action !== 'OFF') {
        throw new Error('Invalid action for device');
      }
      on = action === 'ON';
    }
  
    const success = true//await hardware.controlDevice(house_id, device_id, type, on, lock);
  
    if (success) {
      await prisma.control_log.create({
        data: {
          house_id: house_id,
          device_id: device_id,
          action: action,
          time: new Date(),
        },
      });
    }
  
    return success;
  }

  async updateDevicePosition(house_id: string, device_id: number, floor_id: number, room_id: number, x: number | null, y: number | null): Promise<boolean> {
    room_id = room_id==-1?null:room_id;
    x = x==-1?null:x;
    y = y==-1?null:y;
    const device = await prisma.device.findFirst({
      where: { house_id, device_id },
    });
  
    if (!device) {
      throw new Error('Device not found');
    }
  
    const updatedDevice = await prisma.device.update({
      where: { device_id_house_id: { device_id, house_id } },
      data: {
        floor_id,
        room_id,
        x,
        y,
      },
    });

    if (updatedDevice) {
      const action = `Thay đổi vị trí đến floor(${floor_id}), room(${room_id}), x(${x}), y(${y})`;
      await prisma.control_log.create({
        data: {
          house_id,
          device_id,
          action,
          time: new Date(),
        },
      });
    }
  
    return !!updatedDevice;
  }

  async addDevice(house_id: string, name: string, type: string, color: string, floor_id: number, room_id: number, x: number | null, y: number | null): Promise<boolean> {
    room_id = room_id === -1 ? null : room_id;
    x = x === -1 ? null : x;
    y = y === -1 ? null : y;
  
    if (room_id === null && (x === null || y === null)) {
      throw new Error('room_id and (x, y) cannot be both null');
    }
  
    const newDevice = await prisma.device.create({
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
  
    if (newDevice) {
      const action = `Thêm thiết bị vào lúc ${new Date().toISOString()}, vị trí floor(${floor_id}), room(${room_id}), x(${x}), y(${y})`;
      await prisma.control_log.create({
        data: {
          house_id,
          device_id: newDevice.device_id,
          action,
          time: new Date(),
        },
      });
    }
  
    return !!newDevice;
  }

  async deleteDevice(house_id: string, device_id: number): Promise<boolean> {
    const device = await prisma.device.findFirst({
      where: { house_id, device_id },
    });
  
    if (!device) {
      throw new Error('Device not found');
    }
  
    const deletedDevice = await prisma.device.delete({
      where: { device_id_house_id: { device_id, house_id } },
    });
  
    return !!deletedDevice;
  }
}