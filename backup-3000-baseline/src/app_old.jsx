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
    const monthIndex = monthNames.indexOf(monthName);
    const monthYear = parseInt('20' + year);
    
    // Get actual current month
    const now = new Date();
    const currentMonthIndex = now.getMonth();
    const currentYear = now.getFullYear();
    
    if (monthYear > currentYear) return true;
    if (monthYear === currentYear && monthIndex > currentMonthIndex) return true;
    return false;
  };

  // State variables - initialize from URL params
  const [activeTab, setActiveTab] = useState(() => {
    const tab = searchParams.get('tab');
    return tab ? parseInt(tab) : 0;
  });
  const [auditData, setAuditData] = useState([]);
  
  // Payment Summary state
  const [paymentSummaryData, setPaymentSummaryData] = useState([]);
  const [editingSummary, setEditingSummary] = useState(false);
  const [summaryForm, setSummaryForm] = useState({
    month: '',
    tenant: '',
    totalRent: '',
    baseRent: '',
    maintenance: '',
    energyCharges: '',
    gasBill: '',
    status: ''
  });
  const [dashboardData, setDashboardData] = useState({
    tenants: [],
    summary: { expected: 0, collected: 0, pending: 0, totalTenants: 0 },
    pendingDues: [],
    monthlyData: []
  });
  const [rentData, setRentData] = useState([]);
  const [meterData, setMeterData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const month = searchParams.get('month');
    if (month) return month;
    
    // Default to current month
    const now = new Date();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    return `${monthNames[now.getMonth()]} ${now.getFullYear().toString().slice(-2)}`;
  });
  const [selectedTenant, setSelectedTenant] = useState(() => {
    return searchParams.get('tenant') || 'A-88 G';
  });
  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [meterDialogOpen, setMeterDialogOpen] = useState(false);
  const [a206DialogOpen, setA206DialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [meterInput, setMeterInput] = useState({
    month: '',
    mainMeter: '',
    firstFloor: '',
    secondFloor: '',
    water: '',
    a206Month: '',
    a206MainMeter: '',
    a206SecondFloor: '',
    a206GasBill: '',
    a206Action: 'insert'
  });

  // Function to update URL parameters
  const updateURLParams = (newParams) => {
    const currentParams = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        currentParams.set(key, value);
      } else {
        currentParams.delete(key);
      }
    });
    setSearchParams(currentParams);
  };

  // Update URL when state changes
  useEffect(() => {
    updateURLParams({
      tab: activeTab.toString(),
      month: selectedMonth,
      tenant: selectedTenant
    });
  }, [activeTab, selectedMonth, selectedTenant]);

  useEffect(() => {
    loadTenantConfigs();
  }, []);

  // Load audit data when switching to audit tab
  useEffect(() => {
    if (activeTab === 5) {
      loadAuditData();
    }
  }, [activeTab, loadAuditData]);

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

  const markAsPaid = async (tenantKey, month = selectedMonth) => {
    try {
      setActionLoading(prev => ({ ...prev, [`mark-paid-${tenantKey}`]: true }));
      const response = await fetch('/api/mark-payment-paid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant: tenantKey,
          month: month
        })
      });

      if (response.ok) {
        const result = await response.json();
        setMessage(result.message);
        setOpenSnackbar(true);
        await loadData();
      } else {
        const error = await response.json();
        setMessage(error.message || 'Error updating status');
        setOpenSnackbar(true);
      }
    } catch (error) {
      console.error('Error marking as paid:', error);
      setMessage('Error updating status');
      setOpenSnackbar(true);
    } finally {
      setActionLoading(prev => ({ ...prev, [`mark-paid-${tenantKey}`]: false }));
    handleMenuClose();
    }
  };

  const handleMenuOpen = (event, row) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const saveMeterReadings = async () => {
    try {
      const response = await fetch('/api/update-meter-readings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month: meterInput.month,
          readings: {
            mainMeter: parseFloat(meterInput.mainMeter),
            firstFloor: parseFloat(meterInput.firstFloor),
            secondFloor: parseFloat(meterInput.secondFloor),
            water: parseFloat(meterInput.water)
          }
        })
      });

      if (response.ok) {
        setMessage(`Meter readings saved for ${meterInput.month}`);
        setOpenSnackbar(true);
        setMeterDialogOpen(false);
        loadData();
      } else {
        setMessage('Error saving meter readings');
        setOpenSnackbar(true);
      }
    } catch (error) {
      console.error('Error saving meter readings:', error);
      setMessage('Error saving meter readings');
      setOpenSnackbar(true);
    }
  };

  const saveA206MeterReading = async () => {
    try {
      const response = await fetch('/api/update-a206-meter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month: meterInput.a206Month,
          mainMeter: parseFloat(meterInput.a206MainMeter),
          secondFloorMeter: parseFloat(meterInput.a206SecondFloor),
          gasBill: parseFloat(meterInput.a206GasBill) || 0,
          action: meterInput.a206Action
        })
      });

      if (response.ok) {
        setMessage(`A-206 meter reading ${meterInput.a206Action === 'insert' ? 'saved' : 'updated'} for ${meterInput.a206Month}`);
        setOpenSnackbar(true);
        setA206DialogOpen(false);
        loadData();
      } else {
        const error = await response.json();
        setMessage(error.message || 'Error saving A-206 meter reading');
        setOpenSnackbar(true);
      }
    } catch (error) {
      console.error('Error saving A-206 meter reading:', error);
      setMessage('Error saving A-206 meter reading');
      setOpenSnackbar(true);
    }
  };

  const months = [
    'August 24', 'September 24', 'October 24', 'November 24', 'December 24',
    'January 25', 'February 25', 'March 25', 'April 25', 'May 25', 'June 25', 'July 25',
    'August 25', 'September 25', 'October 25', 'November 25', 'December 25',
    'January 26', 'February 26', 'March 26', 'April 26', 'May 26', 'June 26', 'July 26'
  ];

  // Enhanced tenant configurations with additional details
  const defaultTenantConfigs = {
    'A-88 G': { 
      name: 'Vaneet Bhalla', 
      phone: '9811812336', 
      floor: 'Ground',
      address: 'A-88 Ground Floor, Sector 15, Noida',
      baseRent: 26000, 
      maintenance: 500,
      rentStartMonth: 'January 2024',
      paysMaintenance: true,
      notes: 'Reliable tenant, pays on time'
    },
    'A-88 1st': { 
      name: 'VishnuPratap Pandey', 
      phone: '918377051059', 
      floor: '1st',
      address: 'A-88 First Floor, Sector 15, Noida',
      baseRent: 25000, 
      maintenance: 500,
      rentStartMonth: 'March 2024',
      paysMaintenance: true,
      notes: 'Sometimes delays payment'
    },
    'A-88 2nd': { 
      name: 'Sumit Swarnkar', 
      phone: '9340609004', 
      floor: '2nd',
      address: 'A-88 Second Floor, Sector 15, Noida',
      baseRent: 20000, 
      maintenance: 500,
      rentStartMonth: 'February 2024',
      paysMaintenance: true,
      notes: 'Good tenant'
    },
    'A-206 2nd': { 
      name: 'Ajit Singh', 
      phone: '9999311108', 
      floor: '2nd',
      address: 'A-206 Second Floor, Sector 15, Noida',
      baseRent: 23000, 
      maintenance: 0,
      rentStartMonth: 'January 2024',
      paysMaintenance: false,
      notes: 'No maintenance included'
    },
    'A-81 G': { 
      name: 'Avinash Baisoya', 
      phone: '9999722190', 
      floor: 'Ground',
      address: 'A-81 Ground Floor, Sector 15, Noida',
      baseRent: 20000, 
      maintenance: 0,
      rentStartMonth: 'December 2023',
      paysMaintenance: false,
      notes: 'Long-term tenant'
    },
    'A-81 1st': { 
      name: 'Sumit Raghav', 
      phone: '93112055890', 
      floor: '1st',
      address: 'A-81 First Floor, Sector 15, Noida',
      baseRent: 29000, 
      maintenance: 0,
      rentStartMonth: 'November 2023',
      paysMaintenance: false,
      notes: 'Premium tenant'
    },
    'Eldeco': { 
      name: 'Saqib Mustafa', 
      phone: '9792552989', 
      floor: 'N/A',
      address: 'Eldeco Aangan, Sector 15, Noida',
      baseRent: 34000, 
      maintenance: 0,
      rentStartMonth: 'October 2023',
      paysMaintenance: false,
      notes: 'Commercial property'
    },
    'Gomti': { 
      name: 'Sameer Agarwal', 
      phone: '9792552989', 
      floor: 'N/A',
      address: 'Gomti Nagar, Lucknow',
      baseRent: 80000, 
      maintenance: 0,
      rentStartMonth: 'September 2023',
      paysMaintenance: false,
      notes: 'High-value property'
    }
  };

  // Load tenant configs from API
  const [tenantConfigs, setTenantConfigs] = useState(defaultTenantConfigs);

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
      const resetPromises = Object.keys(defaultTenantConfigs).map(tenantKey =>
        fetch('/api/update-tenant-config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tenantKey,
            updates: defaultTenantConfigs[tenantKey]
          })
        })
      );
      
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
  const ProfessionalStackedBarChart = ({ data, title }) => {
    if (!data || data.length === 0) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>{title}</Typography>
          <Typography variant="body2" color="text.secondary">No data available</Typography>
        </Box>
      );
    }

    const maxAmount = Math.max(...data.map(d => d.expected));
    const barHeight = 300;

    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>{title}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'end', height: barHeight, gap: 2, overflowX: 'auto', pb: 2 }}>
          {data.map((item, index) => {
            const totalHeight = (item.expected / maxAmount) * (barHeight - 80);
            const collectedHeight = (item.collected / item.expected) * totalHeight;
            const pendingHeight = totalHeight - collectedHeight;
            
            return (
              <Box key={index} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 100 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', mb: 1, width: 40 }}>
                  {/* Collected (bottom part) */}
                  <Box
                    sx={{
                      width: 40,
                      height: collectedHeight,
                      background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                      borderRadius: '4px 4px 0 0',
                      borderBottom: pendingHeight > 0 ? '1px solid white' : 'none',
                    }}
                  />
                  {/* Pending (top part) */}
                  {pendingHeight > 0 && (
                    <Box
                      sx={{
                        width: 40,
                        height: pendingHeight,
                        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                        borderRadius: '0 0 4px 4px',
                      }}
                    />
                  )}
                </Box>
                <Typography variant="caption" sx={{ textAlign: 'center', fontSize: '0.7rem', mb: 0.5 }}>
                  {item.month}
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'success.main', fontSize: '0.65rem' }}>
                  ₹{(item.collected / 1000).toFixed(0)}k
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'error.main', fontSize: '0.65rem' }}>
                  ₹{(item.pending / 1000).toFixed(0)}k
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main', fontSize: '0.7rem' }}>
                  ₹{(item.expected / 1000).toFixed(0)}k
                </Typography>
              </Box>
            );
          })}
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', borderRadius: 1 }} />
            <Typography variant="caption">Collected</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', borderRadius: 1 }} />
            <Typography variant="caption">Pending</Typography>
          </Box>
        </Box>
      </Box>
    );
  };

  const DashboardTab = () => (
    <Box>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'stretch', sm: 'center' }, 
        mb: 3,
        gap: { xs: 2, sm: 0 }
      }}>
        <Typography variant="h4" sx={{ 
          fontSize: { xs: '1.5rem', sm: '2.125rem' },
          textAlign: { xs: 'center', sm: 'left' }
        }}>
          Dashboard - {selectedMonth}
        </Typography>
        <FormControl size="small" sx={{ 
          minWidth: { xs: '100%', sm: 150 },
          maxWidth: { xs: 200, sm: 'none' },
          alignSelf: { xs: 'center', sm: 'auto' }
        }}>
          <Select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            displayEmpty
          >
            {months.map((month) => (
              <MenuItem key={month} value={month}>{month}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      
      <Grid container spacing={3}>
        {/* Key Metrics */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: 2,
                boxShadow: 2
              }}>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                    ₹{(dashboardData.summary.expected / 1000).toFixed(0)}k
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Expected Rent
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                color: 'white',
                borderRadius: 2,
                boxShadow: 2
              }}>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                    ₹{(dashboardData.summary.collected / 1000).toFixed(0)}k
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Collected
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                borderRadius: 2,
                boxShadow: 2
              }}>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                    ₹{(dashboardData.summary.pending / 1000).toFixed(0)}k
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Pending
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: 'white',
                borderRadius: 2,
                boxShadow: 2
              }}>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                    {dashboardData.summary.totalTenants}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Tenants
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Chart and Pending Dues */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <Box sx={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <ProfessionalStackedBarChart data={dashboardData.monthlyData || []} title="Monthly Collection Trend" />
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 2, height: 'fit-content' }}>
            <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 600, 
                mb: 2, 
                color: '#d32f2f',
                fontSize: { xs: '1rem', sm: '1.25rem' }
              }}>
                ⚠️ Pending Dues - {selectedMonth}
              </Typography>
              <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
                <Typography variant="body2">
                  <strong>Note:</strong> Gomti Nagar payments are handled separately (cash + cheque). 
                  A-81 1st floor has pending payment of ₹29,000 for {selectedMonth}.
                  <br />
                  <strong>Tenant Details:</strong> All tenant names, phone numbers, and rent amounts are now correctly loaded from Excel files.
                  <br />
                  <strong>A-88 Tenants:</strong> Base rent + maintenance + energy + water charges.
                </Typography>
              </Alert>
              <Box sx={{ maxHeight: 250, overflowY: 'auto' }}>
                {dashboardData.pendingDues && dashboardData.pendingDues.length > 0 ? 
                  dashboardData.pendingDues.map(due => (
                    <Box key={due.tenant} sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      py: 1.5, 
                      px: 2,
                      mb: 1,
                      border: '2px solid #ffcdd2',
                      borderRadius: 2,
                      backgroundColor: '#ffebee',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: '#ffcdd2',
                        transform: 'translateY(-1px)',
                        boxShadow: 2
                      }
                    }}>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#d32f2f' }}>
                          {due.tenant}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#d32f2f', opacity: 0.8 }}>
                          {due.name}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#d32f2f' }}>
                          ₹{due.amount.toLocaleString()}
                        </Typography>
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          onClick={() => markAsPaid(due.tenant)}
                          disabled={actionLoading[`mark-paid-${due.tenant}`]}
                          startIcon={actionLoading[`mark-paid-${due.tenant}`] ? <CircularProgress size={16} /> : null}
                          sx={{ mt: 0.5 }}
                        >
                          {actionLoading[`mark-paid-${due.tenant}`] ? 'Processing...' : 'Mark Paid'}
                        </Button>
                      </Box>
                    </Box>
                  ))
                : <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                  ✅ No pending dues for {selectedMonth}
                </Typography>
                }
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Tenant Summary Table */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Tenant Payment Summary
              </Typography>
              <Box sx={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <TableContainer sx={{ minWidth: { xs: 800, sm: 'auto' } }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 600, minWidth: { xs: 80, sm: 'auto' } }}>Tenant</TableCell>
                        <TableCell sx={{ fontWeight: 600, minWidth: { xs: 120, sm: 'auto' } }}>Name</TableCell>
                        <TableCell sx={{ fontWeight: 600, minWidth: { xs: 100, sm: 'auto' } }}>Base Rent</TableCell>
                        <TableCell sx={{ fontWeight: 600, minWidth: { xs: 100, sm: 'auto' } }}>Maintenance</TableCell>
                        <TableCell sx={{ fontWeight: 600, minWidth: { xs: 80, sm: 'auto' } }}>Misc</TableCell>
                        <TableCell sx={{ fontWeight: 600, minWidth: { xs: 100, sm: 'auto' } }}>Energy</TableCell>
                        <TableCell sx={{ fontWeight: 600, minWidth: { xs: 100, sm: 'auto' } }}>Expected</TableCell>
                        <TableCell sx={{ fontWeight: 600, minWidth: { xs: 100, sm: 'auto' } }}>Actual</TableCell>
                        <TableCell sx={{ fontWeight: 600, minWidth: { xs: 80, sm: 'auto' } }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600, minWidth: { xs: 60, sm: 'auto' } }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboardData.tenants.map(tenant => (
                      <TableRow key={tenant.tenant} hover>
                          <TableCell sx={{ fontWeight: 500, minWidth: { xs: 80, sm: 'auto' } }}>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                cursor: 'pointer', 
                                color: 'primary.main',
                                '&:hover': { textDecoration: 'underline' }
                              }}
                              onClick={() => {
                                setActiveTab(1);
                                setSelectedTenant(tenant.tenant);
                                updateURLParams({ tab: '1', tenant: tenant.tenant });
                              }}
                            >
                              {tenant.tenant}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ minWidth: { xs: 120, sm: 'auto' } }}>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                cursor: 'pointer', 
                                color: 'primary.main',
                                '&:hover': { textDecoration: 'underline' }
                              }}
                              onClick={() => {
                                setActiveTab(1);
                                setSelectedTenant(tenant.tenant);
                                updateURLParams({ tab: '1', tenant: tenant.tenant });
                              }}
                            >
                              {tenant.name}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ minWidth: { xs: 100, sm: 'auto' } }}>₹{tenant.baseRent.toLocaleString()}</TableCell>
                          <TableCell sx={{ minWidth: { xs: 100, sm: 'auto' } }}>₹{tenant.maintenance.toLocaleString()}</TableCell>
                          <TableCell sx={{ minWidth: { xs: 80, sm: 'auto' } }}>₹{tenant.misc.toLocaleString()}</TableCell>
                          <TableCell sx={{ minWidth: { xs: 100, sm: 'auto' } }}>₹{tenant.energyCharges.toLocaleString()}</TableCell>
                          <TableCell sx={{ minWidth: { xs: 100, sm: 'auto' } }}>₹{tenant.expectedAmount.toLocaleString()}</TableCell>
                          <TableCell sx={{ minWidth: { xs: 100, sm: 'auto' } }}>₹{tenant.actualAmount.toLocaleString()}</TableCell>
                          <TableCell sx={{ minWidth: { xs: 80, sm: 'auto' } }}>
                          <Chip
                            label={tenant.status}
                            color={tenant.status === 'Paid' ? 'success' : 'error'}
                            variant="outlined"
                            size="small"
                          />
                        </TableCell>
                          <TableCell sx={{ minWidth: { xs: 60, sm: 'auto' } }}>
                          <IconButton
                            onClick={(e) => handleMenuOpen(e, tenant)}
                            size="small"
                            sx={{ 
                              position: 'relative',
                              '&:hover': {
                                backgroundColor: 'rgba(0,0,0,0.04)'
                              }
                            }}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  // Individual Tenant Details Tab - for viewing detailed info of a specific tenant
  const IndividualTenantDetailsTab = () => {
    // State management
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedTenantForEdit, setSelectedTenantForEdit] = useState(null);
    const [editForm, setEditForm] = useState({
      totalRent: '',
      baseRent: '',
      maintenance: '',
      energyCharges: '',
      gasBill: '',
      status: 'Paid',
      isPastMonth: false
    });

    const [futurePaymentDialogOpen, setFuturePaymentDialogOpen] = useState(false);
    const [futurePaymentForm, setFuturePaymentForm] = useState({
      month: '',
      tenant: '',
      totalRent: '',
      baseRent: '',
      maintenance: '',
      energyCharges: '',
      gasBill: '',
      status: 'Paid'
    });

    const [tenantConfigDialogOpen, setTenantConfigDialogOpen] = useState(false);
    const [tenantConfigForm, setTenantConfigForm] = useState({
      name: '',
      phone: '',
      address: '',
      floor: '',
      baseRent: '',
      maintenance: '',
      misc: '',
      rentStartMonth: '',
      paysMaintenance: true,
      notes: ''
    });

    // Local state for tenant selection - synchronized with global selectedTenant
    const [selectedTenantKey, setSelectedTenantKey] = useState(selectedTenant);

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

      if (currentMonthData) {
        const baseRent = currentMonthData[`${tenantKey}_BaseRent`] ?? tenantConfig.baseRent ?? 0;
        const maintenance = currentMonthData[`${tenantKey}_Maintenance`] ?? tenantConfig.maintenance ?? 0;
        const misc = currentMonthData[`${tenantKey}_Misc`] ?? 0;
        const energyCharges = currentMonthData[`${tenantKey}_EnergyCharges`] ?? 0;
        const gasBill = currentMonthData[`${tenantKey}_GasBill`] ?? 0;
        const totalRent = currentMonthData[`${tenantKey}_TotalRent`] ?? (baseRent + maintenance + misc + energyCharges + gasBill);
        const status = currentMonthData[`${tenantKey}_Status`] ?? 'Not Paid';

        return {
          tenantKey,
          name: tenantConfig.name,
          phone: tenantConfig.phone,
          address: tenantConfig.address,
          floor: tenantConfig.floor,
          baseRent,
          maintenance,
          misc,
          energyCharges,
          gasBill,
          totalRent,
          status,
          notes: tenantConfig.notes,
        };
      } else {
        return {
          tenantKey,
          name: tenantConfig.name,
          phone: tenantConfig.phone,
          address: tenantConfig.address,
          floor: tenantConfig.floor,
          baseRent: tenantConfig.baseRent ?? 0,
          maintenance: tenantConfig.maintenance ?? 0,
          misc: 0,
          energyCharges: 0,
          gasBill: 0,
          totalRent: (tenantConfig.baseRent ?? 0) + (tenantConfig.maintenance ?? 0),
          status: 'Not Paid',
          notes: tenantConfig.notes,
        };
      }
    }, [currentMonthData, tenantConfigs]);

    const getRentHistory = useCallback((tenantKey) => {
      return rentData
        .filter(row => row[tenantKey] && row[tenantKey] > 0)
        .map(row => {
          const baseRent = row[`${tenantKey}_BaseRent`] ?? 0;
          const maintenance = row[`${tenantKey}_Maintenance`] ?? 0;
          const misc = row[`${tenantKey}_Misc`] ?? 0;
          const energyCharges = row[`${tenantKey}_EnergyCharges`] ?? 0;
          const gasBill = row[`${tenantKey}_GasBill`] ?? 0;
          const totalRent = row[`${tenantKey}_TotalRent`] ?? (baseRent + maintenance + misc + energyCharges + gasBill);
          
          return {
            month: row.month,
            totalRent,
            status: row[`${tenantKey}_Status`] ?? 'Not Paid',
            baseRent,
            maintenance,
            energyCharges,
            gasBill
          };
        })
        .sort((a, b) => {
          const [aMonth, aYear] = a.month.split(' ');
          const [bMonth, bYear] = b.month.split(' ');
          const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                             'July', 'August', 'September', 'October', 'November', 'December'];
          const aIndex = monthNames.indexOf(aMonth) + (parseInt('20' + aYear) * 12);
          const bIndex = monthNames.indexOf(bMonth) + (parseInt('20' + bYear) * 12);
          return bIndex - aIndex;
        })
        .slice(0, 12);
    }, [rentData]);

    // Memoized tenant data - moved to avoid duplication

    // Event handlers
    const handleEditPayment = useCallback((tenant) => {
      setSelectedTenantForEdit(tenant);
      
      const isPastMonth = isFutureMonth(selectedMonth) === false && selectedMonth !== getCurrentMonth();
      
      setEditForm({
        totalRent: tenant.totalRent?.toString() ?? '',
        baseRent: tenant.baseRent?.toString() ?? '',
        maintenance: tenant.maintenance?.toString() ?? '',
        energyCharges: tenant.energyCharges?.toString() ?? '',
        gasBill: tenant.gasBill?.toString() ?? '',
        status: tenant.status ?? 'Paid',
        isPastMonth: isPastMonth
      });
      
      setEditDialogOpen(true);
    }, [selectedMonth]);

    const saveEditPayment = useCallback(async () => {
      try {
        setActionLoading(prev => ({ ...prev, 'edit-payment': true }));

        if (editForm.isPastMonth) {
          const response = await fetch('/api/adjust-rent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              tenant: selectedTenantForEdit?.tenantKey,
              month: selectedMonth,
              totalRent: 0,
              baseRent: 0,
              maintenance: 0,
              energyCharges: 0,
              gasBill: 0,
              status: editForm.status
            })
          });

          const result = await response.json();

          if (response.ok) {
            setEditDialogOpen(false);
            setMessage(result.message || 'Status updated successfully');
            setOpenSnackbar(true);
            await loadData();
          } else {
            setMessage(result.message || 'Error updating status');
            setOpenSnackbar(true);
          }
          return;
        }

        const baseRent = parseFloat(editForm.baseRent) || 0;
        const maintenance = parseFloat(editForm.maintenance) || 0;
        const energyCharges = parseFloat(editForm.energyCharges) || 0;
        const gasBill = parseFloat(editForm.gasBill) || 0;
        const totalRent = baseRent + maintenance + energyCharges + gasBill;

        const response = await fetch('/api/adjust-rent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tenant: selectedTenantForEdit?.tenantKey,
            month: selectedMonth,
            totalRent,
            baseRent,
            maintenance,
            energyCharges,
            gasBill,
            status: editForm.status
          })
        });

        const result = await response.json();

        if (response.ok) {
          setEditDialogOpen(false);
          setMessage(result.message || 'Payment updated successfully');
          setOpenSnackbar(true);
          await loadData();
        } else {
          setMessage(result.message || 'Error updating payment');
          setOpenSnackbar(true);
        }
      } catch (error) {
        console.error('Error updating payment:', error);
        setMessage('Error updating payment: ' + error.message);
        setOpenSnackbar(true);
      } finally {
        setActionLoading(prev => ({ ...prev, 'edit-payment': false }));
      }
    }, [editForm, selectedTenantForEdit, selectedMonth, loadData, setMessage, setOpenSnackbar, setActionLoading]);

    const handleAddFuturePayment = (tenant) => {
      const baseRent = tenant.baseRent || 0;
      const maintenance = tenant.maintenance || 0;
      const energyCharges = tenant.energyCharges || 0;
      const misc = tenant.misc || 0;
      const gasBill = tenant.gasBill || 0;
      
      setFuturePaymentForm({
        month: selectedMonth,
        tenant: tenant.tenantKey,
        totalRent: baseRent + maintenance + energyCharges + misc + gasBill,
        baseRent: baseRent,
        maintenance: maintenance,
        energyCharges: energyCharges,
        misc: misc,
        gasBill: gasBill,
        status: 'Not Paid'
      });
      setFuturePaymentDialogOpen(true);
    };

    const saveFuturePayment = async () => {
      try {
        setActionLoading(prev => ({ ...prev, 'future-payment': true }));
        
        const baseRent = parseFloat(futurePaymentForm.baseRent) || 0;
        const maintenance = parseFloat(futurePaymentForm.maintenance) || 0;
        const energyCharges = parseFloat(futurePaymentForm.energyCharges) || 0;
        const gasBill = parseFloat(futurePaymentForm.gasBill) || 0;
        const totalRent = baseRent + maintenance + energyCharges + gasBill;
        
        const response = await fetch('/api/adjust-rent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tenant: futurePaymentForm.tenant,
            month: futurePaymentForm.month,
            totalRent: totalRent,
            baseRent: baseRent,
            maintenance: maintenance,
            energyCharges: energyCharges,
            gasBill: gasBill,
            status: futurePaymentForm.status
          })
        });
        
        const result = await response.json();
        
        if (response.ok) {
          setFuturePaymentDialogOpen(false);
          setMessage(result.message || 'Future payment added successfully');
          setOpenSnackbar(true);
          await loadData();
        } else {
          setMessage(result.message || 'Error adding future payment');
          setOpenSnackbar(true);
        }
      } catch (error) {
        console.error('Error adding future payment:', error);
        setMessage('Error adding future payment: ' + error.message);
        setOpenSnackbar(true);
      } finally {
        setActionLoading(prev => ({ ...prev, 'future-payment': false }));
      }
    };

    const handleEditTenantConfig = () => {
      const tenantConfig = tenantConfigs[selectedTenantKey];
      if (tenantConfig) {
        setTenantConfigForm({
          name: tenantConfig.name || '',
          phone: tenantConfig.phone || '',
          address: tenantConfig.address || '',
          floor: tenantConfig.floor || '',
          baseRent: tenantConfig.baseRent || '',
          maintenance: tenantConfig.maintenance || '',
          misc: tenantConfig.misc || '',
          rentStartMonth: tenantConfig.rentStartMonth || '',
          paysMaintenance: tenantConfig.paysMaintenance !== false,
          notes: tenantConfig.notes || ''
        });
        setTenantConfigDialogOpen(true);
      }
    };

    const saveTenantConfig = async () => {
      try {
        setActionLoading(prev => ({ ...prev, 'tenant-config': true }));
        
        // Prepare updates
        const updates = {
          name: tenantConfigForm.name,
          phone: tenantConfigForm.phone,
          address: tenantConfigForm.address,
          floor: tenantConfigForm.floor,
          baseRent: parseFloat(tenantConfigForm.baseRent) || 0,
          maintenance: parseFloat(tenantConfigForm.maintenance) || 0,
          misc: parseFloat(tenantConfigForm.misc) || 0,
          rentStartMonth: tenantConfigForm.rentStartMonth,
          paysMaintenance: tenantConfigForm.paysMaintenance,
          notes: tenantConfigForm.notes
        };

        // Save to API
        const response = await fetch('/api/update-tenant-config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tenantKey: selectedTenantKey,
            updates: updates
          })
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            // Reload tenant configs from API
            await loadTenantConfigs();
            
            setTenantConfigDialogOpen(false);
            setMessage('Tenant configuration updated successfully');
            setOpenSnackbar(true);
            setTenantConfigForm({
              name: '',
              phone: '',
              address: '',
              floor: '',
              baseRent: '',
              maintenance: '',
              misc: '',
              rentStartMonth: '',
              paysMaintenance: true,
              notes: ''
            });
            
            // Reload data to reflect changes
            await loadData();
          } else {
            setMessage(result.message || 'Error updating tenant configuration');
            setOpenSnackbar(true);
          }
        } else {
          setMessage('Error updating tenant configuration');
          setOpenSnackbar(true);
        }
      } catch (error) {
        console.error('Error saving tenant configuration:', error);
        setMessage('Error saving tenant configuration: ' + error.message);
        setOpenSnackbar(true);
      } finally {
        setActionLoading(prev => ({ ...prev, 'tenant-config': false }));
      }
    };

    const selectedTenantConfig = tenantConfigs[selectedTenantKey];
    
    // Memoize tenant data to prevent infinite re-renders
    const selectedTenantData = useMemo(() => getTenantData(selectedTenantKey), [selectedTenantKey, selectedMonth, tenantConfigs, rentData]);
    const rentHistory = useMemo(() => getRentHistory(selectedTenantKey), [selectedTenantKey, rentData]);
    
    // Debug logging removed to prevent console flooding
    
    // Early return if no tenant data
    if (!selectedTenantData || !selectedTenantConfig) {
      return (
        <Box>
          <Typography variant="h4" gutterBottom>
            Individual Tenant Details
          </Typography>
          <Typography variant="body1" color="error">
            Tenant not found or no data available for the selected tenant.
          </Typography>
        </Box>
      );
    }

    // Early return if no tenant data
    if (!selectedTenantData || !selectedTenantConfig) {
      return (
        <Box>
          <Typography variant="h4" gutterBottom>
            Individual Tenant Details
          </Typography>
          <Typography variant="body1" color="error">
            Tenant not found or no data available for the selected tenant.
          </Typography>
        </Box>
      );
    }

    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Individual Tenant Details
            </Typography>
            <Typography variant="body1" color="text.secondary">
              View detailed information for a specific tenant
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel id="tenant-select-label">Select Tenant</InputLabel>
              <Select
                id="tenant-select"
                name="tenant-select"
                value={selectedTenantKey}
                onChange={(e) => {
                  setSelectedTenantKey(e.target.value);
                  setSelectedTenant(e.target.value);
                  updateURLParams({ tenant: e.target.value });
                }}
                labelId="tenant-select-label"
                label="Select Tenant"
              >
                {Object.keys(tenantConfigs).map((tenantKey) => (
                  <MenuItem key={tenantKey} value={tenantKey}>
                    {tenantConfigs[tenantKey]?.name} ({tenantKey})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="month-select-label">Working Month</InputLabel>
              <Select
                id="month-select"
                name="month-select"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                labelId="month-select-label"
                label="Working Month"
              >
                {months.map((month) => (
                  <MenuItem key={month} value={month}>
                    {month}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>

        {selectedTenantConfig && selectedTenantData && (
          <>
            {/* Month Summary Banner */}
            <Box sx={{ mb: 3, p: 2, bgcolor: 'primary.main', color: 'white', borderRadius: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Working on: {selectedMonth} for {selectedTenantConfig.name}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {isFutureMonth(selectedMonth) ? 
                  'This is a future month - you can add advance payments' : 
                  'This is the current month - you can edit existing payments'
                }
              </Typography>
            </Box>

            <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  {/* Tenant Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        {selectedTenantConfig.name}
                      </Typography>
                      <Typography variant="h6" color="text.secondary">
                        {selectedTenantKey} • {selectedTenantConfig.floor} Floor
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                        📞 {selectedTenantConfig.phone}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        📍 {selectedTenantConfig.address}
                      </Typography>
                    </Box>
                    <Chip
                      label={selectedTenantData?.status || 'Not Paid'}
                      color={selectedTenantData?.status === 'Paid' ? 'success' : 'warning'}
                      size="medium"
                      sx={{ ml: 1 }}
                    />
                  </Box>

                  {/* Rent Configuration */}
                  <Box sx={{ mb: 3, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Typography variant="h5" gutterBottom sx={{ color: 'primary.main' }}>
                      Rent Configuration
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={6} md={3}>
                        <Typography variant="body2" color="text.secondary">Base Rent</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 600 }}>
                          ₹{selectedTenantConfig.baseRent?.toLocaleString() || 0}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Typography variant="body2" color="text.secondary">Maintenance</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 600 }}>
                          ₹{selectedTenantConfig.maintenance?.toLocaleString() || 0}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Typography variant="body2" color="text.secondary">Misc Charges</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 600 }}>
                          ₹{selectedTenantConfig.misc?.toLocaleString() || 0}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Typography variant="body2" color="text.secondary">Rent Since</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {selectedTenantConfig.rentStartMonth}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Typography variant="body2" color="text.secondary">Maintenance</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {selectedTenantConfig.paysMaintenance ? '✅ Yes' : '❌ No'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Current Month Details */}
                  <Box sx={{ mb: 3, p: 3, bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h5" sx={{ color: 'primary.main' }}>
                        {selectedMonth} Details
                      </Typography>
                      <Chip 
                        label={isFutureMonth(selectedMonth) ? 'Future Month' : 'Current Month'} 
                        color={isFutureMonth(selectedMonth) ? 'warning' : 'info'}
                        variant="outlined"
                      />
                    </Box>
                    <Grid container spacing={3}>
                      <Grid item xs={6} md={3}>
                        <Typography variant="body2" color="text.secondary">Base Rent</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 600 }}>
                          ₹{selectedTenantData.baseRent?.toLocaleString() || 0}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Typography variant="body2" color="text.secondary">Maintenance</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 600 }}>
                          ₹{selectedTenantData.maintenance?.toLocaleString() || 0}
                        </Typography>
                      </Grid>
                      {selectedTenantData.misc > 0 && (
                        <Grid item xs={6} md={3}>
                          <Typography variant="body2" color="text.secondary">Misc Charges</Typography>
                          <Typography variant="h5" sx={{ fontWeight: 600, color: 'info.main' }}>
                            ₹{selectedTenantData.misc?.toLocaleString() || 0}
                          </Typography>
                        </Grid>
                      )}
                      {selectedTenantData.energyCharges > 0 && (
                        <Grid item xs={6} md={3}>
                          <Typography variant="body2" color="text.secondary">Energy Charges</Typography>
                          <Typography variant="h5" sx={{ fontWeight: 600, color: 'warning.main' }}>
                            ₹{selectedTenantData.energyCharges?.toLocaleString() || 0}
                          </Typography>
                        </Grid>
                      )}
                      <Grid item xs={6} md={3}>
                        <Typography variant="body2" color="text.secondary">Total</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                          {isFutureMonth(selectedMonth) && (selectedTenantData?.totalRent || 0) === 0 ?
                            'Not Set' :
                            `₹${(selectedTenantData?.totalRent || 0).toLocaleString()}`
                          }
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Notes */}
                  {selectedTenantConfig.notes && (
                    <Box sx={{ mb: 3, p: 3, bgcolor: 'info.50', borderRadius: 2 }}>
                      <Typography variant="h6" gutterBottom>Notes</Typography>
                      <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                        📝 {selectedTenantConfig.notes}
                      </Typography>
                    </Box>
                  )}

                  {/* Action Buttons */}
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => {
                        if (selectedTenantData) {
                          handleEditPayment(selectedTenantData);
                        }
                      }}
                      startIcon={<EditIcon />}
                      disabled={isFutureMonth(selectedMonth)}
                      title={isFutureMonth(selectedMonth) ? 'No data to edit for future months' : 'Edit payment details'}
                    >
                      Edit Payment Details
                    </Button>
                    
                    {isFutureMonth(selectedMonth) && (
                      <Button
                        variant="outlined"
                        size="large"
                        onClick={() => handleAddFuturePayment(selectedTenantData)}
                        startIcon={<AddIcon />}
                        color="secondary"
                      >
                        Add Future Payment
                      </Button>
                    )}
                    
                    {selectedTenantData?.status !== 'Paid' && !isFutureMonth(selectedMonth) && (
                      <Button
                        variant="contained"
                        size="large"
                        onClick={() => markAsPaid(selectedTenantKey)}
                        disabled={actionLoading[`mark-paid-${selectedTenantKey}`]}
                        startIcon={actionLoading[`mark-paid-${selectedTenantKey}`] ? <CircularProgress size={20} /> : <CheckIcon />}
                      >
                        {actionLoading[`mark-paid-${selectedTenantKey}`] ? 'Processing...' : 'Mark Paid'}
                      </Button>
                    )}

                    <Button
                      variant="outlined"
                      size="large"
                      onClick={handleEditTenantConfig}
                      startIcon={<SettingsIcon />}
                      color="info"
                    >
                      Edit Tenant Details
                    </Button>

                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => setActiveTab(2)} // Switch to Tenant Config tab
                      startIcon={<PeopleIcon />}
                      color="primary"
                    >
                      View All Tenants
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} lg={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h5" gutterBottom sx={{ color: 'primary.main' }}>
                    Rent History
                  </Typography>
                  <Box sx={{ maxHeight: 600, overflow: 'auto' }}>
                    {rentHistory.length > 0 ? (
                      rentHistory.map((record, index) => (
                        <Box key={index} sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          py: 1,
                          borderBottom: index < rentHistory.length - 1 ? 1 : 0,
                          borderColor: 'divider',
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: 'action.hover',
                            borderRadius: 1
                          }
                        }}
                        onClick={() => {
                          setSelectedMonth(record.month);
                        }}
                        >
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 500, color: 'primary.main' }}>
                              {record.month}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              ₹{record.totalRent?.toLocaleString() || 0}
                            </Typography>
                          </Box>
                          <Chip
                            label={record.status}
                            color={record.status === 'Paid' ? 'success' : 'warning'}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                        No rent history available
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
        )}

        {/* Edit Payment Dialog */}
        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Edit Payment Details</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="edit-base-rent"
                  name="editBaseRent"
                  label="Base Rent"
                  type="number"
                  value={editForm.baseRent}
                  onChange={(e) => setEditForm(prev => ({ ...prev, baseRent: e.target.value }))}
                  InputProps={{ readOnly: editForm.isPastMonth }}
                  helperText={editForm.isPastMonth ? "Cannot edit rent values for past months" : ""}
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
                  onChange={(e) => setEditForm(prev => ({ ...prev, maintenance: e.target.value }))}
                  InputProps={{ readOnly: editForm.isPastMonth }}
                  helperText={editForm.isPastMonth ? "Cannot edit rent values for past months" : ""}
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
                  onChange={(e) => setEditForm(prev => ({ ...prev, energyCharges: e.target.value }))}
                  InputProps={{ readOnly: editForm.isPastMonth }}
                  helperText={editForm.isPastMonth ? "Cannot edit rent values for past months" : ""}
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
                  onChange={(e) => setEditForm(prev => ({ ...prev, gasBill: e.target.value }))}
                  InputProps={{ readOnly: editForm.isPastMonth }}
                  helperText={editForm.isPastMonth ? "Cannot edit rent values for past months" : ""}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="edit-total-rent"
                  name="editTotalRent"
                  label="Total Rent (Auto-calculated)"
                  type="number"
                  value={(parseFloat(editForm.baseRent) || 0) + (parseFloat(editForm.maintenance) || 0) + (parseFloat(editForm.energyCharges) || 0) + (parseFloat(editForm.gasBill) || 0)}
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
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={saveEditPayment} 
              variant="contained"
              disabled={actionLoading['edit-payment']}
              startIcon={actionLoading['edit-payment'] ? <CircularProgress size={16} /> : null}
            >
              {actionLoading['edit-payment'] ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Future Payment Dialog */}
        <Dialog open={futurePaymentDialogOpen} onClose={() => setFuturePaymentDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Add Future Payment</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Select Month</InputLabel>
                  <Select
                    value={futurePaymentForm.month}
                    onChange={(e) => setFuturePaymentForm(prev => ({ ...prev, month: e.target.value }))}
                    label="Select Month"
                  >
                    {generateFutureMonths('August 25', 12).map((month) => (
                      <MenuItem key={month} value={month}>{month}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="base-rent"
                  name="baseRent"
                  label="Base Rent"
                  type="number"
                  value={futurePaymentForm.baseRent}
                  onChange={(e) => setFuturePaymentForm(prev => ({ ...prev, baseRent: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="maintenance"
                  name="maintenance"
                  label="Maintenance"
                  type="number"
                  value={futurePaymentForm.maintenance}
                  onChange={(e) => setFuturePaymentForm(prev => ({ ...prev, maintenance: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="energy-charges"
                  name="energyCharges"
                  label="Energy Charges"
                  type="number"
                  value={futurePaymentForm.energyCharges}
                  onChange={(e) => setFuturePaymentForm(prev => ({ ...prev, energyCharges: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="gas-bill"
                  name="gasBill"
                  label="Gas Bill"
                  type="number"
                  value={futurePaymentForm.gasBill}
                  onChange={(e) => setFuturePaymentForm(prev => ({ ...prev, gasBill: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="total-rent"
                  name="totalRent"
                  label="Total Rent (Auto-calculated)"
                  type="number"
                  value={(parseFloat(futurePaymentForm.baseRent) || 0) + (parseFloat(futurePaymentForm.maintenance) || 0) + (parseFloat(futurePaymentForm.energyCharges) || 0) + (parseFloat(futurePaymentForm.gasBill) || 0)}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={futurePaymentForm.status}
                    onChange={(e) => setFuturePaymentForm(prev => ({ ...prev, status: e.target.value }))}
                    label="Status"
                  >
                    <MenuItem value="Paid">Paid</MenuItem>
                    <MenuItem value="Not Paid">Not Paid</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFuturePaymentDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={saveFuturePayment} 
              variant="contained"
              disabled={actionLoading['future-payment']}
              startIcon={actionLoading['future-payment'] ? <CircularProgress size={16} /> : null}
            >
              {actionLoading['future-payment'] ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Tenant Configuration Dialog */}
        <Dialog open={tenantConfigDialogOpen} onClose={() => setTenantConfigDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Edit Tenant Configuration</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="full-name"
                  name="name"
                  label="Full Name"
                  value={tenantConfigForm.name}
                  onChange={(e) => setTenantConfigForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="phone-number"
                  name="phone"
                  label="Phone Number"
                  value={tenantConfigForm.phone}
                  onChange={(e) => setTenantConfigForm(prev => ({ ...prev, phone: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="address"
                  name="address"
                  label="Address"
                  multiline
                  rows={2}
                  value={tenantConfigForm.address}
                  onChange={(e) => setTenantConfigForm(prev => ({ ...prev, address: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="floor"
                  name="floor"
                  label="Floor"
                  value={tenantConfigForm.floor}
                  onChange={(e) => setTenantConfigForm(prev => ({ ...prev, floor: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="base-rent"
                  name="baseRent"
                  label="Base Rent"
                  type="number"
                  value={tenantConfigForm.baseRent}
                  onChange={(e) => setTenantConfigForm(prev => ({ ...prev, baseRent: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="maintenance-amount"
                  name="maintenanceAmount"
                  label="Maintenance Amount"
                  type="number"
                  value={tenantConfigForm.maintenance}
                  onChange={(e) => setTenantConfigForm(prev => ({ ...prev, maintenance: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="misc-charges"
                  name="misc"
                  label="Misc Charges (Gas, etc.)"
                  type="number"
                  value={tenantConfigForm.misc}
                  onChange={(e) => setTenantConfigForm(prev => ({ ...prev, misc: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="rent-start-month"
                  name="rentStartMonth"
                  label="Rent Start Month"
                  value={tenantConfigForm.rentStartMonth}
                  onChange={(e) => setTenantConfigForm(prev => ({ ...prev, rentStartMonth: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={tenantConfigForm.paysMaintenance}
                      onChange={(e) => setTenantConfigForm(prev => ({ ...prev, paysMaintenance: e.target.checked }))}
                    />
                  }
                  label="Pays Maintenance"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="notes"
                  name="notes"
                  label="Notes"
                  multiline
                  rows={3}
                  value={tenantConfigForm.notes}
                  onChange={(e) => setTenantConfigForm(prev => ({ ...prev, notes: e.target.value }))}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTenantConfigDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={saveTenantConfig} 
              variant="contained"
              disabled={actionLoading['tenant-config']}
              startIcon={actionLoading['tenant-config'] ? <CircularProgress size={16} /> : null}
            >
              {actionLoading['tenant-config'] ? 'Saving...' : 'Save Configuration'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  };

  // Condensed Tenant Config Tab - for quick overview and actions
  const TenantConfigTab = () => {
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedTenant, setSelectedTenant] = useState(null);
    const [editForm, setEditForm] = useState({
      totalRent: '',
      baseRent: '',
      maintenance: '',
      energyCharges: '',
      gasBill: '',
      status: 'Paid',
      isPastMonth: false
    });

    // Future month payment dialog state
    const [futurePaymentDialogOpen, setFuturePaymentDialogOpen] = useState(false);
    const [futurePaymentForm, setFuturePaymentForm] = useState({
      month: '',
      tenant: '',
      totalRent: '',
      baseRent: '',
      maintenance: '',
      energyCharges: '',
      gasBill: '',
      status: 'Paid'
    });

    // Get current month data
    const currentMonthData = rentData.find(row => row.month === selectedMonth);
    
    // Get tenant data with enhanced information
    const getTenantData = (tenantKey) => {
      const tenantConfig = tenantConfigs[tenantKey];
      if (!tenantConfig) return null;
      
      if (currentMonthData) {
        // Use rentData for all dynamic fields, fallback to config if missing
        const baseRent = currentMonthData[`${tenantKey}_BaseRent`] !== undefined ? currentMonthData[`${tenantKey}_BaseRent`] : tenantConfig.baseRent || 0;
        const maintenance = currentMonthData[`${tenantKey}_Maintenance`] !== undefined ? currentMonthData[`${tenantKey}_Maintenance`] : tenantConfig.maintenance || 0;
        const misc = currentMonthData[`${tenantKey}_Misc`] !== undefined ? currentMonthData[`${tenantKey}_Misc`] : 0;
        const energyCharges = currentMonthData[`${tenantKey}_EnergyCharges`] !== undefined ? currentMonthData[`${tenantKey}_EnergyCharges`] : 0;
        const gasBill = currentMonthData[`${tenantKey}_GasBill`] !== undefined ? currentMonthData[`${tenantKey}_GasBill`] : 0;
        // Use totalRent from CSV data - do not recalculate
        const totalRent = currentMonthData[`${tenantKey}_TotalRent`] !== undefined ? currentMonthData[`${tenantKey}_TotalRent`] : (baseRent + maintenance + misc + energyCharges + gasBill);
        const status = currentMonthData[`${tenantKey}_Status`] || 'Not Paid';
      
      return {
        tenantKey,
        name: tenantConfig.name,
        phone: tenantConfig.phone,
        address: tenantConfig.address,
        floor: tenantConfig.floor,
        totalRent,
        baseRent,
        maintenance,
        misc,
        energyCharges,
        gasBill,
        status
      };
      } else {
        return {
          tenantKey,
          name: tenantConfig.name,
          phone: tenantConfig.phone,
          address: tenantConfig.address,
          floor: tenantConfig.floor,
          totalRent: tenantConfig.baseRent + tenantConfig.maintenance,
          baseRent: tenantConfig.baseRent || 0,
          maintenance: tenantConfig.maintenance || 0,
          misc: 0,
          energyCharges: 0,
          gasBill: 0,
          status: 'Not Paid'
        };
      }
    };

    // Get rent history for a tenant
    const getRentHistory = (tenantKey) => {
      return rentData
        .filter(row => row[tenantKey] && row[tenantKey] > 0)
        .map(row => {
          const baseRent = row[`${tenantKey}_BaseRent`] || 0;
          const maintenance = row[`${tenantKey}_Maintenance`] || 0;
          const misc = row[`${tenantKey}_Misc`] || 0;
          const energyCharges = row[`${tenantKey}_EnergyCharges`] || 0;
          const gasBill = row[`${tenantKey}_GasBill`] || 0;
          // Use totalRent from CSV data - do not recalculate
          const totalRent = row[`${tenantKey}_TotalRent`] || (baseRent + maintenance + misc + energyCharges + gasBill);
          
          return {
            month: row.month,
            totalRent,
            status: row[`${tenantKey}_Status`] || 'Not Paid',
            baseRent,
            maintenance,
            energyCharges,
            gasBill
          };
        })
        .sort((a, b) => {
          const [aMonth, aYear] = a.month.split(' ');
          const [bMonth, bYear] = b.month.split(' ');
          const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                             'July', 'August', 'September', 'October', 'November', 'December'];
          const aIndex = monthNames.indexOf(aMonth) + (parseInt('20' + aYear) * 12);
          const bIndex = monthNames.indexOf(bMonth) + (parseInt('20' + bYear) * 12);
          return bIndex - aIndex; // Most recent first
        })
        .slice(0, 6); // Show last 6 months
    };

    const handleEditPayment = (tenant) => {
      setSelectedTenant(tenant);
      setEditForm({
        totalRent: tenant.totalRent || '',
        baseRent: tenant.baseRent || '',
        maintenance: tenant.maintenance || '',
        energyCharges: tenant.energyCharges || '',
        gasBill: tenant.gasBill || '',
        status: tenant.status || 'Paid'
      });
      setEditDialogOpen(true);
    };

    const saveEditPayment = async () => {
      try {
        setActionLoading(prev => ({ ...prev, 'edit-payment': true }));
        
        const response = await fetch('/api/adjust-rent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tenant: selectedTenant.tenantKey,
            month: selectedMonth,
            ...editForm
          })
        });
        
        const result = await response.json();
        
        if (response.ok) {
          setEditDialogOpen(false);
          setMessage(result.message || 'Payment updated successfully');
          setOpenSnackbar(true);
          await loadData();
        } else {
          setMessage(result.message || 'Error updating payment');
          setOpenSnackbar(true);
        }
      } catch (error) {
        console.error('Error updating payment:', error);
        setMessage('Error updating payment: ' + error.message);
        setOpenSnackbar(true);
      } finally {
        setActionLoading(prev => ({ ...prev, 'edit-payment': false }));
      }
    };

    const handleAddFuturePayment = (tenant) => {
      const baseRent = tenant.baseRent || 0;
      const maintenance = tenant.maintenance || 0;
      const energyCharges = tenant.energyCharges || 0;
      const misc = tenant.misc || 0;
      const gasBill = tenant.gasBill || 0;
      
      setFuturePaymentForm({
        month: selectedMonth,
        tenant: tenant.tenantKey,
        totalRent: baseRent + maintenance + energyCharges + misc + gasBill,
        baseRent: baseRent,
        maintenance: maintenance,
        energyCharges: energyCharges,
        misc: misc,
        gasBill: gasBill,
        status: 'Not Paid'
      });
      setFuturePaymentDialogOpen(true);
    };

    const saveFuturePayment = async () => {
      try {
        setActionLoading(prev => ({ ...prev, 'future-payment': true }));
        
        const baseRent = parseFloat(futurePaymentForm.baseRent) || 0;
        const maintenance = parseFloat(futurePaymentForm.maintenance) || 0;
        const energyCharges = parseFloat(futurePaymentForm.energyCharges) || 0;
        const gasBill = parseFloat(futurePaymentForm.gasBill) || 0;
        const totalRent = baseRent + maintenance + energyCharges + gasBill;
        
        const response = await fetch('/api/adjust-rent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tenant: futurePaymentForm.tenant,
            month: futurePaymentForm.month,
            totalRent: totalRent,
            baseRent: baseRent,
            maintenance: maintenance,
            energyCharges: energyCharges,
            gasBill: gasBill,
            status: futurePaymentForm.status
          })
        });
        
        const result = await response.json();
        
        if (response.ok) {
          setFuturePaymentDialogOpen(false);
          setMessage(result.message || 'Future payment added successfully');
          setOpenSnackbar(true);
          await loadData();
        } else {
          setMessage(result.message || 'Error adding future payment');
          setOpenSnackbar(true);
        }
      } catch (error) {
        console.error('Error adding future payment:', error);
        setMessage('Error adding future payment: ' + error.message);
        setOpenSnackbar(true);
      } finally {
        setActionLoading(prev => ({ ...prev, 'future-payment': false }));
      }
    };

    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
          <Typography variant="h4" gutterBottom>
              Tenant Configuration & Quick Actions
          </Typography>
            <Typography variant="body1" color="text.secondary">
              Condensed view of all tenants with base rent, maintenance, energy costs, and payment status
            </Typography>
            {isFutureMonth(selectedMonth) && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Future month selected - "Add Future Payment" buttons are available
              </Typography>
            )}
          </Box>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              label="Select Month"
            >
              {months.map((month) => (
                <MenuItem key={month} value={month}>
                  {month}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Grid container spacing={2}>
          {Object.keys(tenantConfigs).map((tenantKey) => {
            const tenantConfig = tenantConfigs[tenantKey];
            const tenant = getTenantData(tenantKey);
            
            if (!tenant) return null;
            
            return (
              <Grid item xs={12} md={6} lg={4} key={tenantKey}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ p: 2 }}>
                    {/* Compact Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 600, 
                            color: 'primary.main', 
                            mb: 0.5,
                            cursor: 'pointer',
                            '&:hover': { textDecoration: 'underline' }
                          }}
                          onClick={() => {
                            setActiveTab(1);
                            setSelectedTenant(tenantKey);
                            updateURLParams({ tab: '1', tenant: tenantKey });
                          }}
                        >
                          {tenantConfig.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          {tenantKey} • {tenantConfig.floor} Floor
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                          📞 {tenantConfig.phone}
                        </Typography>
                      </Box>
                      <Chip
                        label={tenant.status}
                        color={tenant.status === 'Paid' ? 'success' : 'warning'}
                        size="small"
                        sx={{ ml: 1, minWidth: 60 }}
                      />
                    </Box>
                    
                    {/* Compact Rent Details */}
                    <Box sx={{ mb: 2 }}>
                      <Grid container spacing={1}>
                      <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Base Rent</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          ₹{tenant.baseRent?.toLocaleString() || 0}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Maintenance</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          ₹{tenant.maintenance?.toLocaleString() || 0}
                        </Typography>
                      </Grid>
                        {tenant.energyCharges > 0 && (
                      <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">Energy</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'warning.main' }}>
                          ₹{tenant.energyCharges?.toLocaleString() || 0}
                        </Typography>
                      </Grid>
                        )}
                        {tenant.gasBill > 0 && (
                      <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">Gas Bill</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main' }}>
                          ₹{tenant.gasBill?.toLocaleString() || 0}
                        </Typography>
                      </Grid>
                        )}
                      <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Total</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                            {isFutureMonth(selectedMonth) && tenant.totalRent === 0 ?
                              'Not Set' :
                              `₹${tenant.totalRent?.toLocaleString() || 0}`
                            }
                        </Typography>
                      </Grid>
                    </Grid>
                    </Box>
                    
                    {/* Quick Actions */}
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleEditPayment(tenant)}
                        startIcon={<EditIcon />}
                        disabled={isFutureMonth(selectedMonth)}
                        title={isFutureMonth(selectedMonth) ? 'No data to edit for future months' : 'Edit payment details'}
                        sx={{ fontSize: '0.75rem', px: 1 }}
                      >
                        Edit
                      </Button>
                      
                      {isFutureMonth(selectedMonth) && (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleAddFuturePayment(tenant)}
                          startIcon={<AddIcon />}
                          color="secondary"
                          sx={{ fontSize: '0.75rem', px: 1 }}
                        >
                          Add Future
                        </Button>
                      )}
                      
                      {tenant.status !== 'Paid' && !isFutureMonth(selectedMonth) && (
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => markAsPaid(tenantKey)}
                          disabled={actionLoading[`mark-paid-${tenantKey}`]}
                          startIcon={actionLoading[`mark-paid-${tenantKey}`] ? <CircularProgress size={14} /> : <CheckIcon />}
                          sx={{ fontSize: '0.75rem', px: 1 }}
                        >
                          {actionLoading[`mark-paid-${tenantKey}`] ? 'Processing...' : 'Mark Paid'}
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Edit Payment Dialog */}
        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Edit Payment Details</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="tenant-config-base-rent"
                  name="tenantConfigBaseRent"
                  label="Base Rent"
                  type="number"
                  value={editForm.baseRent}
                  onChange={(e) => setEditForm(prev => ({ ...prev, baseRent: e.target.value }))}
                  InputProps={{ readOnly: editForm.isPastMonth }}
                  helperText={editForm.isPastMonth ? "Cannot edit rent values for past months" : ""}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="tenant-config-maintenance"
                  name="tenantConfigMaintenance"
                  label="Maintenance"
                  type="number"
                  value={editForm.maintenance}
                  onChange={(e) => setEditForm(prev => ({ ...prev, maintenance: e.target.value }))}
                  InputProps={{ readOnly: editForm.isPastMonth }}
                  helperText={editForm.isPastMonth ? "Cannot edit rent values for past months" : ""}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="tenant-config-energy-charges"
                  name="tenantConfigEnergyCharges"
                  label="Energy Charges"
                  type="number"
                  value={editForm.energyCharges}
                  onChange={(e) => setEditForm(prev => ({ ...prev, energyCharges: e.target.value }))}
                  InputProps={{ readOnly: editForm.isPastMonth }}
                  helperText={editForm.isPastMonth ? "Cannot edit rent values for past months" : ""}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="tenant-config-gas-bill"
                  name="tenantConfigGasBill"
                  label="Gas Bill"
                  type="number"
                  value={editForm.gasBill}
                  onChange={(e) => setEditForm(prev => ({ ...prev, gasBill: e.target.value }))}
                  InputProps={{ readOnly: editForm.isPastMonth }}
                  helperText={editForm.isPastMonth ? "Cannot edit rent values for past months" : ""}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="tenant-config-total-rent"
                  name="tenantConfigTotalRent"
                  label="Total Rent (Auto-calculated)"
                  type="number"
                  value={(parseFloat(editForm.baseRent) || 0) + (parseFloat(editForm.maintenance) || 0) + (parseFloat(editForm.energyCharges) || 0) + (parseFloat(editForm.gasBill) || 0)}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="tenant-config-status-label">Status</InputLabel>
                  <Select
                    id="tenant-config-status"
                    name="tenantConfigStatus"
                    value={editForm.status}
                    onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                    labelId="tenant-config-status-label"
                    label="Status"
                  >
                    <MenuItem value="Paid">Paid</MenuItem>
                    <MenuItem value="Not Paid">Not Paid</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={saveEditPayment} 
              variant="contained"
              disabled={actionLoading['edit-payment']}
              startIcon={actionLoading['edit-payment'] ? <CircularProgress size={16} /> : null}
            >
              {actionLoading['edit-payment'] ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Future Payment Dialog */}
        <Dialog open={futurePaymentDialogOpen} onClose={() => setFuturePaymentDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Add Future Payment</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Select Month</InputLabel>
                  <Select
                    value={futurePaymentForm.month}
                    onChange={(e) => setFuturePaymentForm(prev => ({ ...prev, month: e.target.value }))}
                    label="Select Month"
                  >
                    {generateFutureMonths('August 25', 12).map((month) => (
                      <MenuItem key={month} value={month}>{month}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="base-rent"
                  name="baseRent"
                  label="Base Rent"
                  type="number"
                  value={futurePaymentForm.baseRent}
                  onChange={(e) => setFuturePaymentForm(prev => ({ ...prev, baseRent: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="maintenance"
                  name="maintenance"
                  label="Maintenance"
                  type="number"
                  value={futurePaymentForm.maintenance}
                  onChange={(e) => setFuturePaymentForm(prev => ({ ...prev, maintenance: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="energy-charges"
                  name="energyCharges"
                  label="Energy Charges"
                  type="number"
                  value={futurePaymentForm.energyCharges}
                  onChange={(e) => setFuturePaymentForm(prev => ({ ...prev, energyCharges: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="gas-bill"
                  name="gasBill"
                  label="Gas Bill"
                  type="number"
                  value={futurePaymentForm.gasBill}
                  onChange={(e) => setFuturePaymentForm(prev => ({ ...prev, gasBill: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="total-rent"
                  name="totalRent"
                  label="Total Rent (Auto-calculated)"
                  type="number"
                  value={(parseFloat(futurePaymentForm.baseRent) || 0) + (parseFloat(futurePaymentForm.maintenance) || 0) + (parseFloat(futurePaymentForm.energyCharges) || 0) + (parseFloat(futurePaymentForm.gasBill) || 0)}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={futurePaymentForm.status}
                    onChange={(e) => setFuturePaymentForm(prev => ({ ...prev, status: e.target.value }))}
                    label="Status"
                  >
                    <MenuItem value="Paid">Paid</MenuItem>
                    <MenuItem value="Not Paid">Not Paid</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFuturePaymentDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={saveFuturePayment} 
              variant="contained"
              disabled={actionLoading['future-payment']}
              startIcon={actionLoading['future-payment'] ? <CircularProgress size={16} /> : null}
            >
              {actionLoading['future-payment'] ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  };



  const PaymentReportTab = () => {
    const [reportData, setReportData] = useState(null);
    const [selectedPeriod, setSelectedPeriod] = useState('ytd');
    const [loading, setLoading] = useState(false);

    const loadPaymentReport = useCallback(async (period) => {
      setLoading(true);
      try {
        const apiUrl = getApiUrl();
        const response = await fetch(`${apiUrl}/api/payment-report?period=${period}`);
        const result = await response.json();
        if (result.success) {
          setReportData(result.data);
        } else {
          console.error('Failed to load payment report:', result.error);
        }
      } catch (error) {
        console.error('Error loading payment report:', error);
      } finally {
        setLoading(false);
      }
    }, []);

    useEffect(() => {
      loadPaymentReport(selectedPeriod);
    }, [selectedPeriod, loadPaymentReport]);

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount);
    };

    const getPeriodOptions = () => [
      { value: 'ytd', label: 'Year to Date' },
      { value: 'last12months', label: 'Last 12 Months' },
      { value: 'fromapril', label: 'From April' }
    ];

    // Professional color palette - more subdued
    const colors = {
      primary: '#2c3e50',
      secondary: '#34495e',
      success: '#27ae60',
      warning: '#f39c12',
      info: '#3498db',
      background: '#f8f9fa',
      cardBackground: '#ffffff',
      textPrimary: '#2c3e50',
      textSecondary: '#7f8c8d'
    };

    // Prepare chart data
    const getChartData = () => {
      if (!reportData?.tenants) return [];
      return reportData.tenants.slice(0, 8).map((tenant, index) => ({
        name: tenant.tenant,
        totalPaid: tenant.totalPaid,
        color: [
          '#2c3e50', '#34495e', '#27ae60', '#f39c12', 
          '#3498db', '#8e44ad', '#16a085', '#e67e22'
        ][index % 8]
      }));
    };

    // Payment Distribution Chart Component
    const PaymentDistributionChart = ({ data, title }) => {
      if (!data || data.length === 0) {
        return (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">No data available</Typography>
          </Box>
        );
      }

      const maxAmount = Math.max(...data.map(d => d.totalPaid));
      const barHeight = 200;

      return (
        <Box sx={{ p: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'end', height: barHeight, gap: 1, overflowX: 'auto', pb: 1 }}>
            {data.map((item, index) => {
              const barHeight = (item.totalPaid / maxAmount) * 150;
              
              return (
                <Box key={index} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 60 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', mb: 0.5, width: 25 }}>
                    <Box
                      sx={{
                        width: 25,
                        height: barHeight,
                        backgroundColor: item.color,
                        borderRadius: '2px 2px 0 0',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      }}
                    />
                  </Box>
                  <Typography variant="caption" sx={{ textAlign: 'center', fontSize: '0.6rem', mb: 0.25, fontWeight: 500 }}>
                    {item.name}
      </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: item.color, fontSize: '0.65rem' }}>
                    ₹{(item.totalPaid / 1000).toFixed(0)}k
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
      );
    };

    return (
      <Box sx={{ 
        p: 3, 
        background: `linear-gradient(135deg, ${colors.background} 0%, #ffffff 100%)`,
        minHeight: '100vh'
      }}>
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
                           <Typography 
                   variant="h4" 
                   sx={{ 
                     fontWeight: 600, 
                     color: colors.textPrimary,
                     mb: 1
                   }}
                 >
                   Payment Analytics Report
                 </Typography>
                 <Typography 
                   variant="body1" 
                   sx={{ 
                     color: colors.textSecondary, 
                     fontWeight: 400,
                     mb: 3
                   }}
                 >
                   {reportData?.periodDescription || 'Comprehensive financial insights and tenant payment analysis'}
                 </Typography>
          
          {/* Period Selector */}
          <Card sx={{ 
            background: `linear-gradient(135deg, ${colors.cardBackground} 0%, #f8f9fa 100%)`,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            borderRadius: 3
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                                         <Typography variant="h6" sx={{ color: colors.textPrimary, fontWeight: 600 }}>
                           Report Period:
                         </Typography>
                <FormControl sx={{ minWidth: 250 }}>
                  <Select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: colors.primary,
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: colors.info,
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: colors.primary,
                      },
                    }}
                  >
                    {getPeriodOptions().map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
            </MenuItem>
          ))}
                  </Select>
                </FormControl>
              </Box>
            </CardContent>
          </Card>
      </Box>

        {loading && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            minHeight: '400px',
            flexDirection: 'column',
            gap: 2
          }}>
            <CircularProgress size={60} sx={{ color: colors.primary }} />
                                 <Typography variant="body1" sx={{ color: colors.textSecondary }}>
                       Generating comprehensive report...
                     </Typography>
          </Box>
        )}



        {reportData && !loading && (
          <>
            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                                         <Card sx={{ 
                           background: colors.cardBackground,
                           color: colors.textPrimary,
                           boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                           borderRadius: 2,
                           border: `1px solid ${colors.primary}20`,
                           transition: 'all 0.2s ease-in-out',
                           '&:hover': { 
                             boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                             transform: 'translateY(-2px)' 
                           }
                         }}>
                           <CardContent sx={{ p: 2.5, textAlign: 'center' }}>
                             <Typography variant="h5" sx={{ fontWeight: 600, mb: 1, color: colors.primary }}>
                               {formatCurrency(reportData.totalPayments)}
                  </Typography>
                             <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 0.5, color: colors.textPrimary }}>
                               Total Payments
                  </Typography>
                             <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                               {reportData.totalRecords} transactions
                             </Typography>
                           </CardContent>
                         </Card>
              </Grid>
              
                                     <Grid item xs={12} sm={6} md={3}>
                         <Card sx={{ 
                           background: colors.cardBackground,
                           color: colors.textPrimary,
                           boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                           borderRadius: 2,
                           border: `1px solid ${colors.success}20`,
                           transition: 'all 0.2s ease-in-out',
                           '&:hover': { 
                             boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                             transform: 'translateY(-2px)' 
                           }
                         }}>
                           <CardContent sx={{ p: 2.5, textAlign: 'center' }}>
                             <Typography variant="h5" sx={{ fontWeight: 600, mb: 1, color: colors.success }}>
                               {reportData.tenantCount}
                  </Typography>
                             <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 0.5, color: colors.textPrimary }}>
                               Active Tenants
                  </Typography>
                             <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                               Made payments
                    </Typography>
                           </CardContent>
                         </Card>
                       </Grid>
              
                                     <Grid item xs={12} sm={6} md={3}>
                         <Card sx={{ 
                           background: colors.cardBackground,
                           color: colors.textPrimary,
                           boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                           borderRadius: 2,
                           border: `1px solid ${colors.warning}20`,
                           transition: 'all 0.2s ease-in-out',
                           '&:hover': { 
                             boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                             transform: 'translateY(-2px)' 
                           }
                         }}>
                           <CardContent sx={{ p: 2.5, textAlign: 'center' }}>
                             <Typography variant="h5" sx={{ fontWeight: 600, mb: 1, color: colors.warning }}>
                               {formatCurrency(reportData.summary.averagePerTenant)}
                  </Typography>
                             <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 0.5, color: colors.textPrimary }}>
                               Average per Tenant
                             </Typography>
                             <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                               Per tenant
                             </Typography>
                           </CardContent>
                         </Card>
                       </Grid>
              
                                     <Grid item xs={12} sm={6} md={3}>
                         <Card sx={{ 
                           background: colors.cardBackground,
                           color: colors.textPrimary,
                           boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                           borderRadius: 2,
                           border: `1px solid ${colors.secondary}20`,
                           transition: 'all 0.2s ease-in-out',
                           '&:hover': { 
                             boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                             transform: 'translateY(-2px)' 
                           }
                         }}>
                           <CardContent sx={{ p: 2.5, textAlign: 'center' }}>
                             <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: colors.secondary }}>
                               {reportData.summary.highestPayer?.tenant || 'N/A'}
                             </Typography>
                             <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 0.5, color: colors.textPrimary }}>
                               Highest Payer
                             </Typography>
                             <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                               {formatCurrency(reportData.summary.highestPayer?.totalPaid || 0)}
                             </Typography>
                           </CardContent>
                         </Card>
                       </Grid>
            </Grid>

            {/* Charts Section */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} lg={6}>
                <Card sx={{ 
                  background: colors.cardBackground,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  borderRadius: 3,
                  height: '400px'
                }}>
                  <CardContent sx={{ p: 3, height: '100%' }}>
                                                 <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: colors.textPrimary }}>
                               Payment Distribution by Tenant
                             </Typography>
                    <Box sx={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <PaymentDistributionChart 
                        data={getChartData()}
                        title="Payment Distribution"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} lg={6}>
                <Card sx={{ 
                  background: colors.cardBackground,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  borderRadius: 3,
                  height: '400px'
                }}>
                  <CardContent sx={{ p: 3, height: '100%' }}>
                                                 <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: colors.textPrimary }}>
                               Quick Statistics
                             </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ 
                        p: 2, 
                        borderRadius: 2, 
                        background: `linear-gradient(135deg, ${colors.primary}15 0%, ${colors.info}15 100%)`,
                        border: `1px solid ${colors.primary}30`
                      }}>
                                                       <Typography variant="subtitle2" sx={{ color: colors.primary, fontWeight: 600 }}>
                                 Total Revenue
                               </Typography>
                               <Typography variant="h6" sx={{ color: colors.textPrimary, fontWeight: 600 }}>
                                 {formatCurrency(reportData.totalPayments)}
                               </Typography>
                      </Box>
                      
                      <Box sx={{ 
                        p: 2, 
                        borderRadius: 2, 
                        background: `linear-gradient(135deg, ${colors.success}15 0%, #4caf5015 100%)`,
                        border: `1px solid ${colors.success}30`
                      }}>
                                                       <Typography variant="subtitle2" sx={{ color: colors.success, fontWeight: 600 }}>
                                 Average Payment
                               </Typography>
                               <Typography variant="h6" sx={{ color: colors.textPrimary, fontWeight: 600 }}>
                                 {formatCurrency(reportData.totalPayments / reportData.totalRecords)}
                               </Typography>
                      </Box>
                      
                      <Box sx={{ 
                        p: 2, 
                        borderRadius: 2, 
                        background: `linear-gradient(135deg, ${colors.warning}15 0%, #ff980015 100%)`,
                        border: `1px solid ${colors.warning}30`
                      }}>
                                                       <Typography variant="subtitle2" sx={{ color: colors.warning, fontWeight: 600 }}>
                                 Payment Efficiency
                               </Typography>
                               <Typography variant="h6" sx={{ color: colors.textPrimary, fontWeight: 600 }}>
                                 {((reportData.tenantCount / 8) * 100).toFixed(1)}%
                               </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Enhanced Tenant Details Table */}
            <Card sx={{ 
              background: colors.cardBackground,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              borderRadius: 3
            }}>
              <CardContent sx={{ p: 3 }}>
                                         <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: colors.textPrimary }}>
                           Detailed Tenant Payment Analysis
                         </Typography>
                <TableContainer sx={{ borderRadius: 2, overflow: 'hidden' }}>
                  <Table>
                    <TableHead>
                                                   <TableRow sx={{ 
                               backgroundColor: colors.primary,
                               '& th': { 
                                 color: 'white', 
                                 fontWeight: 600,
                                 fontSize: '0.875rem',
                                 borderBottom: 'none'
                               }
                             }}>
                        <TableCell>Tenant</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell align="right">Total Paid</TableCell>
                        <TableCell align="right">Payment Count</TableCell>
                        <TableCell align="right">Average per Payment</TableCell>
                        <TableCell>Payment Months</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reportData.tenants.map((tenant, index) => (
                        <TableRow 
                          key={tenant.tenant}
                          sx={{ 
                            '&:nth-of-type(odd)': { 
                              backgroundColor: `${colors.background}50` 
                            },
                            '&:hover': { 
                              backgroundColor: `${colors.primary}08`,
                              transform: 'scale(1.01)',
                              transition: 'all 0.2s ease-in-out'
                            }
                          }}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ 
                                width: 12, 
                                height: 12, 
                                borderRadius: '50%', 
                                backgroundColor: [
                                  colors.primary, colors.secondary, colors.success, colors.warning,
                                  colors.info, '#7b1fa2', '#388e3c', '#f57c00'
                                ][index % 8]
                              }} />
                              <Typography 
                                variant="subtitle1" 
                                fontWeight="bold" 
                                color={colors.textPrimary}
                                sx={{ 
                                  cursor: 'pointer',
                                  '&:hover': { textDecoration: 'underline' }
                                }}
                                onClick={() => {
                                  setActiveTab(1);
                                  setSelectedTenant(tenant.tenant);
                                  updateURLParams({ tab: '1', tenant: tenant.tenant });
                                }}
                              >
                                {tenant.tenant}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography 
                              variant="body1" 
                              color={colors.textSecondary}
                              sx={{ 
                                cursor: 'pointer',
                                '&:hover': { textDecoration: 'underline' }
                              }}
                              onClick={() => {
                                setActiveTab(1);
                                setSelectedTenant(tenant.tenant);
                                updateURLParams({ tab: '1', tenant: tenant.tenant });
                              }}
                            >
                              {tenant.name}
                            </Typography>
                          </TableCell>
                                                             <TableCell align="right">
                                     <Typography variant="subtitle1" fontWeight="bold" color={colors.primary}>
                                       {formatCurrency(tenant.totalPaid)}
                                     </Typography>
                                   </TableCell>
                          <TableCell align="right">
                            <Box sx={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: 0.5,
                              px: 2,
                              py: 0.5,
                              borderRadius: 2,
                              backgroundColor: `${colors.success}15`,
                              color: colors.success
                            }}>
                              <Typography variant="body1" fontWeight="600">
                                {tenant.paymentCount}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body1" fontWeight="600" color={colors.textPrimary}>
                              {formatCurrency(tenant.totalPaid / tenant.paymentCount)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {tenant.months.slice(0, 3).map((month, monthIndex) => (
                    <Chip
                                  key={monthIndex}
                                  label={`${month.month} (${formatCurrency(month.amount)})`}
                      size="small"
                                  sx={{
                                    backgroundColor: `${colors.primary}15`,
                                    color: colors.primary,
                                    fontWeight: 600,
                                    '&:hover': {
                                      backgroundColor: `${colors.primary}25`,
                                    }
                                  }}
                                />
                              ))}
                              {tenant.months.length > 3 && (
                                <Chip
                                  label={`+${tenant.months.length - 3} more`}
                        size="small"
                                  sx={{
                                    backgroundColor: `${colors.textSecondary}15`,
                                    color: colors.textSecondary,
                                    fontWeight: 600
                                  }}
                                />
                    )}
                  </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                </CardContent>
              </Card>
          </>
        )}
    </Box>
  );
  };

  const MeterEntryTab = () => {
    // Dialog states
    const [a88EditDialogOpen, setA88EditDialogOpen] = useState(false);
    const [a88AddDialogOpen, setA88AddDialogOpen] = useState(false);
    const [a206EditDialogOpen, setA206EditDialogOpen] = useState(false);
    const [a206AddDialogOpen, setA206AddDialogOpen] = useState(false);
    
    // Next month info
    const [nextMonth, setNextMonth] = useState(null);
    const [latestMonth, setLatestMonth] = useState(null);
    
    // Form states
    const [a88EditForm, setA88EditForm] = useState({
        month: '',
        mainMeter: '',
        firstFloor: '',
        secondFloor: '',
        water: ''
    });
    const [a88AddForm, setA88AddForm] = useState({
        month: '',
        mainMeter: '',
        firstFloor: '',
        secondFloor: '',
        water: ''
    });
    const [a206EditForm, setA206EditForm] = useState({
        month: '',
        mainMeter: '',
        totalConsumed: '',
        secondFloor: '',
        secondFloorConsumed: '',
        self: '',
        finalSecondFloor: '',
        gasBill: ''
    });
    const [a206AddForm, setA206AddForm] = useState({
        month: '',
        mainMeter: '',
        totalConsumed: '',
        secondFloor: '',
        secondFloorConsumed: '',
        self: '',
        finalSecondFloor: '',
        gasBill: ''
    });
    
    const [showWarning, setShowWarning] = useState(false);

    const getCurrentMonth = () => {
        const now = new Date();
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                           'July', 'August', 'September', 'October', 'November', 'December'];
        return `${monthNames[now.getMonth()]} ${now.getFullYear().toString().slice(-2)}`;
    };

    // Function to get previous month's meter reading for A-206
    const getPreviousA206MeterReading = (currentMonth) => {
        if (!meterData || meterData.length === 0) return null;
        
        const monthOrder = [
            'August 24', 'September 24', 'October 24', 'November 24', 'December 24',
            'January 25', 'February 25', 'March 25', 'April 25', 'May 25', 'June 25', 'July 25',
            'August 25', 'September 25', 'October 25', 'November 25', 'December 25'
        ];
        
        const currentIndex = monthOrder.indexOf(currentMonth);
        if (currentIndex <= 0) return null;
        
        const previousMonth = monthOrder[currentIndex - 1];
        return meterData.find(m => m.month === previousMonth);
    };

    // Function to calculate A-206 consumed values
    const calculateA206ConsumedValues = (mainMeter, secondFloorMeter, month) => {
        const previousReading = getPreviousA206MeterReading(month);
        
        if (!previousReading) {
            return {
                totalConsumed: 0,
                secondFloorConsumed: 0,
                finalSecondFloor: 0,
                self: 0
            };
        }
        
        const totalConsumed = Math.max(0, parseFloat(mainMeter) - (previousReading.a206MainMeter || 0));
        const secondFloorConsumed = Math.max(0, parseFloat(secondFloorMeter) - (previousReading.a206SecondFloorMeter || 0));
        const finalSecondFloor = secondFloorConsumed + 200;
        const self = Math.max(0, totalConsumed - finalSecondFloor);
        
        return {
            totalConsumed,
            secondFloorConsumed,
            finalSecondFloor,
            self
        };
    };

    const getNextMonth = useCallback(async () => {
        try {
            const response = await fetch('/api/next-month');
            const data = await response.json();
            setNextMonth(data.nextMonth);
            setLatestMonth(data.latestMonth);
            return data.nextMonth;
        } catch (error) {
            console.error('Error getting next month:', error);
        }
    }, []);

    const checkMonthExists = async (month) => {
        try {
            const response = await fetch(`/api/month-exists/${month}`);
            const data = await response.json();
            setMonthExists(data.exists);
            return data.exists;
        } catch (error) {
            console.error('Error checking month existence:', error);
            return false;
        }
    };

    // Load next month info when component mounts
    useEffect(() => {
        getNextMonth();
    }, [getNextMonth]);

    // Function to reload data from server
    const reloadData = async () => {
        try {
            const response = await fetch('/api/reload-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            const result = await response.json();
            
            if (response.ok) {
                setMessage('Data reloaded successfully');
                setOpenSnackbar(true);
                // Reload the page to refresh all data
                window.location.reload();
            } else {
                setMessage('Error reloading data: ' + result.error);
                setOpenSnackbar(true);
            }
        } catch (error) {
            console.error('Error reloading data:', error);
            setMessage('Error reloading data: ' + error.message);
            setOpenSnackbar(true);
        }
    };

    // A-88 Edit Row Handler
    const handleA88EditRow = (row) => {
        setA88EditForm({
            month: row.month,
            mainMeter: row.mainMeter || '',
            firstFloor: row.firstFloor || '',
            secondFloor: row.secondFloor || '',
            water: row.water || ''
        });
        setA88EditDialogOpen(true);
    };

    // A-88 Add New Month Handler
    const handleA88AddNewMonth = async () => {
        const nextMonth = await getNextMonth();
        if (!nextMonth) {
            setMessage('Already at the latest month in sequence');
            setOpenSnackbar(true);
            return;
        }
        setA88AddForm({
            month: nextMonth,
            mainMeter: '',
            firstFloor: '',
            secondFloor: '',
            water: ''
        });
        setA88AddDialogOpen(true);
    };

    // A-206 Edit Row Handler
    const handleA206EditRow = (row) => {
        setA206EditForm({
            month: row.month,
            mainMeter: row.a206MainMeter || '',
            totalConsumed: row.a206TotalConsumed || '',
            secondFloor: row.a206SecondFloorMeter || '',
            secondFloorConsumed: row.a206SecondFloorConsumed || '',
            self: row.a206Self || '',
            finalSecondFloor: row.a206FinalSecondFloor || '',
            gasBill: row.a206GasBill || ''
        });
        setA206EditDialogOpen(true);
    };

    // A-206 Add New Month Handler
    const handleA206AddNewMonth = async () => {
        const nextMonth = await getNextMonth();
        if (!nextMonth) {
            setMessage('Already at the latest month in sequence');
            setOpenSnackbar(true);
            return;
        }
        setA206AddForm({
            month: nextMonth,
            mainMeter: '',
            totalConsumed: '',
            secondFloor: '',
            secondFloorConsumed: '',
            self: '',
            finalSecondFloor: '',
            gasBill: ''
        });
        setA206AddDialogOpen(true);
    };

    const handleMonthChange = async (value, formType) => {
        const currentMonth = getCurrentMonth();
        const selectedMonth = value;
        
        // Check if selected month is in the past
        const currentDate = new Date();
        const [monthName, year] = selectedMonth.split(' ');
        const yearFull = '20' + year; // Convert '25' to '2025'
        const selectedDate = new Date(`${monthName} 1, ${yearFull}`);
        
        // Only show warning for past months, not future months
        if (selectedDate < currentDate && selectedMonth !== currentMonth) {
            setShowWarning(true);
        } else {
            setShowWarning(false);
        }

        // Check if month exists in CSV
        const exists = await checkMonthExists(value);
        
        if (formType === 'meter') {
            setMeterForm(prev => ({ 
                ...prev, 
                month: value,
                isNewEntry: !exists
            }));
        } else {
            setA206Form(prev => ({ ...prev, month: value }));
        }
    };

    // A-88 Save Functions
    const saveA88Edit = async () => {
        try {
            setActionLoading(prev => ({ ...prev, 'a88-edit': true }));
            
            // Validate required fields
            if (!a88EditForm.month || !a88EditForm.mainMeter || !a88EditForm.firstFloor || !a88EditForm.secondFloor) {
                setMessage('Please fill in all required fields (Month, Main Meter, First Floor, Second Floor)');
                setOpenSnackbar(true);
                return;
            }

            const response = await fetch('/api/update-meter-readings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    month: a88EditForm.month,
                    readings: {
                        mainMeter: parseFloat(a88EditForm.mainMeter),
                        firstFloor: parseFloat(a88EditForm.firstFloor),
                        secondFloor: parseFloat(a88EditForm.secondFloor),
                        water: parseFloat(a88EditForm.water) || 0
                    },
                    isNewEntry: false
                })
            });
            
            const result = await response.json();
            
            if (response.ok) {
                setA88EditDialogOpen(false);
                await loadData();
                setMessage(result.message || 'A-88 meter readings updated successfully');
                setOpenSnackbar(true);
            } else {
                setMessage(result.message || 'Error updating meter readings');
                setOpenSnackbar(true);
            }
        } catch (error) {
            console.error('Error updating meter readings:', error);
            setMessage('Error updating meter readings: ' + error.message);
            setOpenSnackbar(true);
        } finally {
            setActionLoading(prev => ({ ...prev, 'a88-edit': false }));
        }
    };

    const saveA88Add = async () => {
        try {
            setActionLoading(prev => ({ ...prev, 'a88-add': true }));
            
            // Validate required fields
            if (!a88AddForm.month || !a88AddForm.mainMeter || !a88AddForm.firstFloor || !a88AddForm.secondFloor) {
                setMessage('Please fill in all required fields (Month, Main Meter, First Floor, Second Floor)');
                setOpenSnackbar(true);
                return;
            }

            const response = await fetch('/api/update-meter-readings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    month: a88AddForm.month,
                    readings: {
                        mainMeter: parseFloat(a88AddForm.mainMeter),
                        firstFloor: parseFloat(a88AddForm.firstFloor),
                        secondFloor: parseFloat(a88AddForm.secondFloor),
                        water: parseFloat(a88AddForm.water) || 0
                    },
                    isNewEntry: true
                })
            });
            
            const result = await response.json();
            
            if (response.ok) {
                setA88AddDialogOpen(false);
                setA88AddForm({
                    month: '',
                    mainMeter: '',
                    firstFloor: '',
                    secondFloor: '',
                    water: ''
                });
                await loadData();
                setMessage(result.message || 'A-88 meter readings added successfully');
                setOpenSnackbar(true);
            } else {
                setMessage(result.message || 'Error adding meter readings');
                setOpenSnackbar(true);
            }
        } catch (error) {
            console.error('Error adding meter readings:', error);
            setMessage('Error adding meter readings: ' + error.message);
            setOpenSnackbar(true);
        } finally {
            setActionLoading(prev => ({ ...prev, 'a88-add': false }));
        }
    };

    // A-206 Save Functions
    const saveA206Edit = async () => {
        try {
            setActionLoading(prev => ({ ...prev, 'a206-edit': true }));
            
            // Validate required fields
            if (!a206EditForm.month || !a206EditForm.mainMeter) {
                setMessage('Please fill in all required fields (Month, Main Meter)');
                setOpenSnackbar(true);
                return;
            }

            const response = await fetch('/api/update-a206-meter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    month: a206EditForm.month,
                    mainMeter: parseFloat(a206EditForm.mainMeter),
                    totalConsumed: parseFloat(a206EditForm.totalConsumed),
                    secondFloorMeter: parseFloat(a206EditForm.secondFloor) || 0,
                    secondFloorConsumed: parseFloat(a206EditForm.secondFloorConsumed) || 0,
                    self: parseFloat(a206EditForm.self) || 0,
                    finalSecondFloor: parseFloat(a206EditForm.finalSecondFloor) || 0,
                    gasBill: parseFloat(a206EditForm.gasBill) || 0
                })
            });
            
            const result = await response.json();
            
            if (response.ok) {
                setA206EditDialogOpen(false);
                await loadData();
                setMessage(result.message || 'A-206 meter reading updated successfully');
                setOpenSnackbar(true);
            } else {
                setMessage(result.message || 'Error updating A-206 meter reading');
                setOpenSnackbar(true);
            }
        } catch (error) {
            console.error('Error updating A-206 meter reading:', error);
            setMessage('Error updating A-206 meter reading: ' + error.message);
            setOpenSnackbar(true);
        } finally {
            setActionLoading(prev => ({ ...prev, 'a206-edit': false }));
        }
    };

    const saveA206Add = async () => {
        try {
            setActionLoading(prev => ({ ...prev, 'a206-add': true }));
            
            // Validate required fields
            if (!a206AddForm.month || !a206AddForm.mainMeter) {
                setMessage('Please fill in all required fields (Month, Main Meter)');
                setOpenSnackbar(true);
                return;
            }

            const response = await fetch('/api/update-a206-meter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    month: a206AddForm.month,
                    mainMeter: parseFloat(a206AddForm.mainMeter),
                    totalConsumed: parseFloat(a206AddForm.totalConsumed),
                    secondFloorMeter: parseFloat(a206AddForm.secondFloor) || 0,
                    secondFloorConsumed: parseFloat(a206AddForm.secondFloorConsumed) || 0,
                    self: parseFloat(a206AddForm.self) || 0,
                    finalSecondFloor: parseFloat(a206AddForm.finalSecondFloor) || 0,
                    gasBill: parseFloat(a206AddForm.gasBill) || 0
                })
            });
            
            const result = await response.json();
            
            if (response.ok) {
                setA206AddDialogOpen(false);
                setA206AddForm({
                    month: '',
                    mainMeter: '',
                    totalConsumed: '',
                    secondFloor: '',
                    secondFloorConsumed: '',
                    self: '',
                    finalSecondFloor: '',
                    gasBill: ''
                });
                await loadData();
                setMessage(result.message || 'A-206 meter reading added successfully');
                setOpenSnackbar(true);
            } else {
                setMessage(result.message || 'Error adding A-206 meter reading');
                setOpenSnackbar(true);
            }
        } catch (error) {
            console.error('Error adding A-206 meter reading:', error);
            setMessage('Error adding A-206 meter reading: ' + error.message);
            setOpenSnackbar(true);
        } finally {
            setActionLoading(prev => ({ ...prev, 'a206-add': false }));
        }
    };

    return (
        <Box>
            {latestMonth && (
                <Alert severity="info" sx={{ mb: 2 }}>
                    Latest month in system: <strong>{latestMonth}</strong>
                    {nextMonth && ` • Next month to add: ${nextMonth}`}
                </Alert>
            )}
            
            {/* Reload Data Button */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<RefreshIcon />}
                    onClick={reloadData}
                    sx={{ borderRadius: 2 }}
                >
                    Reload Data
                </Button>
            </Box>



            {/* A-88 Edit Dialog */}
            <Dialog 
                open={a88EditDialogOpen} 
                onClose={() => setA88EditDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 3 }
                }}
            >
                <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
                    Edit A-88 Meter Reading
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Alert severity="info" sx={{ mb: 2 }}>
                        Editing data for: <strong>{a88EditForm.month}</strong>
                    </Alert>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                id="month"
                                name="month"
                                label="Month"
                                value={a88EditForm.month}
                                variant="outlined"
                                disabled
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                id="main-meter"
                                name="mainMeter"
                                label="Main Meter"
                                type="number"
                                value={a88EditForm.mainMeter}
                                onChange={(e) => setA88EditForm(prev => ({ ...prev, mainMeter: e.target.value }))}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                id="first-floor"
                                name="firstFloor"
                                label="First Floor"
                                type="number"
                                value={a88EditForm.firstFloor}
                                onChange={(e) => setA88EditForm(prev => ({ ...prev, firstFloor: e.target.value }))}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                id="second-floor"
                                name="secondFloor"
                                label="Second Floor"
                                type="number"
                                value={a88EditForm.secondFloor}
                                onChange={(e) => setA88EditForm(prev => ({ ...prev, secondFloor: e.target.value }))}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                id="water"
                                name="water"
                                label="Water"
                                type="number"
                                value={a88EditForm.water}
                                onChange={(e) => setA88EditForm(prev => ({ ...prev, water: e.target.value }))}
                                variant="outlined"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button 
                        onClick={() => setA88EditDialogOpen(false)}
                        variant="outlined"
                        sx={{ borderRadius: 2 }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={saveA88Edit}
                        variant="contained"
                        disabled={actionLoading['a88-edit']}
                        startIcon={actionLoading['a88-edit'] ? <CircularProgress size={16} /> : null}
                        sx={{ borderRadius: 2 }}
                    >
                        {actionLoading['a88-edit'] ? 'Updating...' : 'Update'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* A-88 Add New Month Dialog */}
            <Dialog 
                open={a88AddDialogOpen} 
                onClose={() => setA88AddDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 3 }
                }}
            >
                <DialogTitle sx={{ bgcolor: 'success.main', color: 'white' }}>
                    Add New Month - A-88 Meter Reading
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Alert severity="success" sx={{ mb: 2 }}>
                        Adding new month: <strong>{a88AddForm.month}</strong>
                    </Alert>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                id="month"
                                name="month"
                                label="Month"
                                value={a88AddForm.month}
                                variant="outlined"
                                disabled
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                id="main-meter"
                                name="mainMeter"
                                label="Main Meter"
                                type="number"
                                value={a88AddForm.mainMeter}
                                onChange={(e) => setA88AddForm(prev => ({ ...prev, mainMeter: e.target.value }))}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                id="first-floor"
                                name="firstFloor"
                                label="First Floor"
                                type="number"
                                value={a88AddForm.firstFloor}
                                onChange={(e) => setA88AddForm(prev => ({ ...prev, firstFloor: e.target.value }))}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                id="second-floor"
                                name="secondFloor"
                                label="Second Floor"
                                type="number"
                                value={a88AddForm.secondFloor}
                                onChange={(e) => setA88AddForm(prev => ({ ...prev, secondFloor: e.target.value }))}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                id="water"
                                name="water"
                                label="Water"
                                type="number"
                                value={a88AddForm.water}
                                onChange={(e) => setA88AddForm(prev => ({ ...prev, water: e.target.value }))}
                                variant="outlined"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button 
                        onClick={() => setA88AddDialogOpen(false)}
                        variant="outlined"
                        sx={{ borderRadius: 2 }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={saveA88Add}
                        variant="contained"
                        color="success"
                        disabled={actionLoading['a88-add']}
                        startIcon={actionLoading['a88-add'] ? <CircularProgress size={16} /> : null}
                        sx={{ borderRadius: 2 }}
                    >
                        {actionLoading['a88-add'] ? 'Adding...' : 'Add'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* A-206 Edit Dialog */}
            <Dialog 
                open={a206EditDialogOpen} 
                onClose={() => setA206EditDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 3 }
                }}
            >
                <DialogTitle sx={{ bgcolor: 'secondary.main', color: 'white' }}>
                    Edit A-206 Meter Reading
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Alert severity="info" sx={{ mb: 2 }}>
                        Editing data for: <strong>{a206EditForm.month}</strong>
                    </Alert>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                id="month"
                                name="month"
                                label="Month"
                                value={a206EditForm.month}
                                variant="outlined"
                                disabled
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                id="main-meter"
                                name="mainMeter"
                                label="Main Meter"
                                type="number"
                                step="0.01"
                                value={a206EditForm.mainMeter}
                                onChange={(e) => {
                                    const mainMeter = e.target.value;
                                    const secondFloor = a206EditForm.secondFloor;
                                    const month = a206EditForm.month;
                                    const calculated = calculateA206ConsumedValues(mainMeter, secondFloor, month);
                                    setA206EditForm(prev => ({ 
                                        ...prev, 
                                        mainMeter,
                                        totalConsumed: calculated.totalConsumed,
                                        secondFloorConsumed: calculated.secondFloorConsumed,
                                        finalSecondFloor: calculated.finalSecondFloor,
                                        self: calculated.self
                                    }));
                                }}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                id="total-consumed"
                                name="totalConsumed"
                                label="Total Consumed (Auto-calculated)"
                                type="number"
                                step="0.01"
                                value={a206EditForm.totalConsumed}
                                InputProps={{ readOnly: true }}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                id="second-floor-meter"
                                name="secondFloorMeter"
                                label="Second Floor Meter"
                                type="number"
                                step="0.01"
                                value={a206EditForm.secondFloor}
                                onChange={(e) => {
                                    const secondFloor = e.target.value;
                                    const mainMeter = a206EditForm.mainMeter;
                                    const month = a206EditForm.month;
                                    const calculated = calculateA206ConsumedValues(mainMeter, secondFloor, month);
                                    setA206EditForm(prev => ({ 
                                        ...prev, 
                                        secondFloor,
                                        totalConsumed: calculated.totalConsumed,
                                        secondFloorConsumed: calculated.secondFloorConsumed,
                                        finalSecondFloor: calculated.finalSecondFloor,
                                        self: calculated.self
                                    }));
                                }}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                id="second-floor-consumed"
                                name="secondFloorConsumed"
                                label="Second Floor Consumed (Auto-calculated)"
                                type="number"
                                step="0.01"
                                value={a206EditForm.secondFloorConsumed}
                                InputProps={{ readOnly: true }}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                id="self"
                                name="self"
                                label="Self (Auto-calculated)"
                                type="number"
                                step="0.01"
                                value={a206EditForm.self}
                                InputProps={{ readOnly: true }}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                id="final-second-floor"
                                name="finalSecondFloor"
                                label="Final Second Floor (Auto-calculated)"
                                type="number"
                                step="0.01"
                                value={a206EditForm.finalSecondFloor}
                                InputProps={{ readOnly: true }}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="Gas Bill"
                                type="number"
                                step="0.01"
                                value={a206EditForm.gasBill}
                                onChange={(e) => setA206EditForm(prev => ({ ...prev, gasBill: e.target.value }))}
                                variant="outlined"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button 
                        onClick={() => setA206EditDialogOpen(false)}
                        variant="outlined"
                        sx={{ borderRadius: 2 }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={saveA206Edit}
                        variant="contained"
                        disabled={actionLoading['a206-edit']}
                        startIcon={actionLoading['a206-edit'] ? <CircularProgress size={16} /> : null}
                        sx={{ borderRadius: 2 }}
                    >
                        {actionLoading['a206-edit'] ? 'Updating...' : 'Update'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* A-206 Add New Month Dialog */}
            <Dialog 
                open={a206AddDialogOpen} 
                onClose={() => setA206AddDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 3 }
                }}
            >
                <DialogTitle sx={{ bgcolor: 'success.main', color: 'white' }}>
                    Add New Month - A-206 Meter Reading
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Alert severity="success" sx={{ mb: 2 }}>
                        Adding new month: <strong>{a206AddForm.month}</strong>
                    </Alert>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                id="month"
                                name="month"
                                label="Month"
                                value={a206AddForm.month}
                                variant="outlined"
                                disabled
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                id="main-meter"
                                name="mainMeter"
                                label="Main Meter"
                                type="number"
                                step="0.01"
                                value={a206AddForm.mainMeter}
                                onChange={(e) => {
                                    const mainMeter = e.target.value;
                                    const secondFloor = a206AddForm.secondFloor;
                                    const month = a206AddForm.month;
                                    const calculated = calculateA206ConsumedValues(mainMeter, secondFloor, month);
                                    setA206AddForm(prev => ({ 
                                        ...prev, 
                                        mainMeter,
                                        totalConsumed: calculated.totalConsumed,
                                        secondFloorConsumed: calculated.secondFloorConsumed,
                                        finalSecondFloor: calculated.finalSecondFloor,
                                        self: calculated.self
                                    }));
                                }}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                id="total-consumed"
                                name="totalConsumed"
                                label="Total Consumed (Auto-calculated)"
                                type="number"
                                step="0.01"
                                value={a206AddForm.totalConsumed}
                                InputProps={{ readOnly: true }}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                id="second-floor-meter"
                                name="secondFloorMeter"
                                label="Second Floor Meter"
                                type="number"
                                step="0.01"
                                value={a206AddForm.secondFloor}
                                onChange={(e) => {
                                    const secondFloor = e.target.value;
                                    const mainMeter = a206AddForm.mainMeter;
                                    const month = a206AddForm.month;
                                    const calculated = calculateA206ConsumedValues(mainMeter, secondFloor, month);
                                    setA206AddForm(prev => ({ 
                                        ...prev, 
                                        secondFloor,
                                        totalConsumed: calculated.totalConsumed,
                                        secondFloorConsumed: calculated.secondFloorConsumed,
                                        finalSecondFloor: calculated.finalSecondFloor,
                                        self: calculated.self
                                    }));
                                }}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                id="second-floor-consumed"
                                name="secondFloorConsumed"
                                label="Second Floor Consumed (Auto-calculated)"
                                type="number"
                                step="0.01"
                                value={a206AddForm.secondFloorConsumed}
                                InputProps={{ readOnly: true }}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                id="self"
                                name="self"
                                label="Self (Auto-calculated)"
                                type="number"
                                step="0.01"
                                value={a206AddForm.self}
                                InputProps={{ readOnly: true }}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                id="final-second-floor"
                                name="finalSecondFloor"
                                label="Final Second Floor (Auto-calculated)"
                                type="number"
                                step="0.01"
                                value={a206AddForm.finalSecondFloor}
                                InputProps={{ readOnly: true }}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="Gas Bill"
                                type="number"
                                step="0.01"
                                value={a206AddForm.gasBill}
                                onChange={(e) => setA206AddForm(prev => ({ ...prev, gasBill: e.target.value }))}
                                variant="outlined"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button 
                        onClick={() => setA206AddDialogOpen(false)}
                        variant="outlined"
                        sx={{ borderRadius: 2 }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={saveA206Add}
                        variant="contained"
                        color="success"
                        disabled={actionLoading['a206-add']}
                        startIcon={actionLoading['a206-add'] ? <CircularProgress size={16} /> : null}
                        sx={{ borderRadius: 2 }}
                    >
                        {actionLoading['a206-add'] ? 'Adding...' : 'Add'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Meter Readings Tables - Stacked Vertically */}
            <Grid container spacing={3}>
                {/* A-88 Meter Readings Table */}
                <Grid item xs={12}>
                    <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    A-88 Meter Readings
                                </Typography>
                                <Button
                                    variant="contained"
                                    color="success"
                                    startIcon={<EditIcon />}
                                    onClick={handleA88AddNewMonth}
                                    sx={{ borderRadius: 2 }}
                                >
                                    Add New Month
                                </Button>
                            </Box>
                            <TableContainer sx={{ maxHeight: 400, overflowY: 'auto' }}>
                                <Table size="small" stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ minWidth: 100, whiteSpace: 'nowrap', fontWeight: 600 }}>Month</TableCell>
                                            <TableCell sx={{ minWidth: 120, whiteSpace: 'nowrap', fontWeight: 600 }}>Main Meter</TableCell>
                                            <TableCell sx={{ minWidth: 120, whiteSpace: 'nowrap', fontWeight: 600 }}>1st Floor</TableCell>
                                            <TableCell sx={{ minWidth: 120, whiteSpace: 'nowrap', fontWeight: 600 }}>2nd Floor</TableCell>
                                            <TableCell sx={{ minWidth: 100, whiteSpace: 'nowrap', fontWeight: 600 }}>Water</TableCell>
                                            <TableCell sx={{ minWidth: 140, whiteSpace: 'nowrap', fontWeight: 600 }}>1st Consumed</TableCell>
                                            <TableCell sx={{ minWidth: 140, whiteSpace: 'nowrap', fontWeight: 600 }}>2nd Consumed</TableCell>
                                            <TableCell sx={{ minWidth: 140, whiteSpace: 'nowrap', fontWeight: 600 }}>Ground Consumed</TableCell>
                                            <TableCell sx={{ minWidth: 80, whiteSpace: 'nowrap', fontWeight: 600 }}>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {meterData
                                            .filter(row => row.mainMeter != null || row.firstFloor != null || row.secondFloor != null || row.water != null)
                                            .sort((a, b) => {
                                                // Sort with current month on top, then by month order
                                                const currentMonth = getCurrentMonth();
                                                if (a.month === currentMonth) return -1;
                                                if (b.month === currentMonth) return 1;
                                                
                                                // Define month order for sorting
                                                const monthOrder = [
                                                    'August 24', 'September 24', 'October 24', 'November 24', 'December 24',
                                                    'January 25', 'February 25', 'March 25', 'April 25', 'May 25', 'June 25', 'July 25',
                                                    'August 25', 'September 25', 'October 25', 'November 25', 'December 25'
                                                ];
                                                
                                                const aIndex = monthOrder.indexOf(a.month);
                                                const bIndex = monthOrder.indexOf(b.month);
                                                
                                                // If month not found in order, put it at the end
                                                if (aIndex === -1) return 1;
                                                if (bIndex === -1) return -1;
                                                
                                                return bIndex - aIndex; // Descending order (newest first)
                                            })
                                            .map((row, index) => (
                                                <TableRow key={index} hover>
                                                    <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 500 }}>{row.month}</TableCell>
                                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.mainMeter || '-'}</TableCell>
                                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.firstFloor || '-'}</TableCell>
                                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.secondFloor || '-'}</TableCell>
                                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.water || '-'}</TableCell>
                                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.firstFloorConsumed || '-'}</TableCell>
                                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.secondFloorConsumed || '-'}</TableCell>
                                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.groundFloorConsumed || '-'}</TableCell>
                                                    <TableCell>
                                                        <IconButton
                                                            size="small"
                                                            color="primary"
                                                            onClick={() => handleA88EditRow(row)}
                                                            sx={{ p: 0.5 }}
                                                        >
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* A-206 Meter Readings Table */}
                <Grid item xs={12}>
                    <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    A-206 Meter Readings
                                </Typography>
                                <Button
                                    variant="contained"
                                    color="success"
                                    startIcon={<EditIcon />}
                                    onClick={handleA206AddNewMonth}
                                    sx={{ borderRadius: 2 }}
                                >
                                    Add New Month
                                </Button>
                            </Box>
                            <TableContainer sx={{ maxHeight: 400, overflowY: 'auto' }}>
                                <Table size="small" stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ minWidth: 100, whiteSpace: 'nowrap', fontWeight: 600 }}>Month</TableCell>
                                            <TableCell sx={{ minWidth: 120, whiteSpace: 'nowrap', fontWeight: 600 }}>Main Meter</TableCell>
                                            <TableCell sx={{ minWidth: 120, whiteSpace: 'nowrap', fontWeight: 600 }}>Total Consumed</TableCell>
                                            <TableCell sx={{ minWidth: 120, whiteSpace: 'nowrap', fontWeight: 600 }}>2nd Floor Meter</TableCell>
                                            <TableCell sx={{ minWidth: 120, whiteSpace: 'nowrap', fontWeight: 600 }}>2nd Floor Consumed</TableCell>
                                            <TableCell sx={{ minWidth: 100, whiteSpace: 'nowrap', fontWeight: 600 }}>Self</TableCell>
                                            <TableCell sx={{ minWidth: 120, whiteSpace: 'nowrap', fontWeight: 600 }}>Final 2nd Floor</TableCell>
                                            <TableCell sx={{ minWidth: 100, whiteSpace: 'nowrap', fontWeight: 600 }}>Gas Bill</TableCell>
                                            <TableCell sx={{ minWidth: 80, whiteSpace: 'nowrap', fontWeight: 600 }}>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {meterData
                                            .filter(row => row.a206MainMeter != null)
                                            .sort((a, b) => {
                                                // Sort with current month on top, then by month order
                                                const currentMonth = getCurrentMonth();
                                                if (a.month === currentMonth) return -1;
                                                if (b.month === currentMonth) return 1;
                                                
                                                // Define month order for sorting
                                                const monthOrder = [
                                                    'August 24', 'September 24', 'October 24', 'November 24', 'December 24',
                                                    'January 25', 'February 25', 'March 25', 'April 25', 'May 25', 'June 25', 'July 25',
                                                    'August 25', 'September 25', 'October 25', 'November 25', 'December 25'
                                                ];
                                                
                                                const aIndex = monthOrder.indexOf(a.month);
                                                const bIndex = monthOrder.indexOf(b.month);
                                                
                                                // If month not found in order, put it at the end
                                                if (aIndex === -1) return 1;
                                                if (bIndex === -1) return -1;
                                                
                                                return bIndex - aIndex; // Descending order (newest first)
                                            })
                                            .map((row, index) => (
                                                <TableRow key={index} hover>
                                                    <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 500 }}>{row.month}</TableCell>
                                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.a206MainMeter || '-'}</TableCell>
                                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.a206TotalConsumed || '-'}</TableCell>
                                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.a206SecondFloorMeter || '-'}</TableCell>
                                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.a206SecondFloorConsumed || '-'}</TableCell>
                                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.a206Self || '-'}</TableCell>
                                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.a206FinalSecondFloor || '-'}</TableCell>
                                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.a206GasBill || '-'}</TableCell>
                                                    <TableCell>
                                                        <IconButton
                                                            size="small"
                                                            color="primary"
                                                            onClick={() => handleA206EditRow(row)}
                                                            sx={{ p: 0.5 }}
                                                        >
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
  }

  const AuditLogTab = () => (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
        Audit Log
      </Typography>
      
      <TableContainer component={Paper} sx={{ maxHeight: 600, overflow: 'auto' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell><strong>Timestamp</strong></TableCell>
              <TableCell><strong>Activity</strong></TableCell>
              <TableCell><strong>Month</strong></TableCell>
              <TableCell><strong>Tenant</strong></TableCell>
              <TableCell><strong>Details</strong></TableCell>
              <TableCell><strong>Old Value</strong></TableCell>
              <TableCell><strong>New Value</strong></TableCell>
              <TableCell><strong>User</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {auditData.map((entry, index) => (
              <TableRow key={index} hover>
                <TableCell>
                  {entry.Timestamp ? new Date(entry.Timestamp).toLocaleString() : 'N/A'}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={entry.Activity || 'Unknown'} 
                    color={
                      entry.Activity && entry.Activity.includes('PAYMENT') ? 'success' :
                      entry.Activity && entry.Activity.includes('METER') ? 'info' :
                      entry.Activity && entry.Activity.includes('RENT') ? 'warning' :
                      'default'
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell>{entry.Month || 'N/A'}</TableCell>
                <TableCell>{entry.Tenant || 'N/A'}</TableCell>
                <TableCell sx={{ maxWidth: 200, wordWrap: 'break-word' }}>
                  {entry.Details || 'N/A'}
                </TableCell>
                <TableCell>{entry.OldValue || 'N/A'}</TableCell>
                <TableCell>{entry.NewValue || 'N/A'}</TableCell>
                <TableCell>{entry.User || 'N/A'}</TableCell>
              </TableRow>
            ))}
            {auditData.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No audit entries found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const PaymentSummaryTab = () => {
    // State for payment summary data
    const [paymentData, setPaymentData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [editForm, setEditForm] = useState({
      month: '',
      tenant: '',
      totalRent: '',
      baseRent: '',
      maintenance: '',
      energyCharges: '',
      gasBill: '',
      status: 'Not Paid'
    });

    // Load payment data from CSV
    const loadPaymentData = useCallback(async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/rent-data');
        const result = await response.json();
        
        if (result.success && result.data) {
          // Transform the data into a flat structure for the summary table
          const summaryData = [];
          
          result.data.forEach(monthRecord => {
            Object.keys(tenantConfigs).forEach(tenantKey => {
              const totalRent = monthRecord[`${tenantKey}_TotalRent`] || 0;
              if (totalRent > 0) {
                summaryData.push({
                  id: `${monthRecord.month}_${tenantKey}`,
                  month: monthRecord.month,
                  tenant: tenantKey,
                  tenantName: tenantConfigs[tenantKey]?.name || tenantKey,
                  totalRent: parseFloat(totalRent) || 0,
                  baseRent: parseFloat(monthRecord[`${tenantKey}_BaseRent`]) || 0,
                  maintenance: parseFloat(monthRecord[`${tenantKey}_Maintenance`]) || 0,
                  energyCharges: parseFloat(monthRecord[`${tenantKey}_EnergyCharges`]) || 0,
                  gasBill: parseFloat(monthRecord[`${tenantKey}_GasBill`]) || 0,
                  status: monthRecord[`${tenantKey}_Status`] || 'Not Paid'
                });
              }
            });
          });
          
          // Sort by month (newest first)
          summaryData.sort((a, b) => {
            const [aMonth, aYear] = a.month.split(' ');
            const [bMonth, bYear] = b.month.split(' ');
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                               'July', 'August', 'September', 'October', 'November', 'December'];
            const aIndex = monthNames.indexOf(aMonth) + (parseInt('20' + aYear) * 12);
            const bIndex = monthNames.indexOf(bMonth) + (parseInt('20' + bYear) * 12);
            return bIndex - aIndex;
          });
          
          setPaymentData(summaryData);
        }
      } catch (error) {
        console.error('Error loading payment data:', error);
        setMessage('Error loading payment data: ' + error.message);
        setOpenSnackbar(true);
      } finally {
        setLoading(false);
      }
    }, [tenantConfigs]);

    // Load data on component mount
    useEffect(() => {
      loadPaymentData();
    }, [loadPaymentData]);

    // Handle edit button click
    const handleEdit = (record) => {
      setEditingRecord(record);
      setEditForm({
        month: record.month,
        tenant: record.tenant,
        totalRent: record.totalRent.toString(),
        baseRent: record.baseRent.toString(),
        maintenance: record.maintenance.toString(),
        energyCharges: record.energyCharges.toString(),
        gasBill: record.gasBill.toString(),
        status: record.status
      });
      setEditDialogOpen(true);
    };

    // Handle form input changes
    const handleFormChange = (field, value) => {
      setEditForm(prev => ({
        ...prev,
        [field]: value
      }));
    };

    // Calculate total rent when individual fields change
    const calculateTotalRent = () => {
      const baseRent = parseFloat(editForm.baseRent) || 0;
      const maintenance = parseFloat(editForm.maintenance) || 0;
      const energyCharges = parseFloat(editForm.energyCharges) || 0;
      const gasBill = parseFloat(editForm.gasBill) || 0;
      return baseRent + maintenance + energyCharges + gasBill;
    };

    // Save edited data
    const handleSave = async () => {
      try {
        setLoading(true);
        
        const totalRent = calculateTotalRent();
        
        const response = await fetch('/api/adjust-rent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tenant: editForm.tenant,
            month: editForm.month,
            totalRent: totalRent,
            baseRent: parseFloat(editForm.baseRent) || 0,
            maintenance: parseFloat(editForm.maintenance) || 0,
            energyCharges: parseFloat(editForm.energyCharges) || 0,
            gasBill: parseFloat(editForm.gasBill) || 0,
            status: editForm.status
          })
        });

        const result = await response.json();
        
        if (result.success) {
          setEditDialogOpen(false);
          setMessage('Payment record updated successfully');
          setOpenSnackbar(true);
          await loadPaymentData(); // Reload data
        } else {
          setMessage('Error updating payment record: ' + (result.error || 'Unknown error'));
          setOpenSnackbar(true);
        }
      } catch (error) {
        console.error('Error saving payment record:', error);
        setMessage('Error saving payment record: ' + error.message);
        setOpenSnackbar(true);
      } finally {
        setLoading(false);
      }
    };

    // Handle dialog close
    const handleClose = () => {
      setEditDialogOpen(false);
      setEditingRecord(null);
      setEditForm({
        month: '',
        tenant: '',
        totalRent: '',
        baseRent: '',
        maintenance: '',
        energyCharges: '',
        gasBill: '',
        status: 'Not Paid'
      });
    };

    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            Payment Summary
          </Typography>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={loadPaymentData}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </Box>

        <Card>
          <CardContent>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Month</strong></TableCell>
                      <TableCell><strong>Tenant</strong></TableCell>
                      <TableCell align="right"><strong>Base Rent</strong></TableCell>
                      <TableCell align="right"><strong>Maintenance</strong></TableCell>
                      <TableCell align="right"><strong>Energy Charges</strong></TableCell>
                      <TableCell align="right"><strong>Gas Bill</strong></TableCell>
                      <TableCell align="right"><strong>Total Rent</strong></TableCell>
                      <TableCell align="center"><strong>Status</strong></TableCell>
                      <TableCell align="center"><strong>Actions</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paymentData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                          <Typography variant="body2" color="text.secondary">
                            No payment data available
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paymentData.map((record) => (
                        <TableRow key={record.id} hover>
                          <TableCell>{record.month}</TableCell>
                          <TableCell>{record.tenantName}</TableCell>
                          <TableCell align="right">₹{record.baseRent.toLocaleString()}</TableCell>
                          <TableCell align="right">₹{record.maintenance.toLocaleString()}</TableCell>
                          <TableCell align="right">₹{record.energyCharges.toLocaleString()}</TableCell>
                          <TableCell align="right">₹{record.gasBill.toLocaleString()}</TableCell>
                          <TableCell align="right">
                            <strong>₹{record.totalRent.toLocaleString()}</strong>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={record.status}
                              color={record.status === 'Paid' ? 'success' : 'warning'}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Button
                              size="small"
                              startIcon={<EditIcon />}
                              onClick={() => handleEdit(record)}
                              variant="outlined"
                            >
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog 
          open={editDialogOpen} 
          onClose={handleClose} 
          maxWidth="md" 
          fullWidth
          PaperProps={{
            sx: { minHeight: '400px' }
          }}
        >
          <DialogTitle>
            Edit Payment Record - {editingRecord?.tenantName} ({editingRecord?.month})
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Month"
                  value={editForm.month}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Tenant"
                  value={editForm.tenant}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Base Rent"
                  type="number"
                  value={editForm.baseRent}
                  onChange={(e) => handleFormChange('baseRent', e.target.value)}
                  variant="outlined"
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Maintenance"
                  type="number"
                  value={editForm.maintenance}
                  onChange={(e) => handleFormChange('maintenance', e.target.value)}
                  variant="outlined"
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Energy Charges"
                  type="number"
                  value={editForm.energyCharges}
                  onChange={(e) => handleFormChange('energyCharges', e.target.value)}
                  variant="outlined"
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Gas Bill"
                  type="number"
                  value={editForm.gasBill}
                  onChange={(e) => handleFormChange('gasBill', e.target.value)}
                  variant="outlined"
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Total Rent (Auto-calculated)"
                  type="number"
                  value={calculateTotalRent().toFixed(2)}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                  helperText="This is automatically calculated from the above fields"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Payment Status</InputLabel>
                  <Select
                    value={editForm.status}
                    onChange={(e) => handleFormChange('status', e.target.value)}
                    label="Payment Status"
                  >
                    <MenuItem value="Paid">Paid</MenuItem>
                    <MenuItem value="Not Paid">Not Paid</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleClose} variant="outlined">
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              variant="contained" 
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return <DashboardTab />;
      case 1:
        return <IndividualTenantDetailsTab />;
      case 2:
        return <TenantConfigTab />;
      case 3:
        return <PaymentReportTab />;
      case 4:
        return <MeterEntryTab />;
      case 5:
        return <AuditLogTab />;
      case 6:
        return <PaymentSummaryTab />;
      default:
        return <DashboardTab />;
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar sx={{ minHeight: { xs: '56px', sm: '64px' } }}>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontSize: { xs: '1rem', sm: '1.25rem' },
              fontWeight: 600
            }}
          >
            Rent Management System
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: { xs: 1, sm: 3 }, px: { xs: 1, sm: 2 } }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Alert severity="info" sx={{ display: 'flex', alignItems: 'center' }}>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Loading data...
            </Alert>
          </Box>
        )}
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3, overflowX: 'auto' }}>
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              minHeight: '48px',
              '& .MuiTab-root': {
                minWidth: 'auto',
                padding: { xs: '6px 8px', sm: '12px 16px' },
                fontSize: { xs: '0.75rem', sm: '0.875rem' }
              }
            }}
          >
            <Tab icon={<DashboardIcon />} label="Dashboard" />
            <Tab icon={<PeopleIcon />} label="Individual Tenant" />
            <Tab icon={<ReceiptIcon />} label="Tenant Config" />
            <Tab icon={<BarChartIcon />} label="Payment Report" />
            <Tab icon={<SpeedIcon />} label="Meter Readings" />
            <Tab icon={<AssessmentIcon />} label="Audit Log" />
            <Tab icon={<EditIcon />} label="Payment Summary" />
          </Tabs>
        </Box>

        {renderTabContent()}
      </Container>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        {selectedRow && selectedRow.status !== 'Paid' && (
          <MenuItem onClick={() => {
            if (selectedRow) markAsPaid(selectedRow.tenant);
          }}>
            <ListItemIcon>
              <CheckCircleIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Mark as Paid</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={() => {
          if (selectedRow) {
            setSelectedTenant(selectedRow.tenant);
            setActiveTab(1);
            handleMenuClose();
          }
        }}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Individual Tenant</ListItemText>
        </MenuItem>
      </Menu>



      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity="success">
          {message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default App;

