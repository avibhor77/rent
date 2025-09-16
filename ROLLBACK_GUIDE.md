# Rollback Guide

## Current Stable Version
**Tag:** `v1.2.0-csv-editor`  
**Commit:** `379a73e`  
**Date:** $(date)  

## Features in this version:
- ✅ Payment Summary CSV Editor with inline editing
- ✅ Data loader with refresh functionality  
- ✅ Gas bill display working (₹712 for A-206 2nd September 25)
- ✅ All existing tabs functional
- ✅ Responsive Material-UI design
- ✅ Error handling and loading states

## How to Rollback

### Option 1: Rollback to this stable version
```bash
git checkout v1.2.0-csv-editor
```

### Option 2: Rollback to previous commit
```bash
git checkout 0f132f3  # Previous stable commit
```

### Option 3: Create a new branch from this version
```bash
git checkout -b rollback-v1.2.0 v1.2.0-csv-editor
```

### Option 4: Reset current branch to this version (DESTRUCTIVE)
```bash
git reset --hard v1.2.0-csv-editor
```

## Available Tags
- `v1.2.0-csv-editor` - Current stable version with CSV editor

## Recent Commits
- `379a73e` - feat: Add Payment Summary CSV Editor with inline editing and data loader
- `0f132f3` - Add local Docker build script for NAS deployment  
- `bdbf2e6` - Fix Docker build issues and add health check endpoint
- `2e4d1c6` - Add Docker image publishing workflows
- `201967a` - Add Synology NAS deployment with Docker

## Quick Status Check
```bash
# Check current commit
git log --oneline -1

# Check current tag
git describe --tags

# Check if working directory is clean
git status
```

## Emergency Rollback (if app is broken)
```bash
# Stop any running processes
pkill -f "node server.js"
pkill -f "vite"

# Rollback to stable version
git checkout v1.2.0-csv-editor

# Restart application
npm run dev:full
```
