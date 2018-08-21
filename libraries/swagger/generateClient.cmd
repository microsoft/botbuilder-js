@echo off

rd /s /q connectorApi

call autorest connectorAPI.md --typescript

call node model_fixes.js

rem Move models to botbuilder-schema
del /q ..\botframework-schema\src\index.ts
move ConnectorAPI\models\index.ts ..\botframework-schema\src\index.ts

rem Move client to botframework-connector
rd /s /q ..\botframework-connector\src\connectorApi
move connectorApi ..\botframework-connector\src\

call autorest oAuthAPI.md --typescript
rd /s /q ..\botframework-connector\src\oAuthApi
move oAuthApi ..\botframework-connector\src\
