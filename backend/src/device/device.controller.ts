import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { DeviceService } from './device.service';
import { ApiResponse, ApiResponse2, DeviceDetail } from './dto/dto';
import { Device } from './dto/dto';

@Controller('device')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @Get('getlist')
  async getDeviceList(@Query('house_id') house_id: string): Promise<ApiResponse<Device[]>> {
    try {
      const devices = await this.deviceService.getDevicesByHouseId(house_id);

      if (!devices || devices.length === 0) {
        return {
          status: 'unsuccessful',
          message: 'No devices found',
          data: null,
        };
      }

      return {
        status: 'successful',
        message: 'Success',
        data: devices,
      };
    } catch (error) {
      console.error('Error fetching devices:', error);
      return {
        status: 'unsuccessful',
        message: error.message || 'An error occurred',
        data: null,
      };
    }
  }

  @Get('detail')
  async getDeviceDetail(@Query('house_id') house_id: string, @Query('device_id') device_id: string): Promise<ApiResponse<DeviceDetail>> {
    try {
      const deviceDetail = await this.deviceService.getDeviceById(house_id, Number(device_id));

      if (!deviceDetail) {
        return {
          status: 'unsuccessful',
          message: 'Device not found',
          data: null,
        };
      }

      return {
        status: 'successful',
        message: 'Success',
        data: deviceDetail,
      };
    } catch (error) {
      console.error('Error fetching device detail:', error);
      return {
        status: 'unsuccessful',
        message: error.message || 'An error occurred',
        data: null,
      };
    }
  }

  @Post('control')
  async controlDevice(
    @Body('house_id') house_id: string,
    @Body('device_id') device_id: string,
    @Body('action') action: string
  ): Promise<ApiResponse2> {
    try {
      const success = await this.deviceService.controlDevice(house_id, Number(device_id), action);

      if (!success) {
        return {
          status: 'unsuccessful',
          message: 'Failed to control device',
        };
      }

      return {
        status: 'successful',
        message: 'Device controlled successfully',
      };
    } catch (error) {
      console.error('Error controlling device:', error);
      return {
        status: 'unsuccessful',
        message: error.message || 'An error occurred',
      };
    }
  }

  @Post('update')
  async updateDevicePosition(
    @Body('house_id') house_id: string,
    @Body('device_id') device_id: number,
    @Body('floor_id') floor_id: number,
    @Body('room_id') room_id: number,
    @Body('x') x: number | null,
    @Body('y') y: number | null
  ): Promise<ApiResponse2> {
    try {
      const success = await this.deviceService.updateDevicePosition(house_id, Number(device_id), Number(floor_id), Number(room_id), Number(x), Number(y));

      if (!success) { 
        return {
          status: 'unsuccessful',
          message: 'Failed to update device position',
        };
      }

      return {
        status: 'successful',
        message: 'Device position updated successfully',
      };
    } catch (error) {
      console.error('Error updating device position:', error);
      return {
        status: 'unsuccessful',
        message: error.message || 'An error occurred',
      };
    }
  }

  @Post('add')
  async addDevice(
    @Body('house_id') house_id: string,
    @Body('name') name: string,
    @Body('type') type: string,
    @Body('color') color: string,
    @Body('floor_id') floor_id: number,
    @Body('room_id') room_id: string,
    @Body('x') x: number | null,
    @Body('y') y: number | null
  ): Promise<ApiResponse2> {
    try {
      const success = await this.deviceService.addDevice(house_id, name, type, color, Number(floor_id), Number(room_id), Number(x), Number(y));

      if (!success) {
        return {
          status: 'unsuccessful',
          message: 'Failed to add device',
        };
      }

      return {
        status: 'successful',
        message: 'Device added successfully',
      };
    } catch (error) {
      console.error('Error adding device:', error);
      return {
        status: 'unsuccessful',
        message: error.message || 'An error occurred',
      };
    }
  }

  @Post('delete')
  async deleteDevice(
    @Body('house_id') house_id: string,
    @Body('device_id') device_id: number
  ): Promise<ApiResponse2> {
    try {
      const success = await this.deviceService.deleteDevice(house_id, Number(device_id));

      if (!success) {
        return {
          status: 'unsuccessful',
          message: 'Failed to delete device',
        };
      }

      return {
        status: 'successful',
        message: 'Device deleted successfully',
      };
    } catch (error) {
      console.error('Error deleting device:', error);
      return {
        status: 'unsuccessful',
        message: error.message || 'An error occurred',
      };
    }
  }
}