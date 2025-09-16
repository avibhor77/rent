// Date utility functions
export const getCurrentMonth = () => {
  const now = new Date();
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const year = now.getFullYear().toString().slice(-2);
  return `${months[now.getMonth()]} ${year}`;
};

export const getNextMonth = (currentMonth) => {
  const [month, year] = currentMonth.split(' ');
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  let monthIndex = months.indexOf(month);
  let yearNum = parseInt('20' + year);
  
  if (monthIndex === 11) {
    monthIndex = 0;
    yearNum++;
  } else {
    monthIndex++;
  }
  
  const nextYear = yearNum.toString().slice(-2);
  return `${months[monthIndex]} ${nextYear}`;
};

export const isFutureMonth = (month) => {
  const currentMonth = getCurrentMonth();
  const [monthName, year] = month.split(' ');
  const [currentMonthName, currentYear] = currentMonth.split(' ');
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const monthIndex = months.indexOf(monthName);
  const currentMonthIndex = months.indexOf(currentMonthName);
  
  const yearNum = parseInt('20' + year);
  const currentYearNum = parseInt('20' + currentYear);
  
  if (yearNum > currentYearNum) return true;
  if (yearNum < currentYearNum) return false;
  
  return monthIndex > currentMonthIndex;
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};
