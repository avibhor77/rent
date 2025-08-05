# Synology NAS Deployment Guide

## 🏠 **Deploy Your Rent Management App on Synology NAS**

This guide will help you deploy your rent management application on your Synology NAS using Docker.

## Prerequisites

### 1. Enable Docker on Synology
1. Open **Package Center**
2. Search for "Docker"
3. Install **Docker** package
4. Open **Docker** from the main menu

### 2. Enable SSH (Optional but Recommended)
1. Go to **Control Panel** → **Terminal & SNMP**
2. Enable **SSH service**
3. Note your NAS IP address

## Deployment Methods

### Method 1: Docker Desktop (Easiest)

#### Step 1: Upload Files to NAS
1. Create a folder on your NAS (e.g., `/volume1/docker/rent-app/`)
2. Upload your project files to this folder:
   - All source code files
   - `Dockerfile`
   - `docker-compose.yml`
   - `data/` folder with your CSV files

#### Step 2: Build and Run
1. Open **Docker** in DSM
2. Go to **Image** tab
3. Click **Add** → **Add from Dockerfile**
4. Browse to your project folder
5. Click **Select** and wait for build to complete
6. Go to **Container** tab
7. Click **Create** → **Create from image**
8. Select your built image
9. Set container name: `rent-app`
10. Set port mapping: `3000:3000`
11. Click **Apply** to start

### Method 2: SSH Command Line (Advanced)

#### Step 1: Connect via SSH
```bash
ssh admin@your-nas-ip
```

#### Step 2: Navigate to Project Directory
```bash
cd /volume1/docker/rent-app
```

#### Step 3: Build and Run with Docker Compose
```bash
# Build the image
docker-compose build

# Start the application
docker-compose up -d

# Check logs
docker-compose logs -f
```

### Method 3: Synology Container Manager

1. Open **Container Manager** in DSM
2. Click **Create** → **Create from image**
3. Select **Docker Hub** and search for a Node.js image
4. Or use the **Add from Dockerfile** option
5. Configure the container with port mapping `3000:3000`

## Configuration

### Environment Variables
You can set these in the Docker container:

- `PORT`: 3000 (default)
- `NODE_ENV`: production

### Data Persistence
Your CSV files are mounted as volumes, so:
- ✅ Data persists between container restarts
- ✅ You can edit CSV files directly on the NAS
- ✅ Automatic backups with your NAS backup strategy

### Port Configuration
- **Container Port**: 3000
- **Host Port**: 3000 (or any port you prefer)
- **Access URL**: `http://your-nas-ip:3000`

## Accessing Your Application

### Local Network Access
- **URL**: `http://your-nas-ip:3000`
- **Example**: `http://192.168.1.100:3000`

### External Access (Optional)
1. **Configure Port Forwarding** on your router
2. **Set up DDNS** (if you don't have a static IP)
3. **Access via**: `http://your-domain.com:3000`

### Security Considerations
- ✅ **Local Network Only**: Most secure option
- ✅ **VPN Access**: Use Synology VPN Server
- ✅ **Reverse Proxy**: Use Synology's built-in reverse proxy
- ❌ **Direct Internet Access**: Not recommended without proper security

## Management Commands

### Via SSH
```bash
# Start the application
docker-compose up -d

# Stop the application
docker-compose down

# View logs
docker-compose logs -f

# Restart the application
docker-compose restart

# Update the application
git pull
docker-compose build
docker-compose up -d
```

### Via Docker Desktop
- **Start/Stop**: Use the play/stop buttons
- **Logs**: Click on container → **Details** → **Log**
- **Terminal**: Click on container → **Details** → **Terminal**

## Backup Strategy

### Automatic Backups
1. **Data Files**: Your CSV files are in `/volume1/docker/rent-app/data/`
2. **Synology Backup**: Include this folder in your NAS backup
3. **Docker Images**: Backup the entire project folder

### Manual Backup
```bash
# Backup data files
cp -r /volume1/docker/rent-app/data/ /volume1/backup/rent-app-data/

# Backup entire project
tar -czf /volume1/backup/rent-app-$(date +%Y%m%d).tar.gz /volume1/docker/rent-app/
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using port 3000
   netstat -tulpn | grep :3000
   
   # Change port in docker-compose.yml
   ports:
     - "3001:3000"  # Use port 3001 instead
   ```

2. **Permission Issues**
   ```bash
   # Fix file permissions
   chmod -R 755 /volume1/docker/rent-app/
   chown -R admin:users /volume1/docker/rent-app/
   ```

3. **Container Won't Start**
   ```bash
   # Check container logs
   docker-compose logs rent-app
   
   # Check if data files exist
   ls -la /volume1/docker/rent-app/data/
   ```

### Performance Optimization

1. **Resource Limits**: Set memory and CPU limits in Docker
2. **SSD Storage**: Store on SSD volume for better performance
3. **Regular Updates**: Keep Docker and your app updated

## Benefits of NAS Deployment

- ✅ **Always On**: Your NAS runs 24/7
- ✅ **Local Control**: No dependency on external services
- ✅ **Data Privacy**: Your data stays on your network
- ✅ **Cost Effective**: No monthly hosting fees
- ✅ **Backup Integration**: Works with your existing NAS backup
- ✅ **Easy Management**: Manage through DSM interface

## Next Steps

1. **Test the deployment** locally first
2. **Set up regular backups** of your data
3. **Configure monitoring** (optional)
4. **Set up SSL** if accessing externally
5. **Create user accounts** for family members (if needed)

Your rent management app will now run reliably on your Synology NAS! 🎉 