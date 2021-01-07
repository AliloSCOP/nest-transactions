import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrderProductEntity } from './orders/entities/order-product.entity';
import { OrderEntity } from './orders/entities/order.entity';
import { OrdersModule } from './orders/orders.module';
import { ProductEntity } from './products/entities/product.entity';
import { ProductsModule } from './products/products.module';

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
      // logging: true,
    }),
    GraphQLModule.forRoot({
      autoSchemaFile: true,
    }),
    ProductsModule,
    OrdersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
