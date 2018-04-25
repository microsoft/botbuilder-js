#!/usr/bin/env node
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const program = require('commander');
const fParser = require('../lib/parser');
const chalk = require('chalk');
program.Command.prototype.unknownOption = function (flag) {
    console.error(chalk.default.redBright(`\n  Unknown arguments: ${process.argv.slice(2).join(' ')}`));
    program.help();
};
program
    .name("ludown parse")
    .description(`Convert .lu file(s) into LUIS JSON, QnA Maker JSON/ TSV files.`)
    .command('ToLuis', 'Convert .lu file(s) into LUIS JSON file.')
    .alias('toluis')
    .command('ToQna', 'Convert .lu file(s) into QnA Maker JSON and TSV files.')
    .alias('toqna')
    .parse(process.argv);
   
