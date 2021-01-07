import { Field, Int, ObjectType } from '@nestjs/graphql';
import { OrderProduct } from './order-product.model';

@ObjectType()
export class Order {
  @Field(() => Int)
  id: number;

  @Field()
  user: string;

  @Field(() => [OrderProduct])
  orderProducts: OrderProduct[];
}
