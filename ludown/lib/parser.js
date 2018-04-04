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

module.exports = {
    /**
     * handle parsing the root file that was passed in command line args
     *
     * @param {string} rootFile Path to the root file passed in command line
     * @param {object} program content flushed out by commander
     */
    handleFile(rootFile, program) {
        // handle root file and subseqntly own calling parse on other files found in rootFile
        var filesToParse = [rootFile];
        var allParsedLUISContent = new Array();
        var allParsedQnAContent = new Array();
        
        // is there an output folder?
        var outFolder = __dirname;
        if(program.out_folder) {
            if(path.isAbsolute(program.out_folder)) {
                outFolder = program.out_folder;
            } else {
                outFolder = path.resolve('', program.out_folder);
            }
            if(!fs.existsSync(outFolder)) {
                process.stdout.write(chalk.red('\nOutput folder ' + outFolder + ' does not exist\n'));
                process.exit(1);
            }
        }
        // get and save the path to root file
        var rootFilePath = __dirname;
        if(path.isAbsolute(rootFile)) {
            rootFilePath = rootFile;
        } else {
            rootFilePath = path.parse(path.resolve('', rootFile)).dir;
        }
        while(filesToParse.length > 0) {
            var file = filesToParse[0];
            if(!fs.existsSync(file)) {
                process.stdout.write(chalk.red('Sorry unable to open [' + file + ']\n'));        
                process.exit(1);
            }
            var fileContent = fs.readFileSync(file,'utf8');
            if (!fileContent) {
                process.stdout.write(chalk.red('Sorry, error reading file:' + file + '\n'));    
                process.exit(1);
            }
            if(!program.quiet) process.stdout.write(chalk.cyan('Parsing file: ' + file + '\n'));
            var parsedContent = parseFileContents.parseFile(fileContent, program.quiet);
            if (!parsedContent) {
                process.stdout.write(chalk.red('Sorry, file ' + file + 'had invalid content\n'));
                process.exit(1);
            } else {
                allParsedLUISContent.push(parsedContent.LUISBlob);
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
        if(!program.luis_schema_version) program.luis_schema_version = "2.1.0";
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
        
        var writeQnAFile = (finalQnAJSON.qnaPairs.length > 0) || 
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

        if(!program.quiet) {
            if(writeLUISFile) {
                process.stdout.write(chalk.gray('-----------------------------------\n'));
                process.stdout.write(chalk.gray('|         FINAL LUIS JSON         |\n'));
                process.stdout.write(chalk.gray('-----------------------------------\n'));
                process.stdout.write(chalk.gray(JSON.stringify(finalLUISJSON, null, 2) + '\n'));
            }
            if(writeQnAFile) {
                process.stdout.write(chalk.gray('-----------------------------------\n'));
                process.stdout.write(chalk.gray('|         FINAL QnA JSON          |\n'));
                process.stdout.write(chalk.gray('-----------------------------------\n'));
                process.stdout.write(chalk.gray(JSON.stringify(finalQnAJSON, null, 2) + '\n'));
            }
        }
        

        if(!program.lOutFile) program.lOutFile = path.basename(rootFile, path.extname(rootFile)) + "_LUISApp.json";
        if(!program.qOutFile) program.qOutFile = path.basename(rootFile, path.extname(rootFile)) + "_qnaKB.json";
        if(!program.qTSVFile) program.qTSVFile = path.basename(rootFile, path.extname(rootFile)) + "_qnaTSV.tsv"; 
        if(writeLUISFile) {
            // write out the final LUIS Json
            fs.writeFileSync(outFolder + '\\' + program.lOutFile, JSON.stringify(finalLUISJSON, null, 2), function(error) {
                if(error) {
                    process.stdout.write(chalk.red('Unable to write LUIS JSON file - ' + outFolder + '\\' + program.lOutFile + '\n'));
                    process.exit(1);
                } 
            });
            if(!program.quiet) process.stdout.write(chalk.green('Successfully wrote LUIS model to ' + outFolder + '\\' + program.lOutFile + '\n'));
        }

        if(writeQnAFile) {
            // write out the final LUIS Json
            fs.writeFileSync(outFolder + '\\' + program.qOutFile, JSON.stringify(finalQnAJSON, null, 2), function(error) {
                if(error) {
                    process.stdout.write(chalk.red('Unable to write LUIS JSON file - ' + outFolder + '\\' + program.qOutFile + '\n'));
                    process.exit(1);
                } 
            });
            if(!program.quiet) process.stdout.write(chalk.green('Successfully wrote LUIS model to ' + outFolder + '\\' + program.qOutFile + '\n'));

            // write tsv file for QnA maker
            var QnAFileContent = "";
            finalQnAJSON.qnaPairs.forEach(function(QnAPair) {
                QnAFileContent += QnAPair.question + '\t' + QnAPair.answer + '\t Editorial \r\n';
            });
            fs.writeFileSync(outFolder + '\\' + program.qTSVFile, QnAFileContent, function(error) {
                if(error) {
                    process.stdout.write(chalk.red('Unable to write LUIS JSON file - ' + outFolder + '\\' + program.qTSVFile + '\n'));
                    process.exit(1);
                } 
            });
            if(!program.quiet) process.stdout.write(chalk.green('Successfully wrote LUIS model to ' + outFolder + '\\' + program.qTSVFile + '\n'));
        }

        // write luis batch test file if requested
        if(program.write_luis_batch_tests) {
            var LUISBatchFileName = path.basename(rootFile, path.extname(rootFile)) + "_LUISBatchTest.json";
            // write out the final LUIS Json
            fs.writeFileSync(outFolder + '\\' + LUISBatchFileName, JSON.stringify(finalLUISJSON.utterances, null, 2), function(error) {
                if(error) {
                    process.stdout.write(chalk.red('Unable to write LUIS batch test JSON file - ' + outFolder + '\\' + LUISBatchFileName + '\n'));
                    process.exit(1);
                } 
            });
            if(!program.quiet) process.stdout.write(chalk.green('Successfully wrote LUIS batch test JSON file to ' + outFolder + '\\' +  LUISBatchFileName + '\n'));
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
    }
};

/**
 * Handle collating all QnA sections across all parsed files into one QnA collection
 *
 * @param {object} parsedBlobs Contents of all parsed file blobs
 * 
 * @returns {FinalQnAJSON} Final qna json contents
 */
var collateQnAFiles = function(parsedBlobs) {
    var FinalQnAJSON = parsedBlobs[0];
    parsedBlobs.splice(0,1);
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
        if(blob.qnaPairs.length > 0) {
            // walk through each qnaPair and add it if the question does not exist
            blob.qnaPairs.forEach(function(qnaPair) {
                var qnaExists = false;
                var fIndex = 0;
                for(fIndex in FinalQnAJSON.qnaPairs) {
                    if(qnaPair.question === FinalQnAJSON.qnaPairs[fIndex].question) {
                        qnaExists = true;
                        break;
                    }
                }
                if(!qnaExists) {
                    FinalQnAJSON.qnaPairs.push(qnaPair);
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



