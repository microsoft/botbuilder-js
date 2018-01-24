@echo off
echo cleaning lib directories
cd botbuilder
erase /q lib\*.*
cd ..\botbuilder-stylers
erase /q lib\*.*
cd ..\botbuilder-storage
erase /q lib\*.*
cd ..\botbuilder-node
erase /q lib\*.*
cd ..\botbuilder-services
erase /q lib\*.*
cd ..\botbuilder-ai 
erase /q lib\*.*
cd ..\botbuilder-azure 
erase /q lib\*.*
cd ..\botbuilder-choices
erase /q lib\*.*
cd ..
echo cleaning complete
