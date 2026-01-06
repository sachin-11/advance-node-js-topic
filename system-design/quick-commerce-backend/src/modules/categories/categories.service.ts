import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../../entities/category.entity';
import { Product } from '../../entities/product.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { LoggerService } from '../../common/logger/logger.service';
import Redis from 'ioredis';

@Injectable()
export class CategoriesService {
  private readonly CACHE_KEY = 'categories:list';
  private readonly CACHE_TTL = 600; // 10 minutes

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @Inject('REDIS_CLIENT')
    private readonly redisClient: Redis | null,
    private readonly logger: LoggerService,
  ) {}

  private async invalidateCategoryCache(): Promise<void> {
    if (!this.redisClient) return;

    try {
      await this.redisClient.del(this.CACHE_KEY);
      // Also invalidate product cache since products depend on categories
      const productKeys = await this.redisClient.keys('products:list:*');
      if (productKeys.length > 0) {
        await this.redisClient.del(...productKeys);
      }
      this.logger.log('Category cache invalidated', 'CategoriesService');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.stack : String(error);
      this.logger.error('Failed to invalidate category cache', errorMessage, 'CategoriesService');
    }
  }

  private buildCategoryHierarchy(categories: Category[]): Category[] {
    const categoryMap = new Map<string, Category & { children: Category[] }>();
    const rootCategories: Category[] = [];

    // Create map of all categories
    categories.forEach((category) => {
      categoryMap.set(category.id, { ...category, children: [] });
    });

    // Build hierarchy
    categories.forEach((category) => {
      const categoryWithChildren = categoryMap.get(category.id)!;
      if (category.parent_id && categoryMap.has(category.parent_id)) {
        const parent = categoryMap.get(category.parent_id)!;
        parent.children.push(categoryWithChildren);
      } else {
        rootCategories.push(categoryWithChildren);
      }
    });

    return rootCategories;
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    // Verify parent category exists if provided
    if (createCategoryDto.parent_id) {
      const parent = await this.categoryRepository.findOne({
        where: { id: createCategoryDto.parent_id },
      });

      if (!parent) {
        throw new NotFoundException('Parent category not found');
      }
    }

    const category = this.categoryRepository.create(createCategoryDto);
    const savedCategory = await this.categoryRepository.save(category);
    await this.invalidateCategoryCache();

    this.logger.log(`Category created: ${savedCategory.name}`, 'CategoriesService');
    return savedCategory;
  }

  async findAll(): Promise<Category[]> {
    // Try to get from cache
    if (this.redisClient) {
      try {
        const cached = await this.redisClient.get(this.CACHE_KEY);
        if (cached) {
          this.logger.log('Categories retrieved from cache', 'CategoriesService');
          return JSON.parse(cached);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.stack : String(error);
        this.logger.error('Cache read error', errorMessage, 'CategoriesService');
      }
    }

    // Fetch from database
    const categories = await this.categoryRepository.find({
      where: { is_active: true },
      relations: ['parent', 'children'],
      order: { created_at: 'ASC' },
    });

    // Build hierarchy
    const hierarchicalCategories = this.buildCategoryHierarchy(categories);

    // Cache the result
    if (this.redisClient) {
      try {
        await this.redisClient.setex(
          this.CACHE_KEY,
          this.CACHE_TTL,
          JSON.stringify(hierarchicalCategories),
        );
      } catch (error) {
        const errorMessage = error instanceof Error ? error.stack : String(error);
        this.logger.error('Cache write error', errorMessage, 'CategoriesService');
      }
    }

    return hierarchicalCategories;
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id, is_active: true },
      relations: ['parent', 'children', 'products'],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);

    // Verify parent category if provided
    if (updateCategoryDto.parent_id) {
      if (updateCategoryDto.parent_id === id) {
        throw new BadRequestException('Category cannot be its own parent');
      }

      const parent = await this.categoryRepository.findOne({
        where: { id: updateCategoryDto.parent_id },
      });

      if (!parent) {
        throw new NotFoundException('Parent category not found');
      }
    }

    Object.assign(category, updateCategoryDto);
    const updatedCategory = await this.categoryRepository.save(category);
    await this.invalidateCategoryCache();

    this.logger.log(`Category updated: ${updatedCategory.name}`, 'CategoriesService');
    return updatedCategory;
  }

  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);

    // Check if category has products
    const productCount = await this.productRepository.count({
      where: { category_id: id, is_active: true },
    });

    if (productCount > 0) {
      throw new BadRequestException(
        `Cannot delete category. It has ${productCount} active product(s).`,
      );
    }

    // Check if category has children
    const childrenCount = await this.categoryRepository.count({
      where: { parent_id: id, is_active: true },
    });

    if (childrenCount > 0) {
      throw new BadRequestException(
        `Cannot delete category. It has ${childrenCount} sub-category(ies).`,
      );
    }

    category.is_active = false;
    await this.categoryRepository.save(category);
    await this.invalidateCategoryCache();

    this.logger.log(`Category deleted (soft): ${category.name}`, 'CategoriesService');
  }
}

