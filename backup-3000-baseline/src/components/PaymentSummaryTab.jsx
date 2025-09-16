import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import { Edit as EditIcon, Save as SaveIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { formatCurrency } from '../utils/dateUtils';
import { PAYMENT_STATUS } from '../utils/constants';
import apiService from '../services/apiService';

const PaymentSummaryTab = ({ onMessage }) => {
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
    status: PAYMENT_STATUS.NOT_PAID
  });

  // Load payment data from CSV
  const loadPaymentData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiService.getRentData();
      const result = await response;
      
      if (result.success && result.data) {
        // Transform the data into a flat structure for the summary table
        const summaryData = result.data.map(row => ({
          id: `${row.Month}_${row.Tenant}`,
          month: row.Month,
          tenant: row.Tenant,
          tenantName: row.Name,
          totalRent: parseFloat(row.TotalRent) || 0,
          baseRent: parseFloat(row.BaseRent) || 0,
          maintenance: parseFloat(row.Maintenance) || 0,
          energyCharges: parseFloat(row.EnergyCharges) || 0,
          gasBill: 0, // Not in current data structure
          status: row.Status || PAYMENT_STATUS.NOT_PAID
        }));
        
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
      onMessage('Error loading payment data: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [onMessage]);

  // Load data on component mount
  useEffect(() => {
    loadPaymentData();
  }, [loadPaymentData]);

  // Handle edit button click
  const handleEdit = useCallback((record) => {
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
  }, []);

  // Handle form field changes
  const handleFormChange = useCallback((field, value) => {
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

  // Handle save
  const handleSave = useCallback(async () => {
    try {
      setLoading(true);
      
      const data = {
        tenantKey: editForm.tenant,
        month: editForm.month,
        baseRent: parseFloat(editForm.baseRent) || 0,
        maintenance: parseFloat(editForm.maintenance) || 0,
        energyCharges: parseFloat(editForm.energyCharges) || 0,
        gasBill: parseFloat(editForm.gasBill) || 0,
        totalRent: parseFloat(editForm.totalRent) || 0,
        status: editForm.status
      };

      const result = await apiService.adjustRent(data);
      
      if (result.success) {
        onMessage('Payment record updated successfully');
        setEditDialogOpen(false);
        await loadPaymentData(); // Reload data
      } else {
        onMessage('Error updating payment record: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error saving payment record:', error);
      onMessage('Error saving payment record: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [editForm, onMessage, loadPaymentData]);

  // Calculate totals
  const totals = useMemo(() => {
    return paymentData.reduce((acc, record) => {
      acc.totalRent += record.totalRent;
      acc.baseRent += record.baseRent;
      acc.maintenance += record.maintenance;
      acc.energyCharges += record.energyCharges;
      acc.gasBill += record.gasBill;
      return acc;
    }, {
      totalRent: 0,
      baseRent: 0,
      maintenance: 0,
      energyCharges: 0,
      gasBill: 0
    });
  }, [paymentData]);

  if (loading && paymentData.length === 0) {
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
          Payment Summary
        </Typography>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={loadPaymentData}
          disabled={loading}
          className="btn-primary"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
      </Box>

      <Card className="card">
        <CardContent className="card-content">
          {loading ? (
            <Box className="loading-container">
              <CircularProgress />
            </Box>
          ) : paymentData.length === 0 ? (
            <Alert severity="info">
              No payment data available
            </Alert>
          ) : (
            <>
              <TableContainer component={Paper}>
                <Table className="table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Month</TableCell>
                      <TableCell>Tenant</TableCell>
                      <TableCell align="right">Base Rent</TableCell>
                      <TableCell align="right">Maintenance</TableCell>
                      <TableCell align="right">Energy Charges</TableCell>
                      <TableCell align="right">Gas Bill</TableCell>
                      <TableCell align="right">Total Rent</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paymentData.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{record.month}</TableCell>
                        <TableCell>{record.tenantName}</TableCell>
                        <TableCell align="right">{formatCurrency(record.baseRent)}</TableCell>
                        <TableCell align="right">{formatCurrency(record.maintenance)}</TableCell>
                        <TableCell align="right">{formatCurrency(record.energyCharges)}</TableCell>
                        <TableCell align="right">{formatCurrency(record.gasBill)}</TableCell>
                        <TableCell align="right" style={{ fontWeight: 'bold' }}>
                          {formatCurrency(record.totalRent)}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={record.status}
                            color={record.status === PAYMENT_STATUS.PAID ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<EditIcon />}
                            onClick={() => handleEdit(record)}
                            className="btn-secondary"
                          >
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Totals Row */}
              <Box marginTop={2} padding={2} backgroundColor="#f8f9fa" borderRadius={1}>
                <Typography variant="h6" gutterBottom>
                  Totals
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={2}>
                    <Typography variant="body2" color="textSecondary">
                      Base Rent
                    </Typography>
                    <Typography variant="h6">
                      {formatCurrency(totals.baseRent)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={2}>
                    <Typography variant="body2" color="textSecondary">
                      Maintenance
                    </Typography>
                    <Typography variant="h6">
                      {formatCurrency(totals.maintenance)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={2}>
                    <Typography variant="body2" color="textSecondary">
                      Energy Charges
                    </Typography>
                    <Typography variant="h6">
                      {formatCurrency(totals.energyCharges)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={2}>
                    <Typography variant="body2" color="textSecondary">
                      Gas Bill
                    </Typography>
                    <Typography variant="h6">
                      {formatCurrency(totals.gasBill)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={2}>
                    <Typography variant="body2" color="textSecondary">
                      Total Rent
                    </Typography>
                    <Typography variant="h5" style={{ color: '#1976d2', fontWeight: 'bold' }}>
                      {formatCurrency(totals.totalRent)}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </>
          )}
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
          Edit Payment Record
        </DialogTitle>
        <DialogContent className="dialog-content">
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="edit-month"
                name="editMonth"
                label="Month"
                value={editForm.month}
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="edit-tenant"
                name="editTenant"
                label="Tenant"
                value={editForm.tenant}
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="edit-base-rent"
                name="editBaseRent"
                label="Base Rent"
                type="number"
                value={editForm.baseRent}
                onChange={(e) => handleFormChange('baseRent', e.target.value)}
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
                onChange={(e) => handleFormChange('maintenance', e.target.value)}
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
                onChange={(e) => handleFormChange('energyCharges', e.target.value)}
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
                onChange={(e) => handleFormChange('gasBill', e.target.value)}
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
                  onChange={(e) => handleFormChange('status', e.target.value)}
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
            onClick={handleSave}
            variant="contained"
            startIcon={<SaveIcon />}
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaymentSummaryTab;
