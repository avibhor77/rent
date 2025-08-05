# Tenant Rent Management System

A comprehensive web application for managing tenant rent payments, meter readings, and property management with professional reporting capabilities.

## 🚀 Quick Deploy to Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yourusername/rent-app)

**Note**: For full functionality, you'll need to deploy the backend separately. See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## Features

- **Dashboard**: Overview of all tenants and their payment status
- **Tenant Configuration**: Manage tenant information and settings
- **Individual Tenant Details**: View and edit individual tenant rent details
- **Meter Entry**: Input and manage electricity meter readings
- **Payment Reports**: Professional analytics and payment summaries
- **CSV Backend**: All data is stored and updated in CSV format
- **Real-time Updates**: Changes are immediately saved to the backend
- **URL State Management**: Bookmarkable pages with persistent state

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone or download the project
2. Navigate to the project directory:
   ```bash
   cd Rent
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

### Option 1: Quick Start (Recommended)
Use the provided script to start both servers:
```bash
./start-dev.sh
```

### Option 2: Manual Start
Start the backend server:
```bash
node server.js
```

In a new terminal, start the frontend server:
```bash
npm run dev
```

## Accessing the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:9999

## How to Use

### 1. Dashboard
- View overview of all tenants
- See payment status for current month
- Navigate between different sections
- Mark payments as paid or adjust rent amounts

### 2. Tenant Configuration
- View condensed tenant information
- See base rent, maintenance, energy costs, and payment status
- Mark payments as paid, adjust final rent, or add future payments

### 3. Individual Tenant Details
- Select individual tenants for detailed view
- View comprehensive tenant information
- Edit tenant configuration (phone, address, rent, maintenance, etc.)
- View rent history and payment details

### 4. Meter Entry
- Enter electricity meter readings for A-88 and A-206 properties
- View historical meter data
- Calculate energy consumption automatically

### 5. Payment Reports
- Generate payment reports for different periods (YTD, Last 12 Months, From April)
- View professional analytics with charts and statistics
- Analyze tenant payment patterns and totals

## CSV Data Structure

The application uses multiple CSV files for data management:

### File Structure
```
data/
├── manual_rent_data.csv      # Monthly rent data for all tenants
├── tenant_configs.csv        # Tenant configuration and details
├── a88_meter_data.csv        # A-88 property meter readings
├── a206_meter_data.csv       # A-206 property meter readings

```

## API Endpoints

### Backend API (Port 9999)

- `GET /api/dashboard-data` - Get dashboard data for current month
- `GET /api/rent-data` - Get rent data for all months
- `GET /api/meter-data` - Get meter readings data
- `GET /api/tenant-configs` - Get tenant configurations
- `POST /api/mark-payment-paid` - Mark payment as paid
- `POST /api/adjust-rent` - Adjust rent amounts
- `POST /api/update-tenant-config` - Update tenant configuration
- `GET /api/payment-report` - Generate payment reports

## Project Structure

```
Rent/
├── data/                     # CSV data files
│   ├── manual_rent_data.csv
│   ├── tenant_configs.csv
│   ├── a88_meter_data.csv
│   ├── a206_meter_data.csv

├── src/                      # Frontend source code
│   ├── app.jsx              # Main React application
│   └── main.jsx             # React entry point
├── index.html               # HTML entry point
├── server.js                # Backend Express server
├── vite.config.js           # Vite configuration
├── package.json             # Dependencies and scripts
├── start-dev.sh             # Development startup script
└── README.md                # This file
```

## Troubleshooting

### Common Issues

1. **Port already in use**
   - Stop existing processes: `pkill -f "node server.js"` or `pkill -f "vite"`
   - Restart the application

2. **CSV file not updating**
   - Ensure the backend server is running on port 9999
   - Check browser console for API errors
   - Verify file permissions on CSV files

3. **Frontend not loading**
   - Check if Vite server is running on port 3000
   - Clear browser cache and reload
   - Check browser console for JavaScript errors

### Development

- **Frontend**: React with Material-UI, Vite build tool
- **Backend**: Node.js with Express
- **Data Storage**: CSV files with real-time updates
- **State Management**: React Router for URL-based state persistence

## 🚀 Deployment

### Frontend Only (Static Demo)
1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Connect your repository
4. Set build command: `npm run build`
5. Set publish directory: `dist`

### Full Stack Deployment
For complete functionality, deploy the backend separately:
- **Railway**: [railway.app](https://railway.app)
- **Render**: [render.com](https://render.com)
- **Netlify Functions**: Convert API endpoints to serverless functions

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## License

This project is for internal use and property management. 