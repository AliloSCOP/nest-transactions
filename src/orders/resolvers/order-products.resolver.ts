import {
  //   Args,
  //   Int,
  //   Query,
  Parent,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { ProductsService } from '../../products/services/products.service';
import { OrderProduct } from '../models/order-product.model';
import { OrderProductsService } from '../services/order-products.service';

@Resolver(() => OrderProduct)
export class OrderProductsResolver {
  constructor(
    private readonly orderProductsService: OrderProductsService,
    private readonly productsService: ProductsService,
  ) {}

  //   @Query(() => OrderProduct)
  //   orderProduct(@Args('id', { type: () => Int }) id: number) {
  //     return this.orderProductsService.findById(id);
  //   }

  @ResolveField()
  product(@Parent() orderProduct) {
    return this.productsService.findById(orderProduct.productId);
  }
}
