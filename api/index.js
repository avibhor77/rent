const express = require('express');
const cors = require('cors');
const { rentData, tenantConfigs, meterData, calculateEnergyCharges } = require('./data.js');

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Global variables for caching
let energyChargesCache = new Map();
let dashboardDataCache = new Map();

// Initialize data
async function initializeData() {
    console.log('Starting data initialization...');
    console.log(`Loaded ${rentData.length} rent records`);
    console.log(`Loaded ${tenantConfigs.length} tenant configurations`);
    console.log(`Loaded ${meterData.length} meter records`);
    
    // Calculate energy charges for current month
    const currentMonth = 'August 25';
    const charges = calculateEnergyCharges(currentMonth);
    if (Object.keys(charges).length > 0) {
        console.log(`Energy charges for ${currentMonth}:`, charges);
    }
    
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

        // Get tenant configs (already loaded)
        const configs = tenantConfigs;
        
        // Get rent data for the month
        const monthData = rentData.filter(row => row.Month === month);
        
        // Calculate energy charges
        const energyCharges = calculateEnergyCharges(month);
        
        // Build tenant data
        const tenants = configs.map(config => {
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
            const monthTenants = configs.map(config => {
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
        res.json({ success: true, data: tenantConfigs });
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

app.post('/api/adjust-rent', async (req, res) => {
    try {
        const { tenant, month, amount, type } = req.body;
        
        // Find and update the rent data
        const rentRow = rentData.find(row => row.Month === month && row.Tenant === tenant);
        if (rentRow) {
            if (type === 'future') {
                // Add future payment
                rentRow.TotalRent = amount;
                rentRow.Status = 'Paid';
            } else {
                // Adjust existing payment
                rentRow.TotalRent = amount;
            }
            res.json({ success: true, message: `Rent adjusted for ${tenant} in ${month}` });
        } else {
            res.status(404).json({ success: false, message: 'Rent record not found' });
        }
    } catch (error) {
        console.error('Error adjusting rent:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.post('/api/update-tenant-config', async (req, res) => {
    try {
        const { tenant, updates } = req.body;
        
        // Find and update tenant config
        const configIndex = tenantConfigs.findIndex(config => config.tenantKey === tenant);
        if (configIndex !== -1) {
            Object.assign(tenantConfigs[configIndex], updates);
            res.json({ success: true, message: `Tenant config updated for ${tenant}` });
        } else {
            res.status(404).json({ success: false, message: 'Tenant config not found' });
        }
    } catch (error) {
        console.error('Error updating tenant config:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.get('/api/next-month', async (req, res) => {
    try {
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
        const currentMonth = 'August 25';
        const [month, year] = currentMonth.split(' ');
        const currentMonthIndex = months.indexOf(month);
        const currentYear = parseInt('20' + year);
        
        let nextMonthIndex = currentMonthIndex + 1;
        let nextYear = currentYear;
        
        if (nextMonthIndex >= 12) {
            nextMonthIndex = 0;
            nextYear++;
        }
        
        const nextMonth = `${months[nextMonthIndex]} ${nextYear.toString().slice(-2)}`;
        res.json({ success: true, data: nextMonth });
    } catch (error) {
        console.error('Error getting next month:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.get('/api/month-exists/:month', async (req, res) => {
    try {
        const { month } = req.params;
        const exists = meterData.some(row => row.month === month);
        res.json({ success: true, exists });
    } catch (error) {
        console.error('Error checking month exists:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.post('/api/update-meter-readings', async (req, res) => {
    try {
        const { month, readings } = req.body;
        
        // Find and update meter data
        const meterIndex = meterData.findIndex(row => row.month === month);
        if (meterIndex !== -1) {
            Object.assign(meterData[meterIndex], readings);
            res.json({ success: true, message: `Meter readings updated for ${month}` });
        } else {
            res.status(404).json({ success: false, message: 'Meter data not found' });
        }
    } catch (error) {
        console.error('Error updating meter readings:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.post('/api/update-a206-meter', async (req, res) => {
    try {
        const { month, readings } = req.body;
        
        // Find and update A-206 meter data
        const meterIndex = meterData.findIndex(row => row.month === month);
        if (meterIndex !== -1) {
            Object.assign(meterData[meterIndex], readings);
            res.json({ success: true, message: `A-206 meter readings updated for ${month}` });
        } else {
            res.status(404).json({ success: false, message: 'A-206 meter data not found' });
        }
    } catch (error) {
        console.error('Error updating A-206 meter readings:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.get('/api/payment-report', async (req, res) => {
    try {
        const { period = 'ytd' } = req.query;
        
        // Get current date for calculations
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth();
        
        // Define period filters
        let startMonth, endMonth;
        if (period === 'ytd') {
            startMonth = 'April 25'; // From April 2025
            endMonth = 'December 25';
        } else if (period === 'last12') {
            // Last 12 months from current month
            const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                           'July', 'August', 'September', 'October', 'November', 'December'];
            const currentMonthName = months[currentMonth];
            startMonth = `${currentMonthName} 24`;
            endMonth = `${currentMonthName} 25`;
        } else {
            startMonth = 'April 25';
            endMonth = 'December 25';
        }
        
        // Filter rent data for the period
        const periodData = rentData.filter(row => {
            const monthYear = row.Month;
            if (period === 'ytd') {
                return monthYear >= startMonth && monthYear <= endMonth;
            } else if (period === 'last12') {
                return monthYear >= startMonth && monthYear <= endMonth;
            }
            return true;
        });
        
        // Aggregate payments by tenant
        const tenantPayments = {};
        const monthPayments = {};
        
        periodData.forEach(row => {
            const tenant = row.Tenant;
            const month = row.Month;
            const amount = parseFloat(row.TotalRent) || 0;
            const status = row.Status;
            
            // Initialize tenant if not exists
            if (!tenantPayments[tenant]) {
                tenantPayments[tenant] = {
                    totalPaid: 0,
                    totalExpected: 0,
                    months: []
                };
            }
            
            // Initialize month if not exists
            if (!monthPayments[month]) {
                monthPayments[month] = {
                    totalPaid: 0,
                    totalExpected: 0,
                    tenants: []
                };
            }
            
            // Add to tenant totals
            tenantPayments[tenant].totalExpected += amount;
            if (status === 'Paid') {
                tenantPayments[tenant].totalPaid += amount;
            }
            tenantPayments[tenant].months.push({
                month,
                amount,
                status
            });
            
            // Add to month totals
            monthPayments[month].totalExpected += amount;
            if (status === 'Paid') {
                monthPayments[month].totalPaid += amount;
            }
            monthPayments[month].tenants.push({
                tenant,
                amount,
                status
            });
        });
        
        // Calculate summary
        const totalPaid = Object.values(tenantPayments).reduce((sum, t) => sum + t.totalPaid, 0);
        const totalExpected = Object.values(tenantPayments).reduce((sum, t) => sum + t.totalExpected, 0);
        
        res.json({
            success: true,
            data: {
                period,
                summary: {
                    totalPaid,
                    totalExpected,
                    totalPending: totalExpected - totalPaid,
                    totalTenants: Object.keys(tenantPayments).length
                },
                tenantPayments,
                monthPayments,
                periodData
            }
        });
    } catch (error) {
        console.error('Error in payment report:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Initialize data when the function is first called
let isInitialized = false;
let initializationPromise = null;

// Export the Express app as a Vercel serverless function
module.exports = async (req, res) => {
    // Initialize data only once, but don't block if it's already running
    if (!isInitialized) {
        if (!initializationPromise) {
            initializationPromise = initializeData().then(() => {
                isInitialized = true;
            }).catch(error => {
                console.error('Initialization failed:', error);
                isInitialized = true; // Mark as initialized to prevent retries
            });
        }
        
        // Wait for initialization with a timeout
        try {
            await Promise.race([
                initializationPromise,
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Initialization timeout')), 8000)
                )
            ]);
        } catch (error) {
            console.error('Initialization timeout or error:', error);
            // Continue without data if initialization fails
        }
    }
    
    // Handle the request
    return app(req, res);
}; 