@ECHO OFF
ECHO [COMPILING DOCS]
md ..\..\..\docs
md ..\..\..\docs\prompts

typedoc --theme markdown --entryPoint botbuilder-prompts --excludePrivate --includeDeclarations --ignoreCompilerErrors --module amd --out ..\..\..\docs\prompts ..\lib\index.d.ts --hideGenerator --name "Bot Builder SDK - Prompts" --readme none
