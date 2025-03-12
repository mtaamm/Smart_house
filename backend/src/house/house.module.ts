import { Module } from '@nestjs/common';
import { HouseService } from './house.service';
import { HouseController } from './house.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [HouseService, PrismaService],
  controllers: [HouseController]
})
export class HouseModule {}
