export enum PROMO_CODE_TYPE {
  FIXED = 'fixed',
  PERCENTAGE = 'percentage'
};

export interface PROMO_CODE {
  id: string;
  code: string;
  rate: number;
  discount_type: PROMO_CODE_TYPE;
  created_at: Date;
  valid_from: Date;
  valid_to: Date;
  active: Boolean;
};