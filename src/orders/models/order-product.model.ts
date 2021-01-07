import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Product } from '../../products/models/product.model';

@ObjectType()
export class OrderProduct {
  @Field(() => Int)
  quantity: number;

  @Field(() => Product)
  product: Product;
}
