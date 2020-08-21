param($ReactProjectDir, $TestsDir)

Write-Host "npm start in new powershell console...";
Set-Location -Path "$ReactProjectDir";
$reactJob = start powershell {npm start};

Write-Host "sleeping before running tests..."
Start-Sleep -Seconds 60

$reactJob | Select-Object -Property *

Write-Host "npm test"
Set-Location -Path "$TestsDir"
npm test