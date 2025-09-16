# Rent Management App - Synology NAS Deployment Guide

## 📦 Package Contents
- `rent-management-app.tar` - Docker image for Synology NAS
- `SYNOLOGY_DEPLOYMENT_GUIDE.md` - This deployment guide
- `docker-compose.yml` - Optional Docker Compose configuration
- `environment.env` - Environment variables template

## 🚀 Quick Start

### Prerequisites
- Synology NAS with DSM 7.0 or later
- Container Manager package installed
- At least 1GB free disk space
- Network access to the NAS

### Step 1: Upload the Package
1. Copy the entire `nas-package` folder to your Synology NAS
2. Access your NAS via web interface (usually `http://your-nas-ip:5000`)

### Step 2: Import Docker Image
1. Open **Container Manager** from the main menu
2. Go to **Image** tab
3. Click **Add** → **Add from local**
4. Select `rent-management-app.tar` from the nas-package folder
5. Click **Next** and wait for import to complete

### Step 3: Create Container
1. In Container Manager, go to **Container** tab
2. Click **Create** → **From image**
3. Select `rent-management-app:latest`
4. Click **Next**

### Step 4: Configure Container
1. **Container Name**: `rent-management-app`
2. **Enable auto-restart**: ✅ Yes
3. **Resource Limits**: 
   - CPU: 1 core minimum
   - Memory: 512MB minimum
4. **Port Settings**:
   - Container Port: `9999`
   - Host Port: `9999` (or any available port)
5. **Volume Settings**:
   - Mount `/app/data` to `/volume1/docker/rent-app/data` (for data persistence)
6. Click **Next** → **Next** → **Done**

### Step 5: Start the Application
1. Find your container in the Container list
2. Click **Start**
3. Wait for the container to start (green status)
4. Access the app at `http://your-nas-ip:9999`

## 🔧 Advanced Configuration

### Environment Variables
Create a `.env` file in the mounted data directory with:
```env
NODE_ENV=production
PORT=9999
DATA_PATH=/app/data
```

### Data Persistence
The app stores all data in CSV files. To ensure data persistence:
1. Mount `/app/data` to a persistent volume
2. Recommended path: `/volume1/docker/rent-app/data`
3. Backup this directory regularly

### Port Configuration
- Default port: `9999`
- Change in Container Manager → Port Settings
- Ensure the port is not used by other services

### Resource Allocation
- **Minimum**: 512MB RAM, 1 CPU core
- **Recommended**: 1GB RAM, 2 CPU cores
- **High Load**: 2GB RAM, 4 CPU cores

## 📊 Monitoring

### Health Check
The app includes a health check endpoint:
- URL: `http://your-nas-ip:9999/api/health`
- Returns: JSON with status, timestamp, and uptime

### Logs
View container logs in Container Manager:
1. Select your container
2. Click **Details** → **Log** tab
3. Monitor for errors or issues

### Data Backup
Regular backup of the data directory:
```bash
# Backup command (run on NAS)
cp -r /volume1/docker/rent-app/data /volume1/backup/rent-app-$(date +%Y%m%d)
```

## 🔄 Updates

### Updating the Application
1. Download the new `rent-management-app.tar`
2. Import the new image in Container Manager
3. Stop the current container
4. Create a new container from the updated image
5. Use the same volume mounts to preserve data

### Data Migration
When updating, ensure data persistence:
1. Backup current data directory
2. Mount the same data directory to the new container
3. Verify data integrity after update

## 🛠️ Troubleshooting

### Common Issues

#### Container Won't Start
- Check port conflicts
- Verify resource allocation
- Check container logs for errors

#### Data Not Persisting
- Verify volume mounts are correct
- Check file permissions
- Ensure data directory exists

#### App Not Accessible
- Check firewall settings
- Verify port forwarding
- Test with `curl http://localhost:9999/api/health`

#### Performance Issues
- Increase memory allocation
- Check disk space
- Monitor CPU usage

### Log Analysis
Common log patterns:
- `Server successfully started on port 9999` - App is running
- `Data validation passed` - Data integrity OK
- `Error loading` - Check data files
- `Port already in use` - Change port configuration

## 📞 Support

### System Requirements
- DSM 7.0+
- Container Manager 1.0+
- 1GB+ RAM
- 1GB+ free disk space

### File Structure
```
/app/
├── dist/           # Built React app
├── data/           # CSV data files
├── server.js       # Node.js server
└── package.json    # Dependencies
```

### Data Files
- `manual_rent_data.csv` - Main rent data
- `tenant_configs.csv` - Tenant configurations
- `a88_meter_data.csv` - A-88 meter readings
- `a206_meter_data.csv` - A-206 meter readings
- `audit_log.csv` - System audit log

## 🔒 Security Notes

- The app runs on port 9999 by default
- No authentication is built-in (add reverse proxy if needed)
- Data is stored in plain CSV files
- Consider VPN access for remote management

## 📈 Performance Tips

1. **Regular Backups**: Set up automated backups of the data directory
2. **Resource Monitoring**: Use Synology Resource Monitor
3. **Log Rotation**: Configure log rotation to prevent disk full
4. **Network Security**: Use firewall rules to restrict access
5. **SSL/HTTPS**: Consider reverse proxy with SSL certificate

---

**Version**: 1.3.0  
**Last Updated**: September 2025  
**Compatibility**: Synology DSM 7.0+
