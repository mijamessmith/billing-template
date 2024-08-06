import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { LINE_ITEM_TYPE } from './model-types/line-item-types';

@Entity("line_items")
export default class LineItem {

  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column('varchar')
  customer!: string;

  @Column('float')
  value!: number;

  @Column('varchar')
  type!: LINE_ITEM_TYPE;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column('varchar', { unique: true })
  ledger_id!: string;
}
