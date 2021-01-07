import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from '../products/products.module';
import { OrderProductEntity } from './entities/order-product.entity';
import { OrderEntity } from './entities/order.entity';
import { OrderProductsResolver } from './resolvers/order-products.resolver';
import { OrdersResolver } from './resolvers/orders.resolver';
import { OrderProductsService } from './services/order-products.service';
import { OrdersService } from './services/orders.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderEntity, OrderProductEntity]),
    ProductsModule,
  ],
  providers: [
    OrdersService,
    OrderProductsService,
    OrdersResolver,
    OrderProductsResolver,
  ],
})
export class OrdersModule {}
