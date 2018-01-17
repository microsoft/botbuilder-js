#1/bin/bash

typedoc --entryPoint botbuilder-services --excludePrivate --includeDeclarations --ignoreCompilerErrors --module amd --out doc ../lib/index.d.ts --hideGenerator --name "Bot Builder SDK - Services" --readme none
