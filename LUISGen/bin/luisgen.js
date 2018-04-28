#!/usr/bin/env node
let args = '';
process.argv.forEach((val, index) => {
  if (index > 1) {
    args = args + ' ' + val;
  }
});
require('child_process').execSync('dotnet ' + __dirname + '/netcoreapp2.0/LUISGen.dll ' + args, {stdio:[0,1,2]});
