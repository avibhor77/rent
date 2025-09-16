# Synology NAS Deployment Guide

## Prerequisites
- Synology NAS with DSM 7.0 or later
- Container Manager package installed
- Docker image file: `rent-management-app.tar`

## Step-by-Step Deployment

### 1. Build the Docker Image
Run the build script on your development machine:
```bash
./build-for-nas.sh
```

This will create `rent-management-app.tar` in the current directory.

### 2. Transfer to Synology NAS
Copy the `rent-management-app.tar` file to your Synology NAS using:
- File Station
- SCP/SFTP
- USB drive

### 3. Import Docker Image
1. Open **Synology DSM**
2. Go to **Package Center** → **Container Manager**
3. Click on **Images** tab
4. Click **Import** → **From file**
5. Select `rent-management-app.tar`
6. Click **Import**

### 4. Create Container
1. In Container Manager, go to **Container** tab
2. Click **Create** → **From image**
3. Select `rent-management-app:latest`
4. Click **Next**

### 5. Configure Container Settings

#### Basic Settings
- **Container name**: `rent-management-app`
- **Enable auto-restart**: ✅ Yes

#### Port Settings
- **Local port**: `3000`
- **Container port**: `3000`
- **Type**: `TCP`

#### Volume Settings
Create a volume mount for data persistence:
- **File/Folder**: `/volume1/docker/rent-management/data`
- **Mount path**: `/app/data`
- **Access mode**: `Read/Write`

#### Environment Variables
- `NODE_ENV`: `production`
- `PORT`: `3000`

### 6. Start Container
1. Click **Next** → **Next** → **Apply**
2. Start the container
3. Check logs to ensure it's running properly

### 7. Access Application
Open your browser and navigate to:
```
http://your-nas-ip:3000
```

## Data Persistence
The application data (CSV files) will be stored in:
```
/volume1/docker/rent-management/data/
```

Make sure to backup this folder regularly.

## Troubleshooting

### Container Won't Start
1. Check container logs in Container Manager
2. Verify port 3000 is not in use
3. Ensure volume mount path exists

### Can't Access Application
1. Check firewall settings on Synology NAS
2. Verify port forwarding if accessing from outside network
3. Check if container is running

### Data Not Persisting
1. Verify volume mount is correctly configured
2. Check file permissions on mounted folder
3. Ensure folder exists and is writable

## Updates
To update the application:
1. Build new Docker image with updated code
2. Import new image to Synology NAS
3. Stop old container
4. Create new container with same settings
5. Start new container

## Backup
Regularly backup the data folder:
```
/volume1/docker/rent-management/data/
```

This contains all your rent data, meter readings, and audit logs.