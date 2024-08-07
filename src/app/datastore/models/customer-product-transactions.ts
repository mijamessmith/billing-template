import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { TRANSACTION_TYPE } from './model-types/customer-product-transaction-types';
import LineItem from './line-items';
@Entity("customer_product_transactions")
export default class CustomerProductTransactions {
  @PrimaryGeneratedColumn('uuid')
  readonly id!: string;

  @Column('varchar')
  customer!: string;

  @Column('varchar')
  product_sku!: string;

  @Column('int')
  quantity: number

  @OneToOne(() => LineItem)
  @JoinColumn({ name: 'line_item_id' })
  line_item_id!: LineItem;

  @Column('varchar')
  transaction_type!: TRANSACTION_TYPE;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column('varchar', { nullable: true })
  promo_code_id?: string;

  @OneToOne(() => CustomerProductTransactions)
  @JoinColumn({ name: 'original_purchase_transaction_id' })
  original_purchase_transaction_id?: CustomerProductTransactions;
}