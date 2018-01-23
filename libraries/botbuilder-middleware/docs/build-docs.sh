#!/bin/bash

typedoc --entryPoint botbuilder-middleware --excludePrivate --includeDeclarations --ignoreCompilerErrors --module amd --out doc ../lib/index.d.ts --hideGenerator --name "Bot Builder SDK - Middleware" --readme none
