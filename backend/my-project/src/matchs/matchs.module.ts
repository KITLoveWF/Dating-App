import { Module } from '@nestjs/common';
import { MatchsService } from './matchs.service';
import { MatchsController } from './matchs.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MatchsController],
  providers: [MatchsService],
})
export class MatchsModule {}
