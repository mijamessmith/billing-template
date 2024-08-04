import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { LINE_ITEM_TYPE } from './model-types/line-item-types';
@Entity("line_items")
export default class LineItem {

  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  customer: string;

  @Column()
  value: number;

  @Column({
    type: "enum",
    enum: LINE_ITEM_TYPE
  })

  @Column()
  created_at: Date;

  @Column({unique: true})
  ledger_id: string;
};
