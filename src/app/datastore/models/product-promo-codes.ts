import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { PROMO_CODE_TYPE } from './model-types/promo-code-types';

@Entity("promo_codes")
export default class LineItem {

  @PrimaryGeneratedColumn('uuid')
  readonly id!: string;

  @Column('string', { unique: true })
  code!: string;

  @Column('float')
  rate!: number;

  @Column({
    type: 'varchar'
  })
  discount_type!: PROMO_CODE_TYPE;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  valid_from: Date;

  @Column('datetime')
  valid_to!: Date;
};
