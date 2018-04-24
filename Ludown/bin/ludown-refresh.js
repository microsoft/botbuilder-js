#!/usr/bin/env node
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const program = require('commander');
const chalk = require('chalk');
const toLU = require('../lib/toLU');

program.Command.prototype.unknownOption = function (flag) {
    console.error(chalk.default.redBright(`\n  Unknown arguments: ${process.argv.slice(2).join(' ')}`));
    program.help();
};
program
    .name("ludown refresh")
    .description(`Convert LUIS JSON and QnAMaker TSV files into .lu file`)
    .option('-o, --out_folder <outputFolder>', 'Output folder for all files the tool will generate')
    .option('-q, --quiet', 'Quiet, no trace messages')
    .option('-i, --LUIS_File <LUIS_JSON_File>', 'LUIS JSON input file name')
    .option('-l, --QNA_File <QNA_TSV_File>', 'QnA Maker JSON output file name')
    .option('-n, --lu_File <LU_File>', 'Output .lu file name')
    .parse(process.argv);

    if (process.argv.length < 3) {
        program.help();
    } else {
        if (!program.LUIS_File && !program.QNA_File) {
            console.error(chalk.default.redBright(`\n  No LUIS input file or QnA Maker TSV specified.`));
            program.help();
        } 
        toLU.generateMarkdown(program);
    }
   
