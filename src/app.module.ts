import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderProductEntity } from './orders/entities/order-product.entity';
import { OrderEntity } from './orders/entities/order.entity';
import { OrdersModule } from './orders/orders.module';
import { ProductEntity } from './products/entities/product.entity';
import { ProductsModule } from './products/products.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: '127.0.0.1',
      port: 3306,
      username: 'docker',
      password: 'docker',
      database: 'db',
      entities: [OrderEntity, ProductEntity, OrderProductEntity],
      synchronize: true,
      // logging: 'all',
    }),
    GraphQLModule.forRoot({
      autoSchemaFile: true,
    }),
    ProductsModule,
    OrdersModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
