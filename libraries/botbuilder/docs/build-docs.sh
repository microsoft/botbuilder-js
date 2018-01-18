#!/bin/bash

typedoc --entryPoint botbuilder --excludePrivate --includeDeclarations --ignoreCompilerErrors --module amd --out doc ../lib/botbuilder.d.ts --hideGenerator --name "Bot Builder SDK - Core" --readme none