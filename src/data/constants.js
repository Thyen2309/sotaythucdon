export const DAYS = [
  { key: 'mon', label: 'Thứ 2' },
  { key: 'tue', label: 'Thứ 3' },
  { key: 'wed', label: 'Thứ 4' },
  { key: 'thu', label: 'Thứ 5' },
  { key: 'fri', label: 'Thứ 6' },
  { key: 'sat', label: 'Thứ 7' },
  { key: 'sun', label: 'Chủ nhật' },
];

export const MEALS = [
  { key: 'breakfast', label: 'Sáng' },
  { key: 'lunch', label: 'Trưa' },
  { key: 'dinner', label: 'Tối' },
];

export const emptyMealPlan = () =>
  DAYS.reduce((plan, day) => {
    plan[day.key] = MEALS.reduce((row, meal) => {
      row[meal.key] = '';
      return row;
    }, {});
    return plan;
  }, {});

export const CATEGORY_ORDER = ['Thịt', 'Rau', 'Gia vị', 'Tinh bột'];

export const CATEGORY_LABELS = {
  Thịt: 'Thịt cá',
  Rau: 'Rau củ',
  'Gia vị': 'Gia vị',
  'Tinh bột': 'Tinh bột',
};

export const RANDOM_STYLES = [
  {
    key: 'smart',
    label: 'Sáng quán • Trưa tối cơm',
    icon: '🌟',
    description: 'Bữa sáng ưu tiên bún/xôi/bánh mì; Bữa trưa & tối là cơm nhà ấm cúng',
  },
  {
    key: 'com-nha',
    label: 'Cơm nhà ấm cúng',
    icon: '🍱',
    description: 'Các món mặn kho xào, canh thanh mát ăn cùng cơm dẻo',
  },
  {
    key: 'hang-quan',
    label: 'Hàng quán & Bún xôi',
    icon: '🍜',
    description: 'Các món bún, phở, xôi, bánh mì, hủ tiếu, bánh cuốn thơm ngon',
  },
  {
    key: 'all',
    label: 'Đa dạng tất cả',
    icon: '🎲',
    description: 'Xáo trộn ngẫu nhiên toàn bộ các món trong thư viện',
  },
];

export const MEAL_STYLES = {
  'com-nha': { label: 'Cơm nhà', icon: '🍱' },
  'hang-quan': { label: 'Hàng quán', icon: '🍜' },
};

