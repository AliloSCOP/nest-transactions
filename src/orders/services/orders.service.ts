import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductsService } from '../../products/services/products.service';
import { OrderEntity } from '../entities/order.entity';
import { OrderProductsService } from './order-products.service';

const waait = (delay: number) =>
  new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, delay);
  });

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly ordersRepo: Repository<OrderEntity>,
    private readonly orderProductsService: OrderProductsService,
    private readonly productsService: ProductsService,
  ) {}

  findAll() {
    return this.ordersRepo.find();
  }

  async create(
    user: string,
    basket: { productId: number; quantity: number }[],
    delay = 100,
  ) {
    await waait(delay);

    await Promise.all(
      basket.map((b) =>
        this.productsService.decreaseStock(b.productId, b.quantity, user),
      ),
    );

    await waait(delay);

    const order = await this.ordersRepo.save({
      user,
    });

    await waait(delay);

    await Promise.all(
      basket.map((b) =>
        this.orderProductsService.create(order.id, b.productId, b.quantity),
      ),
    );

    await waait(delay);

    return order;
  }
}
