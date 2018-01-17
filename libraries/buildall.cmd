cd core
node ..\..\node_modules\typescript\bin\tsc
if errorlevel 1 goto err

cd ..\node
node ..\..\node_modules\typescript\bin\tsc
if errorlevel 1 goto err

cd ..\services
node ..\..\node_modules\typescript\bin\tsc
if errorlevel 1 goto err

cd ..\ai 
node ..\..\node_modules\typescript\bin\tsc
if errorlevel 1 goto err

cd ..\azure 
node ..\..\node_modules\typescript\bin\tsc
if errorlevel 1 goto err

cd ..\choices
node ..\..\node_modules\typescript\bin\tsc
if errorlevel 1 goto err

cd ..\legacy
node ..\..\node_modules\typescript\bin\tsc
if errorlevel 1 goto err

cd ..\lunr
node ..\..\node_modules\typescript\bin\tsc
if errorlevel 1 goto err

cd ..\prompts
node ..\..\node_modules\typescript\bin\tsc
if errorlevel 1 goto err

cd ..\rivescript
node ..\..\node_modules\typescript\bin\tsc
if errorlevel 1 goto err

goto end
:err
@echo BUILD FAILED 1>&2

:end
cd ..
