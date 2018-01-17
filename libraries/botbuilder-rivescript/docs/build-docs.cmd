@ECHO OFF
ECHO [COMPILING DOCS]
md ..\..\..\docs
md ..\..\..\docs\rivescript

typedoc --theme markdown --entryPoint botbuilder-rivescript --excludePrivate --includeDeclarations --ignoreCompilerErrors --module amd --out ..\..\..\docs\rivescript ..\lib\rivescript.d.ts --hideGenerator --name "Bot Builder Rivescript Compoent - AI" --readme none
