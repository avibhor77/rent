// Application constants
export const TAB_NAMES = {
  DASHBOARD: 'Dashboard',
  INDIVIDUAL_TENANT: 'Individual Tenant',
  TENANT_CONFIG: 'Tenant Config',
  METER_READINGS: 'Meter Readings',
  PAYMENT_REPORT: 'Payment Report',
  AUDIT_LOG: 'Audit Log',
  PAYMENT_SUMMARY: 'Payment Summary'
};

export const TAB_INDICES = {
  DASHBOARD: 0,
  INDIVIDUAL_TENANT: 1,
  TENANT_CONFIG: 2,
  METER_READINGS: 3,
  PAYMENT_REPORT: 4,
  AUDIT_LOG: 5,
  PAYMENT_SUMMARY: 6
};

export const PAYMENT_STATUS = {
  PAID: 'Paid',
  NOT_PAID: 'Not Paid'
};

export const TENANT_KEYS = {
  A88: 'A-88 G',
  A206: 'A-206 F'
};

export const DEFAULT_TENANT_CONFIGS = {
  [TENANT_KEYS.A88]: {
    tenantKey: TENANT_KEYS.A88,
    name: 'Vaneet Bhalla',
    phone: '9811812336',
    address: 'A-88 Ground Floor Sector 52 Noida',
    floor: 'Ground',
    baseRent: 15000,
    maintenance: 2000,
    misc: 0,
    rentStartMonth: 'January 24'
  },
  [TENANT_KEYS.A206]: {
    tenantKey: TENANT_KEYS.A206,
    name: 'Anand Vibhor',
    phone: '9876543210',
    address: 'A-206 First Floor Sector 52 Noida',
    floor: 'First',
    baseRent: 15000,
    maintenance: 2000,
    misc: 0,
    rentStartMonth: 'January 24'
  }
};

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const PAYMENT_PERIODS = [
  { value: 'ytd', label: 'Year to Date' },
  { value: 'q1', label: 'Q1 (Jan-Mar)' },
  { value: 'q2', label: 'Q2 (Apr-Jun)' },
  { value: 'q3', label: 'Q3 (Jul-Sep)' },
  { value: 'q4', label: 'Q4 (Oct-Dec)' },
  { value: 'last12', label: 'Last 12 Months' }
];
