# Rent Management App - Synology NAS Package

A complete rent management system designed for Synology NAS deployment.

## 📦 Package Contents

- `rent-management-app.tar` - Docker image (65MB)
- `docker-compose.yml` - Container orchestration
- `environment.env` - Environment configuration template
- `setup.sh` - Automated setup script
- `SYNOLOGY_DEPLOYMENT_GUIDE.md` - Detailed deployment guide
- `README.md` - This file

## 🚀 Quick Start

1. **Upload** this package to your Synology NAS
2. **Run** the setup script: `./setup.sh`
3. **Access** the app at `http://your-nas-ip:9999`

## ✨ Features

- **Dashboard** - Overview of rent collection and tenant status
- **Individual Tenant Details** - Detailed tenant information and payment tracking
- **Meter Readings** - Electricity meter management for A-88 and A-206 buildings
- **Payment Analytics** - Comprehensive financial reports and analysis
- **Payment Summary** - CSV editor for direct data management
- **Audit Log** - Complete activity tracking and change history

## 🔧 System Requirements

- Synology NAS with DSM 7.0+
- Container Manager package
- 1GB+ RAM
- 1GB+ free disk space
- Network access

## 📊 Data Management

All data is stored in CSV files for easy backup and migration:
- `manual_rent_data.csv` - Main rent and payment data
- `tenant_configs.csv` - Tenant configuration and contact info
- `a88_meter_data.csv` - A-88 building meter readings
- `a206_meter_data.csv` - A-206 building meter readings
- `audit_log.csv` - System activity log

## 🔒 Security

- Runs on port 9999 (configurable)
- No built-in authentication (add reverse proxy for production)
- Data stored in plain CSV files
- Health check endpoint for monitoring

## 📈 Performance

- Optimized Docker image (~65MB)
- Multi-stage build for minimal size
- Health checks and auto-restart
- Resource-efficient design

## 🛠️ Troubleshooting

See `SYNOLOGY_DEPLOYMENT_GUIDE.md` for detailed troubleshooting steps.

## 📞 Support

- **Version**: 1.3.0
- **Compatibility**: Synology DSM 7.0+
- **Last Updated**: September 2025

---

**Ready to deploy?** Run `./setup.sh` to get started!
