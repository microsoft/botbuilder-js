@if "%1" == "" goto :need
@if "%2" == "" goto :need
rep -r -find:%1 -replace:%2 package.json
goto :end
:need
@echo You need to pass in old and new version
:end