import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { ProductEntity } from '../entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productsRepo: Repository<ProductEntity>,
  ) {}

  findById(id: number, lock = false) {
    return this.productsRepo.findOne(id, {
      ...(lock ? { lock: { mode: 'pessimistic_write' } } : {}),
    });
  }

  findAll() {
    return this.productsRepo.find();
  }

  @Transactional()
  async decreaseStock(productId: number, quantity: number, user: string) {
    if (quantity < 1) {
      throw new Error('quantity must be a positive integer');
    }

    const product = await this.findById(productId, true);

    if (!product) {
      throw new Error('product does not exist');
    }

    if (quantity > product.stock) {
      throw new Error('not enough stock');
    }

    await this.productsRepo.update(1, {
      stock: product.stock - quantity,
      lastCustomer: user,
    });
  }
}
