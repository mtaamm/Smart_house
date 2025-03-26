import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { House, HouseMember } from './dto/dto';
import hardware from 'src/hardware/hardware';
import { Floor, HouseCreate, HouseUpdate } from './dto/request.dto';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

@Injectable()
export class HouseService {
  async getHouseMap(uid: string, house_id: string): Promise<House | null> {
    await this.validateUserAndHouse(uid, house_id);
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
        floors: await Promise.all(
          house.floor.map(async (floor) => ({
            floor_id: floor.floor_id,
            rooms: await Promise.all(
              floor.room.map(async (room) => ({
                room_id: room.room_id,
                name: room.name,
                length: room.length,
                width: room.width,
                x: room.x,
                y: room.y,
                color: room.color,
                devices: await Promise.all(
                  room.device.map(async (device) => ({
                    device_id: device.device_id,
                    device_type: device.type,
                    device_name: device.name,
                    color: device.color,
                    status: {}, //await hardware.getStatus(house.house_id, device.device_id),
                  })),
                ),
                sensors: await Promise.all(
                  room.sensor.map(async (sensor) => {
                    // const value = await this.getSensorValue(house.house_id, sensor.sensor_id, sensor.type);
                    // await prisma.sensor_log.create({
                    //   data: {
                    //     house_id: house.house_id,
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
                      value: {}, //value thay bằng value khi fix xong hardware
                    };
                  }),
                ),
              })),
            ),
            devices: await Promise.all(
              floor.device.map(async (device) => ({
                device: {
                  device_id: device.device_id,
                  device_type: device.type,
                  device_name: device.name,
                  color: device.color,
                  status: {}, //await hardware.getStatus(house.house_id, device.device_id),
                },
                x: device.x,
                y: device.y,
              })),
            ),
            sensors: await Promise.all(
              floor.sensor.map(async (sensor) => {
                // const value = await this.getSensorValue(house.house_id, sensor.sensor_id, sensor.type);
                // await prisma.sensor_log.create({
                //   data: {
                //     house_id: house.house_id,
                //     sensor_id: sensor.sensor_id,
                //     value: JSON.stringify(value),
                //     time: new Date(),
                //   },
                // });
                return {
                  sensor: {
                    sensor_id: sensor.sensor_id,
                    sensor_type: sensor.type,
                    sensor_name: sensor.name,
                    color: sensor.color,
                    value: {}, //value thay bằng value khi fix xong hardware
                  },
                  x: sensor.x,
                  y: sensor.y,
                };
              }),
            ),
          })),
        ),
      };
    } catch (error) {
      console.error('Error fetching house map:', error);
      return null;
    }
  }

  private async getSensorValue(
    house_id: string,
    sensor_id: number,
    sensor_type: string,
  ): Promise<any> {
    switch (sensor_type) {
      case 'temp_humi':
        return await hardware.getTempHumi(house_id, sensor_id);
      case 'light':
        return await hardware.getLight(house_id, sensor_id);
      default:
        return {};
    }
  }

  async getHouseMembers(
    uid: string,
    house_id: string,
  ): Promise<HouseMember[] | null> {
    await this.validateUserAndHouse(uid, house_id);
    try {
      const members = await prisma.user.findMany({
        where: { house_id: house_id },
      });

      if (!members) return null;

      return members.map((member) => ({
        uid: member.uid,
        name: member.name,
        age: member.age,
        phone_number: member.phone,
        email: member.email,
      }));
    } catch (error) {
      console.error('Error fetching house members:', error);
      return null;
    }
  }

  async deleteMember(
    uid: string,
    house_id: string,
    member_id: string,
  ): Promise<string> {
    await this.validateUserAndHouse(uid, house_id);
    try {
      const member = await prisma.user.findFirst({
        where: { house_id: house_id, uid: member_id },
      });

      if (!member) return 'Member id not found';
      if (member.root_owner) return 'Cannot delete root owner';

      await prisma.user.update({
        where: { uid: member_id },
        data: { house_id: null },
      });

      return 'successful';
    } catch (error) {
      console.error('Error deleting house member:', error);
      return error.message || 'An error occurred';
    }
  }

  async firstTimeSetup(houseCreate: HouseCreate): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { uid: houseCreate.uid },
    });

    if (!user || user.house_id) {
      throw new Error('User already has a house or does not exist');
    }

    const newHouse = await prisma.house.create({
      data: {
        house_id: uuidv4(),
        length: houseCreate.length,
        width: houseCreate.width,
        init_time: new Date(),
      },
    });

    await prisma.user.update({
      where: { uid: houseCreate.uid },
      data: {
        house_id: newHouse.house_id,
        root_owner: true,
      },
    });

    await this.createFloorsAndRooms(newHouse.house_id, houseCreate.floors);

    return true;
  }

  async updateHouse(houseUpdate: HouseUpdate): Promise<boolean> {
    await this.validateUserAndHouse(houseUpdate.uid, houseUpdate.house_id);
    const house = await prisma.house.findUnique({
      where: { house_id: houseUpdate.house_id },
    });

    if (!house) {
      throw new Error('House not found');
    }

    await prisma.house.delete({
      where: { house_id: houseUpdate.house_id },
    });

    const newHouse = await prisma.house.create({
      data: {
        house_id: houseUpdate.house_id,
        length: houseUpdate.length,
        width: houseUpdate.width,
        init_time: new Date(),
      },
    });

    await this.createFloorsAndRooms(newHouse.house_id, houseUpdate.floors);

    return true;
  }

  private async createFloorsAndRooms(
    house_id: string,
    floors: Floor[],
  ): Promise<void> {
    for (const floor of floors) {
      const newFloor = await prisma.floor.create({
        data: {
          floor_id: floor.floor_id,
          house_id: house_id,
        },
      });

      for (const room of floor.rooms) {
        await prisma.room.create({
          data: {
            room_id: room.room_id,
            name: room.name,
            floor_id: newFloor.floor_id,
            house_id: house_id,
            length: room.length,
            width: room.width,
            x: room.x,
            y: room.y,
            color: room.color,
          },
        });

        for (const device of room.devices) {
          await prisma.device.create({
            data: {
              device_id: device.device_id,
              house_id: house_id,
              floor_id: newFloor.floor_id,
              room_id: room.room_id,
              name: device.device_name,
              type: device.device_type,
              color: device.color,
              x: room.x,
              y: room.y,
              init_time: new Date(),
            },
          });
        }

        for (const sensor of room.sensors) {
          await prisma.sensor.create({
            data: {
              sensor_id: sensor.sensor_id,
              house_id: house_id,
              floor_id: newFloor.floor_id,
              room_id: room.room_id,
              name: sensor.sensor_name,
              type: sensor.sensor_type,
              color: sensor.color,
              x: room.x,
              y: room.y,
              init_time: new Date(),
            },
          });
        }
      }

      for (const floorDevice of floor.devices) {
        await prisma.device.create({
          data: {
            device_id: floorDevice.device.device_id,
            house_id: house_id,
            floor_id: newFloor.floor_id,
            name: floorDevice.device.device_name,
            type: floorDevice.device.device_type,
            color: floorDevice.device.color,
            x: floorDevice.x,
            y: floorDevice.y,
            init_time: new Date(),
          },
        });
      }

      for (const floorSensor of floor.sensors) {
        await prisma.sensor.create({
          data: {
            sensor_id: floorSensor.sensor.sensor_id,
            house_id: house_id,
            floor_id: newFloor.floor_id,
            name: floorSensor.sensor.sensor_name,
            type: floorSensor.sensor.sensor_type,
            color: floorSensor.sensor.color,
            x: floorSensor.x,
            y: floorSensor.y,
            init_time: new Date(),
          },
        });
      }
    }
  }

  async validateUserAndHouse(uid: string, house_id: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { uid },
    });

    if (!user) {
      throw new Error('User does not exist');
    }

    if (user.house_id !== house_id) {
      throw new Error('User does not belong to the specified house');
    }
  }
}
