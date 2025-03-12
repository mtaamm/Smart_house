import { ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { InfoDto, PutInfoRequestDto } from './dto';

@Injectable()
export class JobSeekerService {
  constructor(private prismaService: PrismaService) {}

  private async getExistingJobSeeker(id: string) {
    const jobSeeker = await this.prismaService.job_seeker.findUnique({
      where: { uid: id },
      include: { user: true },
    });

    if (!jobSeeker) {
      throw new NotFoundException(`Job seeker with ID ${id} not found.`);
    }
    return jobSeeker;
  }

  async getInfo(id: string): Promise<InfoDto> {
    const jobSeeker = await this.prismaService.job_seeker.findUnique({
      where: { uid: id },
      select: {
        name: true,
        avatar_url: true,
        sex: true,
        day_of_birth: true,
        cv: true,
        about_me: true,
        user: { select: { email: true, phone_number: true, address: true } },
      },
    });

    if (!jobSeeker) {
      throw new NotFoundException(`Job seeker with ID ${id} not found.`);
    }

    return {
      name: jobSeeker.name,
      email: jobSeeker.user.email,
      avatar_url: jobSeeker.avatar_url,
      cv: jobSeeker.cv,
      sex: jobSeeker.sex,
      day_of_birth: jobSeeker.day_of_birth,
      phone_number: jobSeeker.user.phone_number,
      address: jobSeeker.user.address,
      about_me: jobSeeker.about_me,
    };
  }

  async setInfo(id: string, infoRequest: PutInfoRequestDto): Promise<string> {
    const { name, sex, day_of_birth, phone_number, address, about_me } = infoRequest;

    try {
      await this.prismaService.$transaction(async (prisma) => {
        const existingJobSeeker = await this.getExistingJobSeeker(id);

        await prisma.job_seeker.update({
          where: { uid: id },
          data: {
            name,
            sex: sex ?? existingJobSeeker.sex,
            day_of_birth,
            about_me: about_me ?? existingJobSeeker.about_me,
          },
        });

        await prisma.user.update({
          where: { uid: id },
          data: {
            phone_number: phone_number ?? existingJobSeeker.user.phone_number,
            address: address ?? existingJobSeeker.user.address,
            update_at: new Date(),
          },
        });
      });

      return 'Thông tin đã được cập nhật thành công.';
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Có lỗi xảy ra trong quá trình cập nhật thông tin hoặc số điện thoại đã tồn tại.',
      );
    }
  }

  private async updateFile(id: string, field: 'avatar_url' | 'cv', fileDestination: string): Promise<string> {
    try {
      await this.prismaService.$transaction(async (prisma) => {
        await this.getExistingJobSeeker(id);

        await prisma.job_seeker.update({
          where: { uid: id },
          data: { [field]: fileDestination },
        });

        await prisma.user.update({
          where: { uid: id },
          data: { update_at: new Date() },
        });
      });

      return 'success';
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ForbiddenException('Fail');
      }
      throw new InternalServerErrorException(`Unhandled error: ${error.message}`);
    }
  }

  async setAvatar(id: string, fileDestination: string): Promise<string> {
    return this.updateFile(id, 'avatar_url', fileDestination);
  }

  async setCV(id: string, fileDestination: string): Promise<string> {
    return this.updateFile(id, 'cv', fileDestination);
  }
}
