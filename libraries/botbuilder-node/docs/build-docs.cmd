@ECHO OFF
ECHO [COMPILING DOCS]
md ..\..\..\docs
md ..\..\..\docs\node

typedoc --theme markdown --entryPoint botbuilder-node --excludePrivate --includeDeclarations --ignoreCompilerErrors --module amd --out ..\..\..\docs\node ..\lib\index.d.ts --hideGenerator --name "Bot Builder SDK - Node" --readme none
