// Demo data for frontend-only deployment
export const demoData = {
  dashboardData: {
    "August 25": {
      "A-88 G": {
        "Rent": 25000,
        "Maintenance Charge": 2000,
        "Energy Unit": 352,
        "Rate": 10,
        "Energy Charges": 3520,
        "Stairs": 0,
        "IGL Gas": 0,
        "Dust": 0,
        "Total (Rent)": 30020,
        "Status": "Paid"
      },
      "A-88 1st": {
        "Rent": 25000,
        "Maintenance Charge": 2000,
        "Energy Unit": 300,
        "Rate": 10,
        "Energy Charges": 3000,
        "Stairs": 0,
        "IGL Gas": 0,
        "Dust": 0,
        "Total (Rent)": 30000,
        "Status": "Paid"
      },
      "A-206 2nd": {
        "Rent": 23000,
        "Maintenance Charge": 2000,
        "Energy Unit": 280,
        "Rate": 10,
        "Energy Charges": 2800,
        "Stairs": 0,
        "IGL Gas": 0,
        "Dust": 0,
        "Total (Rent)": 27800,
        "Status": "Paid"
      }
    }
  },
  rentData: [
    {
      "Month": "August 25",
      "A-88 G": {
        "Rent": 25000,
        "Maintenance Charge": 2000,
        "Energy Unit": 352,
        "Rate": 10,
        "Energy Charges": 3520,
        "Stairs": 0,
        "IGL Gas": 0,
        "Dust": 0,
        "Total (Rent)": 30020,
        "Status": "Paid"
      },
      "A-88 1st": {
        "Rent": 25000,
        "Maintenance Charge": 2000,
        "Energy Unit": 300,
        "Rate": 10,
        "Energy Charges": 3000,
        "Stairs": 0,
        "IGL Gas": 0,
        "Dust": 0,
        "Total (Rent)": 30000,
        "Status": "Paid"
      },
      "A-206 2nd": {
        "Rent": 23000,
        "Maintenance Charge": 2000,
        "Energy Unit": 280,
        "Rate": 10,
        "Energy Charges": 2800,
        "Stairs": 0,
        "IGL Gas": 0,
        "Dust": 0,
        "Total (Rent)": 27800,
        "Status": "Paid"
      }
    }
  ],
  tenantConfigs: [
    {
      "tenantKey": "A-88 G",
      "name": "Gaurav Kumar",
      "phone": "9876543210",
      "address": "A-88 Ground Floor, New Delhi",
      "baseRent": 25000,
      "maintenance": 2000,
      "rentStartMonth": "April 2025",
      "notes": "Pays maintenance",
      "misc": 0
    },
    {
      "tenantKey": "A-88 1st",
      "name": "Rahul Sharma",
      "phone": "9876543211",
      "address": "A-88 First Floor, New Delhi",
      "baseRent": 25000,
      "maintenance": 2000,
      "rentStartMonth": "April 2025",
      "notes": "Pays maintenance",
      "misc": 0
    },
    {
      "tenantKey": "A-206 2nd",
      "name": "Priya Singh",
      "phone": "9876543212",
      "address": "A-206 Second Floor, New Delhi",
      "baseRent": 23000,
      "maintenance": 2000,
      "rentStartMonth": "April 2025",
      "notes": "Pays maintenance",
      "misc": 0
    }
  ],
  meterData: {
    "a88": [
      {
        "Month": "August 25",
        "Previous Reading": 5000,
        "Current Reading": 5352,
        "Units Consumed": 352
      }
    ],
    "a206": [
      {
        "Month": "August 25",
        "Previous Reading": 4000,
        "Current Reading": 4280,
        "Units Consumed": 280
      }
    ]
  }
};

// Mock API functions
export const mockAPI = {
  async getDashboardData(month) {
    return demoData.dashboardData[month] || {};
  },
  
  async getRentData() {
    return demoData.rentData;
  },
  
  async getTenantConfigs() {
    return demoData.tenantConfigs;
  },
  
  async getMeterData() {
    return demoData.meterData;
  },
  
  async markPaymentPaid(tenantKey, month) {
    console.log(`Mock: Marked ${tenantKey} as paid for ${month}`);
    return { success: true };
  },
  
  async adjustRent(data) {
    console.log('Mock: Adjusted rent', data);
    return { success: true };
  },
  
  async updateTenantConfig(data) {
    console.log('Mock: Updated tenant config', data);
    return { success: true };
  },
  
  async getPaymentReport(period) {
    return {
      totalPaid: 87820,
      totalTenants: 3,
      period: period,
      tenantBreakdown: [
        { tenant: "A-88 G", total: 30020 },
        { tenant: "A-88 1st", total: 30000 },
        { tenant: "A-206 2nd", total: 27800 }
      ]
    };
  }
}; 