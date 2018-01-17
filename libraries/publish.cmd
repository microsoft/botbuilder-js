@if "%1" == "" goto :need
for /f %%s in (%1) do pushd %%s & npm publish --registry http://bbnpm.azurewebsites.net & popd
goto :end
:need
@echo You need to pass in file name with list of packages to publish.
:end