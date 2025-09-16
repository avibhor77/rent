import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { formatCurrency } from '../utils/dateUtils';
import { PAYMENT_STATUS } from '../utils/constants';
import apiService from '../services/apiService';

const DashboardTab = ({ selectedMonth, onMonthChange, onMessage }) => {
  const [rentData, setRentData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load rent data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiService.getRentData();
        if (data.success) {
          setRentData(data.data);
        }
      } catch (err) {
        setError(err.message);
        onMessage('Error loading data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [onMessage]);

  // Calculate dashboard stats
  const dashboardStats = useMemo(() => {
    if (!rentData.length) return null;

    const currentMonthData = rentData.find(row => row.month === selectedMonth);
    if (!currentMonthData) return null;

    // Get all tenant keys from the data
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
      if (status === PAYMENT_STATUS.PAID) {
        totalRentCollected += totalRent;
        paidTenants++;
      }
    });
    
    const outstandingAmount = totalRentDue - totalRentCollected;
    const totalTenants = tenantKeys.length;
    
    return {
      totalRentCollected,
      totalRentDue,
      outstandingAmount,
      totalTenants,
      paidTenants,
      unpaidTenants: totalTenants - paidTenants,
      tenantKeys
    };
  }, [rentData, selectedMonth]);

  // Get available months
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

  if (loading) {
    return (
      <Box className="loading-container">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        Error loading dashboard data: {error}
      </Alert>
    );
  }

  if (!dashboardStats) {
    return (
      <Alert severity="info">
        No data available
      </Alert>
    );
  }

  const stats = [
    {
      title: 'Total Rent Due',
      value: formatCurrency(dashboardStats.totalRentDue),
      color: '#2196f3'
    },
    {
      title: 'Rent Collected',
      value: formatCurrency(dashboardStats.totalRentCollected),
      color: '#4caf50'
    },
    {
      title: 'Outstanding Amount',
      value: formatCurrency(dashboardStats.outstandingAmount),
      color: '#f44336'
    },
    {
      title: 'Collection Rate',
      value: `${Math.round((dashboardStats.totalRentCollected / dashboardStats.totalRentDue) * 100)}%`,
      color: dashboardStats.totalRentCollected === dashboardStats.totalRentDue ? '#4caf50' : '#ff9800'
    }
  ];

  const currentMonthData = rentData.find(row => row.month === selectedMonth);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom={3}>
        <Typography variant="h4">
          Dashboard
        </Typography>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Select Month</InputLabel>
          <Select
            value={selectedMonth}
            onChange={(e) => onMonthChange(e.target.value)}
            label="Select Month"
          >
            {availableMonths.map(month => (
              <MenuItem key={month} value={month}>
                {month}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      
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

      {/* Tenant Details Table */}
      <Card className="card" style={{ marginTop: '2rem' }}>
        <CardContent className="card-content">
          <Typography variant="h6" gutterBottom>
            Tenant Details - {selectedMonth}
          </Typography>
          <TableContainer component={Paper}>
            <Table className="table">
              <TableHead>
                <TableRow>
                  <TableCell>Tenant</TableCell>
                  <TableCell align="right">Base Rent</TableCell>
                  <TableCell align="right">Maintenance</TableCell>
                  <TableCell align="right">Energy Charges</TableCell>
                  <TableCell align="right">Gas Bill</TableCell>
                  <TableCell align="right">Total Rent</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dashboardStats?.tenantKeys.map((tenantKey, index) => {
                  const baseRent = parseFloat(currentMonthData?.[`${tenantKey}_BaseRent`]) || 0;
                  const maintenance = parseFloat(currentMonthData?.[`${tenantKey}_Maintenance`]) || 0;
                  const energyCharges = parseFloat(currentMonthData?.[`${tenantKey}_EnergyCharges`]) || 0;
                  const gasBill = parseFloat(currentMonthData?.[`${tenantKey}_GasBill`]) || 0;
                  const totalRent = parseFloat(currentMonthData?.[`${tenantKey}_TotalRent`]) || 0;
                  const status = currentMonthData?.[`${tenantKey}_Status`] || PAYMENT_STATUS.NOT_PAID;
                  
                  return (
                    <TableRow key={index}>
                      <TableCell>{tenantKey}</TableCell>
                      <TableCell align="right">{formatCurrency(baseRent)}</TableCell>
                      <TableCell align="right">{formatCurrency(maintenance)}</TableCell>
                      <TableCell align="right">{formatCurrency(energyCharges)}</TableCell>
                      <TableCell align="right">{formatCurrency(gasBill)}</TableCell>
                      <TableCell align="right" style={{ fontWeight: 'bold' }}>
                        {formatCurrency(totalRent)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={status}
                          color={status === PAYMENT_STATUS.PAID ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DashboardTab;
