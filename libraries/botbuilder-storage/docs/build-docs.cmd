@ECHO OFF
ECHO [COMPILING DOCS]
md ..\..\..\docs
md ..\..\..\docs\storage
typedoc --theme markdown --theme markdown --entryPoint botbuilder-storage --excludePrivate --includeDeclarations --ignoreCompilerErrors --module amd --out ..\..\..\docs\storage ..\lib\index.d.ts --hideGenerator --name "Bot Builder SDK - Storage" --readme none
