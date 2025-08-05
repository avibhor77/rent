import React, { useState, useEffect } from 'react';
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
  Alert
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { demoData, mockAPI } from './demo-data.js';

function DemoApp() {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState('August 25');
  const [dashboardData, setDashboardData] = useState({});
  const [tenantConfigs, setTenantConfigs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [selectedMonth]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dashboard, configs] = await Promise.all([
        mockAPI.getDashboardData(selectedMonth),
        mockAPI.getTenantConfigs()
      ]);
      setDashboardData(dashboard);
      setTenantConfigs(configs);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const DashboardTab = () => (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard - {selectedMonth}
      </Typography>
      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <Grid container spacing={3}>
          {Object.entries(dashboardData).map(([tenantKey, data]) => (
            <Grid item xs={12} md={4} key={tenantKey}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {tenantKey}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Rent: ₹{data['Rent']?.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Maintenance: ₹{data['Maintenance Charge']?.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Energy: ₹{data['Energy Charges']?.toLocaleString()}
                  </Typography>
                  <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                    Total: ₹{data['Total (Rent)']?.toLocaleString()}
                  </Typography>
                  <Chip 
                    label={data['Status']} 
                    color={data['Status'] === 'Paid' ? 'success' : 'warning'}
                    sx={{ mt: 1 }}
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );

  const TenantConfigTab = () => (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h4" gutterBottom>
        Tenant Configuration
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tenant</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Base Rent</TableCell>
              <TableCell>Maintenance</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tenantConfigs.map((tenant) => (
              <TableRow key={tenant.tenantKey}>
                <TableCell>{tenant.tenantKey}</TableCell>
                <TableCell>{tenant.name}</TableCell>
                <TableCell>{tenant.phone}</TableCell>
                <TableCell>₹{tenant.baseRent?.toLocaleString()}</TableCell>
                <TableCell>₹{tenant.maintenance?.toLocaleString()}</TableCell>
                <TableCell>
                  <Chip 
                    label={dashboardData[tenant.tenantKey]?.['Status'] || 'Pending'} 
                    color={dashboardData[tenant.tenantKey]?.['Status'] === 'Paid' ? 'success' : 'warning'}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const PaymentReportTab = () => (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h4" gutterBottom>
        Payment Report
      </Typography>
      <Alert severity="info" sx={{ mb: 2 }}>
        This is a demo version. Real payment reports require backend connectivity.
      </Alert>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary">
                Total Paid (August 25)
              </Typography>
              <Typography variant="h4">
                ₹87,820
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary">
                Total Tenants
              </Typography>
              <Typography variant="h4">
                3
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary">
                Average Rent
              </Typography>
              <Typography variant="h4">
                ₹29,273
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return <DashboardTab />;
      case 1:
        return <TenantConfigTab />;
      case 2:
        return <PaymentReportTab />;
      default:
        return <DashboardTab />;
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Rent Management System - Demo
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="xl" sx={{ mt: 2 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          This is a demo version with sample data. For full functionality, deploy with backend.
        </Alert>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab icon={<DashboardIcon />} label="Dashboard" />
            <Tab icon={<PeopleIcon />} label="Tenant Config" />
            <Tab icon={<AssessmentIcon />} label="Payment Report" />
          </Tabs>
        </Box>
        
        {renderTabContent()}
      </Container>
    </Box>
  );
}

export default DemoApp; 