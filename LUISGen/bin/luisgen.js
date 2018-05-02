#!/usr/bin/env node
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
let args = '';
process.argv.forEach((val, index) => {
  if (index > 1) {
    args = args + ' "' + val + '"';
  }
});
try {
  require('child_process').execSync('dotnet ' + __dirname + '/netcoreapp2.0/LUISGen.dll ' + args, { stdio: [0, 1, 2] });
}
catch (err) {
}
