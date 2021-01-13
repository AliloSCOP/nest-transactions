import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Transactional } from '../../transactions/Transactional';
import { Product } from '../models/product.model';
import { ProductsService } from '../services/products.service';

const waait = (delay: number) =>
  new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, delay);
  });

@Resolver(() => Product)
export class ProductsResolver {
  constructor(private readonly productsService: ProductsService) {}

  @Query(() => [Product])
  products() {
    return this.productsService.findAll();
  }

  @Query(() => Product)
  product(@Args('id', { type: () => Int }) id: number) {
    return this.productsService.findById(id);
  }

  @Transactional()
  @Mutation(() => Product)
  async decreaseStock(
    @Args('id', { type: () => Int }) id: number,
    @Args('quantity', { type: () => Int }) quantity: number,
  ) {
    await waait(3000);

    const res = await this.productsService.decreaseStock(
      id,
      quantity,
      'mutation',
    );

    await waait(3000);

    return res;
  }
}
