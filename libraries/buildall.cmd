@echo off
cd botbuilder
echo tsc compiling: botbuilder
call tsc
if errorlevel 1 goto err

cd ..\botbuilder-stylers
echo tsc compiling: botbuilder-stylers
call tsc
if errorlevel 1 goto err

cd ..\botbuilder-storage
echo tsc compiling: botbuilder-storage
call tsc
if errorlevel 1 goto err

cd ..\botbuilder-recognizers
echo tsc compiling: botbuilder-recognizers
call tsc
if errorlevel 1 goto err

cd ..\botbuilder-node
echo tsc compiling: botbuilder-node
call tsc
if errorlevel 1 goto err

cd ..\botbuilder-services
echo tsc compiling: botbuilder-services
call tsc
if errorlevel 1 goto err

cd ..\botbuilder-ai
echo tsc compiling: botbuilder-ai
call tsc
if errorlevel 1 goto err

cd ..\botbuilder-azure
echo tsc compiling: botbuilder-azure
call tsc
if errorlevel 1 goto err

cd ..\botbuilder-choices
echo tsc compiling: botbuilder-choices
call tsc
if errorlevel 1 goto err

echo build complete
goto end
:err
@echo BUILD FAILED 1>&2

:end
cd ..
