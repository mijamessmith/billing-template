const getISODateStringWeeksFromToday: Function = (weeksToAdd: number = 1) => {
  const today = new Date();
  const daysToAdd = weeksToAdd * 7;
  today.setDate(today.getDate() + daysToAdd);
  return today.toISOString();
}

export const PROMO_CODE_DATA = {
  1: {
    id: '1',
    code: 'CLICKHOUSE',
    rate: .75,
    discount_type: 'percentage',
    created_at: new Date().toISOString(),
    valid_from: new Date().toISOString(),
    valid_to: getISODateStringWeeksFromToday(2),
    active: true
  },
  2: {
    id: '2',
    code: 'HOLIDAY_2023',
    rate: -10,
    discount_type: 'fixed',
    created_at: new Date().toISOString(),
    valid_from: getISODateStringWeeksFromToday(-40),
    valid_to: getISODateStringWeeksFromToday(-30),
    active: false
  },
  3: {
    id: '3',
    code: 'SUMMER',
    rate: -20,
    discount_type: 'fixed',
    created_at: new Date().toISOString(),
    valid_from: new Date().toISOString(),
    valid_to: getISODateStringWeeksFromToday(1),
    active: true
  }
};