@ECHO OFF
ECHO [COMPILING DOCS]
md ..\..\..\docs
md ..\..\..\docs\azure
typedoc --theme markdown --entryPoint botbuilder-azure --excludePrivate --includeDeclarations --ignoreCompilerErrors --module amd --out ..\..\..\docs\azure  ..\lib\index.d.ts --hideGenerator --name "Bot Builder SDK - Azure v4" --readme none
