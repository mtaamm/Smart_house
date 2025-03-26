import { Body, Controller, Get, Post } from '@nestjs/common';
import { HouseService } from './house.service';
import { House, ApiResponse, HouseMember, ApiResponse2 } from './dto/dto';
import { HouseCreate, HouseUpdate } from './dto/request.dto';

@Controller('house')
export class HouseController {
  constructor(private readonly houseService: HouseService) {}

  @Get('getmap')
  async getHouseMap(uid: string, house_id: string): Promise<ApiResponse<House>> {
    try {
      const houseMap = await this.houseService.getHouseMap(uid, house_id);

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

  @Get('get-members')
  async getHouseMembers(uid: string, house_id: string): Promise<ApiResponse<HouseMember[]>> {
    try {
      const houseMembers = await this.houseService.getHouseMembers(uid, house_id);

      if (!houseMembers) {
        return {
          status: 'unsuccessful',
          message: 'No house members found',
          data: null,
        };
      }

      return {
        status: 'successful',
        message: 'Success',
        data: houseMembers,
      };
    } catch (error) {
      console.error('Error fetching house members:', error);
      return {
        status: 'unsuccessful',
        message: error.message || 'An error occurred',
        data: null,
      };
    }
  }

  @Post('delete-member')
  async deleteMember(@Body('uid') uid: string, @Body('house_id') house_id: string, @Body('member_id') member_id: string): Promise<ApiResponse2> {
    console.log('house_id:', house_id);
    console.log('member_id:', member_id);
    try {
      const deleteResult = await this.houseService.deleteMember(uid, house_id, member_id);

      if (deleteResult !== 'successful') {
        return {
          status: 'unsuccessful',
          message: deleteResult,
        };
      }

      return {
        status: 'successful',
        message: 'successful',
      };
    } catch (error) {
      console.error('Error deleting house member:', error);
      return {
        status: 'unsuccessful',
        message: error.message || 'An error occurred',
      };
    }
  }

  @Post('first-time-setup')
  async firstTimeSetup(@Body() houseCreate: HouseCreate): Promise<ApiResponse2> {
    try {
      const success = await this.houseService.firstTimeSetup(houseCreate);

      if (!success) {
        return {
          status: 'unsuccessful',
          message: 'Failed to create house',
        };
      }

      return {
        status: 'successful',
        message: 'House created successfully',
      };
    } catch (error) {
      console.error('Error creating house:', error);
      return {
        status: 'unsuccessful',
        message: error.message || 'An error occurred',
      };
    }
  }

  @Post('update')
  async updateHouse(@Body() houseUpdate: HouseUpdate): Promise<ApiResponse2> {
    try {
      const success = await this.houseService.updateHouse(houseUpdate);

      if (!success) {
        return {
          status: 'unsuccessful',
          message: 'Failed to update house',
        };
      }

      return {
        status: 'successful',
        message: 'House updated successfully',
      };
    } catch (error) {
      console.error('Error updating house:', error);
      return {
        status: 'unsuccessful',
        message: error.message || 'An error occurred',
      };
    }
  }
}
