/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const LUISObjNameEnum = require('./enums/luisobjenum');
const PARSERCONSTS = require('./enums/parserconsts');
const builtInTypes = require('./enums/luisbuiltintypes');
const helpers = require('./helpers');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const url = require('url');
const deepEqual = require('deep-equal');
const retCode = require('./enums/CLI-errors');

/**
 * Main parser code to parse current file contents into LUIS and QNA sections.
 *
 * @param {string} fileContent current file content
 * @param {boolean} log indicates if we need verbose logging.
 *  
 * @returns {additionalFilesToParse,LUISJsonStruct,qnaJsonStruct} Object that contains list of additional files to parse, parsed LUIS object and parsed QnA object
 */
module.exports.parseFile = function(fileContent, log) 
{
    var additionalFilesToParse = new Array();
    var otherTypes = ['list'];
    var LUISJsonStruct = {
        "intents": new Array(),
        "entities": new Array(),
        "composites": new Array(),
        "closedLists": new Array(),
        "regex_entities": new Array(),
        "model_features": new Array(),
        "regex_features": new Array(),
        "utterances": new Array(),
        "patterns": new Array(),
        "patternAnyEntities": new Array(),
        "prebuiltEntities": new Array()
    };
    var qnaJsonStruct = {
        "qnaList": new Array(),
        "urls": new Array()
    };
    
    var splitOnBlankLines = helpers.splitFileBySections(fileContent.toString());

    // loop through every chunk of information
    splitOnBlankLines.forEach(function(chunk) {
        chunk = chunk.trim();
        if(chunk.indexOf(PARSERCONSTS.URLREF) === 0) {
            var chunkSplitByLine = chunk.split(/\r\n|\r|\n/g);
            var urlRef_regex = chunkSplitByLine[0].trim().replace(PARSERCONSTS.URLREF, '').split(/\(['"](.*?)['"]\)/g);
            if(urlRef_regex.length !== 3 || urlRef_regex[1].trim() === '') {
                process.stderr.write(chalk.default.redBright('[ERROR]: ' + 'Invalid URL Ref: ' + chunkSplitByLine[0]));
                process.exit(retCode.INVALID_URL_REF);
            } else {
                qnaJsonStruct.urls.push(urlRef_regex[1]);
            }
        } else if(chunk.indexOf(PARSERCONSTS.FILEREF) === 0) {
            var chunkSplitByLine = chunk.split(/\r\n|\r|\n/g);
            var urlRef_regex = chunkSplitByLine[0].trim().replace(PARSERCONSTS.FILEREF, '').split(/\(['"](.*?)['"]\)/g);
            if(urlRef_regex.length !== 3 || urlRef_regex[1].trim() === '') {
                process.stderr.write(chalk.default.redBright('[ERROR]: ' + 'Invalid LU File Ref: ' + chunkSplitByLine[0]));
                process.exit(retCode.INVALID_LU_FILE_REF);
            } else {
                additionalFilesToParse.push(urlRef_regex[1]);
            }
            
        } else if(chunk.indexOf(PARSERCONSTS.URLORFILEREF) === 0) {
            var chunkSplitByLine = chunk.split(/\r\n|\r|\n/g);
            var linkValueRegEx = new RegExp(/\(.*?\)/g);
            var linkValueList = chunkSplitByLine[0].trim().match(linkValueRegEx);
            var linkValue = linkValueList[0].replace('(','').replace(')','');
            var parseUrl = url.parse(linkValue);
            if (parseUrl.host || parseUrl.hostname) {
                qnaJsonStruct.urls.push(linkValue);
            } else {
                additionalFilesToParse.push(linkValue);
            }
        } else if(chunk.indexOf(PARSERCONSTS.INTENT) === 0) {
            // split contents in this chunk by newline
            var chunkSplitByLine = chunk.split(/\r\n|\r|\n/g);
            var intentName = chunkSplitByLine[0].substring(chunkSplitByLine[0].indexOf(' ') + 1);

            // is this a QnA section? Qna sections have intent names that begin with ?
            if(intentName.trim().indexOf(PARSERCONSTS.QNA) === 0) {
                var questions = new Array();
                var answer = "";
                var InanswerSection = false;
                var InFiltersSection = false;
                var metadata = new Array();
                questions.push(intentName.replace('?', '').trim());
                chunkSplitByLine.splice(0,1);
                chunkSplitByLine.forEach(function(utterance) {
                    // do we have a filter section? 
                    if(utterance.toLowerCase().indexOf('**filters:**') === 0) {
                        InFiltersSection = true;
                    } else if(InanswerSection) {
                        // are we already in an answer section? 
                        answer += utterance + '\r\n';
                    } else {
                        // we need either another question here or a start of answer section
                        if(utterance.trim().indexOf(PARSERCONSTS.ANSWER) === 0)
                        {
                            InFiltersSection = false;
                            if(InanswerSection) {
                                answer += utterance + '\r\n';
                            } else {
                                // do not add the line that includes the beginning of answer
                                answer = "";
                                InanswerSection = true;
                            }
                        } else {
                            // do we have another question or Filter? 
                            if(InFiltersSection) {
                                if((utterance.indexOf('-') !== 0) &&
                                (utterance.indexOf('*') !== 0) && 
                                (utterance.indexOf('+') !== 0)) {
                                    process.stderr.write(chalk.default.redBright('Filter: "' + utterance + '" does not have list decoration. Use either - or * \n'));
                                    process.stderr.write(chalk.default.redBright('Stopping further processing.\n'));
                                    process.exit(retCode.INVALID_QNA_FILTER_DEF);
                                }
                                utterance = utterance.slice(2);
                                var kp = utterance.split('=');
                                if(kp.length !== 2) {
                                    process.stderr.write(chalk.default.redBright('Filter: "' + utterance + '" does not have a name = value pair. \n'));
                                    process.stderr.write(chalk.default.redBright('Stopping further processing.\n'));
                                    process.exit(retCode.INVALID_QNA_FILTER_DEF);
                                }
                                metadata.push({
                                    "name": kp[0].trim(),
                                    "value": kp[1].trim()
                                });
                            } else {
                                // we have a question
                                if((utterance.indexOf('-') !== 0) &&
                                (utterance.indexOf('*') !== 0) && 
                                (utterance.indexOf('+') !== 0)) {
                                    process.stderr.write(chalk.default.redBright('Question: "' + utterance + '" does not have list decoration. Use either - or * \n'));
                                    process.stderr.write(chalk.default.redBright('Stopping further processing.\n'));
                                    process.exit(retCode.INVALID_QNA_QUESTION_DEF);
                                }
                                utterance = utterance.slice(2);
                                questions.push(utterance.trim());
                            }
                            
                        }
                    }
                });
                var p = answer.substring(0, answer.lastIndexOf('\r\n'));
                qnaJsonStruct.qnaList.push({
                    "id": 0,
                    "answer": p.substring(0, p.lastIndexOf('```')),
                    "questions": questions,
                    "metadata": metadata, 
                    "source": "custom editorial"
                });
            } else {
                // insert only if the intent is not already present.
                addItemIfNotPresent(LUISJsonStruct, LUISObjNameEnum.INTENT, intentName);
                // remove first line from chunk
                chunkSplitByLine.splice(0,1);
                chunkSplitByLine.forEach(function(utterance)
                {
                    // remove the list decoration from line.
                    if((utterance.indexOf('-') !== 0) &&
                        (utterance.indexOf('*') !== 0) && 
                        (utterance.indexOf('+') !== 0)) {
                        process.stderr.write(chalk.default.redBright('Utterance: "' + utterance + '" does not have list decoration. Use either - or * \n'));
                        process.stderr.write(chalk.default.redBright('Stopping further processing.\n'));
                        process.exit(retCode.INVALID_UTTERANCE_DEF);
                        }
                    utterance = utterance.slice(2);
                   
                    // handle entities in the utterance
                    if(utterance.includes("{")) {
                        var entityRegex = new RegExp(/\{(.*?)\}/g);
                        var entitiesFound = utterance.match(entityRegex);
                        // treat this as labelled utterance
                        entitiesFound.forEach(function(entity) {
                            var labelledValue = "";
                            entity = entity.replace("{", "").replace("}", "");
                            // see if this is a trained simple entity of format {entityName=labelled value}
                            if(entity.includes("=")) {
                                var entitySplit = entity.split("=");
                                entity = entitySplit[0].trim();
                                labelledValue = entitySplit[1].trim();
                                if(labelledValue !== "") {
                                    // add this to entities collection unless it already exists
                                    addItemIfNotPresent(LUISJsonStruct, LUISObjNameEnum.ENTITIES, entity);
                                    // clean up uttearnce to only include labelledentityValue and add to utterances collection
                                    var updatedUtterance = utterance.replace("{" + entity + "=" + labelledValue + "}", labelledValue);
                                    var startPos = updatedUtterance.search(labelledValue);
                                    var endPos = startPos + labelledValue.length - 1;
                                    var utteranceObject = {
                                        "text": updatedUtterance,
                                        "intent":intentName,
                                        "entities": [
                                            {
                                                "entity": entity,
                                                "startPos":startPos,
                                                "endPos":endPos
                                            }
                                        ]
                                    }
                                    LUISJsonStruct.utterances.push(utteranceObject);
                                } else {
                                    process.stderr.write(chalk.default.redBright('[WARN]: No labelled value found for entity: ' + entity + ' in utterance: ' + utterance + '\n'));
                                    process.exit(retCode.MISSING_LABELLED_VALUE);
                                }
                            } else {
                                // push this utterance to patterns
                                var patternObject = {
                                    "text": utterance,
                                    "intent": intentName
                                }
                                // if this intent does not have any utterances, push this pattern as an utterance as well. 
                                var intentInUtterance = LUISJsonStruct.utterances.filter(function(item) {
                                    return item.intent == intentName;
                                    });
                                
                                if(intentInUtterance.length === 0) {
                                    var utteranceObject = {
                                        "text": utterance,
                                        "intent":intentName,
                                        "entities": []
                                    }
                                    LUISJsonStruct.utterances.push(utteranceObject);
                                }
                                
                                LUISJsonStruct.patterns.push(patternObject);
                                
                                if(utterance.includes("{")) {
                                    // handle entities
                                    var entityRegex = new RegExp(/\{(.*?)\}/g);
                                    var entitiesFound = utterance.match(entityRegex);
                                    entitiesFound.forEach(function(entity) {
                                        entity = entity.replace("{", "").replace("}", "");
                                        addItemIfNotPresent(LUISJsonStruct, LUISObjNameEnum.PATTERNANYENTITY, entity);
                                    });
                                }
                            }
                        });
                    } else {
                        // push this to utterances
                        var utteranceObject = {
                            "text": utterance,
                            "intent": intentName,
                            "entities": new Array()
                        }
                        LUISJsonStruct.utterances.push(utteranceObject);
                    }
                });
            }
        } else if(chunk.indexOf(PARSERCONSTS.ENTITY) === 0) {
            // we have an entity definition
            // split contents in this chunk by newline
            var chunkSplitByLine = chunk.split(/\r\n|\r|\n/g);
            var entityDef = chunkSplitByLine[0].replace(PARSERCONSTS.ENTITY, '').split(':');
            var entityName = entityDef[0];
            var entityType = entityDef[1];
            // see if we already have this as Pattern.Any entity
            // see if we already have this in patternAny entity collection; if so, remove it
            for(var i in LUISJsonStruct.patternAnyEntities) {
                if(LUISJsonStruct.patternAnyEntities[i].name === entityName) {
                    LUISJsonStruct.patternAnyEntities.splice(i, 1);
                    break;
                }
            }
            // add this entity to appropriate place
            // is this a builtin type? 
            if(builtInTypes.includes(entityType)) {
                // add to prebuiltEntities if it does not exist there.
                addItemIfNotPresent(LUISJsonStruct, LUISObjNameEnum.PREBUILT, entityType);
                if(entityName !== "PREBUILT") {
                    // add to prebuilt entities if this does not already exist there and if this is not PREBUILT
                    var lMatch = true;
                    for(var i in LUISJsonStruct.prebuiltEntities) {
                        if(LUISJsonStruct.prebuiltEntities[i].type === entityType) {
                            // add the entityName as a role if it does not already exist
                            if(!LUISJsonStruct.prebuiltEntities[i].roles.includes(entityName)) {
                                LUISJsonStruct.prebuiltEntities[i].roles.push(entityName);
                            } 
                            lMatch = false;
                            break;
                        }
                    }
                    if(lMatch) {
                        var prebuiltEntitesObj = {
                            "type": entityType,
                            "roles": [entityName]
                        };
                        LUISJsonStruct.prebuiltEntities.push(prebuiltEntitesObj);
                    } 
                }
            } else if(entityType.indexOf('=', entityType.length - 1) >= 0) 
            {
                // is this a list type?  
              
                // get normalized value
                var normalizedValue = entityType.substring(0, entityType.length - 1);

                // remove the first entity declaration line
                chunkSplitByLine.splice(0,1);
                var closedListObj = {};
                
                // do we already have this closed list? 
                var hasValue = false;
                var i;
                for(i in LUISJsonStruct.closedLists) {
                    if(LUISJsonStruct.closedLists[i].name === entityName) {
                        hasValue = true;
                        break;
                    }
                }
                if(!hasValue) {
                    closedListObj.name = entityName;
                    closedListObj.subLists = new Array();
                    closedListObj.roles = new Array();
                } else {
                    closedListObj = LUISJsonStruct.closedLists[i];
                }

                var readingSubList = false;
                var synonymsList = new Array();
                
                // go through the list chunk and parse. Add these as synonyms
                chunkSplitByLine.forEach(function(listLine) {
                    if((listLine.indexOf('-') !== 0) &&
                    (listLine.indexOf('*') !== 0) && 
                    (listLine.indexOf('+') !== 0)) {
                        process.stderr.write(chalk.default.redBright('[ERROR]: Synonyms list value: "' + listLine + '" does not have list decoration. Use either - or * \n'));
                        process.stderr.write(chalk.default.redBright('Stopping further processing.\n'));
                        process.exit(retCode.SYNONYMS_NOT_A_LIST);
                    }
                    listLine = listLine.slice(2);       
                    synonymsList.push(listLine.trim());
                })

                // push anything we might have left
                var subListObj = {
                    "canonicalForm": normalizedValue,
                    "list": synonymsList
                };
                closedListObj.subLists.push(subListObj);
                if(!hasValue) LUISJsonStruct.closedLists.push(closedListObj);
            } else if(entityType.toLowerCase() === 'simple') {
                // add this to entities if it doesnt exist
                addItemIfNotPresent(LUISJsonStruct, LUISObjNameEnum.ENTITIES, entityName);
            } else if(entityType.toLowerCase().trim().indexOf('phraselist') === 0) {
                // is this interchangeable? 
                var intc = false;
                if(entityType.toLowerCase().includes('interchangeable')) intc = true;
                // add this to phraseList if it doesnt exist
                chunkSplitByLine.splice(0,1);
                var pLValues = "";
                chunkSplitByLine.forEach(function(phraseListValues) {
                    if((phraseListValues.indexOf('-') !== 0) &&
                    (phraseListValues.indexOf('*') !== 0) && 
                    (phraseListValues.indexOf('+') !== 0)) {
                        process.stderr.write(chalk.default.redBright('[ERROR]: Phrase list value: "' + phraseListValues + '" does not have list decoration. Use either - or * \n'));
                        process.stderr.write(chalk.default.redBright('Stopping further processing.\n'));
                        process.exit(retCode.PHRASELIST_NOT_A_LIST);
                    }
                    phraseListValues = phraseListValues.slice(2);
                    pLValues = pLValues + phraseListValues + ',';
                });
                // remove the last ',' 
                pLValues = pLValues.substring(0, pLValues.lastIndexOf(","));
                var modelExists = false;
                if(LUISJsonStruct.model_features.length > 0) {
                    var modelIdx = 0;
                    for(modelIdx in LUISJsonStruct.model_features) {
                        if(LUISJsonStruct.model_features[modelIdx].name === entityName) {
                            modelExists = true;
                            break;
                        }
                    }
                    if(modelExists) {
                        LUISJsonStruct.model_features[modelIdx].words += ',' + pLValues;
                    } else {
                        var modelObj = {
                            "name": entityName,
                            "mode": intc,
                            "words": pLValues,
                            "activated": true
                        };
                        LUISJsonStruct.model_features.push(modelObj);
                    }
                } else {
                    var modelObj = {
                        "name": entityName,
                        "mode": intc,
                        "words": pLValues,
                        "activated": true
                    };
                    LUISJsonStruct.model_features.push(modelObj);
                }
            }
        } else if(chunk.indexOf(PARSERCONSTS.QNA) === 0) {
            // split contents in this chunk by newline
            var chunkSplitByLine = chunk.split(/\r\n|\r|\n/g);
            var qnaObj = {
                "id": 0,
                "answer": chunkSplitByLine[1],
                "questions": [chunkSplitByLine[0].replace(PARSERCONSTS.QNA, '').trim()],
                "metadata": [],
                "source": "custom editorial"
            };
            qnaJsonStruct.qnaList.push(qnaObj);
        } 
    });

    return {
        "fParse": additionalFilesToParse,
        "LUISBlob": LUISJsonStruct,
        "QnABlob": qnaJsonStruct
    };
    
};

/**
 * Helper function to add an item to collection if it does not exist
 *
 * @param {object} collection contents of the current collection
 * @param {LUISObjNameEnum} type item type
 * @param {object} value value of the current item to examine and add
 *  
 */
var addItemIfNotPresent = function(collection, type, value) {
    var hasValue = false;
    for(var i in collection[type]) {
        if(collection[type][i].name === value) {
            hasValue = true;
            break;
        }
    }
    if(!hasValue) {
        var itemObj = {};
        itemObj.name = value;
        if(type !== LUISObjNameEnum.INTENT) {
            itemObj.roles = new Array();
        }
        collection[type].push(itemObj);
    }  
};

