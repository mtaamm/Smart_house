import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { DeviceService } from './device.service';
import { ApiResponse, ApiResponse2, DeviceDetail } from './dto/response.dto';
import { Device } from './dto/response.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AddDeviceDto, ControlDeviceDto, DeleteDeviceDto, UpdateDevicePositionDto } from './dto/request.dto';

@ApiTags('Device')
@Controller('device')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @Get('getlist')
  async getDeviceList(
    @Query('uid') uid: string,
    @Query('house_id') house_id: string,
  ): Promise<ApiResponse<Device[]>> {
    try {
      const devices = await this.deviceService.getDevicesByHouseId(
        uid,
        house_id,
      );

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
  async getDeviceDetail(
    @Query('uid') uid: string,
    @Query('house_id') house_id: string,
    @Query('device_id') device_id: string,
  ): Promise<ApiResponse<DeviceDetail>> {
    try {
      const deviceDetail = await this.deviceService.getDeviceById(
        uid,
        house_id,
        Number(device_id),
      );

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
  @ApiOperation({ summary: 'Control a device' })
  async controlDevice(
    @Body() controlDeviceDto: ControlDeviceDto,
  ): Promise<ApiResponse2> {
    const { uid, house_id, device_id, action } = controlDeviceDto;
    try {
      const success = await this.deviceService.controlDevice(
        uid,
        house_id,
        device_id,
        action,
      );

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
  @ApiOperation({ summary: 'Update device position, use -1 for null value' })
  async updateDevicePosition(
    @Body() updateDevicePositionDto: UpdateDevicePositionDto,
  ): Promise<ApiResponse2> {
    const { uid, house_id, device_id, floor_id, room_id, x, y } =
      updateDevicePositionDto;
    try {
      const success = await this.deviceService.updateDevicePosition(
        uid,
        house_id,
        device_id,
        floor_id,
        room_id,
        x,
        y,
      );

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
  @ApiOperation({ summary: 'Add a new device, use -1 for null value' })
  async addDevice(@Body() addDeviceDto: AddDeviceDto): Promise<ApiResponse2> {
    const { uid, house_id, name, type, color, floor_id, room_id, x, y } =
      addDeviceDto;
    try {
      const success = await this.deviceService.addDevice(
        uid,
        house_id,
        name,
        type,
        color,
        floor_id,
        room_id,
        x,
        y,
      );

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
  @ApiOperation({ summary: 'Delete a device' })
  async deleteDevice(
    @Body() deleteDeviceDto: DeleteDeviceDto,
  ): Promise<ApiResponse2> {
    const { uid, house_id, device_id } = deleteDeviceDto;
    try {
      const success = await this.deviceService.deleteDevice(
        uid,
        house_id,
        device_id,
      );

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
