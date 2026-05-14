import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsIn, IsInt, Min, IsString, IsNumberString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEnrollmentDto {
  @ApiProperty()
  @IsNumberString()  // ← Accepte les strings numériques
  student_id: number | string;

  @ApiProperty()
  @IsNumberString()  // ← Accepte les strings numériques
  course_id: number | string;
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

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ required: false, default: 15 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  per_page?: number = 15;
}