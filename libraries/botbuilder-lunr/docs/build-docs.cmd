@ECHO OFF
ECHO [COMPILING DOCS]
md ..\..\..\docs
md ..\..\..\docs\lunr

typedoc --theme markdown --entryPoint botbuilder-lunr --excludePrivate --includeDeclarations --ignoreCompilerErrors --module amd --out ..\..\..\docs\lunr ..\lib\index.d.ts --hideGenerator --name "Bot Builder LUNR search component" --readme none
