#!/usr/bin/env node
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const program = require('commander');
const chalk = require('chalk');
var pjson = require('../package.json');
var retCode = require('../lib/enums/CLI-errors');
program.Command.prototype.unknownOption = function (flag) {
    process.stderr.write(chalk.default.redBright(`\n  Unknown arguments: ${process.argv.slice(2).join(' ')}\n`));
    program.help();
    process.exit(retCode.UNKNOWN_OPTIONS);
};
program
    .version(pjson.version, '-v, --Version')
    .description(`Ludown is a command line tool to bootstrap language understanding models from .lu files`)
    .command('parse', 'Convert .lu file(s) into LUIS JSON OR QnA Maker JSON files.')
    .alias('p')
    .command('refresh', 'Convert LUIS JSON and/ or QnAMaker JSON file into .lu file')
    .alias('d')
    .command('translate', 'Translate .lu files')
    .alias('t')
    .parse(process.argv);

    var commands = ['parse', 'p', 'refresh', 'd', 'translate', 't'];
    if (!commands.includes(process.argv[2].toLowerCase())) {
        process.stderr.write(chalk.default.redBright(`\n  Unknown command: ${process.argv.slice(2).join(' ')}\n`));
        program.help();
        process.exit(retCode.UNKNOWN_OPTIONS);
    }
