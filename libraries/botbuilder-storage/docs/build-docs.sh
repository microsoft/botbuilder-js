#!/bin/bash

typedoc --entryPoint botbuilder-storage --excludePrivate --includeDeclarations --ignoreCompilerErrors --module amd --out doc ../lib/index.d.ts --hideGenerator --name "Bot Builder SDK - Storage" --readme none
