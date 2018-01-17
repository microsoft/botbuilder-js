@ECHO OFF
ECHO [COMPILING DOCS]
md ..\..\..\docs
md ..\..\..\docs\connector-auth
typedoc --theme markdown --entryPoint botframework-connector-auth --excludePrivate --includeDeclarations --ignoreCompilerErrors --module amd --out ..\..\..\docs\connector-auth ..\lib\index.d.ts --hideGenerator --name "Bot Framework Connector Auth" --readme none
