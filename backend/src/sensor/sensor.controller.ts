import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { SensorService } from './sensor.service';
import { ApiResponse, ApiResponse2, SensorDetail } from './dto/dto';
import { Sensor } from './dto/dto';

@Controller('sensor')
export class SensorController {
  constructor(private readonly sensorService: SensorService) {}

  @Get('getlist')
  async getSensorList(@Query('uid') uid: string, @Query('house_id') house_id: string): Promise<ApiResponse<Sensor[]>> {
    try {
      const sensors = await this.sensorService.getDevicesByHouseId(uid, house_id);

      if (!sensors || sensors.length === 0) {
        return {
          status: 'unsuccessful',
          message: 'No sensors found',
          data: null,
        };
      }

      return {
        status: 'successful',
        message: 'Success',
        data: sensors,
      };
    } catch (error) {
      console.error('Error fetching sensors:', error);
      return {
        status: 'unsuccessful',
        message: error.message || 'An error occurred',
        data: null,
      };
    }
  }

  @Get('detail')
  async getSensorDetail(@Query('uid') uid: string, @Query('house_id') house_id: string, @Query('sensor_id') sensor_id: number): Promise<ApiResponse<SensorDetail>> {
    try {
      const sensorDetail = await this.sensorService.getSensorDetail(uid, house_id, sensor_id);

      if (!sensorDetail) {
        return {
          status: 'unsuccessful',
          message: 'Sensor not found',
          data: null,
        };
      }

      return {
        status: 'successful',
        message: 'Success',
        data: sensorDetail,
      };
    } catch (error) {
      console.error('Error fetching sensor detail:', error);
      return {
        status: 'unsuccessful',
        message: error.message || 'An error occurred',
        data: null,
      };
    }
  }

  @Post('add')
  async addSensor(
    @Body('uid') uid: string,
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
      const success = await this.sensorService.addSensor(uid, house_id, name, type, color, Number(floor_id), Number(room_id), Number(x), Number(y));

      if (!success) {
        return {
          status: 'unsuccessful',
          message: 'Failed to add sensor',
        };
      }

      return {
        status: 'successful',
        message: 'Sensor added successfully',
      };
    } catch (error) {
      console.error('Error adding sensor:', error);
      return {
        status: 'unsuccessful',
        message: error.message || 'An error occurred',
      };
    }
  }

  @Post('update')
  async updateSensorPosition(
    @Body('uid') uid: string,
    @Body('house_id') house_id: string,
    @Body('sensor_id') sensor_id: number,
    @Body('floor_id') floor_id: number,
    @Body('room_id') room_id: number,
    @Body('x') x: number | null,
    @Body('y') y: number | null
  ): Promise<ApiResponse2> {
    try {
      const success = await this.sensorService.updateSensorPosition(uid, house_id, Number(sensor_id), Number(floor_id), Number(room_id), Number(x), Number(y));

      if (!success) {
        return {
          status: 'unsuccessful',
          message: 'Failed to update sensor position',
        };
      }

      return {
        status: 'successful',
        message: 'Sensor position updated successfully',
      };
    } catch (error) {
      console.error('Error updating sensor position:', error);
      return {
        status: 'unsuccessful',
        message: error.message || 'An error occurred',
      };
    }
  }

  @Post('delete')
  async deleteSensor(
    @Body('uid') uid: string,
    @Body('house_id') house_id: string,
    @Body('sensor_id') sensor_id: number
  ): Promise<ApiResponse2> {
    try {
      const success = await this.sensorService.deleteSensor(uid, house_id, Number(sensor_id));

      if (!success) {
        return {
          status: 'unsuccessful',
          message: 'Failed to delete sensor',
        };
      }

      return {
        status: 'successful',
        message: 'Sensor deleted successfully',
      };
    } catch (error) {
      console.error('Error deleting sensor:', error);
      return {
        status: 'unsuccessful',
        message: error.message || 'An error occurred',
      };
    }
  }
}