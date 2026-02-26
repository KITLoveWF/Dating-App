import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProfilesModule } from './profiles/profiles.module';
import { MatchsModule } from './matchs/matchs.module';
import { PrismaModule } from './prisma/prisma.module';
import { AvailabilitiesModule } from './availabilities/availabilities.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ProfilesModule, 
    MatchsModule, 
    PrismaModule, 
    AvailabilitiesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
