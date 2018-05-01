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
    let command = __dirname + '/node_modules
    require('child_process').execSync('dotnet ' + __dirname + '/netcoreapp2.0/Dispatch.dll ' + args, { stdio: [0, 1, 2] });
}
catch (err) {
}
