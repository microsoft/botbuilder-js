@echo off

rd /s /q generated
call autorest README.md --nodejs

call ..\..\node_modules\.bin\replace "'../models'" "'botbuilder-schema'" ./generated -r
call ..\..\node_modules\.bin\replace "'./models'" "'botbuilder-schema'" ./generated -r

rd /s /q ..\botbuilder-schema\src\generated\models
rd /s /q ..\botframework-connector\lib\generated
move generated\models ..\botbuilder-schema\src\generated\models
move generated ..\botframework-connector\lib\