import { Controller, Get } from '@nestjs/common';
import { HouseService } from './house.service';
import { HouseDTO, ApiResponseDTO } from './dto/response.dto';

@Controller('house')
export class HouseController {
  constructor(private readonly houseService: HouseService) {}

  @Get('getmap')
  async getHouseMap(): Promise<ApiResponseDTO<HouseDTO>> {
    try {
      const houseMap = await this.houseService.getHouseMap();

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
