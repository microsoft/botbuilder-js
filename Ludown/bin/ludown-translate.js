#!/usr/bin/env node
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const program = require('commander');
const chalk = require('chalk');
const translate = require('../lib/translate');
var retCode = require('../lib/enums/CLI-errors');
program.Command.prototype.unknownOption = function (flag) {
    process.stderr.write(chalk.default.redBright(`\n  Unknown arguments: ${process.argv.slice(2).join(' ')}\n`));
    program.help();
    process.exit(retCode.UNKNOWN_OPTIONS);
};
program
    .name("ludown translate")
    .description(`Translate .lu files from one language to another. Uses the Microsoft translator text API.`)
    .usage('-k <translate_key> --in <luFile> | -k <translate_key> --lu_folder <inputFolder> [-s]')
    .option('--in <luFile>', '.lu file to parse')
    .option('-t, --to_lang <tgtLang>', 'Target language to translate to. See https://aka.ms/translate-langs for list of supported langauges and codes.')
    .option('-k, --translate_key <trKey>', 'Your translation key. See https://aka.ms/translate-key to get your key')
    .option('-l, --lu_folder <inputFolder>', '[Optional] Folder that has the .lu file. By default ludown will only look at the current folder. To look at all subfolders, include -s')
    .option('-o, --out_folder <outputFolder>', '[Optional] Output folder for all files the tool will generate')
    .option('-f, --src_lang <srcLang>', '[Optional] Source language. When omitted, source language is automatically detected. See https://aka.ms/translate-langs for list of supported languages and codes')
    .option('-s, --subfolder', '[Optional] Include sub-folders as well when looking for .lu files')
    .option('-n, --lu_File <LU_File>', '[Optional] Output .lu file name')
    .option('-c, --transate_comments', '[Optional] Translate comments in .lu files')
    .option('-u, --translate_link_text', '[Optional] Translate URL or .lu file reference link text')
    .option('--verbose', '[Optional] Get verbose messages from parser')
    .parse(process.argv);

    if (process.argv.length < 4) {
        program.help();
    } else {
        if (!program.in && !program.lu_folder) {
            process.stderr.write(chalk.default.redBright(`\n  No .lu file or folder specified.\n`));
            program.help();
            process.exit(retCode.UNKNOWN_OPTIONS);
        } 
        if(!program.translate_key) {
            process.stderr.write(chalk.default.redBright(`\n  No translate key provided.\n`));
            program.help();
            process.exit(retCode.UNKNOWN_OPTIONS);
        }
        if(!program.to_lang) {
            process.stderr.write(chalk.default.redBright(`\n  No target language provided.\n`));
            program.help();
            process.exit(retCode.UNKNOWN_OPTIONS);
        }
        translate.translateContent(program);
    }
   
