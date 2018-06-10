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
    .name("ludown parse ToQna")
    .description(`Convert .lu file(s) into QnA Maker JSON file`)
    .usage('--in <luFile> | --lu_folder <inputFolder> [-s]')
    .option('--in <luFile>', '.lu file to parse')
    .option('-l, --lu_folder <inputFolder>', '[Optional] Folder with .lu file(s). By default ludown will only look at the current folder. -s to include subfolders')
    .option('-o, --out_folder <outputFolder>', '[Optional] Output folder for all files the tool will generate')
    .option('-s, --subfolder', '[Optional] Include sub-folders as well when looking for .lu files')
    .option('-n, --qna_name <QnA_KB_Name>', '[Optional] QnA KB name')
    .option('--verbose', '[Optional] Get verbose messages from parser')
    .parse(process.argv);
    
    if (process.argv.length < 4) {
        program.help();
        process.exit(retCode.UNKNOWN_OPTIONS);
    } else {
        if (!program.in && !program.lu_folder) {
            process.stderr.write(chalk.default.redBright(`\n  No .lu file or folder specified.\n`));
            program.help();
            process.exit(retCode.UNKNOWN_OPTIONS);
        } 
        fParser.handleFile(program, 'qna');
    }
