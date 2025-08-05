const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Global variables to store data
let rentData = [];
let meterData = [];
let energyChargesCache = new Map();
let dashboardDataCache = new Map();

// CSV file paths (relative to project root)
const RENT_CSV_PATH = './data/manual_rent_data.csv';
const A88_METER_CSV_PATH = './data/a88_meter_data.csv';
const A206_METER_CSV_PATH = './data/a206_meter_data.csv';
const TENANT_CONFIGS_CSV_PATH = './data/tenant_configs.csv';

// CSV Headers
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
    header: A88_METER_HEADERS
});

const a206MeterCsvWriter = createCsvWriter({
    path: A206_METER_CSV_PATH,
    header: A206_METER_HEADERS
});

// Function to read CSV file and return data
function readCSVFile(filePath) {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', (error) => reject(error));
    });
}

// Load rent data from CSV
async function loadRentDataFromCSV() {
    try {
        console.log('Loading rent data from CSV...');
        const data = await readCSVFile(RENT_CSV_PATH);
        rentData = data;
        console.log(`Loaded ${data.length} months of rent data from CSV`);
        
        // Extract unique tenants
        const tenants = [...new Set(data.map(row => row.Tenant))];
        console.log(`Found ${tenants.length} tenants`);
        
        return data;
    } catch (error) {
        console.error('Error loading rent data:', error);
        return [];
    }
}

// Load meter data from CSV
async function loadMeterDataFromCSV() {
    try {
        console.log('Loading meter data from CSV...');
        
        // Load A-88 meter data
        const a88Data = await readCSVFile(A88_METER_CSV_PATH);
        console.log(`Loaded ${a88Data.length} months of A-88 meter data from CSV`);
        
        // Load A-206 meter data
        const a206Data = await readCSVFile(A206_METER_CSV_PATH);
        console.log(`Loaded ${a206Data.length} months of A-206 meter data from CSV`);
        
        // Combine meter data
        const combinedData = a88Data.map(a88Row => {
            const a206Row = a206Data.find(a206 => a206.Month === a88Row.Month);
            return {
                month: a88Row.Month,
                mainMeter: parseFloat(a88Row.MainMeter) || 0,
                totalConsumed: parseFloat(a88Row.TotalConsumed) || 0,
                firstFloor: parseFloat(a88Row.FirstFloor) || 0,
                secondFloor: parseFloat(a88Row.SecondFloor) || 0,
                water: parseFloat(a88Row.Water) || 0,
                waterPerUnit: parseFloat(a88Row.WaterPerUnit) || 0,
                firstFloorConsumed: parseFloat(a88Row.FirstFloorConsumed) || 0,
                secondFloorConsumed: parseFloat(a88Row.SecondFloorConsumed) || 0,
                groundFloorConsumed: parseFloat(a88Row.GroundFloorConsumed) || 0,
                a206MainMeter: parseFloat(a206Row?.MainMeter) || 0,
                a206TotalConsumed: parseFloat(a206Row?.TotalConsumed) || 0,
                a206SecondFloorMeter: parseFloat(a206Row?.SecondFloorMeter) || 0,
                a206SecondFloorConsumed: parseFloat(a206Row?.SecondFloorConsumed) || 0,
                a206Self: parseFloat(a206Row?.Self) || 0,
                a206FinalSecondFloor: parseFloat(a206Row?.FinalSecondFloor) || 0,
                a206EnergyUnits: parseFloat(a206Row?.EnergyUnits) || 0,
                a206GasBill: a206Row?.GasBill || null
            };
        });
        
        meterData = combinedData;
        console.log(`Combined ${combinedData.length} months of meter data from CSV`);
        
        if (combinedData.length > 0) {
            console.log('Sample meter data:', combinedData[0]);
        }
        
        return combinedData;
    } catch (error) {
        console.error('Error loading meter data:', error);
        return [];
    }
}

// Load tenant configurations from CSV
async function loadTenantConfigsFromCSV() {
    try {
        console.log('Loading tenant configurations from CSV...');
        const data = await readCSVFile(TENANT_CONFIGS_CSV_PATH);
        console.log(`Loaded ${data.length} tenant configurations from CSV`);
        return data;
    } catch (error) {
        console.error('Error loading tenant configs:', error);
        return [];
    }
}

// Calculate energy charges
function calculateEnergyCharges(month) {
    const monthData = meterData.find(m => m.month === month);
    if (!monthData) {
        console.log(`No meter data found for ${month}`);
        return {};
    }

    const energyCharges = {};
    
    // A-88 Ground Floor (30% of total consumption)
    energyCharges['A-88 G'] = Math.round(monthData.groundFloorConsumed * 10);
    
    // A-88 1st Floor (35% of total consumption)
    energyCharges['A-88 1st'] = Math.round(monthData.firstFloorConsumed * 10);
    
    // A-88 2nd Floor (35% of total consumption)
    energyCharges['A-88 2nd'] = Math.round(monthData.secondFloorConsumed * 10);
    
    // A-206 2nd Floor (separate meter)
    energyCharges['A-206 2nd'] = Math.round(monthData.a206EnergyUnits * 10);
    
    return energyCharges;
}

// Initialize data
async function initializeData() {
    console.log('Starting data initialization...');
    
    // Load all data
    await loadRentDataFromCSV();
    await loadMeterDataFromCSV();
    await loadTenantConfigsFromCSV();
    
    // Calculate energy charges for all months
    console.log('Final energy charge calculation...');
    const months = [...new Set(rentData.map(row => row.Month))];
    months.forEach(month => {
        const charges = calculateEnergyCharges(month);
        if (Object.keys(charges).length > 0) {
            console.log(`Final energy charges for ${month}:`, charges);
        }
    });
    
    console.log('Data initialization complete');
}

// API Routes
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'Server is working!', 
        timestamp: new Date().toISOString() 
    });
});

app.get('/api/dashboard-data', async (req, res) => {
    try {
        const { month } = req.query;
        if (!month) {
            return res.status(400).json({ success: false, message: 'Month parameter is required' });
        }

        // Get tenant configs
        const tenantConfigs = await loadTenantConfigsFromCSV();
        
        // Get rent data for the month
        const monthData = rentData.filter(row => row.Month === month);
        
        // Calculate energy charges
        const energyCharges = calculateEnergyCharges(month);
        
        // Build tenant data
        const tenants = tenantConfigs.map(config => {
            const rentRow = monthData.find(row => row.Tenant === config.tenantKey);
            const energyCharge = energyCharges[config.tenantKey] || 0;
            
            const baseRent = parseFloat(config.baseRent) || 0;
            const maintenance = parseFloat(config.maintenance) || 0;
            const misc = parseFloat(config.misc) || 0;
            const expectedAmount = baseRent + maintenance + misc + energyCharge;
            const actualAmount = parseFloat(rentRow?.TotalRent) || expectedAmount;
            const status = rentRow?.Status || 'Not Paid';
            const pendingAmount = status === 'Paid' ? 0 : expectedAmount;
            
            return {
                tenant: config.tenantKey,
                name: config.name,
                phone: config.phone,
                floor: config.floor,
                baseRent,
                maintenance,
                misc,
                energyCharges: energyCharge,
                expectedAmount,
                actualAmount,
                status,
                pendingAmount
            };
        });
        
        // Calculate summary
        const summary = {
            expected: tenants.reduce((sum, t) => sum + t.expectedAmount, 0),
            collected: tenants.reduce((sum, t) => sum + (t.status === 'Paid' ? t.actualAmount : 0), 0),
            pending: tenants.reduce((sum, t) => sum + t.pendingAmount, 0),
            totalTenants: tenants.length
        };
        
        // Get pending dues
        const pendingDues = tenants
            .filter(t => t.status !== 'Paid')
            .map(t => ({
                tenant: t.tenant,
                name: t.name,
                amount: t.pendingAmount
            }));
        
        // Get monthly data for chart
        const months = [...new Set(rentData.map(row => row.Month))].sort();
        const monthlyData = months.map(m => {
            const monthRentData = rentData.filter(row => row.Month === m);
            const monthEnergyCharges = calculateEnergyCharges(m);
            const monthTenants = tenantConfigs.map(config => {
                const rentRow = monthRentData.find(row => row.Tenant === config.tenantKey);
                const energyCharge = monthEnergyCharges[config.tenantKey] || 0;
                const baseRent = parseFloat(config.baseRent) || 0;
                const maintenance = parseFloat(config.maintenance) || 0;
                const misc = parseFloat(config.misc) || 0;
                const expected = baseRent + maintenance + misc + energyCharge;
                const collected = rentRow?.Status === 'Paid' ? parseFloat(rentRow.TotalRent) || expected : 0;
                return { expected, collected };
            });
            
            return {
                month: m,
                expected: monthTenants.reduce((sum, t) => sum + t.expected, 0),
                collected: monthTenants.reduce((sum, t) => sum + t.collected, 0),
                pending: monthTenants.reduce((sum, t) => sum + (t.expected - t.collected), 0)
            };
        });
        
        res.json({
            success: true,
            data: {
                tenants,
                summary,
                pendingDues,
                monthlyData
            },
            month
        });
    } catch (error) {
        console.error('Error in dashboard data:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.get('/api/rent-data', async (req, res) => {
    try {
        res.json({ success: true, data: rentData });
    } catch (error) {
        console.error('Error in rent data:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.get('/api/meter-data', async (req, res) => {
    try {
        res.json({ success: true, data: meterData });
    } catch (error) {
        console.error('Error in meter data:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.get('/api/tenant-configs', async (req, res) => {
    try {
        const configs = await loadTenantConfigsFromCSV();
        res.json({ success: true, data: configs });
    } catch (error) {
        console.error('Error in tenant configs:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.post('/api/mark-payment-paid', async (req, res) => {
    try {
        const { tenant, month } = req.body;
        
        // Find and update the rent data
        const rentRow = rentData.find(row => row.Month === month && row.Tenant === tenant);
        if (rentRow) {
            rentRow.Status = 'Paid';
            // Save to CSV would go here
            res.json({ success: true, message: `Payment marked as paid for ${tenant} in ${month}` });
        } else {
            res.status(404).json({ success: false, message: 'Rent record not found' });
        }
    } catch (error) {
        console.error('Error marking payment paid:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Initialize data when the function is first called
let isInitialized = false;

// Export the Express app as a Vercel serverless function
module.exports = async (req, res) => {
    // Initialize data only once
    if (!isInitialized) {
        await initializeData();
        isInitialized = true;
    }
    
    // Handle the request
    return app(req, res);
}; 