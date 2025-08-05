# Tenant Rent Management System

A comprehensive web application for managing tenant rent payments, meter readings, and property management with professional reporting capabilities.

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

### Start the Backend Server
```bash
node server.js
```

### Start the Frontend Server (in a new terminal)
```bash
npm run dev
```

## Accessing the Application

- **Frontend**: http://localhost:3000 (or the port shown in terminal)
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
└── a206_meter_data.csv       # A-206 property meter readings
```

### Data Files Description

#### manual_rent_data.csv
Contains monthly rent data for all tenants including:
- Month, Tenant, Name, Phone, Floor
- Base Rent, Maintenance, Energy Charges, Total Rent
- Payment Status and Comments

#### tenant_configs.csv
Contains tenant configuration data:
- Tenant key, Name, Phone, Address, Floor
- Base Rent, Maintenance, Misc charges
- Start month for new rent rates

#### a88_meter_data.csv & a206_meter_data.csv
Contains electricity meter readings:
- Monthly meter readings for each property
- Energy consumption calculations
- Water and gas bill data

## API Endpoints

The backend provides the following API endpoints:

- `GET /api/dashboard-data` - Dashboard data for selected month
- `GET /api/rent-data` - All rent data
- `GET /api/meter-data` - All meter data
- `GET /api/tenant-configs` - Tenant configuration data
- `GET /api/payment-report` - Payment report data
- `POST /api/mark-payment-paid` - Mark payment as paid
- `POST /api/adjust-rent` - Adjust rent amounts
- `POST /api/update-tenant-config` - Update tenant configuration
- `POST /api/update-meter-readings` - Update meter readings

## Development

### Project Structure
```
Rent/
├── src/
│   ├── app.jsx              # Main React application
│   └── main.jsx             # React entry point
├── data/                    # CSV data files
├── server.js                # Express backend server
├── package.json             # Dependencies and scripts
└── vite.config.js           # Vite configuration
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `node server.js` - Start backend server

## Data Management

All data is stored in CSV format for easy editing and backup. The application automatically:
- Loads data from CSV files on startup
- Saves changes back to CSV files
- Calculates energy charges based on meter readings
- Maintains data integrity and consistency

## Troubleshooting

### Common Issues

1. **Port already in use**: If port 9999 is in use, the server will automatically try the next available port
2. **CSV file errors**: Ensure CSV files are properly formatted and not corrupted
3. **Frontend not loading**: Check that both backend and frontend servers are running

### Data Backup

Always keep backups of your CSV files before making major changes. The application automatically saves changes, so ensure you have recent backups. 