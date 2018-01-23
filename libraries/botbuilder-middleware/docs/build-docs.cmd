@ECHO OFF
ECHO [COMPILING DOCS]
md ..\..\..\docs
md ..\..\..\docs\middleware
typedoc --theme markdown --theme markdown --entryPoint botbuilder-middleware --excludePrivate --includeDeclarations --ignoreCompilerErrors --module amd --out ..\..\..\docs\middleware ..\lib\index.d.ts --hideGenerator --name "Bot Builder SDK - Middleware" --readme none
