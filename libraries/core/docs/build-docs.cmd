@ECHO OFF
ECHO [COMPILING DOCS]
md ..\..\..\docs
md ..\..\..\docs\core

typedoc --theme markdown --entryPoint botbuilder --excludePrivate --includeDeclarations --ignoreCompilerErrors --module amd --out ..\..\..\docs\core ..\lib\botbuilder.d.ts --hideGenerator --name "Bot Builder SDK - Core" --readme none 
