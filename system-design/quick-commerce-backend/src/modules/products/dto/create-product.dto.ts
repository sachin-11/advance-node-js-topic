import { IsString, IsUUID, IsNumber, IsOptional, IsUrl, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({
    description: 'Product name',
    example: 'Organic Apples',
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  name!: string;

  @ApiPropertyOptional({
    description: 'Product description',
    example: 'Fresh organic apples from local farms',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Category ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  category_id!: string;

  @ApiProperty({
    description: 'Product price',
    example: 299.99,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiPropertyOptional({
    description: 'Product unit (piece, kg, liter, etc.)',
    example: 'kg',
    default: 'piece',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  unit?: string;

  @ApiPropertyOptional({
    description: 'Product image URL',
    example: 'https://example.com/images/apple.jpg',
  })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  image_url?: string;
}

