#!/usr/bin/env node
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const program = require('commander');
const chalk = require('chalk');
const toLU = require('../lib/toLU');
var retCode = require('../lib/enums/CLI-errors');
program.Command.prototype.unknownOption = function (flag) {
    process.stderr.write(chalk.default.redBright(`\n  Unknown arguments: ${process.argv.slice(2).join(' ')}\n`));
    program.help();
    process.exit(retCode.UNKNOWN_OPTIONS);
};
program
    .name("ludown refresh")
    .description(`Convert LUIS JSON and/ or QnAMaker JSON file into .lu file`)
    .usage('-i <LUISJsonFile> | -q <QnAJSONFile>')
    .option('-i, --LUIS_File <LUIS_JSON_File>', '[Optional] LUIS JSON input file name')
    .option('-q, --QNA_FILE <QNA_FILE>', '[Optional] QnA Maker JSON input file name')
    .option('-o, --out_folder <outputFolder> [optional]', '[Optional] Output folder for all files the tool will generate')
    .option('-n, --lu_File <LU_File>', '[Optional] Output .lu file name')
    .option('--verbose', '[Optional] Get verbose messages from parser')
    .option('-s, --skip_header', '[Optional] Generate .lu file without the header comment')
    .parse(process.argv);

    if (process.argv.length < 4) {
        program.help();
    } else {
        if (!program.LUIS_File && !program.QNA_FILE) {
            process.stderr.write(chalk.default.redBright(`\n  No LUIS input file or QnA Maker JSON or TSV specified.`));
            program.help();
            process.exit(retCode.UNKNOWN_OPTIONS);
        } 
        toLU.generateMarkdown(program);
    }
   
