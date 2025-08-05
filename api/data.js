// Embedded data for Vercel serverless functions
// This avoids file system access issues

export const rentData = [
  {
    "Month": "August 25",
    "Tenant": "A-88 G",
    "Name": "Vaneet Bhalla",
    "Phone": "9811812336",
    "Floor": "Ground",
    "BaseRent": "26000",
    "Maintenance": "500",
    "EnergyCharges": "3520",
    "TotalRent": "30020",
    "Status": "Paid",
    "Comments": ""
  },
  {
    "Month": "August 25",
    "Tenant": "A-88 1st",
    "Name": "VishnuPratap Pandey",
    "Phone": "918377051059",
    "Floor": "1st",
    "BaseRent": "25000",
    "Maintenance": "500",
    "EnergyCharges": "4360",
    "TotalRent": "29860",
    "Status": "Not Paid",
    "Comments": ""
  },
  {
    "Month": "August 25",
    "Tenant": "A-88 2nd",
    "Name": "Sumit Swarnkar",
    "Phone": "9340609004",
    "Floor": "2nd",
    "BaseRent": "20000",
    "Maintenance": "500",
    "EnergyCharges": "2670",
    "TotalRent": "23170",
    "Status": "Not Paid",
    "Comments": ""
  },
  {
    "Month": "August 25",
    "Tenant": "A-206 2nd",
    "Name": "Ajit Singh",
    "Phone": "9999311108",
    "Floor": "2nd",
    "BaseRent": "23000",
    "Maintenance": "0",
    "EnergyCharges": "5439",
    "TotalRent": "28939",
    "Status": "Not Paid",
    "Comments": ""
  },
  {
    "Month": "August 25",
    "Tenant": "A-81 G",
    "Name": "Avinash Baisoya",
    "Phone": "9999722190",
    "Floor": "Ground",
    "BaseRent": "20000",
    "Maintenance": "0",
    "EnergyCharges": "0",
    "TotalRent": "20000",
    "Status": "Paid",
    "Comments": ""
  },
  {
    "Month": "August 25",
    "Tenant": "A-81 1st",
    "Name": "Sumit Raghav",
    "Phone": "93112055890",
    "Floor": "1st",
    "BaseRent": "29000",
    "Maintenance": "0",
    "EnergyCharges": "0",
    "TotalRent": "29000",
    "Status": "Not Paid",
    "Comments": ""
  },
  {
    "Month": "August 25",
    "Tenant": "Eldeco",
    "Name": "Saqib Mustafa",
    "Phone": "9792552989",
    "Floor": "N/A",
    "BaseRent": "34000",
    "Maintenance": "0",
    "EnergyCharges": "0",
    "TotalRent": "34000",
    "Status": "Paid",
    "Comments": ""
  },
  {
    "Month": "August 25",
    "Tenant": "Gomti",
    "Name": "Sameer Agarwal",
    "Phone": "9792552989",
    "Floor": "N/A",
    "BaseRent": "80000",
    "Maintenance": "0",
    "EnergyCharges": "0",
    "TotalRent": "80000",
    "Status": "Paid",
    "Comments": ""
  }
];

export const tenantConfigs = [
  {
    "tenantKey": "A-88 G",
    "name": "Vaneet Bhalla",
    "phone": "9811812336",
    "address": "A-88 Ground Floor, New Delhi",
    "floor": "Ground",
    "baseRent": "26000",
    "maintenance": "500",
    "rentStartMonth": "April 2025",
    "notes": "Pays maintenance",
    "misc": "0"
  },
  {
    "tenantKey": "A-88 1st",
    "name": "VishnuPratap Pandey",
    "phone": "918377051059",
    "address": "A-88 First Floor, New Delhi",
    "floor": "1st",
    "baseRent": "25000",
    "maintenance": "500",
    "rentStartMonth": "April 2025",
    "notes": "Pays maintenance",
    "misc": "0"
  },
  {
    "tenantKey": "A-88 2nd",
    "name": "Sumit Swarnkar",
    "phone": "9340609004",
    "address": "A-88 Second Floor, New Delhi",
    "floor": "2nd",
    "baseRent": "20000",
    "maintenance": "500",
    "rentStartMonth": "April 2025",
    "notes": "Pays maintenance",
    "misc": "0"
  },
  {
    "tenantKey": "A-206 2nd",
    "name": "Ajit Singh",
    "phone": "9999311108",
    "address": "A-206 Second Floor, New Delhi",
    "floor": "2nd",
    "baseRent": "23000",
    "maintenance": "0",
    "rentStartMonth": "April 2025",
    "notes": "Pays maintenance",
    "misc": "500"
  },
  {
    "tenantKey": "A-81 G",
    "name": "Avinash Baisoya",
    "phone": "9999722190",
    "address": "A-81 Ground Floor, New Delhi",
    "floor": "Ground",
    "baseRent": "20000",
    "maintenance": "0",
    "rentStartMonth": "April 2025",
    "notes": "Pays maintenance",
    "misc": "0"
  },
  {
    "tenantKey": "A-81 1st",
    "name": "Sumit Raghav",
    "phone": "93112055890",
    "address": "A-81 First Floor, New Delhi",
    "floor": "1st",
    "baseRent": "29000",
    "maintenance": "0",
    "rentStartMonth": "April 2025",
    "notes": "Pays maintenance",
    "misc": "0"
  },
  {
    "tenantKey": "Eldeco",
    "name": "Saqib Mustafa",
    "phone": "9792552989",
    "address": "Eldeco Property, New Delhi",
    "floor": "N/A",
    "baseRent": "34000",
    "maintenance": "0",
    "rentStartMonth": "April 2025",
    "notes": "Pays maintenance",
    "misc": "0"
  },
  {
    "tenantKey": "Gomti",
    "name": "Sameer Agarwal",
    "phone": "9792552989",
    "address": "Gomti Property, New Delhi",
    "floor": "N/A",
    "baseRent": "80000",
    "maintenance": "0",
    "rentStartMonth": "April 2025",
    "notes": "Pays maintenance",
    "misc": "0"
  }
];

export const meterData = [
  {
    "month": "August 25",
    "mainMeter": 235560,
    "totalConsumed": 5000,
    "firstFloor": 11227.4,
    "secondFloor": 50855,
    "water": 7989.4,
    "waterPerUnit": 24,
    "firstFloorConsumed": 436,
    "secondFloorConsumed": 267,
    "groundFloorConsumed": 352,
    "a206MainMeter": 108445,
    "a206TotalConsumed": 620,
    "a206SecondFloorMeter": 27264,
    "a206SecondFloorConsumed": 62,
    "a206Self": 458,
    "a206FinalSecondFloor": 162,
    "a206EnergyUnits": 544,
    "a206GasBill": null
  }
];

// Energy charges calculation
export function calculateEnergyCharges(month) {
  const monthData = meterData.find(m => m.month === month);
  if (!monthData) {
    return {};
  }

  return {
    'A-88 G': Math.round(monthData.groundFloorConsumed * 10),
    'A-88 1st': Math.round(monthData.firstFloorConsumed * 10),
    'A-88 2nd': Math.round(monthData.secondFloorConsumed * 10),
    'A-206 2nd': Math.round(monthData.a206EnergyUnits * 10)
  };
} 