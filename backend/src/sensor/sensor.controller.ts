import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { SensorService } from './sensor.service';
import { ApiResponse, ApiResponse2, SensorDetail } from './dto/response.dto';
import { Sensor } from './dto/response.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AddSensorDto, DeleteSensorDto, UpdateSensorPositionDto } from './dto/request.dto';

@ApiTags('Sensor')
@Controller('sensor')
export class SensorController {
  constructor(private readonly sensorService: SensorService) {}

  @Get('getlist')
  async getSensorList(
    @Query('uid') uid: string,
    @Query('house_id') house_id: string,
  ): Promise<ApiResponse<Sensor[]>> {
    try {
      const sensors = await this.sensorService.getDevicesByHouseId(
        uid,
        house_id,
      );

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
  async getSensorDetail(
    @Query('uid') uid: string,
    @Query('house_id') house_id: string,
    @Query('sensor_id') sensor_id: number,
  ): Promise<ApiResponse<SensorDetail>> {
    try {
      const sensorDetail = await this.sensorService.getSensorDetail(
        uid,
        house_id,
        Number(sensor_id),
      );

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
  @ApiOperation({ summary: 'Add a new sensor, use -1 for null value' })
  async addSensor(@Body() addSensorDto: AddSensorDto): Promise<ApiResponse2> {
    const { uid, house_id, name, type, color, floor_id, room_id, x, y } =
      addSensorDto;
    try {
      const success = await this.sensorService.addSensor(
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
  @ApiOperation({ summary: 'Update sensor position, use -1 for null value' })
  async updateSensorPosition(
    @Body() updateSensorPositionDto: UpdateSensorPositionDto,
  ): Promise<ApiResponse2> {
    const { uid, house_id, sensor_id, floor_id, room_id, x, y } =
      updateSensorPositionDto;
    try {
      const success = await this.sensorService.updateSensorPosition(
        uid,
        house_id,
        sensor_id,
        floor_id,
        room_id,
        x,
        y,
      );

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
  @ApiOperation({ summary: 'Delete a sensor' })
  async deleteSensor(
    @Body() deleteSensorDto: DeleteSensorDto,
  ): Promise<ApiResponse2> {
    const { uid, house_id, sensor_id } = deleteSensorDto;
    try {
      const success = await this.sensorService.deleteSensor(
        uid,
        house_id,
        sensor_id,
      );

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
