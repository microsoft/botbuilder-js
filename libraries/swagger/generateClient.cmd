@echo off

rd /s /q generated
call autorest README.md --typescript

call ..\..\node_modules\.bin\replace "as Models from \"./models" "as Models from \"botbuilder-schema" ./generated -r
call ..\..\node_modules\.bin\replace "as Models from \"../models" "as Models from \"botbuilder-schema" ./generated -r
call ..\..\node_modules\.bin\replace "\?: " ": " ./generated/models/index.ts

del /q ..\botbuilder-schema\src\index.ts
rd /s /q ..\botframework-connector\src\generated

move generated\models\index.ts ..\botbuilder-schema\src\index.ts
move generated ..\botframework-connector\src\