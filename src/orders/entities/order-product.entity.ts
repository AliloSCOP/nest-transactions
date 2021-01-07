import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ProductEntity } from '../../products/entities/product.entity';
import { OrderEntity } from './order.entity';

@Entity('order_product')
export class OrderProductEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  quantity: number;

  @Column()
  orderId: number;

  @Column()
  productId: number;

  @ManyToOne(() => OrderEntity)
  order: OrderEntity;

  @ManyToOne(() => ProductEntity)
  product: ProductEntity;
}
