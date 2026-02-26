import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MatchsService } from './matchs.service';
import { UpdateMatchDto } from './dto/update-match.dto';

@Controller('matchs')
export class MatchsController {
  constructor(private readonly matchsService: MatchsService) {}

  @Post()
  update(@Body() updateMatchDto: UpdateMatchDto) {
    return this.matchsService.update(updateMatchDto);
  }
  
  @Get()
  findAll() {
    return this.matchsService.findAll();
  }

}
