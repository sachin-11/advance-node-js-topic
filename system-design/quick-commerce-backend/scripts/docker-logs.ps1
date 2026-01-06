# Docker Logs Script
# Shows logs for all services or a specific service

param(
    [string]$Service = "all"
)

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptPath
Set-Location $projectRoot

if ($Service -eq "all") {
    Write-Host "Showing logs for all services (Press Ctrl+C to exit)..." -ForegroundColor Yellow
    Write-Host ""
    docker-compose logs -f
} else {
    Write-Host "Showing logs for $Service (Press Ctrl+C to exit)..." -ForegroundColor Yellow
    Write-Host ""
    docker-compose logs -f $Service
}

