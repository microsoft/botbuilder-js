/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const LUISObjNameEnum = require('./enums/luisobjenum');
const PARSERCONSTS = require('./enums/parserconsts');
const builtInTypes = require('./enums/luisbuiltintypes');
const helpers = require('./helpers');
const chalk = require('chalk');
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
        "bing_entities": new Array(),
        "model_features": new Array(),
        "regex_features": new Array(),
        "utterances": new Array(),
        "patterns": new Array(),
        "patternAnyEntities": new Array(),
        "prebuiltEntities": new Array()
    };
    var qnaJsonStruct = {
        "qnaPairs": new Array(),
        "urls": new Array()
    };
    
    var splitOnBlankLines = helpers.splitFileBySections(fileContent.toString());

    // loop through every chunk of information
    splitOnBlankLines.forEach(function(chunk) {
        // is this an intent or entity?
        chunk = chunk.trim();
        // ignore if this line is a comment.

        // TODO: ignore inline comments
        if(!(chunk.indexOf(PARSERCONSTS.COMMENT) === 0)) {
            if(chunk.indexOf(PARSERCONSTS.URLREF) === 0) {
                var chunkSplitByLine = chunk.split(/\r\n|\r|\n/g);
                var urlRef = chunkSplitByLine[0].replace(PARSERCONSTS.URLREF + "('", '').replace(")",'').replace("'",'');
                qnaJsonStruct.urls.push(urlRef);
            } else if(chunk.indexOf(PARSERCONSTS.FILEREF) === 0) {
                var chunkSplitByLine = chunk.split(/\r\n|\r|\n/g);
                var fileRef = chunkSplitByLine[0].replace(PARSERCONSTS.FILEREF + "('", '').replace(")",'').replace("'",'');
                additionalFilesToParse.push(fileRef);
            } else if(chunk.indexOf(PARSERCONSTS.INTENT) === 0) {
                // split contents in this chunk by newline
                var chunkSplitByLine = chunk.split(/\r\n|\r|\n/g);
                var intentName = chunkSplitByLine[0].replace(PARSERCONSTS.INTENT, '').trim();
                // insert only if the intent is not already present.
                addItemIfNotPresent(LUISJsonStruct, LUISObjNameEnum.INTENT, intentName);
                // remove first line from chunk
                chunkSplitByLine.splice(0,1);
                chunkSplitByLine.forEach(function(utterance)
                {
                    // is this a pattern? 
                    if(utterance.trim().indexOf("~") === 0) {
                        // push this utterance to patterns
                        var patternObject = {
                            "text": utterance.slice(1),
                            "intent": intentName
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
                    } else {
                        if(utterance.includes("{")) {
                            var entityRegex = new RegExp(/\{(.*?)\}/g);
                            var entitiesFound = utterance.match(entityRegex);
                        
                            // treat this as labelled utterance
                            entitiesFound.forEach(function(entity) {
                                var labelledValue = "";
                                entity = entity.replace("{", "").replace("}", "");
                                // see if this is a trained simple entity of format {entityName:labelled value}
                                if(entity.includes(":")) {
                                    var entitySplit = entity.split(":");
                                    entity = entitySplit[0];
                                    labelledValue = entitySplit[1];
                                    if(labelledValue !== "") {
                                        // add this to entities collection unless it already exists
                                        addItemIfNotPresent(LUISJsonStruct, LUISObjNameEnum.ENTITIES, entity);
                                        // clean up uttearnce to only include labelledentityValue and add to utterances collection
                                        var updatedUtterance = utterance.replace("{" + entity + ":" + labelledValue + "}", labelledValue);
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
                                        if(!log) process.stdout.write(chalk.yellow('[WARN]: No labelled value found for entity: ' + entity + ' in utterance: ' + utterance + '\n'));
                                    }
                                } else {
                                    if(!log)  process.stdout.write(chalk.yellow('[WARN]: Entity ' + entity + ' in utterance: "' + utterance + '" is missing labelled value \n'));
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
                    }
                });
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
                    // add to bing_entities if it does not exist there.
                    if(!LUISJsonStruct.bing_entities.includes(entityType)) LUISJsonStruct.bing_entities.push(entityType);
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
                }
    
                // is this a list type?
                else if(entityType.toLowerCase() === 'list') {
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
                    var cForm = "";
                    var synonymsList = new Array();
                    
                    // go through the list chunk and parse
                    chunkSplitByLine.forEach(function(listLine) {
                        // do we have canonicalForm on this line? 
                        if(listLine.includes(":")) {
                            // if we are already reading a sublist, push that because we have hit a new collection.
                            if(readingSubList) {
                                var subListObj = {
                                    "canonicalForm": cForm,
                                    "list": synonymsList
                                };
                                closedListObj.subLists.push(subListObj);
                                cForm = listLine.replace(':','').trim();
                                synonymsList = new Array();
                                readingSubList = false;
                            } else {
                                cForm = listLine.replace(':','').trim();
                                synonymsList = new Array();
                                readingSubList = true;
                            }
                        } else {
                            // push this line to list values
                            synonymsList.push(listLine.trim());
                        }
                    })
    
                    // push anything we might have left
                    var subListObj = {
                        "canonicalForm": cForm,
                        "list": synonymsList
                    };
                    closedListObj.subLists.push(subListObj);
                    if(!hasValue) LUISJsonStruct.closedLists.push(closedListObj);
                } else if(entityType.toLowerCase() === 'simple') {
                    // add this to entities if it doesnt exist
                    addItemIfNotPresent(LUISJsonStruct, LUISObjNameEnum.ENTITIES, entityName);
                } else if(entityType.toLowerCase() === 'phraselist') {
                    // add this to phraseList if it doesnt exist
                    chunkSplitByLine.splice(0,1);
                    var pLValues = "";
                    chunkSplitByLine.forEach(function(phraseListValues) {
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
                                "mode": false,
                                "words": pLValues,
                                "activated": true
                            };
                            LUISJsonStruct.model_features.push(modelObj);
                        }
                    } else {
                        var modelObj = {
                            "name": entityName,
                            "mode": false,
                            "words": pLValues,
                            "activated": true
                        };
                        LUISJsonStruct.model_features.push(modelObj);
                    }
                }
            } else if(chunk.indexOf(PARSERCONSTS.QNA) === 0) {
                // split contents in this chunk by newline
                var chunkSplitByLine = chunk.split(/\r\n|\r|\n/g);
                var qnaQuestions = new Array();
                var qnaAnswer = "";
                chunkSplitByLine.forEach(function (qnaLine) {
                    qnaLine = qnaLine.trim();
                    // is this a question or answer?
                    if(qnaLine.indexOf(PARSERCONSTS.QNA) === 0) {
                        qnaQuestions.push(qnaLine.replace(PARSERCONSTS.QNA, '').trim());
                    } else {
                        qnaAnswer = qnaLine;
                    }
                });
                // for each question, add a qna pair
                qnaQuestions.forEach(function(qnaQuestion) {
                    var qnaObj = {
                        "answer": qnaAnswer,
                        "question": qnaQuestion
                    };
                    qnaJsonStruct.qnaPairs.push(qnaObj);
                });
            } 
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