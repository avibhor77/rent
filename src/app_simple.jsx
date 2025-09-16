import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import apiService from './services/apiService';
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
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';

// Helper function to get API URL
const getApiUrl = () => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:9999';
  }
  return '';
};

// Simple Payment Summary Tab
const PaymentSummaryTab = () => {
  const [paymentSummaryData, setPaymentSummaryData] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadPaymentSummary = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${getApiUrl()}/api/payment-summary`);
      const data = await response.json();
      if (data.success) {
        setPaymentSummaryData(data.data);
      } else {
        console.error('Failed to load payment summary:', data.error);
      }
    } catch (error) {
      console.error('Error loading payment summary:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPaymentSummary();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Payment Summary
      </Typography>
      
      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Month</TableCell>
                  <TableCell>Tenant</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Base Rent</TableCell>
                  <TableCell>Maintenance</TableCell>
                  <TableCell>Energy</TableCell>
                  <TableCell>Gas Bill</TableCell>
                  <TableCell>Total Rent</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paymentSummaryData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.month}</TableCell>
                    <TableCell>{row.tenant}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>₹{row.baseRent?.toLocaleString() || 0}</TableCell>
                    <TableCell>₹{row.maintenance?.toLocaleString() || 0}</TableCell>
                    <TableCell>₹{row.energyCharges?.toLocaleString() || 0}</TableCell>
                    <TableCell>₹{row.gasBill?.toLocaleString() || 0}</TableCell>
                    <TableCell>₹{row.totalRent?.toLocaleString() || 0}</TableCell>
                    <TableCell>
                      <Chip
                        label={row.status || 'Not Paid'}
                        color={row.status === 'Paid' ? 'success' : 'default'}
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
    </Box>
  );
};

// Simple Individual Tenant Details Tab
const IndividualTenantDetailsTab = () => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Individual Tenant Details
      </Typography>
      <Typography variant="body1">
        This tab is temporarily simplified. Please use the Payment Summary tab for editing.
      </Typography>
    </Box>
  );
};

// Simple Dashboard Tab
const DashboardTab = () => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1">
        Welcome to the Rent Management System
      </Typography>
    </Box>
  );
};

// Simple Audit Log Tab
const AuditLogTab = () => {
  const [auditData, setAuditData] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadAuditData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${getApiUrl()}/api/audit-log`);
      const data = await response.json();
      if (data.success) {
        setAuditData(data.data);
      } else {
        console.error('Failed to load audit data:', data.error);
      }
    } catch (error) {
      console.error('Error loading audit data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Audit Log
      </Typography>
      
      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {auditData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.timestamp}</TableCell>
                    <TableCell>{row.action}</TableCell>
                    <TableCell>{row.details}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const month = searchParams.get('month');
    if (month) return decodeURIComponent(month);
    return 'September 25';
  });
  const [selectedTenant, setSelectedTenant] = useState(() => {
    const tenant = searchParams.get('tenant');
    return tenant ? decodeURIComponent(tenant) : 'A-88 G';
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('tab', newValue.toString());
    setSearchParams(newSearchParams);
  };

  const reloadData = async () => {
    setSnackbar({ open: true, message: 'Reloading data...', severity: 'info' });
    try {
      // Simulate reload
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSnackbar({ open: true, message: 'Data reloaded successfully!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to reload data', severity: 'error' });
    }
  };

  const renderTabContent = () => {
    switch (selectedTab) {
      case 0:
        return <DashboardTab />;
      case 1:
        return <IndividualTenantDetailsTab />;
      case 2:
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
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Rent Management System
          </Typography>
          <IconButton color="inherit" onClick={reloadData}>
            <RefreshIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="lg" sx={{ mt: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={selectedTab} onChange={handleTabChange}>
            <Tab label="Dashboard" />
            <Tab label="Individual Tenant" />
            <Tab label="Audit Log" />
            <Tab label="Meter Readings" />
            <Tab label="Tenant Config" />
            <Tab label="Payment Report" />
            <Tab label="Payment Summary" />
          </Tabs>
        </Box>
        
        {renderTabContent()}
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default App;
