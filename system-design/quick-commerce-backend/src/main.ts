import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggerService } from './common/logger/logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const logger = app.get(LoggerService);

  // Get app configuration
  const appConfig = configService.get('app');
  const port = appConfig?.port || 3000;
  const apiPrefix = appConfig?.apiPrefix || 'api';

  // Security: Helmet for HTTP headers (configured to allow Swagger assets)
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }),
  );

  // CORS configuration
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  // Swagger API Documentation (setup BEFORE global prefix to avoid path conflicts)
  const config = new DocumentBuilder()
    .setTitle('Quick Commerce Backend API')
    .setDescription(
      'RESTful API for Quick Commerce Platform - A modern e-commerce backend solution with features for product management, orders, users, and more.',
    )
    .setVersion('1.0.0')
    .addTag('Health', 'Health check endpoints')
    .addTag('API', 'Main API endpoints')
    .addTag('Root', 'Root endpoint')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // This name here is important for matching up with @ApiBearerAuth() in your controller!
    )
    .addServer(`http://localhost:${port}`, 'Local Development')
    .addServer('https://api.quickcommerce.com', 'Production')
    .build();

  // Global prefix (exclude health endpoint, docs, and root routes)
  app.setGlobalPrefix(apiPrefix, {
    exclude: ['health', 'docs', '/'],
  });

  // Swagger API Documentation (setup AFTER global prefix with proper configuration)
  const document = SwaggerModule.createDocument(app, config);
  
  // Setup Swagger at /docs to avoid path conflicts with api-docs
  SwaggerModule.setup('docs', app, document, {
    useGlobalPrefix: false, // Don't apply global prefix to Swagger UI routes
    customSiteTitle: 'Quick Commerce API Docs',
    customfavIcon: '/favicon.ico', // Use local favicon to avoid CSP issues
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that don't have decorators
      forbidNonWhitelisted: true, // Throw error for non-whitelisted properties
      transform: true, // Automatically transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global response interceptor
  app.useGlobalInterceptors(new TransformInterceptor());

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    logger.log('SIGTERM signal received: closing HTTP server');
    await app.close();
  });

  process.on('SIGINT', async () => {
    logger.log('SIGINT signal received: closing HTTP server');
    await app.close();
  });

  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}/${apiPrefix}`);
  logger.log(`Health check available at: http://localhost:${port}/health`);
  logger.log(`Root endpoint: http://localhost:${port}/`);
  logger.log(`Swagger API Documentation: http://localhost:${port}/docs`);
}

bootstrap();
