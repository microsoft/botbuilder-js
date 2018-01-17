#!/bin/bash

typedoc --entryPoint botbuilder-node --excludePrivate --includeDeclarations --ignoreCompilerErrors --module amd --out doc ../lib/index.d.ts --hideGenerator --name "Bot Builder SDK - Node" --readme none
