import { Controller, Get } from '@nestjs/common';
import { HouseService } from './house.service';
import { House, ApiResponse } from './dto/response.dto';

@Controller('house')
export class HouseController {
  constructor(private readonly houseService: HouseService) {}

  @Get('getmap')
  async getHouseMap(house_id: string): Promise<ApiResponse<House>> {
    try {
      const houseMap = await this.houseService.getHouseMap(house_id);

      if (!houseMap) {
        return {
          status: 'unsuccessful',
          message: 'No house data found',
          data: null,
        };
      }

      return {
        status: 'successful',
        message: 'Success',
        data: houseMap,
      };
    } catch (error) {
      console.error('Error fetching house map:', error);
      return {
        status: 'unsuccessful',
        message: error.message || 'An error occurred',
        data: null,
      };
    }
  }
}
