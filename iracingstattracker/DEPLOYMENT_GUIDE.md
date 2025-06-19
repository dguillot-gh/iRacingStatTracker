# iRacing Stat Tracker - Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [System Requirements](#system-requirements)
3. [Installation Steps](#installation-steps)
4. [Configuration](#configuration)
5. [Maintenance](#maintenance)
6. [Troubleshooting](#troubleshooting)
7. [Backup and Recovery](#backup-and-recovery)

## Prerequisites

Before deploying the iRacing Stat Tracker application, ensure you have the following prerequisites installed on your Proxmox server:

- Docker Engine (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)
- Git
- Access to Proxmox server with root or sudo privileges

To install the prerequisites:

```bash
# Update package list
apt update

# Install Docker dependencies
apt install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
apt update
apt install -y docker-ce docker-ce-cli containerd.io

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

## System Requirements

Minimum recommended specifications for running the application:

- CPU: 2 cores
- RAM: 4GB
- Storage: 20GB
- Network: 100Mbps
- Ports: 80 (HTTP) and 3002 (API) must be available

## Installation Steps

1. **Clone the Repository**
   ```bash
   git clone <your-repository-url>
   cd iracingstattracker
   ```

2. **Configure Environment**
   ```bash
   # Create a .env file if needed
   touch .env
   ```

3. **Build and Start Services**
   ```bash
   # Build the containers
   docker-compose build

   # Start the services in detached mode
   docker-compose up -d
   ```

4. **Verify Installation**
   ```bash
   # Check if containers are running
   docker-compose ps

   # Check logs
   docker-compose logs -f
   ```

## Configuration

### Frontend Configuration (nginx.conf)
The frontend service is configured using Nginx. The configuration file is located at `nginx.conf`:

```nginx
server {
    listen 80;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Backend Configuration
The backend service configuration can be modified in `docker-compose.yml`. Key environment variables:

```yaml
environment:
  - NODE_ENV=production
  - IRACING_API_URL=https://members-ng.iracing.com
```

## Maintenance

### Regular Updates
To update the application to the latest version:

```bash
# Pull latest code
git pull

# Rebuild containers
docker-compose build

# Update running services
docker-compose up -d
```

### Log Management
```bash
# View logs for all services
docker-compose logs -f

# View logs for specific service
docker-compose logs -f frontend
docker-compose logs -f backend

# View last 100 lines
docker-compose logs --tail=100
```

### Container Management
```bash
# Stop services
docker-compose stop

# Start services
docker-compose start

# Restart services
docker-compose restart

# Remove containers (preserves volumes)
docker-compose down

# Remove everything including volumes
docker-compose down -v
```

## Troubleshooting

### Common Issues and Solutions

1. **Container fails to start**
   ```bash
   # Check container logs
   docker-compose logs [service_name]
   
   # Verify port availability
   netstat -tulpn | grep -E '80|3002'
   ```

2. **Network connectivity issues**
   ```bash
   # Check network status
   docker network ls
   docker network inspect iracingstattracker_default
   ```

3. **Application not responding**
   ```bash
   # Restart services
   docker-compose restart

   # Check resource usage
   docker stats
   ```

## Backup and Recovery

### Backup Procedures

1. **Data Volume Backup**
   ```bash
   # Create backup directory
   mkdir -p /backup/iracingstat

   # Backup volume data
   docker run --rm \
     -v iracingstattracker_backend_data:/data \
     -v /backup/iracingstat:/backup \
     alpine tar czf /backup/backend-data-$(date +%Y%m%d).tar.gz /data
   ```

2. **Configuration Backup**
   ```bash
   # Backup configuration files
   tar czf /backup/iracingstat/config-$(date +%Y%m%d).tar.gz \
     docker-compose.yml \
     nginx.conf \
     .env
   ```

### Recovery Procedures

1. **Restore Volume Data**
   ```bash
   # Stop services
   docker-compose down

   # Restore volume data
   docker run --rm \
     -v iracingstattracker_backend_data:/data \
     -v /backup/iracingstat:/backup \
     alpine tar xzf /backup/backend-data-YYYYMMDD.tar.gz
   
   # Restart services
   docker-compose up -d
   ```

2. **Configuration Restore**
   ```bash
   # Extract configuration files
   tar xzf /backup/iracingstat/config-YYYYMMDD.tar.gz
   ```

---

For additional support or questions, please refer to the project's documentation or create an issue in the repository. 