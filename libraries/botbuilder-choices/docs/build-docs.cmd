@ECHO OFF
ECHO [COMPILING DOCS]
md ..\..\..\docs
md ..\..\..\docs\choices

typedoc --theme markdown --entryPoint botbuilder-choices --excludePrivate --includeDeclarations --ignoreCompilerErrors --module amd --out ..\..\..\docs\choices ..\lib\index.d.ts --hideGenerator --name "Bot Builder SDK - Choices" --readme none
