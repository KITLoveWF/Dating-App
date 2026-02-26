import { Module } from '@nestjs/common';
import { AvailabilitiesService } from './availabilities.service';
import { AvailabilitiesController } from './availabilities.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AvailabilitiesController],
  providers: [AvailabilitiesService],
})
export class AvailabilitiesModule {}
