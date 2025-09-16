import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const PaymentReportTab = ({ selectedMonth, selectedTenant, onMessage }) => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Payment Report
      </Typography>
      <Card className="card">
        <CardContent className="card-content">
          <Typography variant="body1">
            Payment reports will be implemented here.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PaymentReportTab;
