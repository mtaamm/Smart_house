import { Body, Query, Controller, Get, Post, Put, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import {SignUpParam, UserInfUpdateReq, verifyRequestCode, verifyHouse, LoginReq, Logout} from './userDTO/request.dto';
import {Login, UserInf, NotiInf, UsrInfUpdateRes, ApiResponse} from './userDTO/respone.dto';
import { ApiTags, ApiProperty } from '@nestjs/swagger';

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
  ): Promise<ApiResponse<string>> {
    try {
      const auth = await this.userService.signUp(param);
      return {
        status: 'successful',
        message: 'User registered successfully',
        data: auth,
      };
    } catch (error) {
      console.error('Error during sign-up:', error);
      return {
        status: 'unsuccessful',
        message: error.message || 'An error occurred',
        data: '',
      };
    }
  }

  @Post('verify-request-code')
  async verifyRequestCode(
    @Body() param: verifyRequestCode,
  ): Promise<ApiResponse<null>> {
    try {
      await this.userService.sendVerificationCode(param.uid, param.houseId);
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
    @Body() param: verifyHouse,
  ): Promise<ApiResponse<null>> {
    try {
      await this.userService.verifyHouse(
        param.uid,
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
    @Body() param: LoginReq,
  ): Promise<
    ApiResponse<Login>
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
  async logout(@Body() param: Logout): Promise<ApiResponse<null>> {
    try {
      await this.userService.logout(param.uid);
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
  async getUser(@Query('uid') uid: string): Promise<
    ApiResponse<UserInf>
  > {
    try {
      const userInfo = await this.userService.getUserInfo(uid);
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
  async getNotifications(@Query('uid') uid: string): Promise<
    ApiResponse<NotiInf>
  > {
    try {
      const notifications = await this.userService.getNotifications(uid);
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
  async updateUser(@Body() param: UserInfUpdateReq ): Promise<ApiResponse<UsrInfUpdateRes>> {
    try {
      const updatedUser = await this.userService.updateUserInfo(param);
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
