import React, { useState, useEffect, useMemo } from 'react';
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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  CircularProgress,
  Alert
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon } from '@mui/icons-material';
import apiService from '../services/apiService';

const TenantConfigTab = ({ onMessage }) => {
  const [tenantConfigs, setTenantConfigs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [configForm, setConfigForm] = useState({
    tenant: '',
    name: '',
    phone: '',
    address: '',
    floor: '',
    baseRent: '',
    maintenance: '',
    misc: '',
    rentStartMonth: ''
  });

  // Load tenant configs
  useEffect(() => {
    const loadConfigs = async () => {
      try {
        setLoading(true);
        const data = await apiService.getTenantConfigs();
        if (data.success) {
          setTenantConfigs(data.data);
        }
      } catch (err) {
        onMessage('Error loading tenant configs: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    loadConfigs();
  }, [onMessage]);

  const handleAddConfig = () => {
    setEditingConfig(null);
    setConfigForm({
      tenant: '',
      name: '',
      phone: '',
      address: '',
      floor: '',
      baseRent: '',
      maintenance: '',
      misc: '',
      rentStartMonth: ''
    });
    setEditDialogOpen(true);
  };

  const handleEditConfig = (config) => {
    setEditingConfig(config);
    setConfigForm({
      tenant: config.tenantKey || '',
      name: config.name || '',
      phone: config.phone || '',
      address: config.address || '',
      floor: config.floor || '',
      baseRent: config.baseRent || '',
      maintenance: config.maintenance || '',
      misc: config.misc || '',
      rentStartMonth: config.rentStartMonth || ''
    });
    setEditDialogOpen(true);
  };

  const handleSaveConfig = async () => {
    try {
      setLoading(true);
      const result = await apiService.updateTenantConfig(configForm);
      
      if (result.success) {
        onMessage('Tenant configuration saved successfully');
        setEditDialogOpen(false);
        // Reload configs
        const data = await apiService.getTenantConfigs();
        if (data.success) {
          setTenantConfigs(data.data);
        }
      } else {
        onMessage('Error saving tenant configuration: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      onMessage('Error saving tenant configuration: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && tenantConfigs.length === 0) {
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
          Tenant Configuration
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddConfig}
          className="btn-primary"
        >
          Add Tenant
        </Button>
      </Box>

      <Card className="card">
        <CardContent className="card-content">
          {tenantConfigs.length === 0 ? (
            <Alert severity="info">
              No tenant configurations found. Click "Add Tenant" to create one.
            </Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table className="table">
                <TableHead>
                  <TableRow>
                    <TableCell>Tenant</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Floor</TableCell>
                    <TableCell>Base Rent</TableCell>
                    <TableCell>Maintenance</TableCell>
                    <TableCell>Misc Charges</TableCell>
                    <TableCell>Rent Start Month</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.values(tenantConfigs).map((config, index) => (
                    <TableRow key={index}>
                      <TableCell>{config.tenantKey}</TableCell>
                      <TableCell>{config.name}</TableCell>
                      <TableCell>{config.phone}</TableCell>
                      <TableCell>{config.floor}</TableCell>
                      <TableCell>₹{config.baseRent?.toLocaleString() || 0}</TableCell>
                      <TableCell>₹{config.maintenance?.toLocaleString() || 0}</TableCell>
                      <TableCell>₹{config.misc?.toLocaleString() || 0}</TableCell>
                      <TableCell>{config.rentStartMonth}</TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => handleEditConfig(config)}
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
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
        className="dialog"
      >
        <DialogTitle className="dialog-title">
          {editingConfig ? 'Edit Tenant Configuration' : 'Add New Tenant'}
        </DialogTitle>
        <DialogContent className="dialog-content">
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="tenant-key"
                name="tenantKey"
                label="Tenant Key"
                value={configForm.tenant}
                onChange={(e) => setConfigForm(prev => ({ ...prev, tenant: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="tenant-name"
                name="tenantName"
                label="Full Name"
                value={configForm.name}
                onChange={(e) => setConfigForm(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="tenant-phone"
                name="tenantPhone"
                label="Phone Number"
                value={configForm.phone}
                onChange={(e) => setConfigForm(prev => ({ ...prev, phone: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="tenant-floor"
                name="tenantFloor"
                label="Floor"
                value={configForm.floor}
                onChange={(e) => setConfigForm(prev => ({ ...prev, floor: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="tenant-address"
                name="tenantAddress"
                label="Address"
                multiline
                rows={2}
                value={configForm.address}
                onChange={(e) => setConfigForm(prev => ({ ...prev, address: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                id="base-rent"
                name="baseRent"
                label="Base Rent"
                type="number"
                value={configForm.baseRent}
                onChange={(e) => setConfigForm(prev => ({ ...prev, baseRent: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                id="maintenance"
                name="maintenance"
                label="Maintenance"
                type="number"
                value={configForm.maintenance}
                onChange={(e) => setConfigForm(prev => ({ ...prev, maintenance: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                id="misc-charges"
                name="miscCharges"
                label="Misc Charges"
                type="number"
                value={configForm.misc}
                onChange={(e) => setConfigForm(prev => ({ ...prev, misc: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="rent-start-month"
                name="rentStartMonth"
                label="Rent Start Month"
                value={configForm.rentStartMonth}
                onChange={(e) => setConfigForm(prev => ({ ...prev, rentStartMonth: e.target.value }))}
                placeholder="e.g., January 24"
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions className="dialog-actions">
          <Button onClick={() => setEditDialogOpen(false)} className="btn-secondary">
            Cancel
          </Button>
          <Button
            onClick={handleSaveConfig}
            variant="contained"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Configuration'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TenantConfigTab;
