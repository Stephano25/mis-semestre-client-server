import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentDto, UpdateStudentDto, StudentQueryDto } from './dto/student.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: StudentQueryDto) {
    const page = Number(query.page) || 1;
    const per_page = Number(query.per_page) || 15;
    const skip = (page - 1) * per_page;

    const where: any = {};
    if (query.name) {
      where.name = { contains: query.name };
    }

    const [students, total] = await Promise.all([
      this.prisma.student.findMany({
        where,
        skip,
        take: per_page,
      }),
      this.prisma.student.count({ where }),
    ]);

    return {
      success: true,
      data: students,
      total,
      current_page: page,
      last_page: Math.ceil(total / per_page),
      per_page: per_page,
    };
  }

  async create(createStudentDto: CreateStudentDto) {
    const existing = await this.prisma.student.findUnique({
      where: { email: createStudentDto.email },
    });
    if (existing) {
      throw new ConflictException('Email déjà utilisé');
    }

    const hashedPassword = await bcrypt.hash(createStudentDto.password, 10);
    const student = await this.prisma.student.create({
      data: {
        ...createStudentDto,
        password: hashedPassword,
      },
    });

    const { password, ...result } = student;
    return { success: true, data: result };
  }

  async findOne(id: number) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: {
        enrollments: {
          include: { course: true },
        },
      },
    });

    if (!student) {
      throw new NotFoundException('Étudiant non trouvé');
    }

    const { password, ...result } = student;
    return { success: true, data: result };
  }

  async update(id: number, updateStudentDto: UpdateStudentDto) {
    await this.findOne(id);

    const student = await this.prisma.student.update({
      where: { id },
      data: updateStudentDto,
    });

    const { password, ...result } = student;
    return { success: true, data: result };
  }

  async remove(id: number) {
    // 1. Vérifier si l'étudiant existe
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: {
        enrollments: true,
      },
    });

    if (!student) {
      throw new NotFoundException('Étudiant non trouvé');
    }

    // 2. Supprimer TOUTES les inscriptions de l'étudiant
    if (student.enrollments.length > 0) {
      console.log(`Suppression de ${student.enrollments.length} inscription(s) pour l'étudiant ${id}`);
      await this.prisma.enrollment.deleteMany({
        where: { studentId: id },
      });
    }

    // 3. Maintenant supprimer l'étudiant
    await this.prisma.student.delete({
      where: { id },
    });
  }
}