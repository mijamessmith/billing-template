const getISODateStringWeeksFromToday: Function = (weeksToAdd: number = 1) => {
  const today = new Date();
  const daysToAdd = weeksToAdd * 7;
  today.setDate(today.getDate() + daysToAdd);
  return today.toISOString();
}

export const PROMO_CODE_DATA = {
  'CLICKHOUSE': {
    id: '1',
    code: 'CLICKHOUSE',
    rate: .75,
    discount_type: 'percentage',
    created_at: new Date().toISOString(),
    valid_from: new Date().toISOString(),
    valid_to: getISODateStringWeeksFromToday(2),
    active: true
  },
  'HOLIDAY_2023': {
    id: '2',
    code: 'HOLIDAY_2023',
    rate: -10,
    discount_type: 'fixed',
    created_at: new Date().toISOString(),
    valid_from: getISODateStringWeeksFromToday(-40),
    valid_to: getISODateStringWeeksFromToday(-30),
    active: true
  },
  'SUMMER': {
    id: '3',
    code: 'SUMMER',
    rate: -20,
    discount_type: 'fixed',
    created_at: new Date().toISOString(),
    valid_from: new Date().toISOString(),
    valid_to: getISODateStringWeeksFromToday(1),
    active: true
  },
  'WINTER': {
    id: '3',
    code: 'WINTER',
    rate: -15,
    discount_type: 'fixed',
    created_at: new Date().toISOString(),
    valid_from: getISODateStringWeeksFromToday(12),
    valid_to: getISODateStringWeeksFromToday(24),
    active: false
  },
};