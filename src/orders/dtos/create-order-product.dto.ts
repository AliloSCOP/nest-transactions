import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class CreateOrderProductInput {
  @Field(() => Int)
  productId: number;

  @Field(() => Int)
  quantity: number;
}
