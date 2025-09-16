import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Tooltip
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

const PaymentSummaryCsvEditor = () => {
  const [csvData, setCsvData] = useState([]);
  const [editingRow, setEditingRow] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newRow, setNewRow] = useState({});

  // Load data from API
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/payment-summary');
      if (!response.ok) {
        throw new Error('Failed to fetch payment summary data');
      }
      const result = await response.json();
      if (result.success) {
        setCsvData(result.data || []);
      } else {
        throw new Error(result.message || 'Failed to load data');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle edit start
  const handleEditStart = (row) => {
    setEditingRow(row.id);
    setEditForm({ ...row });
  };

  // Handle edit cancel
  const handleEditCancel = () => {
    setEditingRow(null);
    setEditForm({});
  };

  // Handle edit save
  const handleEditSave = async () => {
    try {
      setLoading(true);
      
      // Update the local state
      setCsvData(prevData => 
        prevData.map(row => 
          row.id === editingRow ? { ...editForm } : row
        )
      );
      
      // Here you would typically send the update to your API
      // For now, we'll just show success
      setMessage('Row updated successfully!');
      setSuccess(true);
      setEditingRow(null);
      setEditForm({});
      
      // Reload data after a short delay to show the loader
      setTimeout(() => {
        loadData();
      }, 1000);
      
    } catch (err) {
      setError('Failed to save changes');
      console.error('Error saving:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle add new row
  const handleAddNew = () => {
    setNewRow({
      month: '',
      tenant: '',
      name: '',
      phone: '',
      floor: '',
      baseRent: 0,
      maintenance: 0,
      energyCharges: 0,
      totalRent: 0,
      gasBill: 0,
      status: 'Not Paid'
    });
    setShowAddDialog(true);
  };

  // Handle save new row
  const handleSaveNew = async () => {
    try {
      setLoading(true);
      
      const newId = `${newRow.month}_${newRow.tenant}`;
      const newRowWithId = { ...newRow, id: newId };
      
      setCsvData(prevData => [...prevData, newRowWithId]);
      setMessage('New row added successfully!');
      setSuccess(true);
      setShowAddDialog(false);
      setNewRow({});
      
      // Reload data after a short delay
      setTimeout(() => {
        loadData();
      }, 1000);
      
    } catch (err) {
      setError('Failed to add new row');
      console.error('Error adding row:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete row
  const handleDelete = async (rowId) => {
    if (window.confirm('Are you sure you want to delete this row?')) {
      try {
        setLoading(true);
        
        setCsvData(prevData => prevData.filter(row => row.id !== rowId));
        setMessage('Row deleted successfully!');
        setSuccess(true);
        
        // Reload data after a short delay
        setTimeout(() => {
          loadData();
        }, 1000);
        
      } catch (err) {
        setError('Failed to delete row');
        console.error('Error deleting row:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle manual refresh
  const handleManualRefresh = () => {
    loadData();
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Get status color
  const getStatusColor = (status) => {
    return status === 'Paid' ? 'success' : 'error';
  };

  if (loading && csvData.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading payment summary data...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header with refresh button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Payment Summary CSV Editor
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh Data">
            <IconButton onClick={handleManualRefresh} color="primary" disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddNew}
            disabled={loading}
          >
            Add New Row
          </Button>
        </Box>
      </Box>

      {/* Loading indicator */}
      {loading && (
        <Alert severity="info" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <CircularProgress size={20} sx={{ mr: 1 }} />
          {csvData.length > 0 ? 'Refreshing data...' : 'Loading data...'}
        </Alert>
      )}

      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* CSV Table */}
      <TableContainer component={Paper} sx={{ maxHeight: 600, overflow: 'auto' }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, minWidth: 100 }}>Month</TableCell>
              <TableCell sx={{ fontWeight: 600, minWidth: 120 }}>Tenant</TableCell>
              <TableCell sx={{ fontWeight: 600, minWidth: 150 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 600, minWidth: 120 }}>Phone</TableCell>
              <TableCell sx={{ fontWeight: 600, minWidth: 80 }}>Floor</TableCell>
              <TableCell sx={{ fontWeight: 600, minWidth: 100 }}>Base Rent</TableCell>
              <TableCell sx={{ fontWeight: 600, minWidth: 100 }}>Maintenance</TableCell>
              <TableCell sx={{ fontWeight: 600, minWidth: 100 }}>Energy</TableCell>
              <TableCell sx={{ fontWeight: 600, minWidth: 100 }}>Total Rent</TableCell>
              <TableCell sx={{ fontWeight: 600, minWidth: 100 }}>Gas Bill</TableCell>
              <TableCell sx={{ fontWeight: 600, minWidth: 100 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600, minWidth: 120 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {csvData.map((row) => (
              <TableRow key={row.id} hover>
                {editingRow === row.id ? (
                  // Edit mode
                  <>
                    <TableCell>
                      <TextField
                        size="small"
                        value={editForm.month || ''}
                        onChange={(e) => setEditForm({ ...editForm, month: e.target.value })}
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        value={editForm.tenant || ''}
                        onChange={(e) => setEditForm({ ...editForm, tenant: e.target.value })}
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        value={editForm.name || ''}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        value={editForm.phone || ''}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        value={editForm.floor || ''}
                        onChange={(e) => setEditForm({ ...editForm, floor: e.target.value })}
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={editForm.baseRent || 0}
                        onChange={(e) => setEditForm({ ...editForm, baseRent: parseFloat(e.target.value) || 0 })}
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={editForm.maintenance || 0}
                        onChange={(e) => setEditForm({ ...editForm, maintenance: parseFloat(e.target.value) || 0 })}
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={editForm.energyCharges || 0}
                        onChange={(e) => setEditForm({ ...editForm, energyCharges: parseFloat(e.target.value) || 0 })}
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={editForm.totalRent || 0}
                        onChange={(e) => setEditForm({ ...editForm, totalRent: parseFloat(e.target.value) || 0 })}
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={editForm.gasBill || 0}
                        onChange={(e) => setEditForm({ ...editForm, gasBill: parseFloat(e.target.value) || 0 })}
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        select
                        value={editForm.status || 'Not Paid'}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                        fullWidth
                      >
                        <option value="Paid">Paid</option>
                        <option value="Not Paid">Not Paid</option>
                      </TextField>
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={handleEditSave} color="primary">
                        <SaveIcon />
                      </IconButton>
                      <IconButton size="small" onClick={handleEditCancel} color="secondary">
                        <CancelIcon />
                      </IconButton>
                    </TableCell>
                  </>
                ) : (
                  // View mode
                  <>
                    <TableCell sx={{ fontWeight: 500 }}>{row.month}</TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{row.tenant}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.phone}</TableCell>
                    <TableCell>{row.floor}</TableCell>
                    <TableCell>{formatCurrency(row.baseRent || 0)}</TableCell>
                    <TableCell>{formatCurrency(row.maintenance || 0)}</TableCell>
                    <TableCell>{formatCurrency(row.energyCharges || 0)}</TableCell>
                    <TableCell>{formatCurrency(row.totalRent || 0)}</TableCell>
                    <TableCell>{formatCurrency(row.gasBill || 0)}</TableCell>
                    <TableCell>
                      <Chip
                        label={row.status}
                        color={getStatusColor(row.status)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleEditStart(row)}
                        color="primary"
                        disabled={loading}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(row.id)}
                        color="error"
                        disabled={loading}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add New Row Dialog */}
      <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Payment Record</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mt: 1 }}>
            <TextField
              label="Month"
              value={newRow.month || ''}
              onChange={(e) => setNewRow({ ...newRow, month: e.target.value })}
              fullWidth
              size="small"
            />
            <TextField
              label="Tenant"
              value={newRow.tenant || ''}
              onChange={(e) => setNewRow({ ...newRow, tenant: e.target.value })}
              fullWidth
              size="small"
            />
            <TextField
              label="Name"
              value={newRow.name || ''}
              onChange={(e) => setNewRow({ ...newRow, name: e.target.value })}
              fullWidth
              size="small"
            />
            <TextField
              label="Phone"
              value={newRow.phone || ''}
              onChange={(e) => setNewRow({ ...newRow, phone: e.target.value })}
              fullWidth
              size="small"
            />
            <TextField
              label="Floor"
              value={newRow.floor || ''}
              onChange={(e) => setNewRow({ ...newRow, floor: e.target.value })}
              fullWidth
              size="small"
            />
            <TextField
              label="Base Rent"
              type="number"
              value={newRow.baseRent || 0}
              onChange={(e) => setNewRow({ ...newRow, baseRent: parseFloat(e.target.value) || 0 })}
              fullWidth
              size="small"
            />
            <TextField
              label="Maintenance"
              type="number"
              value={newRow.maintenance || 0}
              onChange={(e) => setNewRow({ ...newRow, maintenance: parseFloat(e.target.value) || 0 })}
              fullWidth
              size="small"
            />
            <TextField
              label="Energy Charges"
              type="number"
              value={newRow.energyCharges || 0}
              onChange={(e) => setNewRow({ ...newRow, energyCharges: parseFloat(e.target.value) || 0 })}
              fullWidth
              size="small"
            />
            <TextField
              label="Total Rent"
              type="number"
              value={newRow.totalRent || 0}
              onChange={(e) => setNewRow({ ...newRow, totalRent: parseFloat(e.target.value) || 0 })}
              fullWidth
              size="small"
            />
            <TextField
              label="Gas Bill"
              type="number"
              value={newRow.gasBill || 0}
              onChange={(e) => setNewRow({ ...newRow, gasBill: parseFloat(e.target.value) || 0 })}
              fullWidth
              size="small"
            />
            <TextField
              label="Status"
              select
              value={newRow.status || 'Not Paid'}
              onChange={(e) => setNewRow({ ...newRow, status: e.target.value })}
              fullWidth
              size="small"
            >
              <option value="Paid">Paid</option>
              <option value="Not Paid">Not Paid</option>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveNew} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
      >
        <Alert onClose={() => setSuccess(false)} severity="success">
          {message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PaymentSummaryCsvEditor;
