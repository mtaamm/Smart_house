import { ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PutInfoRequestDto, RecruiterInfoDto } from './dto';

@Injectable()
export class RecruiterService {
  constructor(private prismaService: PrismaService) { }

  async getInfo(id: string): Promise<RecruiterInfoDto> {
    const recuiter = await this.prismaService.recruiter.findFirst({
      where: {
        uid: id
      },
      select: {
        company: true,
        logo_url: true,
        business_field: true,
        date_of_establishment: true,
        company_size: true,
        user: {
          select: {
            email: true,
            phone_number: true,
            address: true,
          }
        }
      }
    })
    return {
      company: recuiter.company,
      email: recuiter.user.email,
      logo_url: recuiter.logo_url,
      business_field: recuiter.business_field,
      company_size: recuiter.company_size,
      date_of_establishment: recuiter.date_of_establishment,
      phone_number: recuiter.user.phone_number,
      address: recuiter.user.address,
    };
  }

  async setInfo(id: string, infoRequest: PutInfoRequestDto): Promise<string> {
    const { company, company_size, date_of_establishment, phone_number, address, business_field } = infoRequest;

    try {
      await this.prismaService.$transaction(async (prisma) => {
        const existingRecruiter = await prisma.recruiter.findUnique({
          where: {
            uid: id,
          },
          include: { user: true },
        });

        if (!existingRecruiter) {
          throw new NotFoundException(`Recruiter with ID ${id} not found.`);
        }
          console.log(date_of_establishment)
        await prisma.recruiter.update({
          where: { uid: id },
          data: {
            company: company,
            company_size: company_size || existingRecruiter.company_size,
            date_of_establishment: date_of_establishment,
            business_field: business_field || existingRecruiter.business_field,
          },
        });

        await prisma.user.update({
          where: { uid: id },
          data: {
            phone_number: phone_number || existingRecruiter.user.phone_number,
            address: address || existingRecruiter.user.address,
            update_at: new Date(),
          },
        });

      });
      return 'Thông tin đã được cập nhật thành công.';
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Có lỗi xảy ra trong quá trình cập nhật thông tin hoặc số điện thoại đã tồn tại.');
    }
  }

  async setLogo(id: string, fileDestination: string): Promise<string> {
    try {
      await this.prismaService.$transaction(async (prisma) => {
        const existingJobSeeker = await prisma.recruiter.findUnique({
          where: {
            uid: id,
          },
        });

        if (!existingJobSeeker) {
          throw new NotFoundException(`Recruiter with ID ${id} not found.`);
        }

        await this.prismaService.recruiter.update({
          where: {
            uid: id,
          },
          data: {
            logo_url: fileDestination,
          }
        });

        await prisma.user.update({
          where: { uid: id },
          data: {
            update_at: new Date(),
          },
        });

      });

      return 'success'
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ForbiddenException('Fail');
      } else {
        throw new Error(`Unhandled error: ${error.message}`);
      }
    }
  }


}
