// API Service - Centralized API calls
class ApiService {
  constructor() {
    this.baseUrl = this.getApiUrl();
  }

  getApiUrl() {
    // Check if we're in development or production
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:3000';
    }
    return '';
  }

  async makeRequest(endpoint, options = {}) {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Dashboard Data
  async getDashboardData(month) {
    return this.makeRequest(`/api/dashboard-data?month=${encodeURIComponent(month)}`);
  }

  // Rent Data
  async getRentData() {
    return this.makeRequest('/api/rent-data');
  }

  // Meter Data
  async getMeterData() {
    return this.makeRequest('/api/meter-data');
  }

  // Tenant Configs
  async getTenantConfigs() {
    return this.makeRequest('/api/tenant-configs');
  }

  // Audit Log
  async getAuditLog(limit = 200) {
    return this.makeRequest(`/api/audit-log?limit=${limit}`);
  }

  // Payment Report
  async getPaymentReport(period) {
    return this.makeRequest(`/api/payment-report?period=${period}`);
  }

  // Next Month
  async getNextMonth() {
    return this.makeRequest('/api/next-month');
  }

  // Month Exists
  async checkMonthExists(month) {
    return this.makeRequest(`/api/month-exists/${encodeURIComponent(month)}`);
  }

  // Mark Payment Paid
  async markPaymentPaid(tenantKey, month) {
    return this.makeRequest('/api/mark-payment-paid', {
      method: 'POST',
      body: JSON.stringify({ tenantKey, month }),
    });
  }

  // Adjust Rent
  async adjustRent(data) {
    return this.makeRequest('/api/adjust-rent', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Update Tenant Config
  async updateTenantConfig(data) {
    return this.makeRequest('/api/tenant-configs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Reset Tenant Configs
  async resetTenantConfigs() {
    return this.makeRequest('/api/reset-tenant-configs', {
      method: 'POST',
    });
  }

  // Add New Month
  async addNewMonth(tenantKey, monthData) {
    return this.makeRequest('/api/add-new-month', {
      method: 'POST',
      body: JSON.stringify({ tenantKey, ...monthData }),
    });
  }

  // Update Meter Data
  async updateMeterData(tenantKey, month, meterData) {
    return this.makeRequest('/api/update-meter-data', {
      method: 'POST',
      body: JSON.stringify({ tenantKey, month, ...meterData }),
    });
  }

  // Reload Data
  async reloadData() {
    return this.makeRequest('/api/reload-data', {
      method: 'POST',
    });
  }
}

// Create singleton instance
const apiService = new ApiService();
export default apiService;
