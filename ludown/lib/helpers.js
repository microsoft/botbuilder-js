/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const PARSERCONSTS = require('./enums/parserconsts');
const chalk = require('chalk');
/**
 * Helper function to split current file content by sections. Each section needs a parser delimiter
 *
 * @param {string} fileContent string content of current file being parsed
 * 
 * @returns {string[]} List of parsed LUIS/ QnA sections in current file
 */
module.exports.splitFileBySections = function(fileContent) {
    var linesInFile = fileContent.split(/\n|\r\n/);
    var currentSection = null;
    var middleOfSection = false;
    var sectionsInFile = [];
    var currentSectionType = null; //PARSERCONSTS
    for(lineIndex in linesInFile) {
        var currentLine = linesInFile[lineIndex].trim();
        // skip line if it is just a comment
        if(currentLine.indexOf(PARSERCONSTS.COMMENT) === 0) continue;
        // skip line if it is blank
        if(currentLine === "") continue;
        // drop any contents in this line after a comment block
        // e.g. #Greeting //this is the root intent should return #Greeting
        // #Greeting \// this should be considered should return everything
        var currentLineWithoutComments = currentLine.split(/\/\/\s*/); 
        if(currentLineWithoutComments.length > 0) {
            // exclude http[s]://
            if(!currentLineWithoutComments[0].includes('http')) currentLine = currentLineWithoutComments[0].trim();
        }

        // is this a FILEREF or URLREF section? 
        if((currentLine.indexOf(PARSERCONSTS.FILEREF) === 0) ||
           (currentLine.indexOf(PARSERCONSTS.URLREF) === 0)) {
            // handle anything in currentSection buffer
            if(currentSection !== null) {
                var previousSection = currentSection.substring(0, currentSection.lastIndexOf("\r\n"));
                sectionsInFile = validateAndPushCurrentBuffer(previousSection, sectionsInFile, currentSectionType, lineIndex);
            }
            currentSection = null;
            sectionsInFile.push(currentLine);
            middleOfSection = false;
        } else if((currentLine.indexOf(PARSERCONSTS.INTENT) === 0)) {
            // handle anything in currentSection buffer
            if(currentSection !== null) {
                var previousSection = currentSection.substring(0, currentSection.lastIndexOf("\r\n"));
                sectionsInFile = validateAndPushCurrentBuffer(previousSection, sectionsInFile, currentSectionType, lineIndex);
            }
            middleOfSection = true;
            currentSectionType = PARSERCONSTS.INTENT;
            currentSection = currentLine + "\r\n";
        } else if((currentLine.indexOf(PARSERCONSTS.ENTITY) === 0)) {
            // handle anything in currentSection buffer
            if(currentSection !== null) {
                var previousSection = currentSection.substring(0, currentSection.lastIndexOf("\r\n"));
                sectionsInFile = validateAndPushCurrentBuffer(previousSection, sectionsInFile, currentSectionType, lineIndex);
            } 
            // only list entity types can have multi-line definition
            if(currentLine.toLowerCase().includes(':list') || currentLine.toLowerCase().includes(':phraselist')){
                middleOfSection = true;
                currentSectionType = PARSERCONSTS.ENTITY;
                currentSection = currentLine + "\r\n";
            } else {
                sectionsInFile.push(currentLine);
                middleOfSection = false;
                currentSection = null;
            }
        } else if((currentLine.indexOf(PARSERCONSTS.QNA) === 0)) {
            // there can be multiple questions to answer here. So keep adding.
            middleOfSection = true;
            currentSectionType = PARSERCONSTS.QNA;
            if(currentSection !== null) {
                currentSection += currentLine + "\r\n";
            } else {
                currentSection = currentLine + "\r\n";
            }            
        } else {
            if(middleOfSection) {
                currentSection += currentLine + "\r\n";
                // did we just have an answer for QnA? 
                if(currentSectionType === PARSERCONSTS.QNA) {
                    var previousSection = currentSection.substring(0, currentSection.lastIndexOf("\r\n"));
                    sectionsInFile = validateAndPushCurrentBuffer(previousSection, sectionsInFile, currentSectionType, lineIndex);
                    currentSection = null;
                    middleOfSection = false;
                    currentSectionType = null;
                }
            } else {
                process.stdout.write(chalk.red('Error: Line #' + lineIndex + ' is not part of a Intent/ Entity/ QnA \n'));
                process.stdout.write(chalk.red('Stopping further processing.\n'));
                process.exit(1);
            }
        }
    }
    // handle anything in currentSection buffer
    if(currentSection !== null) {
        var previousSection = currentSection.substring(0, currentSection.lastIndexOf("\r\n"));
        sectionsInFile = validateAndPushCurrentBuffer(previousSection, sectionsInFile, currentSectionType, lineIndex);
    }
    return sectionsInFile;
};

/**
 * Helper function to examine type of content in the current buffer and provide validation errors based on content type
 *
 * @param {string} previousSection Contents of of the prior section being parsed
 * @param {string[]} sectionsInFile array of strings of prior sections parsed in current file
 * @param {PARSERCONSTS} currentSectionType type of current section parsed
 * @param {int} lineIndex current line index being parsed
 * 
 * @returns {string[]} updated sections in current file being parsed.
 */
var validateAndPushCurrentBuffer = function(previousSection, sectionsInFile, currentSectionType, lineIndex) {
    switch(currentSectionType) {
        case PARSERCONSTS.INTENT:
            // warn if there isnt at least one utterance in an intent
            if(previousSection.split(/\r\n/).length === 1)  {
                process.stdout.write(chalk.yellow('Line #' + lineIndex + ': [WARN] No utterances found for intent: ' + previousSection.split(/\r\n/)[0] + '\n'));
            }
            sectionsInFile.push(previousSection);
            break;
        case PARSERCONSTS.QNA:
            // warn if there isnt at least one utterance in an intent
            if(previousSection.split(/\r\n/).length === 1)  {
                process.stdout.write(chalk.yellow('Line #' + lineIndex + ': [WARN] No answer found for question' + previousSection.split(/\r\n/)[0] + '\n'));
            }
            sectionsInFile.push(previousSection);
            break;
        case PARSERCONSTS.ENTITY:
            // warn if there isnt at least one utterance in an intent
            if(previousSection.split(/\r\n/).length === 1)  {
                process.stdout.write(chalk.yellow('Line #' + lineIndex + ': [WARN] No list entity definition found for entity:' + previousSection.split(/\r\n/)[0] + '\n'));
            }
            sectionsInFile.push(previousSection);
            break;
    }
    return sectionsInFile;
};