import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('product')
@Unique(['name'])
export class ProductEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ default: 0 })
  stock: number;

  @Column({ nullable: true })
  lastCustomer?: string;
}
