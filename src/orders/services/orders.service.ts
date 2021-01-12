import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { ProductEntity } from '../../products/entities/product.entity';
import { ProductsService } from '../../products/services/products.service';
import { OrderProductEntity } from '../entities/order-product.entity';
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
    private readonly connection: Connection,
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

    await Promise.all(
      basket.map((b) =>
        this.productsService.decreaseStock(b.productId, b.quantity, user),
      ),
    );

    await waait(delay);

    return order;
  }

  /**
    Same as create except execution order
   */

  async create2(
    user: string,
    basket: { productId: number; quantity: number }[],
    delay = 100,
  ) {
    const order = await this.ordersRepo.save({
      user,
    });

    await waait(delay);

    await Promise.all(
      basket.map((b) =>
        this.productsService.decreaseStock(b.productId, b.quantity, user),
      ),
    );

    await waait(delay);

    await Promise.all(
      basket.map((b) =>
        this.orderProductsService.create(order.id, b.productId, b.quantity),
      ),
    );

    await waait(delay);

    return order;
  }

  /** */
  createUnitOfWork = async (
    user: string,
    basket: { productId: number; quantity: number }[],
    delay = 3000,
    attempt = 0,
  ) => {
    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const decreaseStock = async (
        productId: number,
        quantity: number,
        user: string,
      ) => {
        const product = await queryRunner.manager.findOne(
          ProductEntity,
          productId,
          {
            lock: { mode: 'pessimistic_write' },
          },
        );
        if (!product) {
          throw new Error('product does not exist');
        }

        if (quantity > product.stock) {
          throw new Error('not enough stock');
        }

        await queryRunner.manager.update(ProductEntity, productId, {
          stock: product.stock - quantity,
          lastCustomer: user,
        });
      };

      const order = await queryRunner.manager.save(
        queryRunner.manager.create(OrderEntity, { user }),
      );

      await waait(delay);

      await Promise.all(
        basket.map((b) =>
          queryRunner.manager.insert(OrderProductEntity, {
            orderId: order.id,
            productId: b.productId,
            quantity: b.quantity,
          }),
        ),
      );

      await waait(delay);

      await Promise.all(
        basket.map((b) => decreaseStock(b.productId, b.quantity, user)),
      );

      await waait(delay);

      await queryRunner.commitTransaction();

      return order;
    } catch (error) {
      console.log('--->', error);
      await queryRunner.rollbackTransaction();
      if (error.code === 'ER_LOCK_DEADLOCK' && attempt < 3) {
        // queryRunner.release();
        return this.createUnitOfWork(user, basket, delay, attempt + 1);
      }
    } finally {
      await queryRunner.release();
    }
  };
}
