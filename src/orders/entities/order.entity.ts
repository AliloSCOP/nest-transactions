import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { OrderProductEntity } from './order-product.entity';

@Entity('order')
export class OrderEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user: string;

  @OneToMany(() => OrderProductEntity, (orderProduct) => orderProduct.order)
  orderProducts: OrderProductEntity[];
}
