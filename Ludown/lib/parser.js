/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const txtfile = require('read-text-file');
const LUISObjNameEnum = require('./enums/luisobjenum');
const PARSERCONSTS = require('./enums/parserconsts');
const builtInTypes = require('./enums/luisbuiltintypes');
const parseFileContents = require('./parseFileContents');
const prebuiltTypes = require('./enums/luisbuiltintypes');
const deepEqual = require('deep-equal');
const retCode = require('./enums/CLI-errors');

module.exports = {
    /**
     * handle parsing the root file that was passed in command line args
     *
     * @param {object} program content flushed out by commander
     */
    handleFile(program, cmd) {
        try
        {
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

            // handle root file and subseqntly own calling parse on other files found in rootFile
            var allParsedLUISContent = new Array();
            var allParsedQnAContent = new Array();
            
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
            
            if(!program.luis_versionId) program.luis_versionId = "0.1";
            if(!program.luis_schema_version) program.luis_schema_version = "3.0.0";
            if(!program.luis_name) program.luis_name = path.basename(rootFile, path.extname(rootFile));
            if(!program.luis_desc) program.luis_desc = "";
            if(!program.luis_culture) program.luis_culture = "en-us";   
            if(!program.qna_name) program.qna_name = path.basename(rootFile, path.extname(rootFile));
            if(program.luis_culture) program.luis_culture = program.luis_culture.toLowerCase();

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
                var parsedContent = parseFileContents.parseFile(fileContent, program.verbose, program.luis_culture);
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
            var finalLUISJSON = collateLUISFiles(allParsedLUISContent);
            if(haveLUISContent(parsedContent.LUISBlob)) validateLUISBlob(finalLUISJSON);
            var finalQnAJSON = collateQnAFiles(allParsedQnAContent);
            
            if(finalLUISJSON) {
                finalLUISJSON.luis_schema_version = program.luis_schema_version;
                finalLUISJSON.versionId = program.luis_versionId;
                finalLUISJSON.name = program.luis_name,
                finalLUISJSON.desc = program.luis_desc;
                finalLUISJSON.culture = program.luis_culture;
                finalQnAJSON.name = program.qna_name;
            }
            
            var writeQnAFile = (finalQnAJSON.qnaList.length > 0) || 
                               (finalQnAJSON.urls.length > 0);

            var  writeLUISFile = finalLUISJSON?true:false;

            if(!writeLUISFile && program.verbose) {
                process.stdout.write(chalk.default.yellowBright('No LUIS content found in .lu file(s)! \n'));
            }

            if(!writeQnAFile && program.verbose) {
                process.stdout.write(chalk.default.yellowBright('No QnA Maker content found in .lu file(s)! \n'));
            }

            if(program.verbose) {
                if((cmd == 'luis') && writeLUISFile) {
                    process.stdout.write(JSON.stringify(finalLUISJSON, null, 2) + '\n');
                }
                if((cmd == 'qna') && writeQnAFile) {
                    process.stdout.write(JSON.stringify(finalQnAJSON, null, 2) + '\n');
                }
            }
            
            if(!program.lOutFile) {
                if(!program.luis_name) {
                    program.lOutFile = path.basename(rootFile, path.extname(rootFile)) + "_LUISApp.json";  
                } else {
                    program.lOutFile = program.luis_name + ".json";
                }
            }
            if(!program.qOutFile) {
                if(!program.qna_name) {
                    program.qOutFile = path.basename(rootFile, path.extname(rootFile)) + "_qnaKB.json";
                } else {
                    program.qOutFile = program.qna_name + ".json";
                }
            }
            if((cmd == 'luis') && writeLUISFile) {
                var fLuisJson = JSON.stringify(finalLUISJSON, null, 2);
                var luisFilePath = path.join(outFolder, program.lOutFile);
                // write out the final LUIS Json
                try {
                    fs.writeFileSync(luisFilePath, fLuisJson, 'utf-8');
                } catch (err) {
                    process.stderr.write(chalk.default.redBright('Unable to write LUIS JSON file - ' + path.join(outFolder, program.lOutFile) + '\n'));
                    process.exit(retCode.UNABLE_TO_WRITE_FILE);
                }
                if(program.verbose) process.stdout.write(chalk.default.italic('Successfully wrote LUIS model to ' + path.join(outFolder, program.lOutFile) + '\n'));
            }
            if((cmd == 'qna') && writeQnAFile) {
                var qnaJson = JSON.stringify(finalQnAJSON, null, 2);
                var qnaFilePath = path.join(outFolder, program.qOutFile);
                // write out the final LUIS Json
                try {
                    fs.writeFileSync(qnaFilePath, qnaJson, 'utf-8');
                } catch (err) {
                    process.stderr.write(chalk.default.redBright('Unable to write QnA JSON file - ' + path.join(outFolder, program.qOutFile) + '\n'));
                    process.exit(retCode.UNABLE_TO_WRITE_FILE);
                }
                if(program.verbose) process.stdout.write(chalk.default.italic('Successfully wrote QnA KB to ' + path.join(outFolder, program.qOutFile) + '\n'));
            }
            // write luis batch test file if requested
            if((cmd == 'luis') && program.write_luis_batch_tests) {
                var lBatchFile = JSON.stringify(finalLUISJSON.utterances, null, 2);
                var LUISBatchFileName = program.lOutFile.replace(".json","_LUISBatchTest.json");
                var lBFileName = path.join(outFolder, LUISBatchFileName);
                // write out the final LUIS Json
                try {
                    fs.writeFileSync(lBFileName, lBatchFile, 'utf-8');
                } catch (err) {
                    process.stderr.write(chalk.default.redBright('Unable to write LUIS batch test JSON file - ' + path.join(outFolder, LUISBatchFileName) + '\n'));
                    process.exit(retCode.UNABLE_TO_WRITE_FILE);
                }
                if(program.verbose) console.log(chalk.default.italic('Successfully wrote LUIS batch test JSON file to ' + path.join(outFolder, LUISBatchFileName) + '\n'));
            }
            process.exit(retCode.SUCCESS);
        } catch (err) {
            process.stderr.write(chalk.default.redBright('Oops! Something went wrong.\n'));
            process.stderr.write(chalk.yellow(err));
            process.exit(retCode.UNKNOWN_ERROR);
        }
    }
};

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


/**
 * Handle collating all QnA sections across all parsed files into one QnA collection
 *
 * @param {object} parsedBlobs Contents of all parsed file blobs
 * 
 * @returns {FinalQnAJSON} Final qna json contents
 */
var collateQnAFiles = function(parsedBlobs) {
    var FinalQnAJSON = {
        "urls": [],
        "qnaList": []
    };
    
    parsedBlobs.forEach(function(blob) {
        // does this blob have URLs?
        if(blob.urls.length > 0) {
            // add this url if this does not already exist in finaljson
            blob.urls.forEach(function(qnaUrl) {
                if(!FinalQnAJSON.urls.includes(qnaUrl)) {
                    FinalQnAJSON.urls.push(qnaUrl);
                }
            });
        }

        // does this blob have qnapairs?
        if(blob.qnaList.length > 0) {
            // walk through each qnaPair and add it if it does not exist
            blob.qnaList.forEach(function(newQnAItem) {
                if(FinalQnAJSON.qnaList.length == 0) {
                    FinalQnAJSON.qnaList.push(newQnAItem);
                } else {
                    var qnaExists = false;
                    var fIndex = 0;
                    for(fIndex in FinalQnAJSON.qnaList) {
                        if(deepEqual(FinalQnAJSON.qnaList[fIndex], newQnAItem)) {
                            qnaExists = true;
                            break;
                        }
                    }
                    if(!qnaExists) FinalQnAJSON.qnaList.push(newQnAItem);
                }
            });
        }
    });
    return FinalQnAJSON;
};

/**
 * Handle collating all LUIS sections across all parsed files into one LUIS collection
 *
 * @param {object} parsedBlobs Contents of all parsed file blobs
 * 
 * @returns {FinalLUISJSON} Final qna json contents
 */
var collateLUISFiles = function(parsedBlobs) {
    var FinalLUISJSON = parsedBlobs[0];
    parsedBlobs.splice(0,1);
    parsedBlobs.forEach(function(blob) {
        mergeResults2(blob, FinalLUISJSON, LUISObjNameEnum.INTENT);
        mergeResults2(blob, FinalLUISJSON, LUISObjNameEnum.ENTITIES);
        mergeResults_closedlists(blob, FinalLUISJSON, LUISObjNameEnum.CLOSEDLISTS);
        mergeResults2(blob, FinalLUISJSON, LUISObjNameEnum.UTTERANCE);
        mergeResults2(blob, FinalLUISJSON, LUISObjNameEnum.PATTERNS);
        mergeResults2(blob, FinalLUISJSON, LUISObjNameEnum.PATTERNANYENTITY);
        
        // do we have prebuiltEntities here?
        if(blob.prebuiltEntities.length > 0) {
            blob.prebuiltEntities.forEach(function(prebuiltEntity){
                var prebuiltTypeExists = false;
                for(fIndex in FinalLUISJSON.prebuiltEntities) {
                    if(prebuiltEntity.type === FinalLUISJSON.prebuiltEntities[fIndex].type) {
                        // do we have all the roles? if not, merge the roles
                        prebuiltEntity.roles.forEach(function(role) {
                            if(!FinalLUISJSON.prebuiltEntities[fIndex].roles.includes(role)) {
                                FinalLUISJSON.prebuiltEntities[fIndex].roles.push(role);
                            }
                        });
                        prebuiltTypeExists = true;
                        break;
                    }
                }
                if(!prebuiltTypeExists) {
                    FinalLUISJSON.prebuiltEntities.push(prebuiltEntity);
                }
            });
        }
        // do we have model_features?
        if(blob.model_features.length > 0) {
            blob.model_features.forEach(function(modelFeature) {
                var modelFeatureInMaster = FinalLUISJSON.model_features.filter(function(item){
                    return item.name == modelFeature.name;
                });

                if(modelFeatureInMaster.length === 0){
                    FinalLUISJSON.model_features.push(modelFeature);
                } else {
                    if(modelFeatureInMaster[0].mode !== modelFeature.mode) {
                        // error.
                        process.stderr.write(chalk.default.redBright('[ERROR]: Phrase list : "' + modelFeature.name + '" has conflicting definitions. One marked interchangeable and another not interchangeable \n'));
                        process.stderr.write(chalk.default.redBright('Stopping further processing.\n'));
                        process.exit(retCode.INVALID_INPUT);
                    } else {
                        modelFeature.words.split(',').forEach(function(word) {
                            if(!modelFeatureInMaster[0].words.includes(word)) modelFeatureInMaster[0].words += "," + word;
                        })
                    }
                }
            });
        }
    }); 
    return FinalLUISJSON;
};

/**
 * Helper function to merge item if it does not already exist
 *
 * @param {object} blob Contents of all parsed file blobs
 * @param {object} finalCollection reference to the final collection of items
 * @param {LUISObjNameEnum} type enum type of possible LUIS object types
 * 
 */
var mergeResults2 = function(blob, finalCollection, type) {
    if(blob[type].length > 0) {
        blob[type].forEach(function(blobItem) {
            if(finalCollection[type].length === 0) {
                finalCollection[type].push(blobItem);
                return;
            }
            // add if this item if it does not already exist in final collection
            var itemExists = false;
            for(fIndex in finalCollection[type]) {
                if(deepEqual(finalCollection[type][fIndex],blobItem)){
                    itemExists = true;
                    break;
                }
            }
            if(!itemExists) {
                finalCollection[type].push(blobItem);
            }
        });
    }
};

/**
 * Helper function to merge closed list item if it does not already exist
 *
 * @param {object} blob Contents of all parsed file blobs
 * @param {object} finalCollection reference to the final collection of items
 * @param {LUISObjNameEnum} type enum type of possible LUIS object types
 * 
 */
var mergeResults_closedlists = function(blob, finalCollection, type) {
    if(blob[type].length > 0) {
        blob[type].forEach(function(blobItem) {
            var listInFinal = finalCollection[type].filter(function(item) {
                return item.name == blobItem.name;
            });
            if(listInFinal.length === 0) {
                finalCollection[type].push(blobItem);
            } else {
                blobItem.subLists.forEach(function(blobSLItem) {
                    // see if there is a sublist match in listInFinal
                    var slInFinal = listInFinal[0].subLists.filter(function(item) {
                        return item.canonicalForm == blobSLItem.canonicalForm
                    })
                    if(slInFinal.length === 0) {
                        listInFinal[0].subLists.push(blobSLItem);
                    } else {
                        // there is a canonical form match. See if the values all exist
                        blobSLItem.list.forEach(function(listItem) {
                            if(!slInFinal[0].list.includes(listItem)) slInFinal[0].list.push(listItem);
                        })
                    }
                });
            }

            
        });
    }
}

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


