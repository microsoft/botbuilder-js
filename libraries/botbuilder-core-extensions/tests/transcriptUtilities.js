/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

const fs = require('fs');
const promisify = require('util').promisify;
const readFileAsync = promisify(fs.readFile);
const chatdown = require('chatdown');

const { TestAdapter, MemoryStorage, UserState, ConversationState, BotStateSet } = require('../');

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
            // Clean the last line break (\n) from the last activity.text
            // TODO: Remove once issue is resolved: https://github.com/Microsoft/botbuilder-tools/issues/200
            var last = activities[activities.length - 1];
            if (last) {
                last.text = last.text.trimRight('\n');
            }

            return activities;
        })
}

/**
 * Creates a Mocha Test definition (Mocha.ITestDefinition) that will use the TestAdapter to test a bot logic against the specified transcript file.
 * Optionally, pass a third parameter (as function) to register middleware into the TestAdapter.
 * @param {string} transcriptPath Path to the transcript file. Can be a .chat or .transcript file.
 * @param {function} botLogicFactoryFun Function which accepts conversationState and userState and should return the bots logic to test.
 * @param {function} middlewareRegistrationFun (Optional) Function which accepts the testAdapter, conversationState and userState.
 */
function assertBotLogicWithTranscript(transcriptPath, botLogicFactoryFun, middlewareRegistrationFun) {

    var loadFun = transcriptPath.endsWith('.chat')
        ? getActivitiesFromChat
        : getActivitiesFromTranscript;

    // return a Mocha Test Definition, which accepts the done callback to indicate success or error
    return function (done) {
        loadFun(transcriptPath).then(activities => {

            // State
            const storage = new MemoryStorage();
            const conversationState = new ConversationState(storage);
            const userState = new UserState(storage);
            const state = new BotStateSet(conversationState, userState);

            // Bot logic + adapter
            var botLogic = botLogicFactoryFun(conversationState, userState)
            var adapter = new TestAdapter(botLogic);
            adapter.use(state);

            // Middleware registration
            if(typeof middlewareRegistrationFun === 'function') {
                middlewareRegistrationFun(adapter, conversationState, userState);
            }

            // Assert chain of activities
            return adapter.testActivities(activities)
                .then(done)
                .catch(done);

        }).catch(done)
    }
}

module.exports = {
    assertBotLogicWithTranscript: assertBotLogicWithTranscript,
    getActivitiesFromTranscript: getActivitiesFromTranscript,
    getActivitiesFromChat: getActivitiesFromChat
};