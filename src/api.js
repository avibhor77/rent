// API utility for handling environment-based URLs
const API_BASE = process.env.REACT_APP_API_URL || '';

export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  return response.json();
};

export const getApiUrl = (endpoint) => `${API_BASE}${endpoint}`; 