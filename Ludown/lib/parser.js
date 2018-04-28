/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const LUISObjNameEnum = require('./enums/luisobjenum');
const PARSERCONSTS = require('./enums/parserconsts');
const builtInTypes = require('./enums/luisbuiltintypes');
const parseFileContents = require('./parseFileContents');
const prebuiltTypes = require('./enums/luisbuiltintypes');
const deepEqual = require('deep-equal');

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
                if(!fs.statSync(program.lu_folder).isDirectory()) {
                    console.error(chalkdefault.redBright('Sorry, ' + program.lu_folder + ' is not a folder or does not exist'));
                    process.exit(1);
                }
                if(program.subfolder) {
                    filesToParse = findLUFiles(program.lu_folder, true); 
                } else {
                    filesToParse = findLUFiles(program.lu_folder, false); 
                }

                if(filesToParse.length === 0) {
                    console.error(chalkdefault.redBright('Sorry, no .lu files found in the specified folder.'));
                    process.exit(1);
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
                    process.stdout.write(chalk.default.redBright('\nOutput folder ' + outFolder + ' does not exist\n'));
                    process.exit(1);
                }
            }
            while(filesToParse.length > 0) {
                var file = filesToParse[0];
                if(!fs.existsSync(path.resolve(file))) {
                    process.stdout.write(chalk.default.redBright('Sorry unable to open [' + file + ']\n'));        
                    process.exit(1);
                }
                var fileContent = fs.readFileSync(file,'utf8');
                if (!fileContent) {
                    process.stdout.write(chalk.default.redBright('Sorry, error reading file:' + file + '\n'));    
                    process.exit(1);
                }
                console.log(chalk.cyan('Parsing file: ' + file + '\n'));
                var parsedContent = parseFileContents.parseFile(fileContent, program.verbose);
                if (!parsedContent) {
                    process.stdout.write(chalk.default.redBright('Sorry, file ' + file + 'had invalid content\n'));
                    process.exit(1);
                } else {
                    if(validateLUISBlob(parsedContent.LUISBlob)) allParsedLUISContent.push(parsedContent.LUISBlob);
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
            var finalQnAJSON = collateQnAFiles(allParsedQnAContent);
            if(!program.luis_versionId) program.luis_versionId = "0.1";
            if(!program.luis_schema_version) program.luis_schema_version = "2.2.0";
            if(!program.luis_name) program.luis_name = path.basename(rootFile, path.extname(rootFile));
            if(!program.luis_desc) program.luis_desc = "";
            if(!program.luis_culture) program.luis_culture = "en-us";   
            if(!program.qna_name) program.qna_name = path.basename(rootFile, path.extname(rootFile));
            finalLUISJSON.luis_schema_version = program.luis_schema_version;
            finalLUISJSON.versionId = program.luis_versionId;
            finalLUISJSON.name = program.luis_name,
            finalLUISJSON.desc = program.luis_desc;
            finalLUISJSON.culture = program.luis_culture;
            finalQnAJSON.name = program.qna_name;
            
            var writeQnAFile = (finalQnAJSON.qnaList.length > 0) || 
                            (finalQnAJSON.urls.length > 0);

            var  writeLUISFile = (finalLUISJSON[LUISObjNameEnum.INTENT].length > 0) ||
                                (finalLUISJSON[LUISObjNameEnum.ENTITIES].length > 0) || 
                                (finalLUISJSON[LUISObjNameEnum.PATTERNANYENTITY].length > 0) ||
                                (finalLUISJSON[LUISObjNameEnum.CLOSEDLISTS].length > 0) ||
                                (finalLUISJSON.patterns.length > 0) ||
                                (finalLUISJSON.utterances.length > 0) ||
                                (finalLUISJSON.bing_entities.length > 0) ||
                                (finalLUISJSON.prebuiltEntities.length > 0) ||
                                (finalLUISJSON.model_features.length > 0);

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
                    program.lOutFile = program.luis_name + "_LUISApp.json";
                }
            }
            if(!program.qOutFile) {
                if(!program.qna_name) {
                    program.qOutFile = path.basename(rootFile, path.extname(rootFile)) + "_qnaKB.json";
                } else {
                    program.qOutFile = program.qna_name + "_qnaKB.json";
                }
            }
            if(!program.qTSVFile) {
                if(!program.qna_name) {
                    program.qTSVFile = path.basename(rootFile, path.extname(rootFile)) + "_qnaTSV.tsv";
                } else {
                    program.qTSVFile = program.qna_name + "_qnaTSV.tsv";
                }
            }
            if((cmd == 'luis') && writeLUISFile) {
                // write out the final LUIS Json
                fs.writeFileSync(outFolder + '\\' + program.lOutFile, JSON.stringify(finalLUISJSON, null, 2), function(error) {
                    if(error) {
                        process.stdout.write(chalk.default.redBright('Unable to write LUIS JSON file - ' + outFolder + '\\' + program.lOutFile + '\n'));
                        process.exit(1);
                    } 
                });
                console.log(chalk.green('Successfully wrote LUIS model to ' + outFolder + '\\' + program.lOutFile + '\n'));
            }

            if((cmd == 'qna') && writeQnAFile) {
                // write out the final LUIS Json
                fs.writeFileSync(outFolder + '\\' + program.qOutFile, JSON.stringify(finalQnAJSON, null, 2), function(error) {
                    if(error) {
                        process.stdout.write(chalk.default.redBright('Unable to write QnA JSON file - ' + outFolder + '\\' + program.qOutFile + '\n'));
                        process.exit(1);
                    } 
                });
                console.log(chalk.green('Successfully wrote QnA KB to ' + outFolder + '\\' + program.qOutFile + '\n'));

                if(program.write_qna_tsv) {
                    // write tsv file for QnA maker
                    var QnAFileContent = "Question\tAnswer\tSource\tMetadata\r\n";
                    finalQnAJSON.qnaList.forEach(function(QnAPair) {
                        var filters = "";
                        if(QnAPair.metadata.length > 0) {
                            QnAPair.metadata.forEach(function(filter) {
                                filters += filter.name + ':' + filter.value + '|';
                            });
                            filters = filters.substring(0,filters.lastIndexOf('|'));
                        }
                        QnAPair.questions.forEach(function(question) {
                            QnAPair.answer = QnAPair.answer.replace('\r\n', '\\n\\n');
                            QnAFileContent += question + '\t' + QnAPair.answer + '\t Editorial \t' + filters + '\r\n' ;
                        })
                    });
                    fs.writeFileSync(outFolder + '\\' + program.qTSVFile, QnAFileContent, function(error) {
                        if(error) {
                            process.stdout.write(chalk.default.redBright('Unable to write QnA TSV file - ' + outFolder + '\\' + program.qTSVFile + '\n'));
                            process.exit(1);
                        } 
                    });
                    console.log(chalk.green('Successfully wrote QnA TSV to ' + outFolder + '\\' + program.qTSVFile + '\n'));
                }
            }

            // write luis batch test file if requested
            if((cmd == 'luis') && program.write_luis_batch_tests) {
                var LUISBatchFileName = program.lOutFile.replace("_LUISApp.json","_LUISBatchTest.json");
                // write out the final LUIS Json
                fs.writeFileSync(outFolder + '\\' + LUISBatchFileName, JSON.stringify(finalLUISJSON.utterances, null, 2), function(error) {
                    if(error) {
                        process.stdout.write(chalk.default.redBright('Unable to write LUIS batch test JSON file - ' + outFolder + '\\' + LUISBatchFileName + '\n'));
                        process.exit(1);
                    } 
                });
                console.log(chalk.green('Successfully wrote LUIS batch test JSON file to ' + outFolder + '\\' +  LUISBatchFileName + '\n'));
            }
            // write luis only to stdout
            if(program.gen_luis_only) {
                process.stdout.write(JSON.stringify(finalLUISJSON, null, 2));
                process.exit(0);
            }
            // write qna only to stdout
            if(program.gen_qna_only) {
                process.stdout.write(JSON.stringify(finalQnAJSON, null, 2));
                process.exit(0);
            }
            process.exit(0);
        } catch (err) {
            process.stdout.write(chalk.default.redBright('Oops! Something went wrong.\n'));
            process.stdout.write(chalk.yellow(err));
            process.exit(1);
        }
    }
};

/**
 * Helper function to validate parsed LUISJsonblob
 * @param {Object} LUISJSONBlob input LUIS Json blob
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
            if(LUISJSONBlob.bing_entities.filter(function(item) {
                return item == patternAnyEntity.name;
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
            process.stdout.write(chalk.default.redBright('  Entity "' + entity.name + '" has duplicate definitions. \n\n'));
            process.stdout.write(chalk.default.redBright('  ' + JSON.stringify(entity.type, 2, null) + '  \n'));
            process.stdout.write(chalk.default.redBright('\n  Stopping further processing \n'));
            process.exit(1);
        }
    });

    // do we have utterances with labelled list entities ? 
    if(LUISJSONBlob.utterances.length > 0) {
        LUISJSONBlob.utterances.forEach(function(utterance) {
            if(utterance.entities.length > 0) {
                utterance.entities.forEach(function(entity) {
                    var entityInList = entitiesList.filter(function(item) {
                        return item.name == entity.entity;
                    });
                    if(entityInList.length > 0) {
                        if(entityInList[0].type.includes("list")) {
                            process.stdout.write(chalk.default.redBright('  Entity "' + entity.name + '" has duplicate definitions. \n\n'));
                            process.stdout.write(chalk.default.redBright('  ' + JSON.stringify(entity.type, 2, null) + '  \n'));
                            process.stdout.write(chalk.default.redBright('\n  Stopping further processing \n'));
                            process.exit(1);
                        }
                    }
                });
            }
        });
    }
    return true;
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
                        var oldQnAItem = FinalQnAJSON.qnaList[fIndex];
                        if(deepEqual(oldQnAItem, newQnAItem)) {
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
        mergeResults(blob, FinalLUISJSON, LUISObjNameEnum.INTENT);
        mergeResults(blob, FinalLUISJSON, LUISObjNameEnum.ENTITIES);
        mergeResults(blob, FinalLUISJSON, LUISObjNameEnum.PATTERNANYENTITY);
        mergeResults(blob, FinalLUISJSON, LUISObjNameEnum.CLOSEDLISTS);
        // do we have patterns here?
        if(blob.patterns.length > 0) {
            blob.patterns.forEach(function(pattern) {
                FinalLUISJSON.patterns.push(pattern);
            });
        }
        // do we have utterances here?
        if(blob.utterances.length > 0) {
            blob.utterances.forEach(function(utteranceItem) {
                FinalLUISJSON.utterances.push(utteranceItem);
            });
        }
        // do we have bing_entities here? 
        if(blob.bing_entities.length > 0) {
            blob.bing_entities.forEach(function(bingEntity) {
                if(!FinalLUISJSON.bing_entities.includes(bingEntity)) FinalLUISJSON.bing_entities.push(bingEntity);
            });
        }
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
                var modelFeatureExists = false;
                for(fIndex in FinalLUISJSON.model_features) {
                    if(modelFeature.name === FinalLUISJSON.model_features[fIndex].name) {
                        // add values to the existing model feature
                        FinalLUISJSON.model_features[fIndex].words += "," + modelFeature.words;
                        modelFeatureExists = true;
                        break;
                    }
                }
                if(!modelFeatureExists) {
                    FinalLUISJSON.model_features.push(modelFeature);
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
var mergeResults = function(blob, finalCollection, type) {
    if(blob[type].length > 0) {
        blob[type].forEach(function(blobItem){
            // add if this item if it does not already exist in final collection
            var itemExists = false;
            for(fIndex in finalCollection[type]) {
                if(blobItem.name === finalCollection[type][fIndex].name){
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



