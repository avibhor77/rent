import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  MenuItem,
  Snackbar,
  Alert,
  IconButton,
  Menu,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Switch
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Receipt as ReceiptIcon,
  Speed as SpeedIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Check as CheckIcon,
  Add as AddIcon,
  Settings as SettingsIcon,
  BarChart as BarChartIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

// Import styles
import './styles/App.css';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Helper function to get API URL for deployment
  const getApiUrl = () => {
    return import.meta.env.VITE_API_URL || '';
  };

  // Helper functions defined at the top level
  const generateFutureMonths = (currentMonth, count = 12) => {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    
    const [month, year] = currentMonth.split(' ');
    const currentMonthIndex = monthNames.indexOf(month);
    const currentYear = parseInt('20' + year);
    
    const futureMonths = [];
    for (let i = 0; i < count; i++) {
      let nextMonthIndex = currentMonthIndex + i + 1; // Start from next month
      let nextYear = currentYear;
      
      if (nextMonthIndex >= 12) {
        nextMonthIndex = nextMonthIndex % 12;
        nextYear++;
      }
      
      const futureMonth = `${monthNames[nextMonthIndex]} ${nextYear.toString().slice(-2)}`;
      futureMonths.push(futureMonth);
    }
    
    return futureMonths;
  };

  const isFutureMonth = (month) => {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    
    const [monthName, year] = month.split(' ');
    const currentDate = new Date();
    const currentMonth = monthNames[currentDate.getMonth()];
    const currentYear = currentDate.getFullYear().toString().slice(-2);
    
    const monthIndex = monthNames.indexOf(monthName);
    const currentMonthIndex = monthNames.indexOf(currentMonth);
    
    const yearNum = parseInt('20' + year);
    const currentYearNum = parseInt('20' + currentYear);
    
    if (yearNum > currentYearNum) return true;
    if (yearNum < currentYearNum) return false;
    
    return monthIndex > currentMonthIndex;
  };

  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState('September 25');
  const [selectedTenant, setSelectedTenant] = useState('A-88 G');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [actionLoading, setActionLoading] = useState({});

  // Data states
  const [dashboardData, setDashboardData] = useState(null);
  const [rentData, setRentData] = useState([]);
  const [meterData, setMeterData] = useState([]);
  const [auditData, setAuditData] = useState([]);

  // Tenant configuration states
  const defaultTenantConfigs = {
    'A-88 G': {
      tenantKey: 'A-88 G',
      name: 'Vaneet Bhalla',
      phone: '9811812336',
      address: 'A-88 Ground Floor Sector 52 Noida',
      floor: 'Ground',
      baseRent: 15000,
      maintenance: 2000,
      misc: 0,
      rentStartMonth: 'January 24'
    },
    'A-206 F': {
      tenantKey: 'A-206 F',
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

  const [tenantConfigs, setTenantConfigs] = useState(defaultTenantConfigs);

  // Update URL when state changes
  useEffect(() => {
    updateURLParams({
      tab: activeTab.toString(),
      month: selectedMonth,
      tenant: selectedTenant
    });
  }, [activeTab, selectedMonth, selectedTenant]);

  useEffect(() => {
    loadData();
    loadTenantConfigs();
  }, [selectedMonth]);

  // Load audit data when switching to audit tab
  useEffect(() => {
    if (activeTab === 5) {
      loadAuditData();
    }
  }, [activeTab]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const apiUrl = getApiUrl();
  
      const [dashboardRes, rentRes, meterRes] = await Promise.all([
        fetch(`${apiUrl}/api/dashboard-data?month=${selectedMonth}`),
        fetch(`${apiUrl}/api/rent-data`),
        fetch(`${apiUrl}/api/meter-data`)
      ]);

      const dashboardData = await dashboardRes.json();
      const rentData = await rentRes.json();
      const meterData = await meterRes.json();

      if (dashboardData.success) {
        setDashboardData(dashboardData.data);
      }
      if (rentData.success) setRentData(rentData.data);
      if (meterData.success) setMeterData(meterData.data);
    } catch (error) {
      console.error('Error loading data:', error);
      setMessage('Error loading data: ' + error.message);
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);

  const loadAuditData = useCallback(async () => {
    try {
      const apiUrl = getApiUrl();
      const auditRes = await fetch(`${apiUrl}/api/audit-log?limit=200`);
      const auditData = await auditRes.json();
      if (auditData.success) {
        // Filter out any entries with missing required fields
        const validAuditData = (auditData.data || []).filter(entry => 
          entry && typeof entry === 'object'
        );
        setAuditData(validAuditData);
      } else {
        console.error('Audit data loading failed:', auditData.error);
        setAuditData([]);
      }
    } catch (error) {
      console.error('Error loading audit data:', error);
      setMessage('Error loading audit data: ' + error.message);
      setOpenSnackbar(true);
      setAuditData([]);
    }
  }, []);

  // Load tenant configurations from API
  const loadTenantConfigs = useCallback(async () => {
    try {
      const response = await fetch('/api/tenant-configs');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setTenantConfigs(result.data);
        }
      }
    } catch (error) {
      console.error('Error loading tenant configs:', error);
      // Fallback to defaults if API fails
      setTenantConfigs(defaultTenantConfigs);
    }
  }, []);

  // Function to reset tenant configs to defaults
  const resetTenantConfigs = async () => {
    try {
      // Reset each tenant to default values
      const resetPromises = Object.keys(tenantConfigs).map(async (tenantKey) => {
        const defaultConfig = defaultTenantConfigs[tenantKey];
        if (defaultConfig) {
          const response = await fetch('/api/tenant-configs', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              tenantKey,
              ...defaultConfig
            }),
          });
          return response.json();
        }
        return null;
      });
      
      await Promise.all(resetPromises);
      await loadTenantConfigs(); // Reload from API
      setMessage('Tenant configurations reset to defaults');
      setOpenSnackbar(true);
    } catch (error) {
      console.error('Error resetting tenant configs:', error);
      setMessage('Error resetting tenant configurations');
      setOpenSnackbar(true);
    }
  };

  // Professional Stacked Bar Chart Component
  const StackedBarChart = ({ data, title }) => {
    if (!data || data.length === 0) return null;

    const maxValue = Math.max(...data.map(d => d.total));
    const chartHeight = 300;
    const barWidth = 60;
    const spacing = 20;

    return (
      <Card className="card">
        <CardContent className="card-content">
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
          <Box sx={{ height: chartHeight, display: 'flex', alignItems: 'end', gap: 1, overflowX: 'auto' }}>
            {data.map((item, index) => {
              const barHeight = (item.total / maxValue) * chartHeight;
              return (
                <Box key={index} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: barWidth }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', height: barHeight, width: barWidth }}>
                    <Box
                      sx={{
                        height: `${(item.baseRent / item.total) * 100}%`,
                        backgroundColor: '#1976d2',
                        border: '1px solid #fff'
                      }}
                      title={`Base Rent: ₹${item.baseRent.toLocaleString()}`}
                    />
                    <Box
                      sx={{
                        height: `${(item.maintenance / item.total) * 100}%`,
                        backgroundColor: '#388e3c',
                        border: '1px solid #fff'
                      }}
                      title={`Maintenance: ₹${item.maintenance.toLocaleString()}`}
                    />
                    <Box
                      sx={{
                        height: `${(item.energyCharges / item.total) * 100}%`,
                        backgroundColor: '#f57c00',
                        border: '1px solid #fff'
                      }}
                      title={`Energy Charges: ₹${item.energyCharges.toLocaleString()}`}
                    />
                    <Box
                      sx={{
                        height: `${(item.gasBill / item.total) * 100}%`,
                        backgroundColor: '#d32f2f',
                        border: '1px solid #fff'
                      }}
                      title={`Gas Bill: ₹${item.gasBill.toLocaleString()}`}
                    />
                  </Box>
                  <Typography variant="caption" sx={{ mt: 1, textAlign: 'center', fontSize: '0.7rem' }}>
                    {item.month}
                  </Typography>
                  <Typography variant="caption" sx={{ textAlign: 'center', fontSize: '0.6rem', color: 'text.secondary' }}>
                    ₹{item.total.toLocaleString()}
                  </Typography>
                </Box>
              );
            })}
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 16, height: 16, backgroundColor: '#1976d2' }} />
              <Typography variant="caption">Base Rent</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 16, height: 16, backgroundColor: '#388e3c' }} />
              <Typography variant="caption">Maintenance</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 16, height: 16, backgroundColor: '#f57c00' }} />
              <Typography variant="caption">Energy Charges</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 16, height: 16, backgroundColor: '#d32f2f' }} />
              <Typography variant="caption">Gas Bill</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  // Dashboard Tab Component
  const DashboardTab = () => {
    const [selectedMonthForChart, setSelectedMonthForChart] = useState(selectedMonth);
    
    const availableMonths = useMemo(() => {
      const months = [...new Set(rentData.map(row => row.month))];
      return months.sort((a, b) => {
        const [aMonth, aYear] = a.split(' ');
        const [bMonth, bYear] = b.split(' ');
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                           'July', 'August', 'September', 'October', 'November', 'December'];
        const aIndex = monthNames.indexOf(aMonth) + (parseInt('20' + aYear) * 12);
        const bIndex = monthNames.indexOf(bMonth) + (parseInt('20' + bYear) * 12);
        return bIndex - aIndex;
      });
    }, [rentData]);

    const currentMonthData = useMemo(() => {
      return rentData.find(row => row.month === selectedMonth);
    }, [rentData, selectedMonth]);

    const dashboardStats = useMemo(() => {
      if (!currentMonthData) return null;

      const tenantKeys = Object.keys(currentMonthData).filter(key => 
        key.endsWith('_TotalRent')
      ).map(key => key.replace('_TotalRent', ''));
      
      let totalRentCollected = 0;
      let totalRentDue = 0;
      let paidTenants = 0;
      
      tenantKeys.forEach(tenantKey => {
        const totalRent = parseFloat(currentMonthData[`${tenantKey}_TotalRent`]) || 0;
        const status = currentMonthData[`${tenantKey}_Status`];
        
        totalRentDue += totalRent;
        if (status === 'Paid') {
          totalRentCollected += totalRent;
          paidTenants++;
        }
      });
      
      return {
        totalRentCollected,
        totalRentDue,
        outstandingAmount: totalRentDue - totalRentCollected,
        totalTenants: tenantKeys.length,
        paidTenants,
        unpaidTenants: tenantKeys.length - paidTenants
      };
    }, [currentMonthData]);

    const chartData = useMemo(() => {
      return rentData.slice(0, 12).map(row => {
        const tenantKeys = Object.keys(row).filter(key => 
          key.endsWith('_TotalRent')
        ).map(key => key.replace('_TotalRent', ''));
        
        let total = 0;
        let baseRent = 0;
        let maintenance = 0;
        let energyCharges = 0;
        let gasBill = 0;
        
        tenantKeys.forEach(tenantKey => {
          total += parseFloat(row[`${tenantKey}_TotalRent`]) || 0;
          baseRent += parseFloat(row[`${tenantKey}_BaseRent`]) || 0;
          maintenance += parseFloat(row[`${tenantKey}_Maintenance`]) || 0;
          energyCharges += parseFloat(row[`${tenantKey}_EnergyCharges`]) || 0;
          gasBill += parseFloat(row[`${tenantKey}_GasBill`]) || 0;
        });
        
        return {
          month: row.month,
          total,
          baseRent,
          maintenance,
          energyCharges,
          gasBill
        };
      });
    }, [rentData]);

    if (loading) {
      return (
        <Box className="loading-container">
          <CircularProgress />
        </Box>
      );
    }

    if (!dashboardStats) {
      return (
        <Alert severity="info">
          No data available for {selectedMonth}
        </Alert>
      );
    }

    const stats = [
      {
        title: 'Total Rent Due',
        value: `₹${dashboardStats.totalRentDue.toLocaleString()}`,
        color: '#2196f3'
      },
      {
        title: 'Rent Collected',
        value: `₹${dashboardStats.totalRentCollected.toLocaleString()}`,
        color: '#4caf50'
      },
      {
        title: 'Outstanding Amount',
        value: `₹${dashboardStats.outstandingAmount.toLocaleString()}`,
        color: '#f44336'
      },
      {
        title: 'Collection Rate',
        value: `${Math.round((dashboardStats.totalRentCollected / dashboardStats.totalRentDue) * 100)}%`,
        color: dashboardStats.totalRentCollected === dashboardStats.totalRentDue ? '#4caf50' : '#ff9800'
      }
    ];

    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Dashboard - {selectedMonth}
        </Typography>
        
        <Grid container spacing={3}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card className="card">
                <CardContent className="card-content">
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    {stat.title}
                  </Typography>
                  <Typography
                    variant="h4"
                    style={{ color: stat.color, fontWeight: 'bold' }}
                  >
                    {stat.value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <StackedBarChart data={chartData} title="Monthly Rent Breakdown" />
          </Grid>
          <Grid item xs={12} md={6}>
            <Card className="card">
              <CardContent className="card-content">
                <Typography variant="h6" gutterBottom>
                  Tenant Status - {selectedMonth}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Paid Tenants</Typography>
                    <Chip label={dashboardStats.paidTenants} color="success" size="small" />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Unpaid Tenants</Typography>
                    <Chip label={dashboardStats.unpaidTenants} color="error" size="small" />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Total Tenants</Typography>
                    <Chip label={dashboardStats.totalTenants} color="primary" size="small" />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  };

  // Individual Tenant Details Tab Component
  const IndividualTenantDetailsTab = () => {
    const [selectedTenantKey, setSelectedTenantKey] = useState(selectedTenant);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editForm, setEditForm] = useState({
      baseRent: '',
      maintenance: '',
      energyCharges: '',
      gasBill: '',
      totalRent: '',
      status: 'Not Paid'
    });

    // Synchronize local selectedTenantKey with global selectedTenant
    useEffect(() => {
      setSelectedTenantKey(selectedTenant);
    }, [selectedTenant]);

    // Reload data when selectedTenant or selectedMonth changes
    useEffect(() => {
      loadData();
    }, [loadData, selectedTenant, selectedMonth]);

    // Memoized data fetching functions
    const currentMonthData = useMemo(() => 
      rentData.find(row => row.month === selectedMonth), 
      [rentData, selectedMonth]
    );
    
    const getTenantData = useCallback((tenantKey) => {
      const tenantConfig = tenantConfigs[tenantKey];
      if (!tenantConfig) return null;
      
      if (!currentMonthData) return null;
      
      return {
        tenantKey,
        name: tenantConfig.name,
        phone: tenantConfig.phone,
        address: tenantConfig.address,
        floor: tenantConfig.floor,
        baseRent: parseFloat(currentMonthData[`${tenantKey}_BaseRent`]) || 0,
        maintenance: parseFloat(currentMonthData[`${tenantKey}_Maintenance`]) || 0,
        energyCharges: parseFloat(currentMonthData[`${tenantKey}_EnergyCharges`]) || 0,
        gasBill: parseFloat(currentMonthData[`${tenantKey}_GasBill`]) || 0,
        totalRent: parseFloat(currentMonthData[`${tenantKey}_TotalRent`]) || 0,
        status: currentMonthData[`${tenantKey}_Status`] || 'Not Paid'
      };
    }, [currentMonthData, tenantConfigs]);

    const getRentHistory = useCallback((tenantKey) => {
      return rentData
        .filter(row => {
          const tenantKeys = Object.keys(row).filter(key => 
            key.endsWith('_TotalRent')
          ).map(key => key.replace('_TotalRent', ''));
          return tenantKeys.includes(tenantKey);
        })
        .map(row => ({
          month: row.month,
          baseRent: parseFloat(row[`${tenantKey}_BaseRent`]) || 0,
          maintenance: parseFloat(row[`${tenantKey}_Maintenance`]) || 0,
          energyCharges: parseFloat(row[`${tenantKey}_EnergyCharges`]) || 0,
          gasBill: parseFloat(row[`${tenantKey}_GasBill`]) || 0,
          totalRent: parseFloat(row[`${tenantKey}_TotalRent`]) || 0,
          status: row[`${tenantKey}_Status`] || 'Not Paid'
        }))
        .sort((a, b) => {
          const [aMonth, aYear] = a.month.split(' ');
          const [bMonth, bYear] = b.month.split(' ');
          const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                             'July', 'August', 'September', 'October', 'November', 'December'];
          const aIndex = monthNames.indexOf(aMonth) + (parseInt('20' + aYear) * 12);
          const bIndex = monthNames.indexOf(bMonth) + (parseInt('20' + bYear) * 12);
          return bIndex - aIndex;
        });
    }, [rentData]);

    const selectedTenantData = useMemo(() => 
      getTenantData(selectedTenantKey), 
      [getTenantData, selectedTenantKey]
    );

    const rentHistory = useMemo(() => 
      getRentHistory(selectedTenantKey), 
      [getRentHistory, selectedTenantKey]
    );

    const handleEditPayment = useCallback((tenantKey) => {
      const tenantData = getTenantData(tenantKey);
      if (!tenantData) return;
      
      setEditForm({
        baseRent: tenantData.baseRent.toString(),
        maintenance: tenantData.maintenance.toString(),
        energyCharges: tenantData.energyCharges.toString(),
        gasBill: tenantData.gasBill.toString(),
        totalRent: tenantData.totalRent.toString(),
        status: tenantData.status
      });
      setEditDialogOpen(true);
    }, [getTenantData]);

    const saveEditPayment = useCallback(async () => {
      try {
        setLoading(true);
        
        const data = {
          tenantKey: selectedTenantKey,
          month: selectedMonth,
          baseRent: parseFloat(editForm.baseRent) || 0,
          maintenance: parseFloat(editForm.maintenance) || 0,
          energyCharges: parseFloat(editForm.energyCharges) || 0,
          gasBill: parseFloat(editForm.gasBill) || 0,
          totalRent: parseFloat(editForm.totalRent) || 0,
          status: editForm.status
        };

        const response = await fetch('/api/adjust-rent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        const result = await response.json();
        
        if (result.success) {
          setMessage('Payment details updated successfully');
          setOpenSnackbar(true);
          setEditDialogOpen(false);
          loadData(); // Reload data
        } else {
          setMessage('Error updating payment details: ' + (result.error || 'Unknown error'));
          setOpenSnackbar(true);
        }
      } catch (error) {
        console.error('Error saving payment details:', error);
        setMessage('Error saving payment details: ' + error.message);
        setOpenSnackbar(true);
      } finally {
        setLoading(false);
      }
    }, [selectedTenantKey, selectedMonth, editForm, loadData]);

    if (!selectedTenantData) {
      return (
        <Box>
          <Typography variant="h4" gutterBottom>
            Individual Tenant Details
          </Typography>
          <Alert severity="error">
            Tenant not found or no data available for the selected tenant.
          </Alert>
        </Box>
      );
    }

    const isFuture = isFutureMonth(selectedMonth);

    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Individual Tenant Details
        </Typography>

        {/* Tenant Selection */}
        <Card className="card" style={{ marginBottom: '2rem' }}>
          <CardContent className="card-content">
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="tenant-select-label">Select Tenant</InputLabel>
                  <Select
                    id="tenant-select"
                    name="tenantSelect"
                    value={selectedTenantKey}
                    onChange={(e) => {
                      setSelectedTenantKey(e.target.value);
                      setSelectedTenant(e.target.value);
                    }}
                    labelId="tenant-select-label"
                    label="Select Tenant"
                  >
                    {Object.keys(tenantConfigs).map(tenantKey => (
                      <MenuItem key={tenantKey} value={tenantKey}>
                        {tenantConfigs[tenantKey]?.name || tenantKey}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1" color="textSecondary">
                  Current Month: {selectedMonth}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Tenant Information */}
        <Card className="card" style={{ marginBottom: '2rem' }}>
          <CardContent className="card-content">
            <Typography variant="h6" gutterBottom>
              Tenant Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">
                  Name: {selectedTenantData.name}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">
                  Phone: {selectedTenantData.phone}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="textSecondary">
                  Address: {selectedTenantData.address}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Payment Details */}
        <Card className="card" style={{ marginBottom: '2rem' }}>
          <CardContent className="card-content">
            <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom={2}>
              <Typography variant="h6">
                Payment Details - {selectedMonth}
              </Typography>
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => handleEditPayment(selectedTenantKey)}
                className="btn-primary"
              >
                Edit Payment Details
              </Button>
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="textSecondary">
                  Base Rent
                </Typography>
                <Typography variant="h6">
                  ₹{selectedTenantData.baseRent.toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="textSecondary">
                  Maintenance
                </Typography>
                <Typography variant="h6">
                  ₹{selectedTenantData.maintenance.toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="textSecondary">
                  Energy Charges
                </Typography>
                <Typography variant="h6">
                  ₹{selectedTenantData.energyCharges.toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="textSecondary">
                  Gas Bill
                </Typography>
                <Typography variant="h6">
                  ₹{selectedTenantData.gasBill.toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="textSecondary">
                  Total Rent
                </Typography>
                <Typography variant="h5" style={{ color: '#1976d2', fontWeight: 'bold' }}>
                  ₹{selectedTenantData.totalRent.toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="textSecondary">
                  Status
                </Typography>
                <Chip
                  label={selectedTenantData.status}
                  color={selectedTenantData.status === 'Paid' ? 'success' : 'error'}
                  size="small"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Rent History */}
        <Card className="card">
          <CardContent className="card-content">
            <Typography variant="h6" gutterBottom>
              Rent History
            </Typography>
            <TableContainer component={Paper}>
              <Table className="table">
                <TableHead>
                  <TableRow>
                    <TableCell>Month</TableCell>
                    <TableCell>Base Rent</TableCell>
                    <TableCell>Maintenance</TableCell>
                    <TableCell>Energy Charges</TableCell>
                    <TableCell>Gas Bill</TableCell>
                    <TableCell>Total Rent</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rentHistory.map((record, index) => (
                    <TableRow key={index}>
                      <TableCell>{record.month}</TableCell>
                      <TableCell>₹{record.baseRent.toLocaleString()}</TableCell>
                      <TableCell>₹{record.maintenance.toLocaleString()}</TableCell>
                      <TableCell>₹{record.energyCharges.toLocaleString()}</TableCell>
                      <TableCell>₹{record.gasBill.toLocaleString()}</TableCell>
                      <TableCell>₹{record.totalRent.toLocaleString()}</TableCell>
                      <TableCell>
                        <Chip
                          label={record.status}
                          color={record.status === 'Paid' ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          className="dialog"
        >
          <DialogTitle className="dialog-title">
            Edit Payment Details
          </DialogTitle>
          <DialogContent className="dialog-content">
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="edit-base-rent"
                  name="editBaseRent"
                  label="Base Rent"
                  type="number"
                  value={editForm.baseRent}
                  onChange={(e) => {
                    const value = e.target.value;
                    setEditForm(prev => {
                      const newForm = { ...prev, baseRent: value };
                      const baseRent = parseFloat(value) || 0;
                      const maintenance = parseFloat(newForm.maintenance) || 0;
                      const energyCharges = parseFloat(newForm.energyCharges) || 0;
                      const gasBill = parseFloat(newForm.gasBill) || 0;
                      newForm.totalRent = (baseRent + maintenance + energyCharges + gasBill).toString();
                      return newForm;
                    });
                  }}
                  InputProps={{ readOnly: isFuture }}
                  helperText={isFuture ? "Cannot edit rent values for future months" : ""}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="edit-maintenance"
                  name="editMaintenance"
                  label="Maintenance"
                  type="number"
                  value={editForm.maintenance}
                  onChange={(e) => {
                    const value = e.target.value;
                    setEditForm(prev => {
                      const newForm = { ...prev, maintenance: value };
                      const baseRent = parseFloat(newForm.baseRent) || 0;
                      const maintenance = parseFloat(value) || 0;
                      const energyCharges = parseFloat(newForm.energyCharges) || 0;
                      const gasBill = parseFloat(newForm.gasBill) || 0;
                      newForm.totalRent = (baseRent + maintenance + energyCharges + gasBill).toString();
                      return newForm;
                    });
                  }}
                  InputProps={{ readOnly: isFuture }}
                  helperText={isFuture ? "Cannot edit rent values for future months" : ""}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="edit-energy-charges"
                  name="editEnergyCharges"
                  label="Energy Charges"
                  type="number"
                  value={editForm.energyCharges}
                  onChange={(e) => {
                    const value = e.target.value;
                    setEditForm(prev => {
                      const newForm = { ...prev, energyCharges: value };
                      const baseRent = parseFloat(newForm.baseRent) || 0;
                      const maintenance = parseFloat(newForm.maintenance) || 0;
                      const energyCharges = parseFloat(value) || 0;
                      const gasBill = parseFloat(newForm.gasBill) || 0;
                      newForm.totalRent = (baseRent + maintenance + energyCharges + gasBill).toString();
                      return newForm;
                    });
                  }}
                  InputProps={{ readOnly: isFuture }}
                  helperText={isFuture ? "Cannot edit rent values for future months" : ""}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="edit-gas-bill"
                  name="editGasBill"
                  label="Gas Bill"
                  type="number"
                  value={editForm.gasBill}
                  onChange={(e) => {
                    const value = e.target.value;
                    setEditForm(prev => {
                      const newForm = { ...prev, gasBill: value };
                      const baseRent = parseFloat(newForm.baseRent) || 0;
                      const maintenance = parseFloat(newForm.maintenance) || 0;
                      const energyCharges = parseFloat(newForm.energyCharges) || 0;
                      const gasBill = parseFloat(value) || 0;
                      newForm.totalRent = (baseRent + maintenance + energyCharges + gasBill).toString();
                      return newForm;
                    });
                  }}
                  InputProps={{ readOnly: isFuture }}
                  helperText={isFuture ? "Cannot edit rent values for future months" : ""}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="edit-total-rent"
                  name="editTotalRent"
                  label="Total Rent (Auto-calculated)"
                  type="number"
                  value={editForm.totalRent}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="edit-status-label">Status</InputLabel>
                  <Select
                    id="edit-status"
                    name="editStatus"
                    value={editForm.status}
                    onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                    labelId="edit-status-label"
                    label="Status"
                  >
                    <MenuItem value="Paid">Paid</MenuItem>
                    <MenuItem value="Not Paid">Not Paid</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions className="dialog-actions">
            <Button onClick={() => setEditDialogOpen(false)} className="btn-secondary">
              Cancel
            </Button>
            <Button
              onClick={saveEditPayment}
              variant="contained"
              className="btn-primary"
            >
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  };

  // Rest of the components would go here...
  // For brevity, I'll include the main structure

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const updateURLParams = (params) => {
    const newSearchParams = new URLSearchParams(searchParams);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        newSearchParams.set(key, value);
      }
    });
    setSearchParams(newSearchParams);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return <DashboardTab />;
      case 1:
        return <IndividualTenantDetailsTab />;
      default:
        return <DashboardTab />;
    }
  };

  return (
    <div className="app">
      <AppBar position="static" className="app-header">
        <Toolbar>
          <Typography variant="h6" className="app-title">
            Tenant Rent Management System
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" className="app-container">
        <Box className="tab-container">
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab
              icon={<DashboardIcon />}
              label="Dashboard"
              iconPosition="start"
            />
            <Tab
              icon={<PeopleIcon />}
              label="Individual Tenant"
              iconPosition="start"
            />
            <Tab
              icon={<ReceiptIcon />}
              label="Tenant Config"
              iconPosition="start"
            />
            <Tab
              icon={<SpeedIcon />}
              label="Meter Readings"
              iconPosition="start"
            />
            <Tab
              icon={<AssessmentIcon />}
              label="Payment Report"
              iconPosition="start"
            />
            <Tab
              icon={<BarChartIcon />}
              label="Audit Log"
              iconPosition="start"
            />
            <Tab
              icon={<TrendingUpIcon />}
              label="Payment Summary"
              iconPosition="start"
            />
          </Tabs>

          <Box className="tab-content">
            {renderTabContent()}
          </Box>
        </Box>
      </Container>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity="success"
          sx={{ width: '100%' }}
        >
          {message}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default App;
