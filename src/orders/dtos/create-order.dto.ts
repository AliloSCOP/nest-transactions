import { Field, InputType } from '@nestjs/graphql';
import { CreateOrderProductInput } from './create-order-product.dto';

@InputType()
export class CreateOrderInput {
  @Field()
  user: string;

  @Field(() => [CreateOrderProductInput])
  orderProducts: CreateOrderProductInput[];
}
