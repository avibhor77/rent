import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import { Edit as EditIcon, Save as SaveIcon } from '@mui/icons-material';
import { useAppData } from '../hooks/useAppData';
import { formatCurrency, isFutureMonth } from '../utils/dateUtils';
import { PAYMENT_STATUS } from '../utils/constants';
import apiService from '../services/apiService';

const IndividualTenantTab = ({ selectedMonth, selectedTenant, onTenantChange, onMessage }) => {
  const [rentData, setRentData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load rent data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await apiService.getRentData();
        if (data.success) {
          setRentData(data.data);
        }
      } catch (err) {
        onMessage('Error loading data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [onMessage]);

  // Get available tenants
  const availableTenants = useMemo(() => {
    const tenants = [...new Set(rentData.map(row => row.Tenant))];
    return tenants.sort();
  }, [rentData]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    baseRent: '',
    maintenance: '',
    energyCharges: '',
    gasBill: '',
    totalRent: '',
    status: PAYMENT_STATUS.NOT_PAID
  });

  // Get current month data for selected tenant
  const currentMonthData = useMemo(() => {
    return rentData.find(row => row.Month === selectedMonth && row.Tenant === selectedTenant);
  }, [rentData, selectedMonth, selectedTenant]);

  // Get selected tenant data
  const selectedTenantData = useMemo(() => {
    if (!currentMonthData) return null;
    
    return {
      tenantKey: selectedTenant,
      name: currentMonthData.Name || selectedTenant,
      phone: currentMonthData.Phone || '',
      address: currentMonthData.Address || '',
      floor: currentMonthData.Floor || '',
      baseRent: parseFloat(currentMonthData.BaseRent) || 0,
      maintenance: parseFloat(currentMonthData.Maintenance) || 0,
      energyCharges: parseFloat(currentMonthData.EnergyCharges) || 0,
      gasBill: 0, // Not in current data structure
      totalRent: parseFloat(currentMonthData.TotalRent) || 0,
      status: currentMonthData.Status || PAYMENT_STATUS.NOT_PAID
    };
  }, [currentMonthData, selectedTenant]);

  // Get rent history for selected tenant
  const rentHistory = useMemo(() => {
    if (!selectedTenant) return [];
    
    return rentData
      .filter(row => row.Tenant === selectedTenant)
      .map(row => ({
        month: row.Month,
        baseRent: parseFloat(row.BaseRent) || 0,
        maintenance: parseFloat(row.Maintenance) || 0,
        energyCharges: parseFloat(row.EnergyCharges) || 0,
        gasBill: 0, // Not in current data structure
        totalRent: parseFloat(row.TotalRent) || 0,
        status: row.Status || PAYMENT_STATUS.NOT_PAID
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
  }, [rentData, selectedTenant]);

  const handleEditClick = useCallback(() => {
    if (!selectedTenantData) return;
    
    setEditForm({
      baseRent: selectedTenantData.baseRent.toString(),
      maintenance: selectedTenantData.maintenance.toString(),
      energyCharges: selectedTenantData.energyCharges.toString(),
      gasBill: selectedTenantData.gasBill.toString(),
      totalRent: selectedTenantData.totalRent.toString(),
      status: selectedTenantData.status
    });
    setEditDialogOpen(true);
  }, [selectedTenantData]);

  const handleEditFormChange = useCallback((field, value) => {
    setEditForm(prev => {
      const newForm = { ...prev, [field]: value };
      
      // Auto-calculate total rent
      if (['baseRent', 'maintenance', 'energyCharges', 'gasBill'].includes(field)) {
        const baseRent = parseFloat(field === 'baseRent' ? value : newForm.baseRent) || 0;
        const maintenance = parseFloat(field === 'maintenance' ? value : newForm.maintenance) || 0;
        const energyCharges = parseFloat(field === 'energyCharges' ? value : newForm.energyCharges) || 0;
        const gasBill = parseFloat(field === 'gasBill' ? value : newForm.gasBill) || 0;
        newForm.totalRent = (baseRent + maintenance + energyCharges + gasBill).toString();
      }
      
      return newForm;
    });
  }, []);

  const handleSaveEdit = useCallback(async () => {
    try {
      const data = {
        tenantKey: selectedTenant,
        month: selectedMonth,
        baseRent: parseFloat(editForm.baseRent) || 0,
        maintenance: parseFloat(editForm.maintenance) || 0,
        energyCharges: parseFloat(editForm.energyCharges) || 0,
        gasBill: parseFloat(editForm.gasBill) || 0,
        totalRent: parseFloat(editForm.totalRent) || 0,
        status: editForm.status
      };

      const result = await apiService.adjustRent(data);
      
      if (result.success) {
        onMessage('Payment details updated successfully');
        setEditDialogOpen(false);
        // Refresh data would be handled by the parent component
      } else {
        onMessage('Error updating payment details: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error saving payment details:', error);
      onMessage('Error saving payment details: ' + error.message);
    }
  }, [selectedTenant, selectedMonth, editForm, onMessage]);

  if (loading) {
    return (
      <Box className="loading-container">
        <CircularProgress />
      </Box>
    );
  }

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
                  value={selectedTenant}
                  onChange={(e) => onTenantChange(e.target.value)}
                  labelId="tenant-select-label"
                  label="Select Tenant"
                >
                  {availableTenants.map(tenant => (
                    <MenuItem key={tenant} value={tenant}>
                      {tenant}
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
              onClick={handleEditClick}
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
                {formatCurrency(selectedTenantData.baseRent)}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="textSecondary">
                Maintenance
              </Typography>
              <Typography variant="h6">
                {formatCurrency(selectedTenantData.maintenance)}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="textSecondary">
                Energy Charges
              </Typography>
              <Typography variant="h6">
                {formatCurrency(selectedTenantData.energyCharges)}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="textSecondary">
                Gas Bill
              </Typography>
              <Typography variant="h6">
                {formatCurrency(selectedTenantData.gasBill)}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="textSecondary">
                Total Rent
              </Typography>
              <Typography variant="h5" style={{ color: '#1976d2', fontWeight: 'bold' }}>
                {formatCurrency(selectedTenantData.totalRent)}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="textSecondary">
                Status
              </Typography>
              <Chip
                label={selectedTenantData.status}
                color={selectedTenantData.status === PAYMENT_STATUS.PAID ? 'success' : 'error'}
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
                    <TableCell>{formatCurrency(record.baseRent)}</TableCell>
                    <TableCell>{formatCurrency(record.maintenance)}</TableCell>
                    <TableCell>{formatCurrency(record.energyCharges)}</TableCell>
                    <TableCell>{formatCurrency(record.gasBill)}</TableCell>
                    <TableCell>{formatCurrency(record.totalRent)}</TableCell>
                    <TableCell>
                      <Chip
                        label={record.status}
                        color={record.status === PAYMENT_STATUS.PAID ? 'success' : 'error'}
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
                onChange={(e) => handleEditFormChange('baseRent', e.target.value)}
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
                onChange={(e) => handleEditFormChange('maintenance', e.target.value)}
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
                onChange={(e) => handleEditFormChange('energyCharges', e.target.value)}
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
                onChange={(e) => handleEditFormChange('gasBill', e.target.value)}
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
                  onChange={(e) => handleEditFormChange('status', e.target.value)}
                  labelId="edit-status-label"
                  label="Status"
                >
                  <MenuItem value={PAYMENT_STATUS.PAID}>Paid</MenuItem>
                  <MenuItem value={PAYMENT_STATUS.NOT_PAID}>Not Paid</MenuItem>
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
            onClick={handleSaveEdit}
            variant="contained"
            startIcon={<SaveIcon />}
            className="btn-primary"
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default IndividualTenantTab;
