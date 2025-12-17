# PowerShell script to start PostgreSQL on Windows
# Run with: powershell -ExecutionPolicy Bypass -File scripts/start-postgres-windows.ps1

Write-Host "Checking PostgreSQL installation..." -ForegroundColor Cyan

# Common PostgreSQL service names
$serviceNames = @(
    "postgresql-x64-15",
    "postgresql-x64-16", 
    "postgresql-x64-14",
    "postgresql-x64-13",
    "postgresql-x64-12",
    "postgresql",
    "PostgreSQL"
)

$foundService = $null

# Check for PostgreSQL service
Write-Host ""
Write-Host "Searching for PostgreSQL service..." -ForegroundColor Yellow
foreach ($serviceName in $serviceNames) {
    $service = Get-Service -Name $serviceName -ErrorAction SilentlyContinue
    if ($service) {
        $foundService = $service
        Write-Host "Found service: $($service.Name) ($($service.DisplayName))" -ForegroundColor Green
        break
    }
}

if (-not $foundService) {
    # Try to find any service with postgres in name
    $allServices = Get-Service | Where-Object { $_.DisplayName -like "*postgres*" -or $_.Name -like "*postgres*" }
    if ($allServices) {
        $foundService = $allServices[0]
        Write-Host "Found service: $($foundService.Name) ($($foundService.DisplayName))" -ForegroundColor Green
    }
}

if ($foundService) {
    Write-Host ""
    Write-Host "Service Status: $($foundService.Status)" -ForegroundColor Cyan
    
    if ($foundService.Status -eq "Running") {
        Write-Host "PostgreSQL is already running!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "Starting PostgreSQL service..." -ForegroundColor Yellow
        try {
            Start-Service -Name $foundService.Name
            Start-Sleep -Seconds 2
            $updatedService = Get-Service -Name $foundService.Name
            if ($updatedService.Status -eq "Running") {
                Write-Host "PostgreSQL started successfully!" -ForegroundColor Green
            } else {
                Write-Host "Service started but status is: $($updatedService.Status)" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "Failed to start service: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host ""
            Write-Host "Try running as Administrator:" -ForegroundColor Yellow
            Write-Host "net start $($foundService.Name)" -ForegroundColor White
        }
    }
} else {
    Write-Host ""
    Write-Host "PostgreSQL service not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "PostgreSQL Installation Options:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Install via Chocolatey (Recommended):" -ForegroundColor Cyan
    Write-Host "   choco install postgresql15" -ForegroundColor White
    Write-Host "   choco install postgresql16" -ForegroundColor White
    Write-Host ""
    Write-Host "2. Download from official website:" -ForegroundColor Cyan
    Write-Host "   https://www.postgresql.org/download/windows/" -ForegroundColor White
    Write-Host ""
    Write-Host "3. Install via winget:" -ForegroundColor Cyan
    Write-Host "   winget install PostgreSQL.PostgreSQL" -ForegroundColor White
    Write-Host ""
    Write-Host "4. Use Docker (if Docker Desktop is installed):" -ForegroundColor Cyan
    Write-Host "   docker run --name postgres-instagram -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=instagram_db -p 5432:5432 -d postgres:15" -ForegroundColor White
    Write-Host ""
    Write-Host "After installation, run this script again to start PostgreSQL." -ForegroundColor Yellow
}

Write-Host ""
