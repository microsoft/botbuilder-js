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
    var inQnATable = false;
    var inQnAAnswer = false;
    var ticksAList = new Array();
    var ticksBList = new Array();
    for(lineIndex in linesInFile) {
        var currentLine = linesInFile[lineIndex].trim();

        if(currentLine.indexOf(PARSERCONSTS.ANSWER) === 0) {
            inQnAAnswer = !inQnAAnswer;
        }

        if(inQnAAnswer) {
            currentSection += currentLine + '\r\n';
            continue;
        }
        // skip line if it is just a comment
        if(currentLine.indexOf(PARSERCONSTS.COMMENT) === 0) continue;

        // skip line if it is blank
        if(currentLine === "") continue;

        // is this a FILEREF or URLREF section? 
        if((currentLine.indexOf(PARSERCONSTS.FILEREF) === 0) ||
           (currentLine.indexOf(PARSERCONSTS.URLREF) === 0)  ||
           (currentLine.indexOf(PARSERCONSTS.URLORFILEREF) === 0)) {
            // handle anything in currentSection buffer
            if(currentSection !== null) {
                var previousSection = currentSection.substring(0, currentSection.lastIndexOf("\r\n"));
                sectionsInFile = validateAndPushCurrentBuffer(previousSection, sectionsInFile, currentSectionType, lineIndex);
                inQnATable = false;
            }
            currentSection = null;
            sectionsInFile.push(currentLine);
            middleOfSection = false;
        } else if((currentLine.indexOf(PARSERCONSTS.INTENT) === 0)) {
            if(currentLine.indexOf(' ') === -1) {
                ++lineIndex;
                process.stdout.write(chalk.red('Error: Line #' + lineIndex + '. "' + currentLine + '" does not have valid intent definition \n'));
                process.stdout.write(chalk.red('Stopping further processing.\n'));
                process.exit(1);
            }
            // handle anything in currentSection buffer
            if(currentSection !== null) {
                var previousSection = currentSection.substring(0, currentSection.lastIndexOf("\r\n"));
                sectionsInFile = validateAndPushCurrentBuffer(previousSection, sectionsInFile, currentSectionType, lineIndex);
                inQnATable = false;
            }
            middleOfSection = true;
            currentSectionType = PARSERCONSTS.INTENT;
            currentSection = currentLine + "\r\n";
        } else if((currentLine.indexOf(PARSERCONSTS.ENTITY) === 0)) {
            // handle anything in currentSection buffer
            if(currentSection !== null) {
                var previousSection = currentSection.substring(0, currentSection.lastIndexOf("\r\n"));
                sectionsInFile = validateAndPushCurrentBuffer(previousSection, sectionsInFile, currentSectionType, lineIndex);
                inQnATable = false;
            } 
            // only list entity types can have multi-line definition
            var isListEntity = (currentLine.indexOf('=', currentLine.length - 1) >= 0)?true:false;

            if(isListEntity || currentLine.toLowerCase().includes(':phraselist')){
                middleOfSection = true;
                currentSectionType = PARSERCONSTS.ENTITY;
                currentSection = currentLine + "\r\n";
            } else {
                sectionsInFile.push(currentLine);
                middleOfSection = false;
                currentSection = null;
            }
        } else if((currentLine.indexOf(PARSERCONSTS.QNATABLE) === 0)) {
            // if we are already reading a QnA table, this is just a new row there.
            if(inQnATable) {
                // add this as question, answer pair
                var sections = currentLine.split('|');
                // is this a line separator? 
                var lineRegEx = new RegExp(/[-]+/);
                var lineBreak = sections[1].trim().match(lineRegEx);
                if (!lineBreak) {
                    // add this as QnA pair
                    currentSection = PARSERCONSTS.QNA + ' ' + sections[1].trim() + '\r\n' + sections[2].trim();
                    sectionsInFile = validateAndPushCurrentBuffer(currentSection, sectionsInFile, currentSectionType, lineIndex);
                    currentSection = null;
                }
                
            } else {
                currentSectionType = PARSERCONSTS.QNA;
                inQnATable = true;
            }
        } else {
            if(middleOfSection) {
                currentSection += currentLine + "\r\n";
            } else {
                ++lineIndex;
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
                ++lineIndex;
                if(previousSection.split(/\r\n/)[0].includes('?')) {
                    process.stdout.write(chalk.yellow('Line #' + lineIndex + ': [WARN] No answer found for question: ' + previousSection.split(/\r\n/)[0] + '\n'));
                } else {
                    process.stdout.write(chalk.yellow('Line #' + lineIndex + ': [WARN] No utterances found for intent: ' + previousSection.split(/\r\n/)[0] + '\n'));
                }
                --lineIndex;
            }
            sectionsInFile.push(previousSection);
            break;
        case PARSERCONSTS.QNA:
            // warn if there isnt at least one utterance in an intent
            if(previousSection.split(/\r\n/).length === 1)  {
                ++lineIndex;
                process.stdout.write(chalk.yellow('Line #' + lineIndex + ': [WARN] No answer found for question' + previousSection.split(/\r\n/)[0] + '\n'));
                --lineIndex;
            }
            sectionsInFile.push(previousSection);
            break;
        case PARSERCONSTS.ENTITY:
            // warn if there isnt at least one utterance in an intent
            if(previousSection.split(/\r\n/).length === 1)  {
                ++lineIndex;
                process.stdout.write(chalk.yellow('Line #' + lineIndex + ': [WARN] No list entity definition found for entity:' + previousSection.split(/\r\n/)[0] + '\n'));
                --lineIndex;
            }
            sectionsInFile.push(previousSection);
            break;
    }
    return sectionsInFile;
};