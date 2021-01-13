import { UseInterceptors } from '@nestjs/common';
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { DeadUnlockerInterceptor } from '../../transactions/deadunlocker.interceptor';
import { CreateOrderInput } from '../dtos/create-order.dto';
import { Order } from '../models/order.model';
import { OrderProductsService } from '../services/order-products.service';
import { OrdersService } from '../services/orders.service';

@UseInterceptors(DeadUnlockerInterceptor)
@Resolver(() => Order)
export class OrdersResolver {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly orderProductsService: OrderProductsService,
  ) {}

  @Query(() => [Order])
  orders() {
    return this.ordersService.findAll();
  }

  @ResolveField()
  async orderProducts(@Parent() order: Order) {
    return this.orderProductsService.findByOrder(order.id);
  }

  @Transactional()
  @Mutation(() => Order, { name: 'createOrder' })
  async create(@Args('input') input: CreateOrderInput) {
    if (input.deadlock) {
      return this.ordersService.createWithDeadlock(
        input.user,
        input.orderProducts,
      );
    }
    return this.ordersService.create(input.user, input.orderProducts);
  }
}
