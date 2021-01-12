import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from '../entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productsRepo: Repository<ProductEntity>,
  ) {}

  findById(id: number) {
    return this.productsRepo.findOne(id);
  }

  findAll() {
    return this.productsRepo.find();
  }

  async decreaseStock(productId: number, quantity: number, user: string) {
    if (quantity < 1) {
      throw new Error('quantity must be a positive integer');
    }

    const product = await this.productsRepo.findOne(productId, {
      lock: { mode: 'pessimistic_write' },
    });

    if (!product) {
      throw new Error('product does not exist');
    }

    if (quantity > product.stock) {
      throw new Error('not enough stock');
    }

    await this.productsRepo.update(productId, {
      stock: product.stock - quantity,
      lastCustomer: user,
    });
  }
}
