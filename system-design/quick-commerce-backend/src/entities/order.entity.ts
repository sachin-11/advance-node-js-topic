import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Warehouse } from './warehouse.entity';
import { DeliveryPartner } from './delivery-partner.entity';
import { OrderItem } from './order-item.entity';
import { OrderStatus } from './enums/order-status.enum';
import { PaymentStatus } from './enums/payment-status.enum';

@Entity('orders')
@Index(['order_id'], { unique: true })
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  order_id!: string; // Human-readable order ID like ORD-20240106-001

  @Column({ type: 'uuid' })
  user_id!: string;

  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'uuid' })
  warehouse_id!: string;

  @ManyToOne(() => Warehouse, (warehouse) => warehouse.orders)
  @JoinColumn({ name: 'warehouse_id' })
  warehouse!: Warehouse;

  @Column({ type: 'uuid', nullable: true })
  delivery_partner_id!: string | null;

  @ManyToOne(() => DeliveryPartner, (partner) => partner.orders, {
    nullable: true,
  })
  @JoinColumn({ name: 'delivery_partner_id' })
  deliveryPartner!: DeliveryPartner | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_amount!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  delivery_fee!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  final_amount!: number;

  @Column({ type: 'text' })
  delivery_address!: string;

  @Column({ type: 'decimal', precision: 10, scale: 8 })
  delivery_latitude!: number;

  @Column({ type: 'decimal', precision: 11, scale: 8 })
  delivery_longitude!: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status!: OrderStatus;

  @Column({ type: 'varchar', length: 50, default: 'cod' })
  payment_method!: string; // cod, online, wallet

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  payment_status!: PaymentStatus;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;

  @Column({ type: 'timestamp', nullable: true })
  confirmed_at!: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  prepared_at!: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  picked_up_at!: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  delivered_at!: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  cancelled_at!: Date | null;

  @Column({ type: 'integer', nullable: true })
  estimated_delivery_time!: number | null; // in minutes

  @Column({ type: 'integer', nullable: true })
  actual_delivery_time!: number | null; // in minutes

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, {
    cascade: true,
  })
  orderItems!: OrderItem[];
}
