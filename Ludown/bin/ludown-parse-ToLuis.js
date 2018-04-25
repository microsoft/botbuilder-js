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
    .name("ludown parse ToLuis")
    .description(`Convert .lu file(s) into LUIS JSON file. You can optionally also request LUIS batch test input file`)
    .option('--in <luFile>', '.lu file to parse')
    .option('-l, --lu_folder <inputFolder>', 'Folder that has the .lu file. By default ludown will only look at the current folder. To look at all subfolders, include -s')
    .option('-o, --out_folder <outputFolder>', 'Output folder for all files the tool will generate')
    .option('-s, --subfolder ', 'Include sub-folders as well when looking for .lu files')
    .option('--verbose', 'Get verbose messages from parser')
    .option('-r, --luis_schema_version <luis_schema_version>', 'LUIS Schema version')
    .option('-v, --luis_versionId <luis_versionId>', 'LUIS app version')
    .option('-n, --luis_name <luis_appName>', 'LUIS app name')
    .option('-d, --luis_desc <luis_appDesc>', 'LUIS app description')
    .option('-c, --luis_culture <luis_appCulture>', 'LUIS app culture')
    .option('-t, --write_luis_batch_tests', 'Write out LUIS batch test json file')
    .parse(process.argv);

    if (process.argv.length < 3) {
        program.help();
    } else {
        if (!program.in && !program.lu_folder) {
            console.error(chalk.default.redBright(`\n  No .lu file or folder specified.`));
            program.help();
        } 
        fParser.handleFile(program, 'luis');
    }
