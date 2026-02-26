import { Injectable } from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProfilesService {
  constructor(private prisma: PrismaService) {}
  create(createProfileDto: CreateProfileDto) {
    return this.prisma.profile.create({
      data: {
        name: createProfileDto.name,
        age: createProfileDto.age,
        gender: createProfileDto.gender,
        bio: createProfileDto.bio,
        email: createProfileDto.email,
      }
    });
  }

  findAll() {
    return this.prisma.profile.findMany();
  }
}
