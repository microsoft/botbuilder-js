@echo off

rd /s /q generated

call autorest README.md --typescript

call node model_fixes.js

rem Move models to botbuilder-schema
del /q ..\botframework-schema\src\index.ts
move generated\models\index.ts ..\botframework-schema\src\index.ts

rem Move client to botframework-connector
rd /s /q ..\botframework-connector\src\generated
move generated ..\botframework-connector\src\