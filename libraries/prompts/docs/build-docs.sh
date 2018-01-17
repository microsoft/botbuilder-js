#!/bin/bash

typedoc --entryPoint botbuilder-prompts --excludePrivate --includeDeclarations --ignoreCompilerErrors --module amd --out doc ../lib/index.d.ts --hideGenerator --name "Bot Builder SDK - Prompts" --readme none
