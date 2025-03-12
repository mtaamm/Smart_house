import { Module } from '@nestjs/common';
import { JobSeekerService } from './job_seeker.service';
import { JobSeekerController } from './job_seeker.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule],
  providers: [
    JobSeekerService],
  controllers: [JobSeekerController],
})
export class JobSeekerModule {}
