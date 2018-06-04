/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const retCode = require('./enums/CLI-errors');
const txtfile = require('read-text-file');

module.exports = {
    generateMarkdown(program) {
        try {
            var outFolder = process.cwd();
            var LUISJSON = {"sourceFile": "", "model": {}};
            var QnAJSONFromTSV = {"sourceFile": "", "model": []};
            var QnAJSON = {"sourceFile": "", "model": {}}
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
            
            // Do we have a LUIS file? If so, get that and load into memory
            if(program.LUIS_File) {
                LUISJSON.model = parseLUISFile(program.LUIS_File);
                LUISJSON.sourceFile = program.LUIS_File;
            }

            //do we have a QnA JSON file? If so, get that and load into memory
            if(program.QNA_FILE) {
                QnAJSON.model = parseQnAJSONFile(program.QNA_FILE);
                QnAJSON.sourceFile = program.QNA_FILE;
            }
            // construct the markdown file content
            var outFileContent = constructMdFile(LUISJSON, QnAJSON, program.LUIS_File, program.QNA_FILE);
            if(!outFileContent) {
                process.stderr.write(chalk.default.redBright('\nSorry, Unable to generate .lu file content!\n'));
                process.exit(retCode.UNKNOWN_ERROR);
            }

            // write out the file
            if(!program.lu_File) {
                var outFileName = '';
                if(LUISJSON.sourceFile) {
                    outFileName += path.basename(LUISJSON.sourceFile, path.extname(LUISJSON.sourceFile));
                }
                if(QnAJSONFromTSV.sourceFile) {
                    outFileName += path.basename(QnAJSONFromTSV.sourceFile, path.extname(QnAJSONFromTSV.sourceFile));
                }   
                program.lu_File = outFileName + '.lu'; 
            } else {
                if(program.lu_File.lastIndexOf(".lu") === -1) {
                    program.lu_File += '.lu';
                }
            }

            if(fs.existsSync(path.join(outFolder, program.lu_File))) {
                process.stderr.write(chalk.default.redBright('Output file: ' + path.join(outFolder, program.lu_File) + ' exists! You can use -n <lu file name> or -o <output_folder>\n'));
                process.exit(retCode.OUTPUT_FILE_EXISTS);
            }
            var outFileName = path.join(outFolder, program.lu_File);
            try {
                fs.writeFileSync(outFileName, outFileContent, 'utf-8');
            } catch (err) {
                process.stderr.write(chalk.default.redBright('Unable to write LU file - ' + outFileName + '\n'));
                process.exit(retCode.UNABLE_TO_WRITE_FILE);
            }
            if(program.verbose) process.stdout.write(chalk.default.italic('Successfully wrote to ' + path.join(outFolder, program.lu_File)));
        } catch (err) {
            process.stderr.write(chalk.default.redBright('Oops! Something went wrong.\n'));
            process.stderr.write(chalk.yellow(err));
            process.exit(retCode.UNKNOWN_ERROR);
        }
    }
};
/**
 * helper function to parse QnAMaker TSV file into a JSON object
 *
  * @param {String} file input LUIS JSON file name
  * @returns {object} LUIS JSON object
 */
var parseLUISFile = function(file) {
    if(!fs.existsSync(path.resolve(file))) {
        process.stderr.write(chalk.default.redBright('Sorry unable to open [' + file + ']\n'));        
        process.exit(retCode.FILE_OPEN_ERROR);
    }
    var LUISFileContent = txtfile.readSync(file);
    if (!LUISFileContent) {
        process.stderr.write(chalk.default.redBright('Sorry, error reading file: ' + file + '\n'));    
        process.exit(retCode.FILE_OPEN_ERROR);
    }
    LUISJSON = JSON.parse(LUISFileContent);
    if(LUISJSON.composites && LUISJSON.composites.length !== 0) {
        process.stderr.write(chalk.default.redBright('Sorry, input LUIS JSON file has references to composite entities. Cannot convert to .lu file.\n'));    
        process.exit(retCode.INVALID_INPUT_FILE);
    }
    if(LUISJSON.regex_entities && LUISJSON.regex_entities.length !== 0) {
        process.stderr.write(chalk.default.redBright('Sorry, input LUIS JSON file has references to regular expression entities. Cannot convert to .lu file.\n'));    
        process.exit(retCode.INVALID_INPUT_FILE);
    }
    if(LUISJSON.regex_features && LUISJSON.regex_features.length !== 0) {
        process.stderr.write(chalk.default.redBright('Sorry, input LUIS JSON file has references to regex_features. Cannot convert to .lu file.\n'));    
        process.exit(retCode.INVALID_INPUT_FILE);
    }
    return LUISJSON;
};
/**
 * helper function to parse LUIS JSON file into a JSON object
 *
 * @param {String} file input QnA TSV file name
 * @returns {object} LUIS JSON object
 */
var parseQnAJSONFile = function(file){
    if(!fs.existsSync(path.resolve(file))) {
        process.stderr.write(chalk.default.redBright('Sorry unable to open [' + file + ']\n'));        
        process.exit(retCode.FILE_OPEN_ERROR);
    }
    var QNAFileContent = txtfile.readSync(file);
    if (!QNAFileContent) {
        process.stderr.write(chalk.default.redBright('Sorry, error reading file: ' + file + '\n'));    
        process.exit(retCode.FILE_OPEN_ERROR);
    }
    QnAJSON = JSON.parse(QNAFileContent);
    if (!QnAJSON) {
        process.stderr.write(chalk.default.redBright('Sorry, error parsing file as QnA JSON: ' + file + '\n'));    
        process.exit(retCode.INVALID_INPUT_FILE);
    }
    return QnAJSON;
}
/**
 * helper function to construct the file content based on parsed luis and qna objects
 *
 * @param {object} LUISJSON Path to the root file passed in command line
 * @param {object} QnAJSONFromTSV content flushed out by commander
 * @param {String} luisFile input LUIS JSON file name
 * @param {String} QnAFile input QnA TSV file name
 * @returns {String} file content to flush to disk
 */
var constructMdFile = function(LUISJSON, QnAJSONFromTSV, luisFile, QnAFile) {
    var fileContent = "";
    var NEWLINE = '\r\n';
    if(LUISJSON.sourceFile) {
        var luisObj = {"intents" : [], "patterns" : {}};
        // go through LUIS stuff
        if(LUISJSON.model.intents.length >= 0) {
            LUISJSON.model.intents.forEach(function(intent) {
                luisObj.intents.push({
                    "intent" : intent,
                    "utterances" : []
                });
            });
        }
        if(LUISJSON.model.utterances.length >= 0) {
            LUISJSON.model.utterances.forEach(function(utteranceObj) {
                var intentInObj = luisObj.intents.filter(function(item) {
                    return item.intent.name == utteranceObj.intent;
                });
                intentInObj[0].utterances.push(utteranceObj);
            });
        }
    
        if(LUISJSON.model.patterns.length >= 0) {
            LUISJSON.model.patterns.forEach(function(patternObj) {
                var intentInObj = luisObj.intents.filter(function(item) {
                    return item.intent.name == patternObj.intent;
                });
                // only push this utterance if it does not already exist
                var utteranceExists = intentInObj[0].utterances.filter(function(utterance) {
                    return utterance.text == patternObj.pattern;
                });
                if(utteranceExists.length === 0) {
                    intentInObj[0].utterances.push({
                        "text": patternObj.pattern,
                        "intent": patternObj.intent,
                        "entities": []
                    });
                }
            });
        }
    
        if(luisObj.intents.length >= 0) {
            fileContent += NEWLINE;
            fileContent += '> # Intent definitions' + NEWLINE + NEWLINE;
            // write out intents and utterances..
            luisObj.intents.forEach(function(intent) {
                fileContent += '## ' + intent.intent.name + NEWLINE;
                intent.utterances.forEach(function(utterance) {
                    if(utterance.entities.length >= 0) {
                        // update utterance for each entity
                        var text = utterance.text;
                        var updatedText = utterance.text;
                        var offSet = 0;
                        utterance.entities.forEach(function(entity) {
                            var label = text.substring(entity.startPos, entity.endPos + 1);
                            var entityWithLabel = '{' + entity.entity + '=' + label + '}';
                            var leftText = updatedText.substring(0, entity.startPos + offSet);
                            var rightText = updatedText.substring(entity.endPos + 1 + offSet);
                            //updatedText = updatedText.replace(label, entityWithLabel);
                            updatedText = leftText + entityWithLabel + rightText;
                            offSet += entityWithLabel.length - label.length;
                        })
                    }
                    if(updatedText) fileContent += '- ' + updatedText + NEWLINE;
                });
                fileContent += NEWLINE + NEWLINE;
            });
        }
        
        if(LUISJSON.model.entities && LUISJSON.model.entities.length >= 0) {
            fileContent += '> # Entity definitions' + NEWLINE + NEWLINE;
            LUISJSON.model.entities.forEach(function(entity) {
                fileContent += '$' + entity.name + ':simple' + NEWLINE + NEWLINE;
            });
            fileContent += NEWLINE;
        }
    
        if(LUISJSON.model.prebuiltEntities && LUISJSON.model.prebuiltEntities.length >= 0){
            fileContent += '> # PREBUILT Entity definitions' + NEWLINE + NEWLINE;
            LUISJSON.model.prebuiltEntities.forEach(function(entity) {
                fileContent += '$PREBUILT:' + entity.name + NEWLINE + NEWLINE;
            });
            fileContent += NEWLINE;
        }
        
        if(LUISJSON.model.model_features && LUISJSON.model.model_features.length >= 0) {
            fileContent += '> # Phrase list definitions' + NEWLINE + NEWLINE;
            LUISJSON.model.model_features.forEach(function(entity) {
                fileContent += '$' + entity.name + ':phraseList' + NEWLINE;
                fileContent += '- ' + entity.words + NEWLINE;
            });
            fileContent += NEWLINE;
        }
        if(LUISJSON.model.closedLists && LUISJSON.model.closedLists.length >= 0){
            fileContent += '> # List entities' + NEWLINE + NEWLINE;
            LUISJSON.model.closedLists.forEach(function(ListItem) {
                ListItem.subLists.forEach(function(list) {
                    fileContent += '$' + ListItem.name + ':' + list.canonicalForm + '=' + NEWLINE;
                    list.list.forEach(function(listItem) {
                        fileContent += '- ' + listItem + NEWLINE;
                    });
                    fileContent += NEWLINE;
                });
                fileContent += NEWLINE + NEWLINE;
            });
        }
    }
    
    if(QnAJSONFromTSV.sourceFile) {
        // go through anything in QnAJSONFromTSV .. 
        fileContent += '> # QnA pairs' + NEWLINE + NEWLINE;
        var root = null;
        if(QnAJSONFromTSV.model.qnaDocuments) {
            root = QnAJSONFromTSV.model.qnaDocuments;
        } else {
            root = QnAJSONFromTSV.model.qnaList;
        }
        if(root.length > 0) {
            root.forEach(function(qnaItem) {
                fileContent += '> Source: ' + qnaItem.source + NEWLINE;
                fileContent += '## ? ' + qnaItem.questions[0] + NEWLINE;
                qnaItem.questions.splice(0,1);
                qnaItem.questions.forEach(function(question) {
                    fileContent += '- ' + question + NEWLINE;
                })
                fileContent += NEWLINE;
                if(qnaItem.metadata.length > 0) {
                    fileContent += NEWLINE + '**Filters:**' + NEWLINE;
                    qnaItem.metadata.forEach(function(filter) {
                        fileContent += '- ' + filter.name + ' = ' + filter.value + NEWLINE;    
                    });
                    fileContent += NEWLINE;
                }
                fileContent += '```markdown' + NEWLINE;
                fileContent += qnaItem.answer + NEWLINE;
                fileContent += '```' + NEWLINE + NEWLINE;
            });

        }
    }
    
    if(fileContent) {
        var now = new Date();
        fileContent = '> ! Automatically generated by [LUDown CLI](https://github.com/Microsoft/botbuilder-tools/tree/master/Ludown), ' + now.toString() + NEWLINE + NEWLINE + 
                      '> ! Source LUIS JSON file: ' + (LUISJSON.sourceFile?LUISJSON.sourceFile:"Not Specified") + NEWLINE + NEWLINE +
                      '> ! Source QnA TSV file: ' + (QnAJSONFromTSV.sourceFile?QnAJSONFromTSV.sourceFile:"Not Specified") + NEWLINE + NEWLINE + fileContent;
    }
    return fileContent;
};
