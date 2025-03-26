import { Body, Controller, Get, Post, Put, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiResponse } from '../house/dto/response.dto';
import { ApiTags } from '@nestjs/swagger';

interface SignUpParam {
  username: string;
  password: string;
  name: string;
  age: number;
  phone_number: string;
  email: string;
}

interface Auth {
  uid: string;
  auth_code: string;
}

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Post('sign-up')
  async signUp(
    @Body() param: SignUpParam,
  ): Promise<ApiResponse<{ auth: Auth }>> {
    try {
      const auth = await this.userService.signUp(param);
      return {
        status: 'successful',
        message: 'User registered successfully',
        data: { auth },
      };
    } catch (error) {
      console.error('Error during sign-up:', error);
      return {
        status: 'unsuccessful',
        message: error.message || 'An error occurred',
        data: null,
      };
    }
  }

  @Post('verify-request-code')
  async verifyRequestCode(
    @Body() param: { auth: Auth; houseId: string },
  ): Promise<ApiResponse<null>> {
    try {
      await this.userService.sendVerificationCode(param.auth, param.houseId);
      return {
        status: 'successful',
        message: 'Verification code sent successfully',
        data: null,
      };
    } catch (error) {
      console.error('Error sending verification code:', error);
      return {
        status: 'unsuccessful',
        message: error.message || 'An error occurred',
        data: null,
      };
    }
  }

  @Post('verify-house')
  async verifyHouse(
    @Body() param: { auth: Auth; house_id: string; code: string },
  ): Promise<ApiResponse<null>> {
    try {
      await this.userService.verifyHouse(
        param.auth,
        param.house_id,
        param.code,
      );
      return {
        status: 'successful',
        message: 'House verification successful',
        data: null,
      };
    } catch (error) {
      console.error('Error verifying house:', error);
      return {
        status: 'unsuccessful',
        message: error.message || 'An error occurred',
        data: null,
      };
    }
  }

  @Post('login')
  async login(
    @Body() param: { username: string; password: string },
  ): Promise<
    ApiResponse<{ auth: Auth; own_house: boolean; root_owner: boolean }>
  > {
    try {
      const loginResponse = await this.userService.login(
        param.username,
        param.password,
      );
      return {
        status: 'successful',
        message: 'Login successful',
        data: loginResponse,
      };
    } catch (error) {
      console.error('Error during login:', error);
      return {
        status: 'unsuccessful',
        message: error.message || 'Invalid username or password',
        data: null,
      };
    }
  }

  @Post('logout')
  async logout(@Body() param: { auth: Auth }): Promise<ApiResponse<null>> {
    try {
      await this.userService.logout(param.auth);
      return {
        status: 'successful',
        message: 'Logout successful',
        data: null,
      };
    } catch (error) {
      console.error('Error during logout:', error);
      return {
        status: 'unsuccessful',
        message: error.message || 'An error occurred',
        data: null,
      };
    }
  }

  @Get('get')
  async getUser(@Body() param: { auth: Auth }): Promise<
    ApiResponse<{
      uid: string;
      house_id: string | null;
      root_owner: boolean;
      name: string;
      age: number | null;
      phone_number: string | null;
      email: string;
    }>
  > {
    try {
      const userInfo = await this.userService.getUserInfo(param.auth);
      return {
        status: 'successful',
        message: 'User information retrieved successfully',
        data: userInfo,
      };
    } catch (error) {
      console.error('Error fetching user information:', error);
      return {
        status: 'unsuccessful',
        message: error.message || 'An error occurred',
        data: null,
      };
    }
  }

  @Get('get-noti')
  async getNotifications(@Body() param: { auth: Auth }): Promise<
    ApiResponse<{
      total: number;
      unread: number;
      notices: Array<{
        id: string;
        time: string;
        content: string;
        read: boolean;
      }>;
    }>
  > {
    try {
      const notifications = await this.userService.getNotifications(param.auth);
      return {
        status: 'successful',
        message: 'Notifications retrieved successfully',
        data: notifications,
      };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return {
        status: 'unsuccessful',
        message: error.message || 'An error occurred',
        data: null,
      };
    }
  }

  @Put('update')
  async updateUser(
    @Body()
    param: {
      auth: Auth;
      data: {
        name: string;
        age: number;
        phone_number: string;
        email: string;
      };
    },
  ): Promise<
    ApiResponse<{
      uid: string;
      house_id: string | null;
      root_owner: boolean;
      name: string;
      age: number | null;
      phone_number: string | null;
      email: string;
    }>
  > {
    try {
      const updatedUser = await this.userService.updateUserInfo(
        param.auth,
        param.data,
      );
      return {
        status: 'successful',
        message: 'User information updated successfully',
        data: updatedUser,
      };
    } catch (error) {
      console.error('Error updating user information:', error);
      return {
        status: 'unsuccessful',
        message: error.message || 'An error occurred',
        data: null,
      };
    }
  }
}
