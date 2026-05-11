import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCourseDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  duration_hours: number;

  @ApiProperty()
  @IsNumber()
  instructor_id: number;
}

export class UpdateCourseDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  duration_hours?: number;
}

export class CourseQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  instructor_id?: number;

  @ApiProperty({ required: false, enum: ['price', 'created_at'] })
  @IsOptional()
  @IsIn(['price', 'created_at'])
  sort?: string = 'created_at';

  @ApiProperty({ required: false, enum: ['asc', 'desc'] })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  direction?: string = 'desc';

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  per_page?: number = 15;
}