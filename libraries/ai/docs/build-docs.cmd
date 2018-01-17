@ECHO OFF
ECHO [COMPILING DOCS]
md ..\..\..\docs
md ..\..\..\docs\ai
typedoc --theme markdown --theme markdown --entryPoint botbuilder-ai --excludePrivate --includeDeclarations --ignoreCompilerErrors --module amd --out ..\..\..\docs\ai ..\lib\index.d.ts --hideGenerator --name "Bot Builder SDK - AI" --readme none
