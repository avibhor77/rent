import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/apiService';

// Custom hook for managing application data
export const useAppData = (selectedMonth) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [rentData, setRentData] = useState([]);
  const [meterData, setMeterData] = useState([]);
  const [tenantConfigs, setTenantConfigs] = useState({});
  const [auditData, setAuditData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getDashboardData(selectedMonth);
      if (data.success) {
        setDashboardData(data.data);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);

  // Load rent data
  const loadRentData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getRentData();
      if (data.success) {
        setRentData(data.data);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error loading rent data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load meter data
  const loadMeterData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getMeterData();
      if (data.success) {
        setMeterData(data.data);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error loading meter data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load tenant configs
  const loadTenantConfigs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getTenantConfigs();
      if (data.success) {
        setTenantConfigs(data.data);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error loading tenant configs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load audit data
  const loadAuditData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getAuditLog();
      if (data.success) {
        setAuditData(data.data);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error loading audit data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load all data
  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [dashboardRes, rentRes, meterRes, tenantRes] = await Promise.all([
        apiService.getDashboardData(selectedMonth),
        apiService.getRentData(),
        apiService.getMeterData(),
        apiService.getTenantConfigs()
      ]);

      if (dashboardRes.success) setDashboardData(dashboardRes.data);
      if (rentRes.success) setRentData(rentRes.data);
      if (meterRes.success) setMeterData(meterRes.data);
      if (tenantRes.success) setTenantConfigs(tenantRes.data);
    } catch (err) {
      setError(err.message);
      console.error('Error loading all data:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);

  // Initial data load
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  return {
    // Data
    dashboardData,
    rentData,
    meterData,
    tenantConfigs,
    auditData,
    loading,
    error,
    
    // Actions
    loadDashboardData,
    loadRentData,
    loadMeterData,
    loadTenantConfigs,
    loadAuditData,
    loadAllData,
    
    // Setters
    setDashboardData,
    setRentData,
    setMeterData,
    setTenantConfigs,
    setAuditData
  };
};
