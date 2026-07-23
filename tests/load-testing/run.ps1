# run.ps1
# ─────────────────────────────────────────────────────────────────────────────
# Smart Learn — Load Test Orchestrator
# Automates Server Startup, Load Test Execution, Excel Generation, and Teardown
# ─────────────────────────────────────────────────────────────────────────────

$ErrorActionPreference = "Stop"

# Ensure clean directory context
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -Path "$ScriptDir\..\.."

Write-Host "STARTING: [1/5] Starting Express Backend Server..." -ForegroundColor Green
# Start express server in the background and track process
$ServerProcess = Start-Process -FilePath "node" -ArgumentList "backend/server.js" -PassThru -NoNewWindow

# Wait for database connection and server initialization
Write-Host "WAITING: Waiting 3 seconds for database initialization..." -ForegroundColor Cyan
Start-Sleep -Seconds 3

try {
    # Check if process is still running
    if ($ServerProcess.HasExited) {
        throw "Failed to start Node server.js process"
    }

    Set-Location -Path "$ScriptDir"

    Write-Host "RUNNING: [2/5] Initiating 1-Minute Load Generator (100 Concurrent Users)..." -ForegroundColor Yellow
    # Execute the load test
    node run_load_test.js

    # Check if results JSON exists
    if (-not (Test-Path "load_test_results.json")) {
        throw "Load test execution did not output load_test_results.json"
    }

    Write-Host "EXCEL: [3/5] Compiling Metrics and Generating Excel Spreadsheet..." -ForegroundColor Magenta
    # Ensure UTF-8 execution for print statements
    $env:PYTHONIOENCODING="utf-8"
    python generate_load_excel.py

    Write-Host "SUCCESS: [4/5] Load Test Cycle Completed Successfully!" -ForegroundColor Green
}
catch {
    Write-Host "ERROR: Error encountered during load test execution: $_" -ForegroundColor Red
}
finally {
    Write-Host "CLEANUP: [5/5] Tearing down Express Backend Server process..." -ForegroundColor Gray
    if ($ServerProcess -and -not $ServerProcess.HasExited) {
        # Stop process gracefully
        Stop-Process -Id $ServerProcess.Id -Force
        Write-Host "   Express server stopped." -ForegroundColor Gray
    }
}
