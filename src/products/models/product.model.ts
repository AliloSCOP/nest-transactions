import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Product {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field(() => Int)
  stock: number;

  @Field({ nullable: true })
  lastCustomer: string | null;
}
