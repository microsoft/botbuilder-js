rem @echo off

rd /s /q connectorApi
rd /s /q oAuthApi

rem call autorest connectorAPI.md --typescript

rem call node model_fixes.js

rem Move models to botbuilder-schema
rem del /q ..\botframework-schema\src\index.ts
rem move ConnectorAPI\lib\models\index.ts ..\botframework-schema\src\index.ts

rem Move client to botframework-connector
rem rd /s /q ..\botframework-connector\src\connectorApi
rem move connectorApi\lib ..\botframework-connector\src\connectorApi

call autorest tokenAPI.md --typescript
rd /s /q ..\botframework-connector\src\tokenApi
move tokenApi\lib ..\botframework-connector\src\tokenApi

rem rd /s /q connectorApi
rd /s /q tokenApi
