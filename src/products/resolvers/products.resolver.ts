import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import { Product } from '../models/product.model';
import { ProductsService } from '../services/products.service';

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
}
