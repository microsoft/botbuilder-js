rem @echo off

rd /s /q connectorApi
rd /s /q oAuthApi

call autorest connectorAPI.md --typescript

call node model_fixes.js

rem Move models to botbuilder-schema
del /q ..\botframework-schema\src\index.ts
move ConnectorAPI\lib\models\index.ts ..\botframework-schema\src\index.ts

rem Move client to botframework-connector
rd /s /q ..\botframework-connector\src\connectorApi
move connectorApi\lib ..\botframework-connector\src\connectorApi

call autorest oAuthAPI.md --typescript
rd /s /q ..\botframework-connector\src\oAuthApi
move oAuthApi\lib ..\botframework-connector\src\oAuthApi

rd /s /q connectorApi
rd /s /q oAuthApi
