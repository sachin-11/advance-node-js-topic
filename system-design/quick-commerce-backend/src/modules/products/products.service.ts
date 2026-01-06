import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Product } from '../../entities/product.entity';
import { Category } from '../../entities/category.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';
import { LoggerService } from '../../common/logger/logger.service';
import Redis from 'ioredis';
import * as crypto from 'crypto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @Inject('REDIS_CLIENT')
    private readonly redisClient: Redis | null,
    private readonly logger: LoggerService,
  ) {}

  private generateCacheKey(filters: FilterProductDto): string {
    const filterString = JSON.stringify(filters);
    const hash = crypto.createHash('md5').update(filterString).digest('hex');
    return `products:list:${hash}`;
  }

  private async invalidateProductCache(): Promise<void> {
    if (!this.redisClient) return;

    try {
      const keys = await this.redisClient.keys('products:list:*');
      if (keys.length > 0) {
        await this.redisClient.del(...keys);
        this.logger.log('Product cache invalidated', 'ProductsService');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.stack : String(error);
      this.logger.error('Failed to invalidate product cache', errorMessage, 'ProductsService');
    }
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    // Verify category exists
    const category = await this.categoryRepository.findOne({
      where: { id: createProductDto.category_id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const product = this.productRepository.create({
      ...createProductDto,
      unit: createProductDto.unit || 'piece',
    });

    const savedProduct = await this.productRepository.save(product);
    await this.invalidateProductCache();

    this.logger.log(`Product created: ${savedProduct.name}`, 'ProductsService');
    return savedProduct;
  }

  async findAll(filterDto: FilterProductDto): Promise<{
    data: Product[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = filterDto.page || 1;
    const limit = filterDto.limit || 10;
    const skip = (page - 1) * limit;

    // Try to get from cache
    const cacheKey = this.generateCacheKey(filterDto);
    if (this.redisClient) {
      try {
        const cached = await this.redisClient.get(cacheKey);
        if (cached) {
          this.logger.log('Products retrieved from cache', 'ProductsService');
          return JSON.parse(cached);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.stack : String(error);
        this.logger.error('Cache read error', errorMessage, 'ProductsService');
      }
    }

    // Build query
    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.is_active = :isActive', { isActive: true });

    // Apply filters
    if (filterDto.category_id) {
      queryBuilder.andWhere('product.category_id = :categoryId', {
        categoryId: filterDto.category_id,
      });
    }

    if (filterDto.min_price !== undefined) {
      queryBuilder.andWhere('product.price >= :minPrice', {
        minPrice: filterDto.min_price,
      });
    }

    if (filterDto.max_price !== undefined) {
      queryBuilder.andWhere('product.price <= :maxPrice', {
        maxPrice: filterDto.max_price,
      });
    }

    if (filterDto.search) {
      queryBuilder.andWhere(
        '(product.name ILIKE :search OR product.description ILIKE :search)',
        { search: `%${filterDto.search}%` },
      );
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination
    const products = await queryBuilder
      .orderBy('product.created_at', 'DESC')
      .skip(skip)
      .take(limit)
      .getMany();

    const result = {
      data: products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    // Cache the result
    if (this.redisClient) {
      try {
        await this.redisClient.setex(cacheKey, 300, JSON.stringify(result)); // 5 minutes TTL
      } catch (error) {
        const errorMessage = error instanceof Error ? error.stack : String(error);
        this.logger.error('Cache write error', errorMessage, 'ProductsService');
      }
    }

    return result;
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id, is_active: true },
      relations: ['category'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);

    // Verify category if provided
    if (updateProductDto.category_id) {
      const category = await this.categoryRepository.findOne({
        where: { id: updateProductDto.category_id },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }
    }

    Object.assign(product, updateProductDto);
    const updatedProduct = await this.productRepository.save(product);
    await this.invalidateProductCache();

    this.logger.log(`Product updated: ${updatedProduct.name}`, 'ProductsService');
    return updatedProduct;
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    product.is_active = false;
    await this.productRepository.save(product);
    await this.invalidateProductCache();

    this.logger.log(`Product deleted (soft): ${product.name}`, 'ProductsService');
  }

  async search(query: string): Promise<Product[]> {
    if (!query || query.trim().length === 0) {
      throw new BadRequestException('Search query is required');
    }

    const products = await this.productRepository.find({
      where: [
        { name: Like(`%${query}%`), is_active: true },
        { description: Like(`%${query}%`), is_active: true },
      ],
      relations: ['category'],
      take: 20, // Limit search results
    });

    return products;
  }
}

