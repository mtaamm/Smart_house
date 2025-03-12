import {
  Body,
  Controller,
  Get,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { JobSeekerService } from './job_seeker.service';
import { storageConfig, handleFileUpload, fileFilter } from '../../helpers/config';
import {
  InfoResponseDto,
  InfoDto,
  MessageResponseDto,
  PutInfoRequestDto,
  PutFileRequestDto,
} from './dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetUser } from 'src/auth/decorator';
import { user } from '@prisma/client';

@Controller('job-seeker')
export class JobSeekerController {
  constructor(private jobSeekerService: JobSeekerService) {}

  @Get('me')
  async getInfo(@GetUser() user: user): Promise<InfoResponseDto> {
    const { uid } = user;
    const data: InfoDto = await this.jobSeekerService.getInfo(uid);
    return { data, status: 'OK' };
  }

  @Put('change-info')
  async updateInfo(
    @GetUser() user: user,
    @Body() infoRequest: PutInfoRequestDto,
  ): Promise<MessageResponseDto> {
    const { uid } = user;
    const message: string = await this.jobSeekerService.setInfo(uid, infoRequest);
    return { status: 'OK', message };
  }

  @Put('change-avatar')
  @UseInterceptors(
    FileInterceptor('avatar_url', {
      storage: storageConfig('avatar_url'),
      fileFilter: fileFilter(['.png', '.jpg', '.jpeg'], 5),
    }),
  )
  async setAvatar(
    @GetUser() user: user,
    @Body() body: PutFileRequestDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<MessageResponseDto> {
    return handleFileUpload(file, body, async () =>
      await this.jobSeekerService.setAvatar(user.uid, `avatar_url/${file.filename}`),
    );
  }

  @Put('change-cv')
  @UseInterceptors(
    FileInterceptor('cv', {
      storage: storageConfig('cv'),
      fileFilter: fileFilter(['.pdf', '.doc', '.docx'], 5),
    }),
  )
  async setCV(
    @GetUser() user: user,
    @Body() body: PutFileRequestDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<MessageResponseDto> {
    return handleFileUpload(file, body, async () =>
      await this.jobSeekerService.setCV(user.uid, `cv/${file.filename}`),
    );
  }

  @Get('pre-apply')
  async preApply(@GetUser() user: user) {
    const jobSeeker = await this.jobSeekerService.getInfo(user.uid);
    return {
      status: 'OK',
      data: {
        name: jobSeeker.name,
        cv: jobSeeker.cv,
      },
    };
  }
}
