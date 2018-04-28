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
    .usage('--in <luFile> | --lu_folder <inputFolder> [-s]')
    .option('--in <luFile>', '.lu file to parse')
    .option('-l, --lu_folder <inputFolder>', '[Optional] Folder that has the .lu file. By default ludown will only look at the current folder. To look at all subfolders, include -s')
    .option('-o, --out_folder <outputFolder>', '[Optional] Output folder for all files the tool will generate')
    .option('-s, --subfolder', '[Optional] Include sub-folders as well when looking for .lu files')
    .option('-n, --luis_name <luis_appName>', '[Optional] LUIS app name')
    .option('-d, --luis_desc <luis_appDesc>', '[Optional] LUIS app description')
    .option('-v, --luis_versionId <luis_versionId>', '[Optional] LUIS app version', '0.1')
    .option('-c, --luis_culture <luis_appCulture>', '[Optional] LUIS app culture', 'en-us')
    .option('-r, --luis_schema_version <luis_schema_version>', '[Optional] LUIS Schema version', '2.2.0')
    .option('-t, --write_luis_batch_tests', '[Optional] Write out LUIS batch test json file')
    .option('--verbose', '[Optional] Get verbose messages from parser')
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
