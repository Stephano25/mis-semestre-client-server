import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCourseDto, UpdateCourseDto, CourseQueryDto } from './dto/course.dto';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: CourseQueryDto) {
    const { instructor_id, sort = 'created_at', direction = 'desc', page = 1, per_page = 15 } = query;
    const skip = (page - 1) * per_page;

    const where: any = {};
    if (instructor_id) {
      where.instructorId = instructor_id;
    }

    const orderBy: any = {};
    if (sort === 'price') {
      orderBy.price = direction;
    } else {
      orderBy.createdAt = direction;
    }

    const [courses, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        skip,
        take: per_page,
        orderBy,
        include: {
          instructor: true,
        },
      }),
      this.prisma.course.count({ where }),
    ]);

    return {
      success: true,
      data: courses,
      total,
      current_page: page,
      last_page: Math.ceil(total / per_page),
      per_page,
    };
  }

  async create(createCourseDto: CreateCourseDto) {
    const instructor = await this.prisma.instructor.findUnique({
      where: { id: createCourseDto.instructor_id },
    });
    if (!instructor) {
      throw new NotFoundException('Formateur non trouvé');
    }

    const course = await this.prisma.course.create({
      data: {
        title: createCourseDto.title,
        price: createCourseDto.price,
        durationHours: createCourseDto.duration_hours,
        instructorId: createCourseDto.instructor_id,
      },
      include: { instructor: true },
    });

    return { success: true, data: course };
  }

  async findOne(id: number) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        instructor: true,
        enrollments: true,
      },
    });

    if (!course) {
      throw new NotFoundException('Cours non trouvé');
    }

    return {
      success: true,
      data: {
        ...course,
        enrollmentCount: course.enrollments.length,
      },
    };
  }

  async update(id: number, updateCourseDto: UpdateCourseDto) {
    await this.findOne(id);

    const course = await this.prisma.course.update({
      where: { id },
      data: {
        title: updateCourseDto.title,
        price: updateCourseDto.price,
        durationHours: updateCourseDto.duration_hours,
      },
      include: { instructor: true },
    });

    return { success: true, data: course };
  }

  async remove(id: number) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        enrollments: {
          where: { status: { in: ['pending', 'active'] } },
        },
      },
    });

    if (!course) {
      throw new NotFoundException('Cours non trouvé');
    }

    if (course.enrollments.length > 0) {
      throw new BadRequestException(
        'Impossible de supprimer ce cours car des inscriptions actives existent',
      );
    }

    await this.prisma.course.delete({ where: { id } });
    return { success: true, message: 'Cours supprimé avec succès' };
  }
}