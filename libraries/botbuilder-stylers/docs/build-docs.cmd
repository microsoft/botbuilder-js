@ECHO OFF
ECHO [COMPILING DOCS]
md ..\..\..\docs
md ..\..\..\docs\stylers
typedoc --theme markdown --theme markdown --entryPoint botbuilder-stylers --excludePrivate --includeDeclarations --ignoreCompilerErrors --module amd --out ..\..\..\docs\stylers ..\lib\index.d.ts --hideGenerator --name "Bot Builder SDK - Stylers" --readme none
