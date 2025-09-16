import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  CircularProgress
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';

const IndividualTenantTab = ({ 
  selectedTenant, 
  selectedMonth, 
  tenantConfigs, 
  rentData, 
  onDataChange,
  onEditTenantConfig 
}) => {
  // Simple state management
  const [loading, setLoading] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    baseRent: '',
    maintenance: '',
    energyCharges: '',
    gasBill: '',
    status: 'Paid'
  });

  // Get current tenant data
  const getCurrentTenantData = () => {
    if (!selectedTenant || !tenantConfigs[selectedTenant]) return null;
    
    const tenantConfig = tenantConfigs[selectedTenant];
    const currentMonthRecord = rentData.find(row => row.month === selectedMonth);
    
    if (!currentMonthRecord) {
      return {
        ...tenantConfig,
        baseRent: tenantConfig.baseRent || 0,
        maintenance: tenantConfig.maintenance || 0,
        energyCharges: 0,
        gasBill: 0,
        totalRent: (tenantConfig.baseRent || 0) + (tenantConfig.maintenance || 0),
        status: 'Not Paid'
      };
    }

    const baseRent = currentMonthRecord[`${selectedTenant}_BaseRent`] || tenantConfig.baseRent || 0;
    const maintenance = currentMonthRecord[`${selectedTenant}_Maintenance`] || tenantConfig.maintenance || 0;
    const energyCharges = currentMonthRecord[`${selectedTenant}_EnergyCharges`] || 0;
    const gasBill = currentMonthRecord[`${selectedTenant}_GasBill`] || 0;
    const totalRent = currentMonthRecord[`${selectedTenant}_TotalRent`] || (baseRent + maintenance + energyCharges + gasBill);
    const status = currentMonthRecord[`${selectedTenant}_Status`] || 'Not Paid';

    return {
      ...tenantConfig,
      baseRent,
      maintenance,
      energyCharges,
      gasBill,
      totalRent,
      status
    };
  };

  const tenantData = getCurrentTenantData();

  // Handle edit button click
  const handleEdit = () => {
    if (!tenantData) return;
    
    setEditForm({
      baseRent: tenantData.baseRent.toString(),
      maintenance: tenantData.maintenance.toString(),
      energyCharges: tenantData.energyCharges.toString(),
      gasBill: tenantData.gasBill.toString(),
      status: tenantData.status
    });
    setEditDialogOpen(true);
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/adjust-rent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant: selectedTenant,
          month: selectedMonth,
          baseRent: parseFloat(editForm.baseRent) || 0,
          maintenance: parseFloat(editForm.maintenance) || 0,
          energyCharges: parseFloat(editForm.energyCharges) || 0,
          gasBill: parseFloat(editForm.gasBill) || 0,
          status: editForm.status
        })
      });

      if (response.ok) {
        setEditDialogOpen(false);
        // Trigger data reload
        if (onDataChange) onDataChange();
      }
    } catch (error) {
      console.error('Error saving payment:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!tenantData) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>No tenant data available</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {tenantData.name} - {selectedMonth}
      </Typography>

      {/* Tenant Info Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Contact Information</Typography>
              <Typography><strong>Phone:</strong> {tenantData.phone}</Typography>
              <Typography><strong>Floor:</strong> {tenantData.floor}</Typography>
              {tenantData.address && (
                <Typography><strong>Address:</strong> {tenantData.address}</Typography>
              )}
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Payment Details</Typography>
              <Typography><strong>Base Rent:</strong> ₹{tenantData.baseRent.toLocaleString()}</Typography>
              <Typography><strong>Maintenance:</strong> ₹{tenantData.maintenance.toLocaleString()}</Typography>
              {tenantData.energyCharges > 0 && (
                <Typography><strong>Energy Charges:</strong> ₹{tenantData.energyCharges.toLocaleString()}</Typography>
              )}
              {tenantData.gasBill > 0 && (
                <Typography><strong>Gas Bill:</strong> ₹{tenantData.gasBill.toLocaleString()}</Typography>
              )}
              <Typography variant="h6" sx={{ mt: 1 }}>
                <strong>Total Rent:</strong> ₹{tenantData.totalRent.toLocaleString()}
              </Typography>
              <Chip 
                label={tenantData.status} 
                color={tenantData.status === 'Paid' ? 'success' : 'error'}
                sx={{ mt: 1 }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <Button 
          variant="contained" 
          onClick={handleEdit}
          disabled={loading}
        >
          Edit Payment Details
        </Button>
        <Button
          variant="outlined"
          size="large"
          onClick={onEditTenantConfig}
          startIcon={<SettingsIcon />}
          color="info"
        >
          Edit Tenant Details
        </Button>
      </Box>

      {/* Payment History Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Payment History</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Month</TableCell>
                  <TableCell>Base Rent</TableCell>
                  <TableCell>Maintenance</TableCell>
                  <TableCell>Energy</TableCell>
                  <TableCell>Gas</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rentData
                  .filter(row => row[`${selectedTenant}_TotalRent`] && row[`${selectedTenant}_TotalRent`] > 0)
                  .slice(0, 12)
                  .map((row) => {
                    const baseRent = row[`${selectedTenant}_BaseRent`] || 0;
                    const maintenance = row[`${selectedTenant}_Maintenance`] || 0;
                    const energyCharges = row[`${selectedTenant}_EnergyCharges`] || 0;
                    const gasBill = row[`${selectedTenant}_GasBill`] || 0;
                    const totalRent = row[`${selectedTenant}_TotalRent`] || (baseRent + maintenance + energyCharges + gasBill);
                    const status = row[`${selectedTenant}_Status`] || 'Not Paid';

                    return (
                      <TableRow key={row.month}>
                        <TableCell>{row.month}</TableCell>
                        <TableCell>₹{baseRent.toLocaleString()}</TableCell>
                        <TableCell>₹{maintenance.toLocaleString()}</TableCell>
                        <TableCell>₹{energyCharges.toLocaleString()}</TableCell>
                        <TableCell>₹{gasBill.toLocaleString()}</TableCell>
                        <TableCell>₹{totalRent.toLocaleString()}</TableCell>
                        <TableCell>
                          <Chip 
                            label={status} 
                            color={status === 'Paid' ? 'success' : 'error'}
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

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Payment Details</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Base Rent"
                  type="number"
                  value={editForm.baseRent}
                  onChange={(e) => setEditForm(prev => ({ ...prev, baseRent: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Maintenance"
                  type="number"
                  value={editForm.maintenance}
                  onChange={(e) => setEditForm(prev => ({ ...prev, maintenance: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Energy Charges"
                  type="number"
                  value={editForm.energyCharges}
                  onChange={(e) => setEditForm(prev => ({ ...prev, energyCharges: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Gas Bill"
                  type="number"
                  value={editForm.gasBill}
                  onChange={(e) => setEditForm(prev => ({ ...prev, gasBill: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Total Rent (Auto-calculated)"
                  type="number"
                  value={(parseFloat(editForm.baseRent) || 0) + (parseFloat(editForm.maintenance) || 0) + (parseFloat(editForm.energyCharges) || 0) + (parseFloat(editForm.gasBill) || 0)}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={editForm.status}
                    onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                    label="Status"
                  >
                    <MenuItem value="Paid">Paid</MenuItem>
                    <MenuItem value="Not Paid">Not Paid</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSaveEdit} 
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : null}
          >
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default IndividualTenantTab;
