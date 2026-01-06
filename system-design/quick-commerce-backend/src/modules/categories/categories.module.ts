import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { Category } from '../../entities/category.entity';
import { Product } from '../../entities/product.entity';
import { LoggerService } from '../../common/logger/logger.service';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Product])],
  controllers: [CategoriesController],
  providers: [CategoriesService, LoggerService],
  exports: [CategoriesService],
})
export class CategoriesModule {}

