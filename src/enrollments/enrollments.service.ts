import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEnrollmentDto, EnrollmentQueryDto } from './dto/enrollment.dto';

@Injectable()
export class EnrollmentsService {
  constructor(private prisma: PrismaService) {}

  async create(createEnrollmentDto: CreateEnrollmentDto) {
    const { student_id, course_id } = createEnrollmentDto;

    // Vérifier si l'étudiant existe
    const student = await this.prisma.student.findUnique({
      where: { id: student_id },
    });
    if (!student) {
      throw new NotFoundException('Étudiant non trouvé');
    }

    // Vérifier si le cours existe
    const course = await this.prisma.course.findUnique({
      where: { id: course_id },
    });
    if (!course) {
      throw new NotFoundException('Cours non trouvé');
    }

    // Vérifier si déjà inscrit
    const existing = await this.prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: student_id,
          courseId: course_id,
        },
      },
    });
    if (existing) {
      throw new ConflictException('Étudiant déjà inscrit à ce cours');
    }

    const enrollment = await this.prisma.enrollment.create({
      data: {
        studentId: student_id,
        courseId: course_id,
        status: 'pending',
        paymentStatus: 'unpaid',
      },
      include: {
        student: true,
        course: true,
      },
    });

    return { success: true, data: enrollment };
  }

  async complete(id: number) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id },
    });

    if (!enrollment) {
      throw new NotFoundException('Inscription non trouvée');
    }

    const updated = await this.prisma.enrollment.update({
      where: { id },
      data: { status: 'completed' },
    });

    return { success: true, data: updated };
  }

  async findAll(query: EnrollmentQueryDto) {
    const { status, payment_status, page = 1, per_page = 15 } = query;
    const skip = (page - 1) * per_page;

    const where: any = {};
    if (status) where.status = status;
    if (payment_status) where.paymentStatus = payment_status;

    const [enrollments, total] = await Promise.all([
      this.prisma.enrollment.findMany({
        where,
        skip,
        take: per_page,
        include: {
          student: true,
          course: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.enrollment.count({ where }),
    ]);

    return {
      success: true,
      data: enrollments,
      total,
      current_page: page,
      last_page: Math.ceil(total / per_page),
      per_page,
    };
  }
}