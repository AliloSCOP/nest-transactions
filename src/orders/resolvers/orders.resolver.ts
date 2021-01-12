import { UseInterceptors } from '@nestjs/common';
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { EntityManager } from 'typeorm';
import { TransactionParam } from '../../common/transactions/transaction-manager.decorator';
import { TransactionInterceptor } from '../../common/transactions/transaction.interceptor';
import { CreateOrderInput } from '../dtos/create-order.dto';
import { Order } from '../models/order.model';
import { OrderProductsService } from '../services/order-products.service';
import { OrdersService } from '../services/orders.service';

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

  @UseInterceptors(TransactionInterceptor)
  @Mutation(() => Order, { name: 'createOrder' })
  async create(
    @Args('input') input: CreateOrderInput,
    @TransactionParam() manager: EntityManager,
  ) {
    return this.ordersService.create(manager, input.user, input.orderProducts);
  }
}
