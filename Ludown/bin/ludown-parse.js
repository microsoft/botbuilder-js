#!/usr/bin/env node
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const program = require('commander');
const fParser = require('../lib/parser');
const chalk = require('chalk');
var retCode = require('../lib/enums/CLI-errors');
program.Command.prototype.unknownOption = function (flag) {
    process.stderr.write(chalk.default.redBright(`\n  Unknown arguments: ${process.argv.slice(2).join(' ')}\n`));
    program.help();
    process.exit(retCode.UNKNOWN_OPTIONS);
};
program
    .name("ludown parse")
    .description(`Convert .lu file(s) into LUIS JSON, QnA Maker JSON files.`)
    .command('ToLuis', 'Convert .lu file(s) into LUIS JSON file.')
    .alias('toluis')
    .command('ToQna', 'Convert .lu file(s) into QnA Maker JSON files.')
    .alias('toqna')
    .parse(process.argv);
   
    var commands = ['toluis', 'toqna']
    if (!commands.includes(process.argv[2].toLowerCase())) {
        process.stderr.write(chalk.default.redBright(`\n  Unknown command: ${process.argv.slice(2).join(' ')}\n`));
        program.help();
        process.exit(retCode.UNKNOWN_OPTIONS);
    }
