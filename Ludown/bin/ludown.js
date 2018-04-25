#!/usr/bin/env node
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const program = require('commander');
const chalk = require('chalk');
var pjson = require('../package.json');
program.Command.prototype.unknownOption = function (flag) {
    console.error(chalk.default.redBright(`\n  Unknown arguments: ${process.argv.slice(2).join(' ')}`));
    program.help();
};
program
    .version(pjson.version, '-V, --Version')
    .description(`Ludown is a command line tool to bootstrap language understanding models from .lu files`)
    .command('create', 'Convert .lu file(s) into JSON and TSV files.')
    .command('refresh', 'Convert LUIS JSON and QnAMaker TSV files into .lu file')
    .parse(process.argv);
