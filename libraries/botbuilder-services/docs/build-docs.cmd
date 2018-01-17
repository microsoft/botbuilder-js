@ECHO OFF
ECHO [COMPILING DOCS]
md ..\..\..\docs
md ..\..\..\docs\services

typedoc --theme markdown --entryPoint botbuilder-services --excludePrivate --includeDeclarations --ignoreCompilerErrors --module amd --out ..\..\..\docs\services ..\lib\index.d.ts --hideGenerator --name "Bot Builder SDK - Services" --readme none
