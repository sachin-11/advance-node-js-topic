# Server Status Check Script
# Checks if the Quick Commerce Backend server is running and healthy

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Quick Commerce Backend - Server Status" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Docker services
Write-Host "Checking Docker Services..." -ForegroundColor Yellow
Write-Host ""

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptPath
Set-Location $projectRoot

# Check if containers are running
$containers = docker-compose ps --format json | ConvertFrom-Json

if ($containers.Count -eq 0) {
    Write-Host "No Docker containers found. Services may not be running." -ForegroundColor Red
    Write-Host "Start services with: docker-compose up -d" -ForegroundColor Yellow
    exit 1
}

Write-Host "Container Status:" -ForegroundColor Cyan
docker-compose ps
Write-Host ""

# Check each service
$services = @("quick-commerce-postgres", "quick-commerce-redis", "quick-commerce-backend")
$allRunning = $true

foreach ($service in $services) {
    $container = docker ps --filter "name=$service" --format "{{.Names}}"
    if ($container -eq $service) {
        Write-Host "✓ $service is running" -ForegroundColor Green
    } else {
        Write-Host "✗ $service is not running" -ForegroundColor Red
        $allRunning = $false
    }
}

Write-Host ""

# Check API endpoint
Write-Host "Checking API Health..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-WebRequest -Uri "http://localhost:3000/health" -Method GET -TimeoutSec 5 -UseBasicParsing
    if ($healthResponse.StatusCode -eq 200) {
        Write-Host "✓ API Server is responding" -ForegroundColor Green
        Write-Host "  Status Code: $($healthResponse.StatusCode)" -ForegroundColor Gray
        Write-Host "  Response: $($healthResponse.Content)" -ForegroundColor Gray
    } else {
        Write-Host "✗ API Server returned status: $($healthResponse.StatusCode)" -ForegroundColor Red
        $allRunning = $false
    }
} catch {
    Write-Host "✗ API Server is not responding" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Gray
    $allRunning = $false
}

Write-Host ""

# Check database connection
Write-Host "Checking Database Connection..." -ForegroundColor Yellow
try {
    $dbCheck = docker exec quick-commerce-postgres pg_isready -U postgres
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ PostgreSQL is ready" -ForegroundColor Green
    } else {
        Write-Host "✗ PostgreSQL is not ready" -ForegroundColor Red
        $allRunning = $false
    }
} catch {
    Write-Host "✗ Cannot check PostgreSQL status" -ForegroundColor Red
    $allRunning = $false
}

Write-Host ""

# Check Redis connection
Write-Host "Checking Redis Connection..." -ForegroundColor Yellow
try {
    $redisCheck = docker exec quick-commerce-redis redis-cli ping
    if ($redisCheck -eq "PONG") {
        Write-Host "✓ Redis is responding" -ForegroundColor Green
    } else {
        Write-Host "✗ Redis is not responding" -ForegroundColor Red
        $allRunning = $false
    }
} catch {
    Write-Host "✗ Cannot check Redis status" -ForegroundColor Red
    $allRunning = $false
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

if ($allRunning) {
    Write-Host "All services are running and healthy! ✓" -ForegroundColor Green
    Write-Host ""
    Write-Host "API Endpoints:" -ForegroundColor Cyan
    Write-Host "  - Health: http://localhost:3000/health" -ForegroundColor White
    Write-Host "  - API: http://localhost:3000/api" -ForegroundColor White
} else {
    Write-Host "Some services are not running properly ✗" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "  1. Check logs: docker-compose logs" -ForegroundColor White
    Write-Host "  2. Restart services: docker-compose restart" -ForegroundColor White
    Write-Host "  3. Rebuild: docker-compose up -d --build" -ForegroundColor White
}

Write-Host ""

