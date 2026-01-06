# Docker Stop Script
# Stops all Docker services

Write-Host "Stopping Quick Commerce Backend Services..." -ForegroundColor Yellow
Write-Host ""

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptPath
Set-Location $projectRoot

docker-compose down

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "All services stopped successfully!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "Error stopping services" -ForegroundColor Red
}

