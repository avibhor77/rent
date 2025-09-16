import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import { Refresh as RefreshIcon, FilterList as FilterIcon } from '@mui/icons-material';
import apiService from '../services/apiService';

const AuditLogTab = ({ selectedMonth, selectedTenant, onMessage }) => {
  const [auditData, setAuditData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    activity: '',
    tenant: '',
    month: '',
    limit: 100
  });

  // Load audit data
  const loadAuditData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiService.getAuditLog(filters.limit);
      
      if (response.success && response.data) {
        let filteredData = response.data;
        
        // Apply filters
        if (filters.activity) {
          filteredData = filteredData.filter(entry => 
            entry.Activity.toLowerCase().includes(filters.activity.toLowerCase())
          );
        }
        if (filters.tenant) {
          filteredData = filteredData.filter(entry => 
            entry.Tenant.toLowerCase().includes(filters.tenant.toLowerCase())
          );
        }
        if (filters.month) {
          filteredData = filteredData.filter(entry => 
            entry.Month.toLowerCase().includes(filters.month.toLowerCase())
          );
        }
        
        setAuditData(filteredData);
      }
    } catch (error) {
      console.error('Error loading audit data:', error);
      onMessage('Error loading audit data: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [filters, onMessage]);

  // Load data on component mount and when filters change
  useEffect(() => {
    loadAuditData();
  }, [loadAuditData]);

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Get activity color
  const getActivityColor = (activity) => {
    switch (activity) {
      case 'PAYMENT_MARKED_PAID':
        return 'success';
      case 'RENT_ADJUSTED':
        return 'primary';
      case 'ENERGY_CHARGE_AUTO_UPDATED':
        return 'info';
      case 'METER_READING_ENTERED':
        return 'warning';
      case 'TENANT_CONFIG_UPDATED':
        return 'secondary';
      case 'STATUS_CHANGED':
        return 'error';
      default:
        return 'default';
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch (error) {
      return timestamp;
    }
  };

  if (loading && auditData.length === 0) {
    return (
      <Box className="loading-container">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom={3}>
        <Typography variant="h4">
          Audit Log
        </Typography>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={loadAuditData}
          disabled={loading}
          className="btn-primary"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
      </Box>

      {/* Filters */}
      <Card className="card" style={{ marginBottom: '20px' }}>
        <CardContent className="card-content">
          <Typography variant="h6" gutterBottom>
            <FilterIcon style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Filters
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Activity"
                value={filters.activity}
                onChange={(e) => handleFilterChange('activity', e.target.value)}
                placeholder="e.g., PAYMENT_MARKED_PAID"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Tenant"
                value={filters.tenant}
                onChange={(e) => handleFilterChange('tenant', e.target.value)}
                placeholder="e.g., A-88 G"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Month"
                value={filters.month}
                onChange={(e) => handleFilterChange('month', e.target.value)}
                placeholder="e.g., September 25"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Limit</InputLabel>
                <Select
                  value={filters.limit}
                  onChange={(e) => handleFilterChange('limit', e.target.value)}
                  label="Limit"
                >
                  <MenuItem value={50}>50 entries</MenuItem>
                  <MenuItem value={100}>100 entries</MenuItem>
                  <MenuItem value={200}>200 entries</MenuItem>
                  <MenuItem value={500}>500 entries</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card className="card">
        <CardContent className="card-content">
          {loading ? (
            <Box className="loading-container">
              <CircularProgress />
            </Box>
          ) : auditData.length === 0 ? (
            <Alert severity="info">
              No audit entries found matching your filters
            </Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table className="table">
                <TableHead>
                  <TableRow>
                    <TableCell>Timestamp</TableCell>
                    <TableCell>Activity</TableCell>
                    <TableCell>Month</TableCell>
                    <TableCell>Tenant</TableCell>
                    <TableCell>Details</TableCell>
                    <TableCell>Old Value</TableCell>
                    <TableCell>New Value</TableCell>
                    <TableCell>User</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {auditData.map((entry, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Typography variant="body2" color="textSecondary">
                          {formatTimestamp(entry.Timestamp)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={entry.Activity}
                          color={getActivityColor(entry.Activity)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{entry.Month}</TableCell>
                      <TableCell>{entry.Tenant}</TableCell>
                      <TableCell>
                        <Typography variant="body2" style={{ maxWidth: '200px', wordWrap: 'break-word' }}>
                          {entry.Details}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="textSecondary">
                          {entry.OldValue}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="primary">
                          {entry.NewValue}
                        </Typography>
                      </TableCell>
                      <TableCell>{entry.User}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default AuditLogTab;
