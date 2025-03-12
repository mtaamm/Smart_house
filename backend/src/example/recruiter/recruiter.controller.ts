import { Body, Controller, Get, Put, UploadedFile, UseInterceptors } from '@nestjs/common';
import { RecruiterService } from './recruiter.service';
import { RecruiterInfoDto, MessageResponseDto, PutFileRequestDto, PutInfoRequestDto, RecruiterInfoResponseDto } from './dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter, handleFileUpload, storageConfig } from 'helpers/config';
import { GetUser } from 'src/auth/decorator';
import { user } from '@prisma/client';

@Controller('recruiter')
export class RecruiterController {
  constructor(
    private recruiterService: RecruiterService,

  ) { }

  @Get('me')
  async getInfo(@GetUser() user: user): Promise<RecruiterInfoResponseDto> {
    const { uid } = user;
    const data: RecruiterInfoDto = await this.recruiterService.getInfo(uid);
    return { data, status: 'OK' };
  }

  @Put('change-info')
  async updateInfo(
    @GetUser() user: user,
    @Body() infoRequest: PutInfoRequestDto,
  ): Promise<MessageResponseDto> {
    const { uid } = user;
    const message: string = await this.recruiterService.setInfo(uid, infoRequest);
    return { status: 'OK', message };
  }

  @Put('change-logo')
  @UseInterceptors(
    FileInterceptor('logo_url', {
      storage: storageConfig('logo_url'),
      fileFilter: fileFilter(['.png', '.jpg', '.jpeg'], 5),
    }),
  )
  async setLogo(
    @GetUser() user: user,
    @Body() body: PutFileRequestDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<MessageResponseDto> {
    return handleFileUpload(file, body, async () =>
      this.recruiterService.setLogo(user.uid, `logo_url/${file.filename}`),
    );
  }

}
