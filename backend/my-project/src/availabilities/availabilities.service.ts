import { Injectable } from '@nestjs/common';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { CheckAvailabilityDto } from './dto/check-availability.dto';
import { ResponseAvailabilityDto } from './dto/response-availability.dto';
import { PrismaService } from 'src/prisma/prisma.service';


@Injectable()
export class AvailabilitiesService {
  constructor(private prisma: PrismaService) {}
  async create(createAvailabilityDto: CreateAvailabilityDto) {
    const availability = await this.prisma.availability.findFirst({
      where: {
        userId: createAvailabilityDto.userId,
        matchId: createAvailabilityDto.matchId,
      }
    });
    if(availability){
      return this.prisma.availability.update({
        where: {
          id: availability.id,
        },
        data: {
          fromDate: createAvailabilityDto.fromDate,
          toDate: createAvailabilityDto.toDate,
        }
      });
    }
    return this.prisma.availability.create({
      data: {
        userId: createAvailabilityDto.userId,
        matchId: createAvailabilityDto.matchId,
        fromDate: createAvailabilityDto.fromDate,
        toDate: createAvailabilityDto.toDate,
      }
    });
  }
  async check(checkAvailabilityDto: CheckAvailabilityDto): Promise<ResponseAvailabilityDto > {
    const availabilityUser1 = await this.prisma.availability.findFirst({
      where: {
        userId: checkAvailabilityDto.user1Id,
        matchId: checkAvailabilityDto.matchId,
      }
    });
    const availabilityUser2 = await this.prisma.availability.findFirst({
      where: {
        userId: checkAvailabilityDto.user2Id,
        matchId: checkAvailabilityDto.matchId,
        }
    });
    console.log('Availability User 1:', availabilityUser1);
    console.log('Availability User 2:', availabilityUser2);
    if (!availabilityUser1 || !availabilityUser2) {
        console.log('One or both users do not have availability records for this match.');
        return {
          isAvailable: false,
          fromDate: null,
          toDate: null,
        };
      }
    if(availabilityUser1.fromDate > availabilityUser2.toDate || availabilityUser2.fromDate > availabilityUser1.toDate ) {
      return {
        isAvailable: false,
        fromDate: null,
        toDate: null,
      };
    }
    else {
      if(availabilityUser1.fromDate <= availabilityUser2.toDate) {
        const fromDate : Date = availabilityUser1.fromDate;
        const toDate : Date = availabilityUser2.toDate;
        const response : ResponseAvailabilityDto = {
          isAvailable: true,
          fromDate: fromDate,
          toDate: toDate,
        }
        return response;
      }
      else {
        const fromDate : Date = availabilityUser2.fromDate;
        const toDate : Date = availabilityUser1.toDate;
        const response : ResponseAvailabilityDto = {
          isAvailable: true,
          fromDate: fromDate,
          toDate: toDate,
        }
        return response; 
      }
    }
  }
  async findSchedule(userId: number, matchId: number) {
    return this.prisma.availability.findFirst({
      where: {
        matchId: matchId,
        userId: userId,
      }
    })
  }
  findAll() {
    return this.prisma.availability.findMany();
  }

}
