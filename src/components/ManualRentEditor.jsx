import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';

const ManualRentEditor = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch('/api/manual-rent-data');
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch data');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e, rowIndex, columnId) => {
    const newData = [...data];
    newData[rowIndex][columnId] = e.target.value;
    setData(newData);
  };

  const handleSaveChanges = async () => {
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch('/api/manual-rent-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data }),
      });
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Failed to save data');
      }
      setSuccess('Changes saved successfully!');
      fetchData(); // Refresh data after saving
    } catch (err) {
      setError(`Error saving changes: ${err.message}`);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  const columns = data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Edit Manual Rent Data
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      <TableContainer component={Paper}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column} sx={{ fontWeight: 'bold' }}>{column}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map((column) => (
                  <TableCell key={column}>
                    <TextField
                      variant="standard"
                      value={row[column] || ''}
                      onChange={(e) => handleInputChange(e, rowIndex, column)}
                      fullWidth
                      InputProps={{ disableUnderline: true }}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Button
        variant="contained"
        color="primary"
        onClick={handleSaveChanges}
        sx={{ mt: 2 }}
      >
        Save Changes
      </Button>
    </Box>
  );
};

export default ManualRentEditor;
