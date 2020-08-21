param()
Write-Host "npm start in new powershell console..."
Set-Location -Path "C:\Users\AshleyFinafrock\Work\pipeline-test-app\pipeline2-with-yarnlock"
start powershell {npm start}

Write-Host "sleeping..."
Start-Sleep -Seconds 60

$reactJob | Select-Object -Property *

Write-Host "npm test"
Set-Location -Path "C:\Users\AshleyFinafrock\Work\pipeline-test-app\tests"
npm test