import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEnrollmentDto {
  @ApiProperty()
  @IsNumber()
  student_id: number;

  @ApiProperty()
  @IsNumber()
  course_id: number;
}

export class EnrollmentQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsIn(['pending', 'active', 'completed'])
  status?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsIn(['unpaid', 'paid'])
  payment_status?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  per_page?: number = 15;
}