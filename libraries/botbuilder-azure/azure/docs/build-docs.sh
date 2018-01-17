#!/bin/bash

typedoc --entryPoint botbuilder-azure-v4 --excludePrivate --includeDeclarations --ignoreCompilerErrors --module amd --out doc ../lib/index.d.ts --hideGenerator --name "Bot Builder SDK - Azure v4" --readme none
