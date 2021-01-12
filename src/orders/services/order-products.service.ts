import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderProductEntity } from '../entities/order-product.entity';

@Injectable()
export class OrderProductsService {
  constructor(
    @InjectRepository(OrderProductEntity)
    private readonly orderProductsRepo: Repository<OrderProductEntity>,
  ) {}

  findById(id: number) {
    return this.orderProductsRepo.findOne(id);
  }

  findByOrder(orderId: number) {
    return this.orderProductsRepo.find({ where: { orderId: orderId } });
  }

  create(orderId: number, productId: number, quantity: number) {
    return this.orderProductsRepo.insert({ orderId, productId, quantity });
  }
}
