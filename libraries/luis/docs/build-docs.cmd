@ECHO OFF
ECHO [COMPILING DOCS]
md ..\..\..\docs
md ..\..\..\docs\luis

typedoc --theme markdown --entryPoint botframework-luis --excludePrivate --includeDeclarations --ignoreCompilerErrors --module amd --out ..\..\..\docs\luis ..\lib\luisclient.d.ts --hideGenerator --name "Bot Framework LUIS SDK" --readme none
