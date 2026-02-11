# Run Formulus on a physical Android device (USB)
# Use this script so Metro + adb reverse + debug app are set up in one go.
# Run from the formulus directory: .\run-on-device.ps1

$ErrorActionPreference = "Stop"
$FormulusDir = $PSScriptRoot

# 1. Check device
Write-Host "Checking for Android device..." -ForegroundColor Cyan
$devices = adb devices | Select-String "device$"
if (-not $devices) {
    Write-Host "ERROR: No Android device found. Connect the phone via USB and enable USB debugging." -ForegroundColor Red
    Write-Host "Run: adb devices" -ForegroundColor Yellow
    exit 1
}
Write-Host "Device found." -ForegroundColor Green

# 2. Port forward so the app can reach Metro
Write-Host "Setting up port forward (adb reverse tcp:8081 tcp:8081)..." -ForegroundColor Cyan
adb reverse tcp:8081 tcp:8081
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: adb reverse failed." -ForegroundColor Red
    exit 1
}
Write-Host "Port forward OK." -ForegroundColor Green

# 3. Start Metro in a new window if not already running
$metroRunning = $false
try {
    $conn = Get-NetTCPConnection -LocalPort 8081 -ErrorAction SilentlyContinue
    if ($conn) { $metroRunning = $true }
} catch {}
if (-not $metroRunning) {
    Write-Host "Starting Metro in a new window (keep it open)..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$FormulusDir'; npx react-native start --reset-cache"
    Write-Host "Waiting 15 seconds for Metro to be ready..." -ForegroundColor Cyan
    Start-Sleep -Seconds 15
} else {
    Write-Host "Metro already running on 8081." -ForegroundColor Green
}

# 4. Uninstall existing app so we install a fresh debug build
Write-Host "Uninstalling existing Formulus app (ensures debug build)..." -ForegroundColor Cyan
adb uninstall org.opendataensemble.formulus 2>$null
# Ignore error if app was not installed

# 5. Build, install, and launch the app (uses existing Metro)
Write-Host "Building and installing the app (first time may take several minutes)..." -ForegroundColor Cyan
Push-Location $FormulusDir
try {
    npx react-native run-android --no-packager
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "Done. The app should be open on your device." -ForegroundColor Green
        Write-Host "To reload after code changes: shake the device and tap Reload." -ForegroundColor Cyan
    } else {
        exit $LASTEXITCODE
    }
} finally {
    Pop-Location
}
