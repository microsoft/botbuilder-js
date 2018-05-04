#!/usr/bin/env node
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const pkg = require('../package.json');
let args = '';
process.argv.forEach((val, index) => {
  if (index > 1) {
    args = args + ' "' + val + '"';
  }
});
args = args.trim();
if (args == '"-v"' || args == '"--version"') {
    return process.stdout.write(pkg.version);
}
try {
  require('child_process').execSync('dotnet ' + __dirname + '/netcoreapp2.0/LUISGen.dll ' + args, { stdio: [0, 1, 2] });
}
catch (err) {
}
