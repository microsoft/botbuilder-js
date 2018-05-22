/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

var fs = require('fs');
var promisify = require('util').promisify;
var readFileAsync = promisify(fs.readFile);
var chatdown = require('chatdown');

/**
 * Loads a list of activities from a .transcript file.
 * @param {string} transcriptFilePath Relative or absolute path to .transcript file.
 */
function getActivitiesFromTranscript(transcriptFilePath) {
    return readFileAsync(transcriptFilePath, { encoding: 'utf8' })
        .then(transcript => JSON.parse(transcript));
}

/**
 * Loads a list of activities from a .chat file.
 * @param {string} chatFilePath Relative or absolute path to .chat file.
 */
function getActivitiesFromChat(chatFilePath) {
    return readFileAsync(chatFilePath, { encoding: 'utf8' })
        .then(chat => chatdown(chat, { in: chatFilePath }))
        .then(activities => {
            // Clean the last EOL from the last activity.text
            // TODO: Remove once issue is resolved: https://github.com/Microsoft/botbuilder-tools/issues/200
            var last = activities[activities.length - 1];
            if (last) {
                last.text = last.text.trimRight('\n');
            }

            return activities;
        })
}

module.exports = {
    getActivitiesFromTranscript: getActivitiesFromTranscript,
    getActivitiesFromChat: getActivitiesFromChat
};