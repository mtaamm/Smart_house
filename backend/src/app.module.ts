import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { HouseModule } from './house/house.module';
import { SensorModule } from './sensor/sensor.module';
import { DeviceModule } from './device/device.module';

@Module({
  imports: [PrismaModule, UserModule, HouseModule, SensorModule, DeviceModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
