import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { TRANSACTION_TYPE } from './model-types/customer-product-transaction-types';
import LineItem from './line-items';
@Entity("customer_product_transactions")
export default class CustomerProductTransactions {
  @PrimaryGeneratedColumn('uuid')
  readonly id!: string;

  @Column('varchar')
  customerId!: string;

  @Column('varchar')
  product_sku!: string;

  @OneToOne(() => LineItem)
  @JoinColumn()
  line_item_id!: LineItem;

  @Column('varchar')
  transaction_type: TRANSACTION_TYPE;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}