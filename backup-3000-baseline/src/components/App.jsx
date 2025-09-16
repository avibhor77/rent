import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Tabs,
  Tab,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Receipt as ReceiptIcon,
  Speed as SpeedIcon,
  Assessment as AssessmentIcon,
  History as HistoryIcon,
  Payment as PaymentIcon
} from '@mui/icons-material';

// Import components
import DashboardTab from './DashboardTab';
import IndividualTenantTab from './IndividualTenantTab';
import TenantConfigTab from './TenantConfigTab';
import MeterReadingsTab from './MeterReadingsTab';
import PaymentReportTab from './PaymentReportTab';
import AuditLogTab from './AuditLogTab';
import PaymentSummaryTab from './PaymentSummaryTab';

// Import styles
import '../styles/App.css';

const App = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState('September 25');
  const [selectedTenant, setSelectedTenant] = useState('A-88 G');
  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // Initialize from URL params
  useEffect(() => {
    const tab = parseInt(searchParams.get('tab')) || 0;
    const month = searchParams.get('month') || 'September 25';
    const tenant = searchParams.get('tenant') || 'A-88 G';
    
    setActiveTab(tab);
    setSelectedMonth(month);
    setSelectedTenant(tenant);
  }, [searchParams]);

  // Update URL when state changes
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('tab', activeTab.toString());
    params.set('month', selectedMonth);
    params.set('tenant', selectedTenant);
    setSearchParams(params);
  }, [activeTab, selectedMonth, selectedTenant, setSearchParams]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleMonthChange = (month) => {
    setSelectedMonth(month);
  };

  const handleTenantChange = (tenant) => {
    setSelectedTenant(tenant);
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setOpenSnackbar(true);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const renderTabContent = () => {
    const commonProps = {
      selectedMonth,
      selectedTenant,
      onMonthChange: handleMonthChange,
      onTenantChange: handleTenantChange,
      onMessage: showMessage
    };

    switch (activeTab) {
      case 0:
        return <DashboardTab {...commonProps} />;
      case 1:
        return <IndividualTenantTab {...commonProps} />;
      case 2:
        return <TenantConfigTab {...commonProps} />;
      case 3:
        return <MeterReadingsTab {...commonProps} />;
      case 4:
        return <PaymentReportTab {...commonProps} />;
      case 5:
        return <AuditLogTab {...commonProps} />;
      case 6:
        return <PaymentSummaryTab {...commonProps} />;
      default:
        return <DashboardTab {...commonProps} />;
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
              icon={<HistoryIcon />}
              label="Audit Log"
              iconPosition="start"
            />
            <Tab
              icon={<PaymentIcon />}
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
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          sx={{ width: '100%' }}
        >
          {message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default App;
