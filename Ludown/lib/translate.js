#!/usr/bin/env node
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const retCode = require('./enums/CLI-errors');
const txtfile = require('read-text-file');
const parseFileContents = require('./parseFileContents');

module.exports = {
    translateContent(program) {
        var filesToParse = [];
        var rootFile = '';

        if(program.in) {
            rootFile = program.in;
            filesToParse.push(program.in);
        }
        
        if(program.lu_folder) {
            // is this a folder? 
            if(!fs.statSync(program.lu_folder).isDirectory()) {
                process.stderr.write(chalk.default.redBright('Sorry, ' + program.lu_folder + ' is not a folder or does not exist'));
                process.exit(retCode.OUTPUT_FOLDER_INVALID);
            }
            if(program.subfolder) {
                filesToParse = findLUFiles(program.lu_folder, true); 
            } else {
                filesToParse = findLUFiles(program.lu_folder, false); 
            }

            if(filesToParse.length === 0) {
                process.stderr.write(chalk.default.redBright('Sorry, no .lu files found in the specified folder.'));
                process.exit(retCode.NO_LU_FILES_FOUND);
            }
            if(!rootFile) rootFile = filesToParse[0]
        }
         // is there an output folder?
         var outFolder = process.cwd();
         if(program.out_folder) {
             if(path.isAbsolute(program.out_folder)) {
                 outFolder = program.out_folder;
             } else {
                 outFolder = path.resolve('', program.out_folder);
             }
             if(!fs.existsSync(outFolder)) {
                 process.stderr.write(chalk.default.redBright('\nOutput folder ' + outFolder + ' does not exist\n'));
                 process.exit(retCode.OUTPUT_FOLDER_INVALID);
             }
         }
         while(filesToParse.length > 0) {
             var file = filesToParse[0];
             if(!fs.existsSync(path.resolve(file))) {
                 process.stderr.write(chalk.default.redBright('Sorry unable to open [' + file + ']\n'));        
                 process.exit(retCode.FILE_OPEN_ERROR);
             }
             var fileContent = txtfile.readSync(file);
             if (!fileContent) {
                 process.stderr.write(chalk.default.redBright('Sorry, error reading file:' + file + '\n'));    
                 process.exit(retCode.FILE_OPEN_ERROR);
             }
             if(program.verbose) process.stdout.write(chalk.default.whiteBright('Parsing file: ' + file + '\n'));
             var parsedContent = parseFileContents.parseFile(fileContent, program.verbose);
             if (!parsedContent) {
                 process.stderr.write(chalk.default.redBright('Sorry, file ' + file + 'had invalid content\n'));
                 process.exit(retCode.INVALID_INPUT_FILE);
             } else {
                 if(haveLUISContent(parsedContent.LUISBlob) && validateLUISBlob(parsedContent.LUISBlob)) allParsedLUISContent.push(parsedContent.LUISBlob);
                 allParsedQnAContent.push(parsedContent.QnABlob);
             }
             // remove this file from the list
             var parentFile = filesToParse.splice(0,1);
             var parentFilePath = path.parse(path.resolve(parentFile[0])).dir;
             // add additional files to parse to the list
             if(parsedContent.fParse.length > 0) {
                 parsedContent.fParse.forEach(function(file) {
                     if(path.isAbsolute(file)) {
                         filesToParse.push(file);
                     } else {
                         filesToParse.push(path.resolve(parentFilePath, file));
                     }
                 });
             }
         }
    }
};