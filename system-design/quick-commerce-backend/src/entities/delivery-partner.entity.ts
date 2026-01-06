import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Order } from './order.entity';

@Entity('delivery_partners')
export class DeliveryPartner {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 15, unique: true })
  phone!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  vehicle_type!: string | null; // bike, car, bicycle

  @Column({ type: 'varchar', length: 50, nullable: true })
  vehicle_number!: string | null;

  @Column({ type: 'boolean', default: true })
  is_available!: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  current_latitude!: number | null;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  current_longitude!: number | null;

  @Column({ type: 'uuid', nullable: true })
  current_order_id!: string | null;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;

  @OneToMany(() => Order, (order) => order.deliveryPartner)
  orders!: Order[];
}
