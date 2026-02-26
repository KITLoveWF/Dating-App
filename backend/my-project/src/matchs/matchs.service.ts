import { Injectable } from '@nestjs/common';
import { UpdateMatchDto } from './dto/update-match.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MatchsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.match.findMany();
  }

  async update( updateMatchDto: UpdateMatchDto) {
    console.log("updateMatchDto",updateMatchDto);
    const match = await this.prisma.match.findFirst({
      where: { user1Id: updateMatchDto.user1Id, user2Id: updateMatchDto.user2Id },
    });
    const matchReverse = await this.prisma.match.findFirst({
      where: { user1Id: updateMatchDto.user2Id, user2Id: updateMatchDto.user1Id },
    });
    if (!match && !matchReverse) {
      return this.prisma.match.create({
        data: {
          user1Id: updateMatchDto.user1Id,
          user2Id: updateMatchDto.user2Id,
        }
      }); 
    }
    return this.prisma.match.updateMany({
      where: { user1Id: updateMatchDto.user1Id, user2Id: updateMatchDto.user2Id },
      data: {
        isMutal: true,
      }
    });
  }
}
