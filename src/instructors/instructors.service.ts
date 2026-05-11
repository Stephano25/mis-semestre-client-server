import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInstructorDto } from './dto/instructor.dto';

@Injectable()
export class InstructorsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const instructors = await this.prisma.instructor.findMany({
      include: {
        courses: true,
      },
    });
    return { success: true, data: instructors };
  }

  async create(createInstructorDto: CreateInstructorDto) {
    const existing = await this.prisma.instructor.findUnique({
      where: { email: createInstructorDto.email },
    });
    if (existing) {
      throw new ConflictException('Email déjà utilisé');
    }

    const instructor = await this.prisma.instructor.create({
      data: createInstructorDto,
    });
    return { success: true, data: instructor };
  }
}