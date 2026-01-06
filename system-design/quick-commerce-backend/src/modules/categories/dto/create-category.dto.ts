import { IsString, IsUUID, IsOptional, IsUrl, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Category name',
    example: 'Fruits',
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  name!: string;

  @ApiPropertyOptional({
    description: 'Category description',
    example: 'Fresh fruits and vegetables',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Category image URL',
    example: 'https://example.com/images/fruits.jpg',
  })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  image_url?: string;

  @ApiPropertyOptional({
    description: 'Parent category ID (for hierarchical categories)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  parent_id?: string;
}

