import React, { useState, useEffect } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import apiService from '../services/apiService';

const MeterReadingsTab = ({ selectedMonth, onMonthChange, onMessage }) => {
  const [meterData, setMeterData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load meter data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiService.getMeterData();
        if (data.success) {
          setMeterData(data.data);
        }
      } catch (err) {
        setError(err.message);
        onMessage('Error loading meter data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [onMessage]);

  // Get available months
  const availableMonths = [...new Set(meterData.map(row => row.Month))].sort();

  // Filter data for selected month
  const currentMonthData = meterData.filter(row => row.Month === selectedMonth);

  if (loading) {
    return (
      <Box className="loading-container">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        Error loading meter data: {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom={3}>
        <Typography variant="h4">
          Meter Readings
        </Typography>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Select Month</InputLabel>
          <Select
            value={selectedMonth}
            onChange={(e) => onMonthChange(e.target.value)}
            label="Select Month"
          >
            {availableMonths.map(month => (
              <MenuItem key={month} value={month}>
                {month}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Card className="card">
        <CardContent className="card-content">
          {currentMonthData.length === 0 ? (
            <Alert severity="info">
              No meter readings available for {selectedMonth}
            </Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table className="table">
                <TableHead>
                  <TableRow>
                    <TableCell>Month</TableCell>
                    <TableCell>Tenant</TableCell>
                    <TableCell>Main Meter</TableCell>
                    <TableCell>First Floor</TableCell>
                    <TableCell>Second Floor</TableCell>
                    <TableCell>Water</TableCell>
                    <TableCell>Total Units</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentMonthData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.Month}</TableCell>
                      <TableCell>{row.Tenant}</TableCell>
                      <TableCell>{row.MainMeter || 0}</TableCell>
                      <TableCell>{row.FirstFloor || 0}</TableCell>
                      <TableCell>{row.SecondFloor || 0}</TableCell>
                      <TableCell>{row.Water || 0}</TableCell>
                      <TableCell>
                        {(parseFloat(row.MainMeter) || 0) + 
                         (parseFloat(row.FirstFloor) || 0) + 
                         (parseFloat(row.SecondFloor) || 0) + 
                         (parseFloat(row.Water) || 0)}
                      </TableCell>
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

export default MeterReadingsTab;
