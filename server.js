const express = require('express');
const cors = require('cors');

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const app = express();
app.use(cors());
app.use(express.json());

// Global variables to store data
let rentData = [];
let meterData = [];
let energyChargesCache = new Map(); // Cache for energy calculations
let dashboardDataCache = new Map(); // Cache for dashboard data

// CSV file paths
const RENT_CSV_PATH = './data/manual_rent_data.csv';
const A88_METER_CSV_PATH = './data/a88_meter_data.csv';
const A206_METER_CSV_PATH = './data/a206_meter_data.csv';

// CSV Headers for updateCsvRow function
const A88_METER_HEADERS = [
    { id: 'Month', title: 'Month' },
    { id: 'MainMeter', title: 'MainMeter' },
    { id: 'TotalConsumed', title: 'TotalConsumed' },
    { id: 'FirstFloor', title: 'FirstFloor' },
    { id: 'SecondFloor', title: 'SecondFloor' },
    { id: 'Water', title: 'Water' },
    { id: 'WaterPerUnit', title: 'WaterPerUnit' },
    { id: 'FirstFloorConsumed', title: 'FirstFloorConsumed' },
    { id: 'SecondFloorConsumed', title: 'SecondFloorConsumed' },
    { id: 'GroundFloorConsumed', title: 'GroundFloorConsumed' }
];

const A206_METER_HEADERS = [
    { id: 'Month', title: 'Month' },
    { id: 'MainMeter', title: 'MainMeter' },
    { id: 'TotalConsumed', title: 'TotalConsumed' },
    { id: 'SecondFloorMeter', title: 'SecondFloorMeter' },
    { id: 'SecondFloorConsumed', title: 'SecondFloorConsumed' },
    { id: 'Self', title: 'Self' },
    { id: 'FinalSecondFloor', title: 'FinalSecondFloor' },
    { id: 'EnergyUnits', title: 'EnergyUnits' },
    { id: 'GasBill', title: 'GasBill' }
];

// CSV Writers
const rentCsvWriter = createCsvWriter({
    path: RENT_CSV_PATH,
    header: [
        { id: 'Month', title: 'Month' },
        { id: 'Tenant', title: 'Tenant' },
        { id: 'Name', title: 'Name' },
        { id: 'Phone', title: 'Phone' },
        { id: 'Floor', title: 'Floor' },
        { id: 'BaseRent', title: 'BaseRent' },
        { id: 'Maintenance', title: 'Maintenance' },
        { id: 'EnergyCharges', title: 'EnergyCharges' },
        { id: 'TotalRent', title: 'TotalRent' },
        { id: 'Status', title: 'Status' },
        { id: 'Comments', title: 'Comments' }
    ]
});

const a88MeterCsvWriter = createCsvWriter({
    path: A88_METER_CSV_PATH,
    header: [
        { id: 'Month', title: 'Month' },
        { id: 'MainMeter', title: 'MainMeter' },
        { id: 'TotalConsumed', title: 'TotalConsumed' },
        { id: 'FirstFloor', title: 'FirstFloor' },
        { id: 'SecondFloor', title: 'SecondFloor' },
        { id: 'Water', title: 'Water' },
        { id: 'WaterPerUnit', title: 'WaterPerUnit' },
        { id: 'FirstFloorConsumed', title: 'FirstFloorConsumed' },
        { id: 'SecondFloorConsumed', title: 'SecondFloorConsumed' },
        { id: 'GroundFloorConsumed', title: 'GroundFloorConsumed' }
    ]
});

const a206MeterCsvWriter = createCsvWriter({
    path: A206_METER_CSV_PATH,
    header: [
        { id: 'Month', title: 'Month' },
        { id: 'MainMeter', title: 'MainMeter' },
        { id: 'TotalConsumed', title: 'TotalConsumed' },
        { id: 'SecondFloorMeter', title: 'SecondFloorMeter' },
        { id: 'SecondFloorConsumed', title: 'SecondFloorConsumed' },
        { id: 'Self', title: 'Self' },
        { id: 'FinalSecondFloor', title: 'FinalSecondFloor' },
        { id: 'EnergyUnits', title: 'EnergyUnits' },
        { id: 'GasBill', title: 'GasBill' }
    ]
});

// Function to read CSV file and return data
function readCSVFile(filePath) {
    return new Promise((resolve, reject) => {
        const results = [];
        if (!fs.existsSync(filePath)) {
            resolve([]);
            return;
        }
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', (error) => reject(error));
    });
}

// Function to load rent data from CSV
async function loadRentDataFromCSV() {
    try {
        console.log('Loading rent data from CSV...');
        const csvData = await readCSVFile(RENT_CSV_PATH);
        
        if (csvData.length === 0) {
            console.log('No CSV data found. Please ensure CSV files are properly configured.');
            return;
        }

        // Group data by month
        const groupedData = {};
        csvData.forEach(row => {
            const month = row.Month;
            if (!groupedData[month]) {
                groupedData[month] = {};
            }
            
            const tenantKey = row.Tenant;
            groupedData[month][tenantKey] = {
                totalRent: parseFloat(row.TotalRent),
                baseRent: parseFloat(row.BaseRent),
                maintenance: parseFloat(row.Maintenance),
                energyCharges: parseFloat(row.EnergyCharges),
                status: row.Status
            };
            
            // Note: Tenant configs are now loaded separately from tenant_configs.csv
        });
        
        // Convert to array format
        rentData = Object.keys(groupedData).map(month => ({
            month: month,
            ...groupedData[month]
        }));
        
        console.log(`Loaded ${rentData.length} months of rent data from CSV`);
        console.log(`Found ${Object.keys(tenantConfigs).length} tenants`);
        
        // Energy charges will be calculated after meter data is loaded in initializeData()
    } catch (error) {
        console.error('Error loading rent data from CSV:', error);
        console.log('Please check CSV file format and permissions.');
    }
}

// Function to load meter data from CSV
async function loadMeterDataFromCSV() {
    try {
        console.log('Loading meter data from CSV...');
        
        // Load A-88 meter data
        const a88CsvData = await readCSVFile(A88_METER_CSV_PATH);
        console.log(`Loaded ${a88CsvData.length} months of A-88 meter data from CSV`);
        
        // Load A-206 meter data
        const a206CsvData = await readCSVFile(A206_METER_CSV_PATH);
        console.log(`Loaded ${a206CsvData.length} months of A-206 meter data from CSV`);
        
        if (a88CsvData.length === 0 && a206CsvData.length === 0) {
            console.log('No CSV meter data found. Please ensure meter CSV files are properly configured.');
            return;
        }

        // Create a map of A-206 data by month
        const a206DataMap = {};
        a206CsvData.forEach(row => {
            a206DataMap[row.Month] = {
                a206MainMeter: parseFloat(row.MainMeter) || null,
                a206TotalConsumed: parseFloat(row.TotalConsumed) || null,
                a206SecondFloorMeter: parseFloat(row.SecondFloorMeter) || null,
                a206SecondFloorConsumed: parseFloat(row.SecondFloorConsumed) || null,
                a206Self: parseFloat(row.Self) || null,
                a206FinalSecondFloor: parseFloat(row.FinalSecondFloor) || null,
                a206EnergyUnits: parseFloat(row.EnergyUnits) || null,
                a206GasBill: parseFloat(row.GasBill) || null
            };
        });

        // Combine A-88 and A-206 data
        const combinedData = {};
        
        // Process A-88 data
        a88CsvData.forEach(row => {
            const month = row.Month;
            combinedData[month] = {
                month: month,
                mainMeter: parseFloat(row.MainMeter) || 0,
                totalConsumed: parseFloat(row.TotalConsumed) || 0,
                firstFloor: parseFloat(row.FirstFloor) || 0,
                secondFloor: parseFloat(row.SecondFloor) || 0,
                water: parseFloat(row.Water) || 0,
                waterPerUnit: parseFloat(row.WaterPerUnit) || 0,
                firstFloorConsumed: parseFloat(row.FirstFloorConsumed) || 0,
                secondFloorConsumed: parseFloat(row.SecondFloorConsumed) || 0,
                groundFloorConsumed: parseFloat(row.GroundFloorConsumed) || 0
            };
        });
        
        // Add A-206 data to existing records or create new ones
        a206CsvData.forEach(row => {
            const month = row.Month;
            if (!combinedData[month]) {
                combinedData[month] = { month: month };
            }
            
            combinedData[month] = {
                ...combinedData[month],
                a206MainMeter: parseFloat(row.MainMeter) || null,
                a206TotalConsumed: parseFloat(row.TotalConsumed) || null,
                a206SecondFloorMeter: parseFloat(row.SecondFloorMeter) || null,
                a206SecondFloorConsumed: parseFloat(row.SecondFloorConsumed) || null,
                a206Self: parseFloat(row.Self) || null,
                a206FinalSecondFloor: parseFloat(row.FinalSecondFloor) || null,
                a206EnergyUnits: parseFloat(row.EnergyUnits) || null,
                a206GasBill: parseFloat(row.GasBill) || null
            };
        });
        
        meterData = Object.values(combinedData);
        
        console.log(`Combined ${meterData.length} months of meter data from CSV`);
        console.log('Sample meter data:', meterData[0]); // Debug log
    } catch (error) {
        console.error('Error loading meter data from CSV:', error);
    }
}

// Function to save rent data to CSV
async function saveRentDataToCSV() {
    try {
        const csvRecords = [];
        
        rentData.forEach(monthData => {
            const month = monthData.month;
            Object.keys(monthData).forEach(tenantKey => {
                if (tenantKey !== 'month' && monthData[tenantKey]) {
                    const tenantData = monthData[tenantKey];
                    const tenantConfig = tenantConfigs[tenantKey] || {};
                    
                    csvRecords.push({
                        Month: month,
                        Tenant: tenantKey,
                        Name: tenantConfig.name || '',
                        Phone: tenantConfig.phone || '',
                        Floor: tenantConfig.floor || '',
                        BaseRent: tenantData.baseRent || 0,
                        Maintenance: tenantData.maintenance || 0,
                        EnergyCharges: tenantData.energyCharges || 0,
                        TotalRent: tenantData.totalRent || 0,
                        Status: tenantData.status || 'Not Paid',
                        Comments: ''
                    });
                }
            });
        });
        
        await rentCsvWriter.writeRecords(csvRecords);
        console.log(`Saved ${csvRecords.length} rent records to CSV`);
    } catch (error) {
        console.error('Error saving rent data to CSV:', error);
    }
}

// Function to get the next month in sequence
function getNextMonth(currentMonth) {
    const monthOrder = [
        'August 24', 'September 24', 'October 24', 'November 24', 'December 24',
        'January 25', 'February 25', 'March 25', 'April 25', 'May 25', 'June 25', 'July 25',
        'August 25', 'September 25', 'October 25', 'November 25', 'December 25'
    ];
    
    const currentIndex = monthOrder.indexOf(currentMonth);
    if (currentIndex === -1 || currentIndex === monthOrder.length - 1) {
        return null;
    }
    
    return monthOrder[currentIndex + 1];
}

// Function to check if month exists in CSV
async function monthExistsInCSV(month) {
    try {
        const a88Data = await readCSVFile(A88_METER_CSV_PATH);
        const a206Data = await readCSVFile(A206_METER_CSV_PATH);
        
        const a88Exists = a88Data.some(row => row.Month === month);
        const a206Exists = a206Data.some(row => row.Month === month);
        
        return a88Exists || a206Exists;
    } catch (error) {
        console.error('Error checking if month exists:', error);
        return false;
    }
}

// Function to get the latest month from CSV
async function getLatestMonthFromCSV() {
    try {
        const a88Data = await readCSVFile(A88_METER_CSV_PATH);
        const a206Data = await readCSVFile(A206_METER_CSV_PATH);
        
        const allMonths = [...a88Data, ...a206Data].map(row => row.Month);
        const uniqueMonths = [...new Set(allMonths)];
        
        if (uniqueMonths.length === 0) return null;
        
        // Sort months chronologically
        const monthOrder = [
            'August 24', 'September 24', 'October 24', 'November 24', 'December 24',
            'January 25', 'February 25', 'March 25', 'April 25', 'May 25', 'June 25', 'July 25',
            'August 25', 'September 25', 'October 25', 'November 25', 'December 25'
        ];
        
        const sortedMonths = uniqueMonths.sort((a, b) => {
            return monthOrder.indexOf(a) - monthOrder.indexOf(b);
        });
        
        return sortedMonths[sortedMonths.length - 1];
    } catch (error) {
        console.error('Error getting latest month:', error);
        return null;
    }
}

// Function to update a specific row in CSV file
async function updateCsvRow(csvPath, month, newData, headers) {
    try {
        // Read existing CSV data
        const existingData = await readCSVFile(csvPath);
        
        // Remove any duplicate entries for this month (keep only the first one)
        const uniqueData = [];
        const seenMonths = new Set();
        
        for (const row of existingData) {
            if (!seenMonths.has(row.Month)) {
                uniqueData.push(row);
                seenMonths.add(row.Month);
            }
        }
        
        // Find the row to update
        const rowIndex = uniqueData.findIndex(row => row.Month === month);
        
        if (rowIndex !== -1) {
            // Update existing row
            uniqueData[rowIndex] = { ...uniqueData[rowIndex], ...newData };
            console.log(`Updated existing row for ${month} in ${csvPath}`);
        } else {
            // Add new row
            uniqueData.push(newData);
            console.log(`Added new row for ${month} in ${csvPath}`);
        }
        
        // Sort data by month chronologically
        const monthOrder = [
            'August 24', 'September 24', 'October 24', 'November 24', 'December 24',
            'January 25', 'February 25', 'March 25', 'April 25', 'May 25', 'June 25', 'July 25',
            'August 25', 'September 25', 'October 25', 'November 25', 'December 25'
        ];
        
        uniqueData.sort((a, b) => {
            return monthOrder.indexOf(a.Month) - monthOrder.indexOf(b.Month);
        });
        
        // Write back to CSV
        const csvWriter = createCsvWriter({ path: csvPath, header: headers });
        await csvWriter.writeRecords(uniqueData);
        
        console.log(`Successfully wrote ${uniqueData.length} records to ${csvPath}`);
        return true;
    } catch (error) {
        console.error(`Error updating CSV row for ${month}:`, error);
        return false;
    }
}

// Function to validate month sequence
async function validateMonthSequence(month) {
    const monthOrder = [
        'August 24', 'September 24', 'October 24', 'November 24', 'December 24',
        'January 25', 'February 25', 'March 25', 'April 25', 'May 25', 'June 25', 'July 25',
        'August 25', 'September 25', 'October 25', 'November 25', 'December 25'
    ];
    
    const monthIndex = monthOrder.indexOf(month);
    if (monthIndex === -1) {
        return { valid: false, error: `Invalid month format: ${month}` };
    }
    
    // Check if previous month exists in CSV files
    if (monthIndex > 0) {
        const previousMonth = monthOrder[monthIndex - 1];
        
        try {
            // Check both A-88 and A-206 CSV files for previous month
            const a88Data = await readCSVFile(A88_METER_CSV_PATH);
            const a206Data = await readCSVFile(A206_METER_CSV_PATH);
            
            const a88HasPrevious = a88Data.some(row => row.Month === previousMonth);
            const a206HasPrevious = a206Data.some(row => row.Month === previousMonth);
            
            if (!a88HasPrevious && !a206HasPrevious) {
                return { 
                    valid: false, 
                    error: `Cannot add data for ${month} because ${previousMonth} data is missing. Please add ${previousMonth} data first.` 
                };
            }
        } catch (error) {
            console.error('Error checking CSV files for validation:', error);
            // If we can't read the CSV files, allow the operation
            return { valid: true };
        }
    }
    
    return { valid: true };
}

// Function to save meter data to CSV
async function saveMeterDataToCSV() {
    try {
        console.log('Saving meter data to CSV...');
        
        // Read existing CSV data to get the base data
        const existingA88Data = await readCSVFile(A88_METER_CSV_PATH);
        const existingA206Data = await readCSVFile(A206_METER_CSV_PATH);
        
        // Create a map of existing data
        const existingA88Map = new Map(existingA88Data.map(row => [row.Month, row]));
        const existingA206Map = new Map(existingA206Data.map(row => [row.Month, row]));
        
        // Update with new meter data
        meterData.forEach(record => {
            if (record.month) {
                // Update A-88 data
                if (record.mainMeter !== undefined || record.firstFloor !== undefined || record.secondFloor !== undefined || record.water !== undefined || 
                    record.firstFloorConsumed !== undefined || record.secondFloorConsumed !== undefined || record.groundFloorConsumed !== undefined) {
                    
                    const a88Record = {
                        Month: record.month,
                        MainMeter: record.mainMeter || 0,
                        TotalConsumed: record.totalConsumed || 0,
                        FirstFloor: record.firstFloor || 0,
                        SecondFloor: record.secondFloor || 0,
                        Water: record.water || 0,
                        WaterPerUnit: record.waterPerUnit || 0,
                        FirstFloorConsumed: record.firstFloorConsumed || 0,
                        SecondFloorConsumed: record.secondFloorConsumed || 0,
                        GroundFloorConsumed: record.groundFloorConsumed || 0
                    };
                    
                    existingA88Map.set(record.month, a88Record);
                }
                
                // Update A-206 data
                if (record.a206MainMeter !== undefined || record.a206TotalConsumed !== undefined || record.a206EnergyUnits !== undefined) {
                    
                    const a206Record = {
                        Month: record.month,
                        MainMeter: record.a206MainMeter || 0,
                        TotalConsumed: record.a206TotalConsumed || 0,
                        SecondFloorMeter: record.a206SecondFloorMeter || 0,
                        SecondFloorConsumed: record.a206SecondFloorConsumed || 0,
                        Self: record.a206Self || 0,
                        FinalSecondFloor: record.a206FinalSecondFloor || 0,
                        EnergyUnits: record.a206EnergyUnits || 0,
                        GasBill: record.a206GasBill || 0
                    };
                    
                    existingA206Map.set(record.month, a206Record);
                }
            }
        });
        
        // Convert maps back to arrays and sort by month
        const monthOrder = [
            'August 24', 'September 24', 'October 24', 'November 24', 'December 24',
            'January 25', 'February 25', 'March 25', 'April 25', 'May 25', 'June 25', 'July 25',
            'August 25', 'September 25', 'October 25', 'November 25', 'December 25'
        ];
        
        const a88CsvRecords = Array.from(existingA88Map.values()).sort((a, b) => {
            return monthOrder.indexOf(a.Month) - monthOrder.indexOf(b.Month);
        });
        
        const a206CsvRecords = Array.from(existingA206Map.values()).sort((a, b) => {
            return monthOrder.indexOf(a.Month) - monthOrder.indexOf(b.Month);
        });
        
        console.log('A-88 records to save:', a88CsvRecords.length);
        console.log('A-206 records to save:', a206CsvRecords.length);
        
        // Save to separate files with headers
        await a88MeterCsvWriter.writeRecords(a88CsvRecords);
        await a206MeterCsvWriter.writeRecords(a206CsvRecords);
        
        console.log(`Saved ${a88CsvRecords.length} A-88 meter records and ${a206CsvRecords.length} A-206 meter records to CSV`);
    } catch (error) {
        console.error('Error saving meter data to CSV:', error);
    }
}

// Function to update rent data and save to CSV
async function updateRentData(month, tenantKey, updates) {
    try {
        // Find the month data
        let monthData = rentData.find(m => m.month === month);
        if (!monthData) {
            monthData = { month: month };
            rentData.push(monthData);
        }
        
        // Update tenant data
        if (!monthData[tenantKey]) {
            monthData[tenantKey] = {};
        }
        
        monthData[tenantKey] = { ...monthData[tenantKey], ...updates };
        
        // Save to CSV
        await saveRentDataToCSV();
        
        // Clear dashboard cache since rent data changed
        dashboardDataCache.clear();
        
        console.log(`Updated rent data for ${tenantKey} in ${month} and saved to CSV`);
        return true;
    } catch (error) {
        console.error('Error updating rent data:', error);
        return false;
    }
}

// Function to update meter data and save to CSV
async function updateMeterData(month, updates, isNewEntry = false) {
    try {
        // Check if this is an update to existing data or a new entry
        const monthExists = await monthExistsInCSV(month);
        
        if (isNewEntry && monthExists) {
            return { success: false, error: `Data for ${month} already exists. Use update mode instead.` };
        }
        
        if (!isNewEntry && !monthExists) {
            return { success: false, error: `Data for ${month} does not exist. Use new entry mode instead.` };
        }
        
        // For new entries, validate month sequence
        if (isNewEntry) {
            const validation = await validateMonthSequence(month);
            if (!validation.valid) {
                console.error('Month validation failed:', validation.error);
                return { success: false, error: validation.error };
            }
        }
        
        // Find the meter data
        let meterRecord = meterData.find(m => m.month === month);
        if (!meterRecord) {
            meterRecord = { month: month };
            meterData.push(meterRecord);
        }
        
        // Update meter data
        Object.assign(meterRecord, updates);
        
        // Calculate consumed values for A-88 meter if we have meter readings
        if (meterRecord.mainMeter !== undefined || meterRecord.firstFloor !== undefined || meterRecord.secondFloor !== undefined) {
            // Find previous month's data by looking for the month before the current one
            const currentMonth = month;
            const monthParts = currentMonth.split(' ');
            const monthName = monthParts[0];
            const year = monthParts[1];
            
            // Find the previous month
            let previousMonth = null;
            if (monthName === 'September') {
                previousMonth = meterData.find(m => m.month === `August ${year}`);
            } else if (monthName === 'October') {
                previousMonth = meterData.find(m => m.month === `September ${year}`);
            } else if (monthName === 'November') {
                previousMonth = meterData.find(m => m.month === `October ${year}`);
            } else if (monthName === 'December') {
                previousMonth = meterData.find(m => m.month === `November ${year}`);
            } else if (monthName === 'January') {
                const prevYear = parseInt(year) - 1;
                previousMonth = meterData.find(m => m.month === `December ${prevYear}`);
            } else if (monthName === 'February') {
                previousMonth = meterData.find(m => m.month === `January ${year}`);
            } else if (monthName === 'March') {
                previousMonth = meterData.find(m => m.month === `February ${year}`);
            } else if (monthName === 'April') {
                previousMonth = meterData.find(m => m.month === `March ${year}`);
            } else if (monthName === 'May') {
                previousMonth = meterData.find(m => m.month === `April ${year}`);
            } else if (monthName === 'June') {
                previousMonth = meterData.find(m => m.month === `May ${year}`);
            } else if (monthName === 'July') {
                previousMonth = meterData.find(m => m.month === `June ${year}`);
            } else if (monthName === 'August') {
                previousMonth = meterData.find(m => m.month === `July ${year}`);
            }
            
            if (previousMonth) {
                // Calculate total consumed
                if (meterRecord.mainMeter !== undefined && previousMonth.mainMeter !== undefined) {
                    meterRecord.totalConsumed = meterRecord.mainMeter - previousMonth.mainMeter;
                }
                
                // Calculate first floor consumed
                if (meterRecord.firstFloor !== undefined && previousMonth.firstFloor !== undefined) {
                    meterRecord.firstFloorConsumed = meterRecord.firstFloor - previousMonth.firstFloor;
                }
                
                // Calculate second floor consumed
                if (meterRecord.secondFloor !== undefined && previousMonth.secondFloor !== undefined) {
                    meterRecord.secondFloorConsumed = meterRecord.secondFloor - previousMonth.secondFloor;
                }
                
                // Calculate ground floor consumed (total - first - second)
                if (meterRecord.totalConsumed !== undefined && meterRecord.firstFloorConsumed !== undefined && meterRecord.secondFloorConsumed !== undefined) {
                    meterRecord.groundFloorConsumed = Math.max(0, meterRecord.totalConsumed - meterRecord.firstFloorConsumed - meterRecord.secondFloorConsumed);
                }
            }
        }
        
        // Update CSV files directly with row-level updates
        if (meterRecord.mainMeter !== undefined || meterRecord.firstFloor !== undefined || meterRecord.secondFloor !== undefined || meterRecord.water !== undefined) {
            // Update A-88 CSV
            const a88Record = {
                Month: month,
                MainMeter: meterRecord.mainMeter || 0,
                TotalConsumed: meterRecord.totalConsumed || 0,
                FirstFloor: meterRecord.firstFloor || 0,
                SecondFloor: meterRecord.secondFloor || 0,
                Water: meterRecord.water || 0,
                WaterPerUnit: meterRecord.waterPerUnit || 0,
                FirstFloorConsumed: meterRecord.firstFloorConsumed || 0,
                SecondFloorConsumed: meterRecord.secondFloorConsumed || 0,
                GroundFloorConsumed: meterRecord.groundFloorConsumed || 0
            };
            
            const a88Success = await updateCsvRow(A88_METER_CSV_PATH, month, a88Record, A88_METER_HEADERS);
            if (!a88Success) {
                console.error(`Failed to update A-88 CSV for ${month}`);
            }
        }
        
        if (meterRecord.a206MainMeter !== undefined || meterRecord.a206TotalConsumed !== undefined || meterRecord.a206EnergyUnits !== undefined) {
            // Update A-206 CSV
            const a206Record = {
                Month: month,
                MainMeter: meterRecord.a206MainMeter || 0,
                TotalConsumed: meterRecord.a206TotalConsumed || 0,
                SecondFloorMeter: meterRecord.a206SecondFloorMeter || 0,
                SecondFloorConsumed: meterRecord.a206SecondFloorConsumed || 0,
                Self: meterRecord.a206Self || 0,
                FinalSecondFloor: meterRecord.a206FinalSecondFloor || 0,
                EnergyUnits: meterRecord.a206EnergyUnits || 0,
                GasBill: meterRecord.a206GasBill || 0
            };
            
            const a206Success = await updateCsvRow(A206_METER_CSV_PATH, month, a206Record, A206_METER_HEADERS);
            if (!a206Success) {
                console.error(`Failed to update A-206 CSV for ${month}`);
            }
        }
        
        // Clear cache for this month since data changed
        energyChargesCache.delete(month);
        dashboardDataCache.clear(); // Clear dashboard cache since energy charges changed
        
        const action = isNewEntry ? 'Added' : 'Updated';
        return { success: true, action: action.toLowerCase() };
    } catch (error) {
        console.error('Error updating meter data:', error);
        return { success: false, error: error.message };
    }
}

const PORT = process.env.PORT || 9999;

// Global data storage
let tenantConfigs = {};

// Load tenant configurations from CSV
async function loadTenantConfigsFromCSV() {
    try {
        const csvPath = path.join(__dirname, 'data', 'tenant_configs.csv');
        if (!fs.existsSync(csvPath)) {
            console.log('Tenant configs CSV not found, using default configs...');
            return;
        }

        const csvData = await readCSVFile(csvPath);
        
        if (csvData.length === 0) {
            console.log('No tenant configs found in CSV');
            return;
        }

        tenantConfigs = {};
        csvData.forEach(row => {
            const tenantKey = row.tenantKey;
            tenantConfigs[tenantKey] = {
                name: row.name || '',
                phone: row.phone || '',
                address: row.address || '',
                floor: row.floor || '',
                baseRent: parseFloat(row.baseRent) || 0,
                maintenance: parseFloat(row.maintenance) || 0,
                misc: parseFloat(row.misc) || 0,
                rentStartMonth: row.rentStartMonth || '',
                paysMaintenance: row.paysMaintenance === 'true',
                notes: row.notes || '',
                // Legacy fields for backward compatibility
                energyDependent: row.energyDependent === 'true',
                meterType: row.meterType || null
            };
        });

        console.log(`Loaded ${Object.keys(tenantConfigs).length} tenant configurations from CSV`);
    } catch (error) {
        console.error('Error loading tenant configs from CSV:', error);
    }
}

// Save tenant configurations to CSV
async function saveTenantConfigsToCSV() {
    try {
        const csvPath = path.join(__dirname, 'data', 'tenant_configs.csv');
        const headers = [
            'tenantKey', 'name', 'phone', 'address', 'floor', 'baseRent', 
            'maintenance', 'misc', 'rentStartMonth', 'paysMaintenance', 'notes'
        ];

        const csvData = Object.keys(tenantConfigs).map(tenantKey => {
            const config = tenantConfigs[tenantKey];
            return {
                tenantKey: tenantKey,
                name: config.name || '',
                phone: config.phone || '',
                address: config.address || '',
                floor: config.floor || '',
                baseRent: config.baseRent || 0,
                maintenance: config.maintenance || 0,
                misc: config.misc || 0,
                rentStartMonth: config.rentStartMonth || '',
                paysMaintenance: config.paysMaintenance ? 'true' : 'false',
                notes: config.notes || ''
            };
        });

        const csvContent = [
            headers.join(','),
            ...csvData.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
        ].join('\n');

        await fs.promises.writeFile(csvPath, csvContent, 'utf8');
        console.log(`Saved ${csvData.length} tenant configurations to CSV`);
    } catch (error) {
        console.error('Error saving tenant configs to CSV:', error);
        throw error;
    }
}

// Load data on startup
async function initializeData() {
    try {
        // Load tenant configurations from CSV
        await loadTenantConfigsFromCSV();
        
        // Try to load from CSV first
        await loadRentDataFromCSV();
        await loadMeterDataFromCSV();
        
        // Ensure CSV data is loaded
        if (rentData.length === 0) {
            console.log('No CSV data found. Please ensure CSV files are properly configured.');
            return;
        }
            // Ensure energy charges are calculated after both rent and meter data are loaded
            console.log('Final energy charge calculation...');
            rentData.forEach(monthData => {
                const month = monthData.month;
                const energyCharges = calculateEnergyCharges(month);
                console.log(`Final energy charges for ${month}:`, energyCharges);
                
                // Update energy charges for each tenant
                Object.keys(monthData).forEach(tenantKey => {
                    if (tenantKey !== 'month' && monthData[tenantKey]) {
                        const tenantConfig = tenantConfigs[tenantKey];
                        if (tenantConfig && tenantConfig.energyDependent) {
                            const tenantEnergyCharge = energyCharges[tenantKey] || 0;
                            monthData[tenantKey].energyCharges = tenantEnergyCharge;
                            monthData[tenantKey].totalRent = monthData[tenantKey].baseRent + monthData[tenantKey].maintenance + tenantEnergyCharge;
                        }
                    }
                });
            });
    } catch (error) {
        console.error('Error initializing data:', error);
        console.log('Please check CSV file format and permissions.');
    }
}

// Initialize data and start server
async function startServer() {
    try {
        console.log('Starting server initialization...');
        await initializeData();
        console.log('Data initialization complete, starting HTTP server...');
        
        console.log(`Attempting to start server on port ${PORT}...`);
        const server = app.listen(PORT, () => {
            console.log(`Server successfully started on port ${PORT}`);
        });
        
        // Handle server errors
        server.on('error', (error) => {
            console.error('Server error:', error);
            if (error.code === 'EADDRINUSE') {
                console.error(`Port ${PORT} is already in use. Please try a different port.`);
            }
            process.exit(1);
        });
        
        // Handle process errors
        process.on('uncaughtException', (error) => {
            console.error('Uncaught Exception:', error);
            process.exit(1);
        });
        
        process.on('unhandledRejection', (reason, promise) => {
            console.error('Unhandled Rejection at:', promise, 'reason:', reason);
            process.exit(1);
        });
        
    } catch (error) {
        console.error('Error starting server:', error);
        process.exit(1);
    }
}

startServer();



function normalizeMonthFormat(monthStr) {
    if (!monthStr) return monthStr;
    
    const monthMap = {
        'Jan': 'January', 'Feb': 'February', 'Mar': 'March', 'Apr': 'April',
        'May': 'May', 'Jun': 'June', 'Jul': 'July', 'Aug': 'August',
        'Sep': 'September', 'Oct': 'October', 'Nov': 'November', 'Dec': 'December'
    };
    
    const parts = monthStr.toString().trim().split(' ');
    if (parts.length >= 2) {
        const month = parts[0];
        const year = parts[1];
        const normalizedMonth = monthMap[month] || month;
        return `${normalizedMonth} ${year}`;
    }
    
    return monthStr;
}

function calculateEnergyCharges(month) {
    // Check cache first
    if (energyChargesCache.has(month)) {
        return energyChargesCache.get(month);
    }
    
    const meterRecord = meterData.find(m => m.month === month);
    if (!meterRecord) {
        console.log(`No meter data found for ${month}`);
        energyChargesCache.set(month, {});
        return {};
    }
    
    const energyCharges = {};
    const ratePerUnit = 8; // ₹8 per unit
    
    // Use the consumed energy values from meter data (CSV format)
    if (meterRecord.groundFloorConsumed) {
        const groundFloorEnergy = meterRecord.groundFloorConsumed * ratePerUnit;
        energyCharges['A-88 G'] = groundFloorEnergy;
    }
    
    if (meterRecord.firstFloorConsumed) {
        const firstFloorEnergy = meterRecord.firstFloorConsumed * ratePerUnit;
        energyCharges['A-88 1st'] = firstFloorEnergy;
    }
    
    if (meterRecord.secondFloorConsumed) {
        const secondFloorEnergy = meterRecord.secondFloorConsumed * ratePerUnit;
        energyCharges['A-88 2nd'] = secondFloorEnergy;
    }
    
    // Calculate for A-206 using the energy units field
    if (meterRecord.a206EnergyUnits) {
        const a206Energy = meterRecord.a206EnergyUnits * ratePerUnit;
        energyCharges['A-206 2nd'] = a206Energy;
    }
    
    // Cache the result
    energyChargesCache.set(month, energyCharges);
    return energyCharges;
}

function calculateTotalRent(tenant, month) {
    const config = tenantConfigs[tenant];
    if (!config) return 0;
    
    const baseRent = config.baseRent;
    const maintenance = config.maintenance;
    
    // Special handling for Gomti Nagar (cash + cheque payments)
    if (tenant === 'Gomti' && config.specialHandling) {
        return baseRent + maintenance;
    }
    
    if (config.energyDependent) {
        const energyCharges = calculateEnergyCharges(month);
        const energyCharge = energyCharges[tenant] || 0;
        return baseRent + maintenance + energyCharge;
    } else {
        return baseRent + maintenance;
    }
}

// API Endpoints

app.get('/api/dashboard-data', async (req, res) => {
    try {
        const { month = 'August 25' } = req.query;
        const normalizedMonth = normalizeMonthFormat(month);
        
        // Check cache first
        const cacheKey = `dashboard-${normalizedMonth}`;
        if (dashboardDataCache.has(cacheKey)) {
            return res.json(dashboardDataCache.get(cacheKey));
        }
        
        const rentRecord = rentData.find(r => r.month === normalizedMonth);
        const energyCharges = calculateEnergyCharges(normalizedMonth);
        
        // Calculate dashboard summary
        const dashboardData = [];
        let totalExpected = 0;
        let totalCollected = 0;
        let totalPending = 0;
        const pendingDues = [];
        
        if (rentRecord) {
            // Get all tenant keys from the rent record - look for tenant objects
            const tenantKeys = Object.keys(rentRecord).filter(key => 
                key !== 'month' && typeof rentRecord[key] === 'object' && rentRecord[key] !== null
            );
            
            tenantKeys.forEach(tenantKey => {
                const tenantData = rentRecord[tenantKey];
                const status = tenantData.status || 'Not Paid';
                const baseRent = tenantData.baseRent || 0;
                const maintenance = tenantData.maintenance || 0;
                // Use tenant config misc value if not in rent data
                const misc = tenantData.misc || tenantConfigs[tenantKey]?.misc || 0;
                
                // Use stored energy charges from rent data, fallback to calculated if not available
                const energyCharge = tenantData.energyCharges || energyCharges[tenantKey] || 0;
                const expectedAmount = baseRent + maintenance + energyCharge + misc;
                const isPending = status === 'Not Paid' || status === 'Pending';
                const pendingAmount = isPending ? expectedAmount : 0;
                
                totalExpected += expectedAmount;
                totalCollected += (status === 'Paid' ? expectedAmount : 0);
                totalPending += pendingAmount;
                
                if (isPending) {
                    pendingDues.push({
                        tenant: tenantKey,
                        name: tenantConfigs[tenantKey]?.name || tenantKey,
                        amount: pendingAmount
                    });
                }
                
                dashboardData.push({
                    tenant: tenantKey,
                    name: tenantConfigs[tenantKey]?.name || tenantKey,
                    phone: tenantConfigs[tenantKey]?.phone || '',
                    floor: tenantConfigs[tenantKey]?.floor || '',
                    baseRent: baseRent,
                    maintenance: maintenance,
                    misc: misc,
                    energyCharges: energyCharge,
                    expectedAmount: expectedAmount,
                    actualAmount: expectedAmount,
                    status: status,
                    pendingAmount: pendingAmount
                });
            });
        }
        
        // Generate monthly trend data (cached separately)
        const monthlyData = rentData.slice(-12).map(record => {
            const tenantKeys = Object.keys(record).filter(key => 
                key !== 'month' && typeof record[key] === 'object' && record[key] !== null
            );
            
            const monthExpected = tenantKeys.reduce((sum, tenant) => {
                return sum + (record[tenant].totalRent || 0);
            }, 0);
            
            const monthCollected = tenantKeys.reduce((sum, tenant) => {
                const status = record[tenant].status || 'Not Paid';
                return sum + (status === 'Paid' ? (record[tenant].totalRent || 0) : 0);
            }, 0);
            
            return {
                month: record.month,
                expected: monthExpected,
                collected: monthCollected,
                pending: monthExpected - monthCollected
            };
        });
        
        const response = {
            success: true,
            data: {
                tenants: dashboardData,
                summary: {
                    expected: totalExpected,
                    collected: totalCollected,
                    pending: totalPending,
                    totalTenants: Object.keys(tenantConfigs).length
                },
                pendingDues: pendingDues,
                monthlyData: monthlyData
            },
            month: normalizedMonth
        };
        
        // Cache the result
        dashboardDataCache.set(cacheKey, response);
        
        res.json(response);
        
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/rent-data', async (req, res) => {
    try {
        if (!rentData || rentData.length === 0) {
            return res.json({
                success: true,
                data: []
            });
        }
        
        const rentDataWithCalculations = rentData.map(record => {
            const energyCharges = calculateEnergyCharges(record.month);
            const result = { month: record.month };
            
            Object.keys(tenantConfigs).forEach(tenantKey => {
                const tenantData = record[tenantKey];
                if (tenantData) {
                    result[tenantKey] = tenantData.totalRent;
                    result[`${tenantKey}_Status`] = tenantData.status;
                    result[`${tenantKey}_BaseRent`] = tenantData.baseRent;
                    result[`${tenantKey}_Maintenance`] = tenantData.maintenance;
                    result[`${tenantKey}_EnergyCharges`] = tenantData.energyCharges;
                } else {
                    result[tenantKey] = 0;
                    result[`${tenantKey}_Status`] = 'Not Paid';
                    result[`${tenantKey}_BaseRent`] = tenantConfigs[tenantKey].baseRent;
                    result[`${tenantKey}_Maintenance`] = tenantConfigs[tenantKey].maintenance;
                    result[`${tenantKey}_EnergyCharges`] = calculateEnergyCharges(record.month)[tenantKey] || 0;
                }
            });
            
            return result;
        });
        
        res.json({
            success: true,
            data: rentDataWithCalculations
        });
        
    } catch (error) {
        console.error('Error fetching rent data:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/meter-data', async (req, res) => {
    try {
        const meterDataWithCalculations = meterData.map(record => {
            const result = {
                month: record.month,
                mainMeter: record.mainMeter,
                totalConsumed: record.totalConsumed,
                firstFloor: record.firstFloor,
                secondFloor: record.secondFloor,
                water: record.water,
                waterPerUnit: record.waterPerUnit,
                firstFloorConsumed: record.firstFloorConsumed,
                secondFloorConsumed: record.secondFloorConsumed,
                groundFloorConsumed: record.groundFloorConsumed,
                firstFloorEnergy: record.firstFloorEnergy,
                secondFloorEnergy: record.secondFloorEnergy,
                groundFloorEnergy: record.groundFloorEnergy,
                mainMeterMovement: record.mainMeterMovement,
                firstFloorMovement: record.firstFloorMovement,
                secondFloorMovement: record.secondFloorMovement,
                waterMovement: record.waterMovement,
                waterChargePerFloor: record.waterChargePerFloor
            };
            
            // A-206 data (now stored directly on record object)
            result.a206MainMeter = record.a206MainMeter;
            result.a206SecondFloorMeter = record.a206SecondFloorMeter;
            result.a206SecondFloorConsumed = record.a206SecondFloorConsumed;
            result.a206Self = record.a206Self;
            result.a206FinalSecondFloor = record.a206FinalSecondFloor;
            result.a206EnergyUnits = record.a206EnergyUnits;
            result.a206TotalConsumed = record.a206TotalConsumed;
            result.a206GasBill = record.a206GasBill;
            
            return result;
        });
        
        res.json({
            success: true,
            data: meterDataWithCalculations
        });
        
    } catch (error) {
        console.error('Error fetching meter data:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/tenant-details/:tenant', async (req, res) => {
    try {
        const { tenant } = req.params;
        const config = tenantConfigs[tenant];
        
        if (!config) {
            return res.status(404).json({ success: false, error: 'Tenant not found' });
        }
        
        res.json({
            success: true,
            data: {
                tenant,
                name: config.name,
                phone: config.phone,
                floor: config.floor,
                baseRent: config.baseRent,
                maintenance: config.maintenance,
                energyDependent: config.energyDependent,
                meterType: config.meterType
            }
        });
        
    } catch (error) {
        console.error('Error fetching tenant details:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/mark-payment-paid', async (req, res) => {
    try {
        const { tenant, month } = req.body;
        const normalizedMonth = normalizeMonthFormat(month);
        
        // Update rent data and save to CSV
        const success = await updateRentData(normalizedMonth, tenant, { status: 'Paid' });
        
        if (!success) {
            return res.status(404).json({ 
                success: false, 
                message: `No rent data found for ${tenant} in ${month}` 
            });
        }
        
        res.json({ 
            success: true, 
            message: `Payment marked as paid for ${tenant} for ${month} and saved to CSV`,
            data: { tenant, month, status: 'Paid' }
        });
        
    } catch (error) {
        console.error('Error marking payment as paid:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/adjust-rent', async (req, res) => {
    try {
        const { tenant, month, totalRent, baseRent, maintenance, energyCharges, gasBill, status } = req.body;
        const normalizedMonth = normalizeMonthFormat(month);
        
        console.log('Adjusting rent for:', { tenant, month: normalizedMonth, totalRent, baseRent, maintenance, energyCharges, gasBill, status });
        
        // Find the month data
        let monthData = rentData.find(m => m.month === normalizedMonth);
        if (!monthData) {
            monthData = { month: normalizedMonth };
            rentData.push(monthData);
        }
        
        // Update tenant data
        if (!monthData[tenant]) {
            monthData[tenant] = {};
        }
        
        const updates = {
            totalRent: parseFloat(totalRent) || 0,
            baseRent: parseFloat(baseRent) || 0,
            maintenance: parseFloat(maintenance) || 0,
            energyCharges: parseFloat(energyCharges) || 0,
            gasBill: parseFloat(gasBill) || 0,
            status: status || 'Not Paid'
        };
        
        monthData[tenant] = { ...monthData[tenant], ...updates };
        
        // Save to CSV
        await saveRentDataToCSV();
        
        // Clear dashboard cache since rent data changed
        dashboardDataCache.clear();
        
        console.log(`Updated rent data for ${tenant} in ${normalizedMonth} and saved to CSV`);
        
        res.json({ 
            success: true, 
            message: `Rent data updated for ${tenant} for ${month} and saved to CSV`,
            data: { tenant, month: normalizedMonth, totalRent, status }
        });
        
    } catch (error) {
        console.error('Error adjusting rent:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// API endpoint to get the next month in sequence
app.get('/api/next-month', async (req, res) => {
    try {
        const latestMonth = await getLatestMonthFromCSV();
        if (!latestMonth) {
            return res.json({ nextMonth: 'August 24' });
        }
        
        const nextMonth = getNextMonth(latestMonth);
        if (!nextMonth) {
            return res.json({ nextMonth: null, message: 'Already at the latest month in sequence' });
        }
        
        res.json({ nextMonth, latestMonth });
    } catch (error) {
        console.error('Error getting next month:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// API endpoint to check if a month exists
app.get('/api/month-exists/:month', async (req, res) => {
    try {
        const month = req.params.month;
        const exists = await monthExistsInCSV(month);
        res.json({ month, exists });
    } catch (error) {
        console.error('Error checking month existence:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/update-meter-readings', async (req, res) => {
    try {
        const { month, readings, isNewEntry = false } = req.body;
        
        // Validate input
        if (!month) {
            return res.status(400).json({ 
                success: false, 
                message: 'Month is required' 
            });
        }
        
        if (!readings || typeof readings !== 'object') {
            return res.status(400).json({ 
                success: false, 
                message: 'Readings data is required' 
            });
        }
        
        // Validate required fields for A-88 meter
        if (!readings.mainMeter || !readings.firstFloor || !readings.secondFloor) {
            return res.status(400).json({ 
                success: false, 
                message: 'Main Meter, First Floor, and Second Floor readings are required' 
            });
        }
        
        // Update meter data and save to CSV
        const result = await updateMeterData(month, readings, isNewEntry);
        
        if (!result.success) {
            return res.status(400).json({ 
                success: false, 
                message: result.error || `Error ${result.action || 'updating'} meter readings for ${month}` 
            });
        }
        
        const action = result.action === 'added' ? 'Added' : 'Updated';
        res.json({ success: true, message: `${action} meter readings for ${month} and saved to CSV` });
        
    } catch (error) {
        console.error('Error updating meter readings:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/update-a206-meter', async (req, res) => {
    try {
        const { month, mainMeter, totalConsumed, secondFloorMeter, secondFloorConsumed, self, finalSecondFloor, gasBill, action } = req.body;
        
        // Validate input
        if (!month) {
            return res.status(400).json({ 
                success: false, 
                message: 'Month is required' 
            });
        }
        
        if (!mainMeter || !totalConsumed) {
            return res.status(400).json({ 
                success: false, 
                message: 'Main Meter and Total Consumed are required' 
            });
        }
        
        // Find existing A-206 reading or create new one
        let monthIndex = meterData.findIndex(row => row.month === month);
        
        if (action === 'overwrite' && monthIndex === -1) {
            return res.status(404).json({ 
                success: false, 
                message: `No existing reading found for ${month}. Use 'Insert New' instead.` 
            });
        }
        
        if (action === 'insert' && monthIndex !== -1 && meterData[monthIndex].a206) {
            return res.status(409).json({ 
                success: false, 
                message: `Reading already exists for ${month}. Use 'Overwrite Existing' instead.` 
            });
        }
        
        // Calculate energy units (total consumed + self)
        const energyUnits = (totalConsumed || 0) + (self || 0);
        
        const a206Data = {
            a206MainMeter: mainMeter,
            a206TotalConsumed: totalConsumed,
            a206SecondFloorMeter: secondFloorMeter || 0,
            a206SecondFloorConsumed: secondFloorConsumed || 0,
            a206Self: self || 0,
            a206FinalSecondFloor: finalSecondFloor || 0,
            a206EnergyUnits: energyUnits,
            a206GasBill: gasBill || 0
        };
        
        // Update meter data and save to CSV
        const result = await updateMeterData(month, a206Data, false); // Always update mode for A-206
        
        if (!result.success) {
            return res.status(400).json({ 
                success: false, 
                message: result.error || `Error updating A-206 meter reading for ${month}` 
            });
        }
        
        res.json({ 
            success: true, 
            message: `A-206 meter reading ${action === 'insert' ? 'saved' : 'updated'} for ${month} and saved to CSV`,
            data: {
                month,
                mainMeter,
                totalConsumed,
                secondFloorMeter,
                secondFloorConsumed,
                self,
                finalSecondFloor,
                energyUnits,
                energyCharge: energyUnits * 8,
                gasBill,
                totalBill: (energyUnits * 8) + (gasBill || 0)
            }
        });
        
    } catch (error) {
        console.error('Error updating A-206 meter reading:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// API endpoint to get all tenant configurations
app.get('/api/tenant-configs', (req, res) => {
    res.json({ success: true, data: tenantConfigs });
});

// API endpoint to update tenant configuration
app.post('/api/update-tenant-config', async (req, res) => {
    try {
        const { tenantKey, updates } = req.body;
        
        if (!tenantKey || !tenantConfigs[tenantKey]) {
            return res.status(400).json({ success: false, message: 'Invalid tenant key' });
        }

        // Update the tenant configuration
        tenantConfigs[tenantKey] = { ...tenantConfigs[tenantKey], ...updates };
        
        // Save to CSV
        await saveTenantConfigsToCSV();
        
        res.json({ success: true, message: 'Tenant configuration updated successfully', data: tenantConfigs[tenantKey] });
    } catch (error) {
        console.error('Error updating tenant config:', error);
        res.status(500).json({ success: false, message: 'Error updating tenant configuration' });
    }
});

// Simple test endpoint
app.get('/api/test', (req, res) => {
    res.json({ message: 'Server is working!', timestamp: new Date().toISOString() });
});

// Test endpoint for energy calculation
app.get('/api/test-energy/:month', (req, res) => {
    try {
        const month = req.params.month;
        const energyCharges = calculateEnergyCharges(month);
        res.json({ 
            month, 
            energyCharges,
            meterData: meterData.find(m => m.month === month)
        });
    } catch (error) {
        console.error('Error testing energy calculation:', error);
        res.status(500).json({ error: error.message });
    }
});



// Payment Report API endpoint
app.get('/api/payment-report', (req, res) => {
    try {
        const { period = 'ytd' } = req.query; // ytd, last12months, fromapril
        
        // Helper function to check if a month is within a period
        const isMonthInPeriod = (monthStr, period) => {
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear();
            const currentMonth = currentDate.getMonth(); // 0-11
            
            // Parse month string (e.g., "August 25")
            const monthMatch = monthStr.match(/(\w+)\s+(\d{2})/);
            if (!monthMatch) return false;
            
            const monthName = monthMatch[1];
            const year = parseInt('20' + monthMatch[2]);
            
            const monthNames = [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
            ];
            const monthIndex = monthNames.indexOf(monthName);
            
            if (monthIndex === -1) return false;
            
            switch (period) {
                case 'ytd':
                    // Year to date: from January of current year to current month
                    return year === currentYear && monthIndex <= currentMonth;
                    
                case 'last12months':
                    // Last 12 months from current month
                    const twelveMonthsAgo = new Date(currentYear, currentMonth - 11, 1);
                    const monthDate = new Date(year, monthIndex, 1);
                    return monthDate >= twelveMonthsAgo;
                    
                case 'fromapril':
                    // From April of current year to current month
                    return year === currentYear && monthIndex >= 3; // April is index 3
                    
                default:
                    return false;
            }
        };
        
        // Filter rent data based on period and paid status
        const filteredData = rentData.filter(record => 
            isMonthInPeriod(record.month, period)
        );
        

        
        // Group by tenant and calculate totals
        const tenantTotals = {};
        let grandTotal = 0;
        let totalRecords = 0;
        
        filteredData.forEach(monthRecord => {
            const month = monthRecord.month;
            
            // Process each tenant in this month
            Object.keys(monthRecord).forEach(tenantKey => {
                if (tenantKey === 'month') return; // Skip the month field
                
                const tenantData = monthRecord[tenantKey];
                if (!tenantData || typeof tenantData !== 'object') return;
                
                // Check if this tenant's status is "Paid"
                const status = tenantData.status;
                
                if (status && status.toLowerCase() === 'paid') {
                    const amount = parseFloat(tenantData.totalRent) || 0;
                    
                    if (!tenantTotals[tenantKey]) {
                        tenantTotals[tenantKey] = {
                            tenant: tenantKey,
                            name: tenantConfigs[tenantKey]?.name || tenantKey,
                            totalPaid: 0,
                            paymentCount: 0,
                            months: []
                        };
                    }
                    
                    tenantTotals[tenantKey].totalPaid += amount;
                    tenantTotals[tenantKey].paymentCount += 1;
                    tenantTotals[tenantKey].months.push({
                        month: month,
                        amount: amount
                    });
                    
                    grandTotal += amount;
                    totalRecords += 1;
                }
            });
        });
        
        // Convert to array and sort by total paid
        const tenantSummary = Object.values(tenantTotals).sort((a, b) => b.totalPaid - a.totalPaid);
        
        // Calculate period details
        const currentDate = new Date();
        const periodDetails = {
            ytd: {
                label: 'Year to Date',
                description: `From January ${currentDate.getFullYear()} to current month`
            },
            last12months: {
                label: 'Last 12 Months',
                description: 'Rolling 12 months from current month'
            },
            fromapril: {
                label: 'From April',
                description: `From April ${currentDate.getFullYear()} to current month`
            }
        };
        
        res.json({
            success: true,
            data: {
                period: period,
                periodLabel: periodDetails[period]?.label || period,
                periodDescription: periodDetails[period]?.description || '',
                totalPayments: grandTotal,
                totalRecords: totalRecords,
                tenantCount: tenantSummary.length,
                tenants: tenantSummary,
                summary: {
                    totalAmount: grandTotal,
                    averagePerTenant: tenantSummary.length > 0 ? grandTotal / tenantSummary.length : 0,
                    highestPayer: tenantSummary.length > 0 ? tenantSummary[0] : null,
                    lowestPayer: tenantSummary.length > 0 ? tenantSummary[tenantSummary.length - 1] : null
                }
            }
        });
        
    } catch (error) {
        console.error('Error generating payment report:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Server startup is handled by startServer() function