import { NestFactory } from '@nestjs/core';
import 'reflect-metadata';
import {
  initializeTransactionalContext,
  patchTypeORMRepositoryWithBaseRepository,
} from 'typeorm-transactional-cls-hooked';
import { AppModule } from './app.module';

initializeTransactionalContext();
patchTypeORMRepositoryWithBaseRepository();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3010);
}
bootstrap();
