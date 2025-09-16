import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const AuditLogTab = ({ selectedMonth, selectedTenant, onMessage }) => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Audit Log
      </Typography>
      <Card className="card">
        <CardContent className="card-content">
          <Typography variant="body1">
            Audit log will be implemented here.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AuditLogTab;
