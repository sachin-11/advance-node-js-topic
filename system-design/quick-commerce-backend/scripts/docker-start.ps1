# Docker Start Script for Quick Commerce Backend
# This script starts all Docker services (PostgreSQL, Redis, and App)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting Quick Commerce Backend Services" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is installed
try {
    docker --version | Out-Null
} catch {
    Write-Host "ERROR: Docker is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# Navigate to project directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptPath
Set-Location $projectRoot

Write-Host "Starting Docker services..." -ForegroundColor Green
Write-Host ""

# Start services in detached mode
docker-compose up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "Services Started Successfully!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Waiting for services to be ready..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    
    Write-Host ""
    Write-Host "Service Status:" -ForegroundColor Cyan
    docker-compose ps
    
    Write-Host ""
    Write-Host "To view logs, run: docker-compose logs -f" -ForegroundColor Yellow
    Write-Host "To check server status, run: .\scripts\check-server.ps1" -ForegroundColor Yellow
    Write-Host "To stop services, run: docker-compose down" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "API will be available at: http://localhost:3000/api" -ForegroundColor Green
    Write-Host "Health check: http://localhost:3000/health" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "ERROR: Failed to start Docker services" -ForegroundColor Red
    Write-Host "Check Docker Desktop is running and try again" -ForegroundColor Yellow
    exit 1
}

