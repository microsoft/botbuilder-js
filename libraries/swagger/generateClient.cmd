@echo off

rd /s /q generated

call npm i replace-in-file
call autorest README.md --typescript

call node model_fixes.js

rem Move models to botbuilder-schema
del /q ..\botbuilder-schema\src\index.ts
move generated\models\index.ts ..\botbuilder-schema\src\index.ts

rem Move client to botframework-connector
rd /s /q ..\botframework-connector\src\generated
move generated ..\botframework-connector\src\