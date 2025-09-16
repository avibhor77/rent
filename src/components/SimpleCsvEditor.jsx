import React, { useState, useEffect } from 'react';
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
  Chip,
  Alert
} from '@mui/material';
import { Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';

const SimpleCsvEditor = ({ selectedTenant, selectedMonth, tenantConfigs, onDataUpdate }) => {
  const [csvData, setCsvData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingRow, setEditingRow] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Load CSV data
  const loadCsvData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:9999/api/rent-data');
      const result = await response.json();
      
      if (result.success) {
        // Convert API data to simple CSV format
        const csvRows = [];
        result.data.forEach(monthData => {
          Object.keys(tenantConfigs).forEach(tenantKey => {
            if (monthData[tenantKey] !== undefined) {
              csvRows.push({
                Month: monthData.month,
                Tenant: tenantKey,
                Name: tenantConfigs[tenantKey]?.name || '',
                Phone: tenantConfigs[tenantKey]?.phone || '',
                Floor: tenantConfigs[tenantKey]?.floor || '',
                BaseRent: monthData[`${tenantKey}_BaseRent`] || 0,
                Maintenance: monthData[`${tenantKey}_Maintenance`] || 0,
                EnergyCharges: monthData[`${tenantKey}_EnergyCharges`] || 0,
                GasBill: monthData[`${tenantKey}_GasBill`] || 0,
                TotalRent: monthData[tenantKey] || 0,
                Status: monthData[`${tenantKey}_Status`] || 'Not Paid',
                Comments: ''
              });
            }
          });
        });
        
        setCsvData(csvRows);
      } else {
        setError('Failed to load data');
      }
    } catch (error) {
      console.error('Error loading CSV data:', error);
      setError('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  // Filter data based on selected tenant and month
  const filteredData = csvData.filter(row => {
    const matchesTenant = !selectedTenant || row.Tenant === selectedTenant;
    const matchesMonth = !selectedMonth || row.Month === selectedMonth;
    return matchesTenant && matchesMonth;
  });

  // Start editing a row
  const handleEdit = (row) => {
    setEditingRow(row);
    setEditForm({
      BaseRent: row.BaseRent.toString(),
      Maintenance: row.Maintenance.toString(),
      EnergyCharges: row.EnergyCharges.toString(),
      GasBill: row.GasBill.toString(),
      Status: row.Status,
      Comments: row.Comments || ''
    });
  };

  // Cancel editing
  const handleCancel = () => {
    setEditingRow(null);
    setEditForm({});
  };

  // Save changes
  const handleSave = async () => {
    try {
      const baseRent = parseFloat(editForm.BaseRent) || 0;
      const maintenance = parseFloat(editForm.Maintenance) || 0;
      const energyCharges = parseFloat(editForm.EnergyCharges) || 0;
      const gasBill = parseFloat(editForm.GasBill) || 0;
      const totalRent = baseRent + maintenance + energyCharges + gasBill;

      const response = await fetch('http://localhost:9999/api/adjust-rent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenant: editingRow.Tenant,
          month: editingRow.Month,
          baseRent: baseRent,
          maintenance: maintenance,
          energyCharges: energyCharges,
          gasBill: gasBill,
          totalRent: totalRent,
          status: editForm.Status
        })
      });

      if (response.ok) {
        // Reload data
        await loadCsvData();
        if (onDataUpdate) {
          onDataUpdate();
        }
        setEditingRow(null);
        setEditForm({});
      } else {
        setError('Failed to save changes');
      }
    } catch (error) {
      console.error('Error saving changes:', error);
      setError('Error saving changes');
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadCsvData();
  }, []);

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Simple CSV Editor
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Selected: {selectedTenant} | {selectedMonth}
      </Typography>

      <TableContainer component={Paper}>
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
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.Month}</TableCell>
                <TableCell>{row.Tenant}</TableCell>
                <TableCell>{row.Name}</TableCell>
                
                {editingRow === row ? (
                  <>
                    <TableCell>
                      <TextField
                        size="small"
                        value={editForm.BaseRent}
                        onChange={(e) => setEditForm({...editForm, BaseRent: e.target.value})}
                        type="number"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        value={editForm.Maintenance}
                        onChange={(e) => setEditForm({...editForm, Maintenance: e.target.value})}
                        type="number"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        value={editForm.EnergyCharges}
                        onChange={(e) => setEditForm({...editForm, EnergyCharges: e.target.value})}
                        type="number"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        value={editForm.GasBill}
                        onChange={(e) => setEditForm({...editForm, GasBill: e.target.value})}
                        type="number"
                      />
                    </TableCell>
                    <TableCell>
                      {(
                        (parseFloat(editForm.BaseRent) || 0) +
                        (parseFloat(editForm.Maintenance) || 0) +
                        (parseFloat(editForm.EnergyCharges) || 0) +
                        (parseFloat(editForm.GasBill) || 0)
                      ).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        select
                        value={editForm.Status}
                        onChange={(e) => setEditForm({...editForm, Status: e.target.value})}
                        SelectProps={{ native: true }}
                      >
                        <option value="Not Paid">Not Paid</option>
                        <option value="Paid">Paid</option>
                        <option value="Partial">Partial</option>
                      </TextField>
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={handleSave} color="primary">
                        <SaveIcon />
                      </IconButton>
                      <IconButton onClick={handleCancel} color="secondary">
                        <CancelIcon />
                      </IconButton>
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell>{row.BaseRent.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</TableCell>
                    <TableCell>{row.Maintenance.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</TableCell>
                    <TableCell>{row.EnergyCharges.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</TableCell>
                    <TableCell>
                      <strong>{row.GasBill.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</strong>
                    </TableCell>
                    <TableCell>{row.TotalRent.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</TableCell>
                    <TableCell>
                      <Chip 
                        label={row.Status} 
                        color={row.Status === 'Paid' ? 'success' : row.Status === 'Partial' ? 'warning' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEdit(row)} color="primary">
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredData.length === 0 && (
        <Typography sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}>
          No data found for the selected tenant and month.
        </Typography>
      )}
    </Box>
  );
};

export default SimpleCsvEditor;