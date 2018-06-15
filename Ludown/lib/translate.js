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
             // parse file content and translate
             var parsedLocContent = parseFileContents.parseAndTranslate(fileContent, program);
             if (!parsedLocContent) {
                 process.stderr.write(chalk.default.redBright('Sorry, file ' + file + 'had invalid content\n'));
                 process.exit(retCode.INVALID_INPUT_FILE);
             } else {
                 // write out file
                 //parsedLocContent.blob
             }
             // remove this file from the list
             var parentFile = filesToParse.splice(0,1);
             var parentFilePath = path.parse(path.resolve(parentFile[0])).dir;
             // TODO: add additional files to parse to the list
             if(parsedLocContent.fParse.length > 0) {
                parsedLocContent.fParse.forEach(function(file) {
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

// TODO: Move these functions into a separate module.

/**
 * Helper function to see if we have any luis content in the blob
 *
 * @param {object} blob Contents of parsed luis blob
 * @returns {boolean} true if there is any luis content in the blob
 * 
 */
var haveLUISContent = function(blob) {
    return ((blob[LUISObjNameEnum.INTENT].length > 0) ||
    (blob[LUISObjNameEnum.ENTITIES].length > 0) || 
    (blob[LUISObjNameEnum.CLOSEDLISTS].length > 0) ||
    (blob[LUISObjNameEnum.PATTERNANYENTITY].length > 0) ||
    (blob.patterns.length > 0) ||
    (blob[LUISObjNameEnum.UTTERANCE].length > 0) ||
    (blob.prebuiltEntities.length > 0) ||
    (blob.model_features.length > 0));
}

/**
 * Helper function to validate parsed LUISJsonblob
 * @param {Object} LUISJSONBlob input LUIS Json blob
 * @param {Object} entitiesList list of entities in collated models
 * @returns {Boolean} True if validation succeeds.
 */
var validateLUISBlob = function(LUISJSONBlob) {
    // patterns can have references to any other entity types. So if there is a pattern.any entity that is also defined as another type, remove the pattern.any entity
    var spliceList = [];
    if(LUISJSONBlob.patternAnyEntities.length > 0) {
        for(var i in LUISJSONBlob.patternAnyEntities) {
            var patternAnyEntity = LUISJSONBlob.patternAnyEntities[i];
            if(LUISJSONBlob.entities.filter(function(item){
                return item.name == patternAnyEntity.name
            }).length > 0) {
                spliceList.push(patternAnyEntity.name);
            }
            if(LUISJSONBlob.closedLists.filter(function(item) {
                return item.name == patternAnyEntity.name;
            }).length > 0) {
                spliceList.push(patternAnyEntity.name);
            }
            if(LUISJSONBlob.model_features.filter(function(item) {
                return item.name == patternAnyEntity.name;
            }).length > 0) {
                spliceList.push(patternAnyEntity.name);
            }
            if(LUISJSONBlob.prebuiltEntities.filter(function(item) {
                return item.name == patternAnyEntity.name;
            }).length > 0) {
                spliceList.push(patternAnyEntity.name);
            }
            
        }
    }
    if(spliceList.length > 0) {
        spliceList.forEach(function(item) {
            for(var i in LUISJSONBlob.patternAnyEntities) {
                if(LUISJSONBlob.patternAnyEntities[i].name === item) {
                    LUISJSONBlob.patternAnyEntities.splice(i, 1);
                    break;
                }
            }
        })
    }
    
    // look for entity name collisions - list, simple, patternAny, phraselist
    // look for list entities labelled
    // look for prebuilt entity labels in utterances
    var entitiesList = [];
    if(LUISJSONBlob.entities.length > 0) {
        LUISJSONBlob.entities.forEach(function(entity) {
            entitiesList.push({
                "name": entity.name,
                "type": ["simple"]
            });
        });
    }
    if(LUISJSONBlob.closedLists.length > 0){
        LUISJSONBlob.closedLists.forEach(function(entity) {
            var entityFound = entitiesList.filter(function(item) {
                return item.name == entity.name;
            });
            if(entityFound.length === 0) {
                entitiesList.push({
                    "name": entity.name,
                    "type": ["simple"]
                });
            } else {
                entityFound[0].type.push("list");
            }
        });
    }
    if(LUISJSONBlob.patternAnyEntities.length > 0) {
        LUISJSONBlob.patternAnyEntities.forEach(function(entity) {
            var entityFound = entitiesList.filter(function(item) {
                return item.name == entity.name;
            });
            if(entityFound.length === 0) {
                entitiesList.push({
                    "name": entity.name,
                    "type": ["patternAny"]
                });
            } else {
                entityFound[0].type.push("patternAny");
            }
        });
    }
    if(LUISJSONBlob.model_features.length > 0) {
        LUISJSONBlob.model_features.forEach(function(entity) {
            var entityFound = entitiesList.filter(function(item) {
                return item.name == entity.name;
            });
            if(entityFound.length === 0) {
                entitiesList.push({
                    "name": entity.name,
                    "type": ["phraseList"]
                });
            } else {
                entityFound[0].type.push("phraseList");
            }
        });
    }
    // for each entityFound, see if there are duplicate definitions
    entitiesList.forEach(function(entity) {
        if(entity.type.length > 1) {
            process.stderr.write(chalk.default.redBright('  Entity "' + entity.name + '" has duplicate definitions. \n\n'));
            process.stderr.write(chalk.default.redBright('  ' + JSON.stringify(entity.type, 2, null) + '  \n'));
            process.stderr.write(chalk.default.redBright('\n  Stopping further processing \n'));
            process.exit(retCode.DUPLICATE_ENTITIES);
        }
    });

    // do we have utterances with labelled list entities or phraselist entities? 
    if(LUISJSONBlob.utterances.length > 0) {
        LUISJSONBlob.utterances.forEach(function(utterance) {
            if(utterance.entities.length > 0) {
                utterance.entities.forEach(function(entity) {
                    var entityInList = entitiesList.filter(function(item) {
                        return item.name == entity.entity;
                    });
                    if(entityInList.length > 0) {
                        if(entityInList[0].type.includes("list")) {
                            
                            process.stderr.write(chalk.default.redBright('\n  Utterance "' + utterance.text + '", has reference to List entity type. \n\n'));
                            process.stderr.write(chalk.default.redBright('  You cannot have utterances with phraselist references in them\n'));
                            process.stderr.write(chalk.default.redBright('\n  Stopping further processing \n'));
                            process.exit(retCode.INVALID_INPUT);
                        }
                        if(entityInList[0].type.includes("phraseList")) {
                            process.stderr.write(chalk.default.redBright('\n  Utterance "' + utterance.text + '", has reference to PhraseList. \n\n'));
                            process.stderr.write(chalk.default.redBright('  You cannot have utterances with phraselist references in them\n'));
                            process.stderr.write(chalk.default.redBright('\n  Stopping further processing \n'));
                            process.exit(retCode.INVALID_INPUT);
                        }
                    }
                });
            }
        });
    }

    

    return true;
}
