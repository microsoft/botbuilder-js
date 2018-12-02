@echo off

echo [92mRemoving any preexisting output folders ("connectorApi/", "tokenApi/")[0m
rd /s /q connectorApi
rd /s /q tokenApi

@echo on
call npx autorest connectorAPI.md --typescript --use=".\node_modules\@microsoft.azure\autorest.typescript"

call node model_fixes.js

echo [92mMove models to botbuilder-schema[0m
del /q ..\botframework-schema\src\index.ts
move connectorAPI\lib\models\index.ts ..\botframework-schema\src\index.ts

echo [92mMove client to botframework-connector[0m
rd /s /q ..\botframework-connector\src\connectorApi
move connectorApi\lib ..\botframework-connector\src\connectorApi

@echo on
call npx autorest tokenAPI.md --typescript --use=".\node_modules\@microsoft.azure\autorest.typescript"
@echo off

echo [92mMove tokenAPI to botframework-connector[0m
rd /s /q ..\botframework-connector\src\tokenApi
move tokenApi\lib ..\botframework-connector\src\tokenApi

echo [92mRemoving generated folders ("connectorApi/", "tokenApi/")[0m
rd /s /q connectorApi
rd /s /q tokenApi
