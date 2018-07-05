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
const PARSERCONSTS = require('./enums/parserconsts');
const fetch = require('node-fetch');

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
            try
            {
                var folderStat = fs.statSync(program.lu_folder);
            } catch (err) {
                process.stderr.write(chalk.default.redBright('Sorry, ' + program.lu_folder + ' is not a folder or does not exist'));
                process.exit(retCode.OUTPUT_FOLDER_INVALID);
            }
            
            if(!folderStat.isDirectory()) {
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
            parse(file, program, outFolder);
            filesToParse.splice(0,1);
         }
    }
};
/**
 * Helper function to parse, translate and write out localized lu files
 * @param {string} file file name
 * @param {object} program program object from commander
 * @param {string} outFolder output folder path
 * @returns {void} nothing
 */
async function parse(file, program, outFolder) {
    let fileName = path.basename(file);
    if(!fs.existsSync(path.resolve(file))) {
        process.stderr.write(chalk.default.redBright('Sorry unable to open [' + file + ']\n'));        
        process.exit(retCode.FILE_OPEN_ERROR);
    }
    let fileContent = txtfile.readSync(file);
    if (!fileContent) {
        process.stderr.write(chalk.default.redBright('Sorry, error reading file:' + file + '\n'));    
        process.exit(retCode.FILE_OPEN_ERROR);
    }
    if(program.verbose) process.stdout.write(chalk.default.whiteBright('Parsing file: ' + file + '\n'));
    let parsedLocContent = await parseAndTranslate(fileContent, program);
    if (!parsedLocContent) {
        process.stderr.write(chalk.default.redBright('Sorry, file ' + file + 'had invalid content\n'));
        process.exit(retCode.INVALID_INPUT_FILE);
    } else {
        // write out file
        outFolder = path.join(outFolder, program.to_lang);
        try
        {
            fs.mkdirSync(outFolder);
        } catch(exception) {
            if(exception.code != 'EEXIST') {
                process.stderr.write(chalk.default.redBright('Unable to create folder - ' + exception + '\n'));
                process.exit(retCode.UNABLE_TO_WRITE_FILE);
            }
        }
        var outFileName = path.join(outFolder, fileName);
        try {
            fs.writeFileSync(outFileName, parsedLocContent, 'utf-8');
        } catch (err) {
            process.stderr.write(chalk.default.redBright('Unable to write LU file - ' + outFileName + '\n'));
            process.exit(retCode.UNABLE_TO_WRITE_FILE);
        }
        if(program.verbose) process.stdout.write(chalk.default.italic('Successfully wrote to ' + outFileName + '\n\n'));
    }
}
/**
 * Helper function to recursively get all .lu files
 * @param {string} inputfolder input folder name
 * @param {boolean} getSubFolder indicates if we should recursively look in sub-folders as well
 * @returns {Array} Array of .lu files found
 */
var findLUFiles = function(inputFolder, getSubFolders) {
    var results = [];
    const luExt = '.lu';
    fs.readdirSync(inputFolder).forEach(function(dirContent) {
        dirContent = path.resolve(inputFolder,dirContent);
        if(getSubFolders && fs.statSync(dirContent).isDirectory()) {
            results = results.concat(findLUFiles(dirContent, getSubFolders));
        }
        if(fs.statSync(dirContent).isFile()) {
            if(dirContent.endsWith(luExt)) {
                results.push(dirContent);
            }
        }
    });
    return results;
};

/**
 * Helper function to parseAndTranslate lu file content
 * @param {string} fileContent file content
 * @param {object} program program object from commander
 * @returns {string} Localized file content
 */
async function parseAndTranslate (fileContent, program) {
    let linesInFile = fileContent.split(/\n|\r\n/);
    let localizedContent = '';
    let currentSectionType = '';
    let data = '';
    const NEWLINE = '\r\n';
    const NL = '\n';
    for(lineIndex in linesInFile) {
        let currentLine = linesInFile[lineIndex];

        // is current line a comment? 
        if(currentLine.indexOf(PARSERCONSTS.COMMENT) === 0) {
            if(program.transate_comments) {
                data = await translateContent(currentLine, program.translate_key, program.to_lang, program.src_lang);
                localizedContent += data[0].translations[0].text + NEWLINE;
                if(program.verbose) process.stdout.write(chalk.default.gray(data[0].translations[0].text + NL));
            } else {
                localizedContent += currentLine + NEWLINE;
                if(program.verbose) process.stdout.write(chalk.default.gray(currentLine + NL));
            }
        } else if (currentLine.indexOf(PARSERCONSTS.INTENT) === 0) {
            var intentName = currentLine.substring(currentLine.indexOf(' ') + 1).trim();
            //is this a QnA? 
            if(intentName.indexOf(PARSERCONSTS.QNA) === 0) {
                var beforeQuestion = currentLine.substring(0, currentLine.indexOf(' ') + 1);
                var question = intentName.slice(1).trim();
                data = await translateContent(question, program.translate_key, program.to_lang, program.src_lang);
                var lText = data[0].translations[0].text;
                localizedContent += beforeQuestion + '? ' + lText + NEWLINE;
                if(program.verbose) process.stdout.write(chalk.default.gray(beforeQuestion + '? ' + lText + NL));
                currentSectionType = PARSERCONSTS.QNA;
            } else {
                // we would not localize intent name but remember we are under intent section
                currentSectionType = PARSERCONSTS.INTENT;
                localizedContent += currentLine + NEWLINE;
                if(program.verbose) process.stdout.write(chalk.default.gray(currentLine + NL));
            }
            
        } else if(currentLine.indexOf('-') === 0 || 
                  currentLine.indexOf('*') === 0 || 
                  currentLine.indexOf('+') === 0 ) {
            switch(currentSectionType) {
                case PARSERCONSTS.INTENT: 
                    // strip line of the list separator
                    var listSeparator = currentLine.charAt(0);
                    var content = currentLine.slice(1).trim();
                    var entitiesList = [];
                    
                    // strip line off labelled entity values,mark pattern any entities as not to localize
                    if(content.includes("{")) {
                        var entityRegex = new RegExp(/\{(.*?)\}/g);
                        var entitiesFound = content.match(entityRegex);
                        var eStartIndex = -1;
                        var eEndIndex = -1;
                        entitiesFound.forEach(function(entity) {
                            var lEntity = entity.replace("{", "").replace("}", "");
                            var labelledValue = '';
                            
                            // is this a labelled value? 
                            if(lEntity.includes('=')) {
                                var entitySplit = lEntity.split("=");
                                if(entitySplit.length > 2) {
                                    process.stderr.write(chalk.default.redBright('[ERROR]: Nested entity references are not supported in utterance: ' + utterance + '\n'));
                                    process.stderr.write(chalk.default.redBright('Stopping further processing.\n'));
                                    process.exit(retCode.INVALID_INPUT);
                                }
                                lEntity = entitySplit[0].trim();
                                labelledValue = entitySplit[1].trim();
                                if(!labelledValue.includes(' ')) {
                                    updatedUtteranceLeft = content.substring(0,content.indexOf(entity));
                                    updatedUtteranceRight = content.substring(content.indexOf(entity) + entity.length);
                                    content = updatedUtteranceLeft + labelledValue + updatedUtteranceRight;
                                    eStartIndex = content.indexOf(labelledValue);
                                    eEndIndex = eStartIndex + labelledValue.length - 1;
                                    entitiesList.push({
                                        'entity': lEntity,
                                        'value': labelledValue,
                                        'start': eStartIndex,
                                        'end': eEndIndex
                                    });
                                }                                 
                            } else {
                                eStartIndex = content.indexOf(lEntity);
                                eEndIndex = eStartIndex + lEntity.length - 1;
                                entitiesList.push({
                                    'entity': lEntity,
                                    'value': labelledValue,
                                    'start': eStartIndex,
                                    'end': eEndIndex
                                });
                            }
                            
                        });
                    }
                    data = await translateContent(content, program.translate_key, program.to_lang, program.src_lang);
                    if(entitiesList.length === 0) {
                        localizedContent += listSeparator + ' ' + data[0].translations[0].text + NEWLINE;
                        if(program.verbose) process.stdout.write(chalk.default.gray(listSeparator + ' ' + data[0].translations[0].text + NL));
                    } else {
                        // handle alignment
                        lText = data[0].translations[0].text;
                        if(data[0].translations[0].alignment) {
                            var alData = data[0].translations[0].alignment.proj.split(' ');
                            entitiesList.forEach(function(entity) {
                                var testIndex = entity.start + ':' + entity.end;
                                var alDataMap = alData.filter(val => {
                                    let p = val.split('-');
                                    if(p[0] === testIndex) return p[1];
                                });
                                if(alDataMap.length !== 0) {
                                    var seIndex = alDataMap[0].split('-')[1].split(':');
                                    var leftText = lText.substring(0, seIndex[0]);
                                    var rightText = lText.substring(parseInt(seIndex[1]) + 1);
                                    if(entity.value === '') {
                                        // we have a pattern any entity
                                        lText = leftText + entity.entity + rightText;
                                    } else {
                                        locLabelledValue = lText.substring(seIndex[0], parseInt(seIndex[1]) + 1);
                                        lText = leftText + '{' + entity.entity + '=' + locLabelledValue + '}' + rightText
                                    }
                                }
                            });
                        } else {
                            data = await translateContent(content, program.translate_key, program.to_lang, program.src_lang);
                            lText = data[0].translations[0].text;
                        }
                        
                        localizedContent += listSeparator + ' ' + lText + NEWLINE;
                        if(program.verbose) process.stdout.write(chalk.default.gray(listSeparator + ' ' + lText + NL));
                        
                    }
                    
                    
                    break;
                case PARSERCONSTS.ENTITY: 
                    // strip line of the list separator
                    var listSeparator = currentLine.charAt(0);
                    var content = currentLine.slice(1).trim();
                    data = await translateContent(content, program.translate_key, program.to_lang, program.src_lang);
                    var lText = data[0].translations[0].text;
                    localizedContent += listSeparator + ' ' + lText + NEWLINE;
                    if(program.verbose) process.stdout.write(chalk.default.gray(listSeparator + ' ' + lText + NL));
                    break;
                case PARSERCONSTS.QNA:
                    // strip line of the list separator
                    var listSeparator = currentLine.charAt(0);
                    var content = currentLine.slice(1).trim();
                    data = await translateContent(content, program.translate_key, program.to_lang, program.src_lang);
                    var lText = data[0].translations[0].text;
                    localizedContent += listSeparator + ' ' + lText + NEWLINE;
                    if(program.verbose) process.stdout.write(chalk.default.gray(listSeparator + ' ' + lText + NL));
                    break;
            }
        } else if(currentLine.indexOf(PARSERCONSTS.ENTITY) === 0) {
            // we would not localize entity line but remember we are under entity section for list entities
            currentSectionType = PARSERCONSTS.ENTITY;
            localizedContent += currentLine + NEWLINE;
            if(program.verbose) process.stdout.write(chalk.default.gray(currentLine + NL));
        } else if (currentLine.indexOf(PARSERCONSTS.QNA) === 0) {
            // we should localize the question
            currentSectionType = PARSERCONSTS.QNA;
        } else if(currentLine.indexOf(PARSERCONSTS.ANSWER) === 0) {
            localizedContent += currentLine + NEWLINE;
            if(program.verbose) process.stdout.write(chalk.default.gray(currentLine + NL));
            currentSectionType = PARSERCONSTS.ANSWER;
        } else if (currentLine.indexOf(PARSERCONSTS.URLORFILEREF) ===0) {
            currentSectionType = PARSERCONSTS.URLORFILEREF;
            if(program.translate_link_text) {
                var linkValueRegEx = new RegExp(/\(.*?\)/g);
                var linkValueList = currentLine.trim().match(linkValueRegEx);
                var linkValue = linkValueList[0].replace('(','').replace(')','');
                var linkTextRegEx = new RegExp(/\[.*\]/g);
                var linkTextList = currentLine.trim().match(linkTextRegEx);
                var linkTextValue = linkTextList[0].replace('[','').replace(']','');
                data = await translateContent(linkTextValue, program.translate_key, program.to_lang, program.src_lang);
                var lText = data[0].translations[0].text;
                localizedContent += '[' + lText + ']' + '(' + linkValue + ')' + NEWLINE;
                if(program.verbose) process.stdout.write(chalk.default.gray('[' + lText + ']' + '(' + linkValue + ')' + NL));
            } else {
                localizedContent += currentLine + NEWLINE;
                if(program.verbose) process.stdout.write(chalk.default.gray(currentLine + NL));
            }
        } else if(currentLine === '') {
            localizedContent += NEWLINE;
            if(program.verbose) process.stdout.write(chalk.default.gray(NL));
        } else {
            if(currentSectionType === PARSERCONSTS.ANSWER) {
                data = await translateContent(currentLine, program.translate_key, program.to_lang, program.src_lang);
                var lText = data[0].translations[0].text;
                localizedContent += lText + NEWLINE;
                if(program.verbose) process.stdout.write(chalk.default.gray(lText + NL));
            } else {
                process.stderr.write(chalk.red('Error: Unexpected line encountered when parsing \n'));
                process.stderr.write(chalk.red('[' + lineIndex + ']:' + currentLine + '\n'));
                process.stderr.write(chalk.red('Stopping further processing.\n'));
                process.exit(retCode.TRANSLATE_SERVICE_FAIL);
            }
        }
    }
    return localizedContent;
};
/**
 * Helper function to call MT rest API to translate content
 * @param {string} currentLine current text line to translate
 * @param {string} subscriptionKey user provided subscription to text translation API
 * @param {string} to_lang target language to localize to
 * @returns {object} response from MT rest call.
 */
async function translateContent(currentLine, subscriptionKey, to_lang, from_lang) {
    let tUri = 'https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=' + to_lang + '&includeAlignment=true';
    if(from_lang) tUri += '&from=' + from_lang;
    const options = {
        method: 'POST',
        body: JSON.stringify ([{'Text' : currentLine}]),
        headers: {
          'Content-Type': 'application/json',
          'Ocp-Apim-Subscription-Key' : subscriptionKey,
          'X-ClientTraceId' : get_guid (),
        }
      };
    const res = await fetch(tUri, options);
    if (!res.ok) {
        process.stderr.write(chalk.red('Error: Translation failed with the following error \n'));
        process.stderr.write(chalk.red('Response status: ' + res.status + '\n'));
        process.stderr.write(chalk.red('Response status text: ' + res.statusText + '\n'));
        process.stderr.write(chalk.red('Stopping further processing.\n'));
        process.exit(retCode.TRANSLATE_SERVICE_FAIL);
    }
    let data = await res.json();
    return data;
}
/**
 * Helper function to create a random guid
  * @returns {string} GUID
 */
let get_guid = function () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  