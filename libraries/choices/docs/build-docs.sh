#!/bin/bash

typedoc --entryPoint botbuilder-choices --excludePrivate --includeDeclarations --ignoreCompilerErrors --module amd --out doc ../lib/index.d.ts --hideGenerator --name "Bot Builder SDK - Choices" --readme none
