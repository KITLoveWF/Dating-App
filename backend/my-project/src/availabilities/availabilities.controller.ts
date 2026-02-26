import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AvailabilitiesService } from './availabilities.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { CheckAvailabilityDto } from './dto/check-availability.dto';

@Controller('availabilities')
export class AvailabilitiesController {
  constructor(private readonly availabilitiesService: AvailabilitiesService) {}

  @Post()
  create(@Body() createAvailabilityDto: CreateAvailabilityDto) {
    return this.availabilitiesService.create(createAvailabilityDto);
  }
  @Post('check')
  check(@Body() checkAvailabilityDto: CheckAvailabilityDto) {
    return this.availabilitiesService.check(checkAvailabilityDto);
  }
  @Get('schedule/:matchId/:userId')
  findSchedule(
    @Param('matchId') matchId: string,
    @Param('userId') userId: string,
  ){
    console.log('Received schedule request for matchId:', matchId, 'and userId:', userId);
    return this.availabilitiesService.findSchedule(
      parseInt(userId),
      parseInt(matchId)
    );
  }
  @Get()
  findAll() {
    return this.availabilitiesService.findAll();
  }
}
