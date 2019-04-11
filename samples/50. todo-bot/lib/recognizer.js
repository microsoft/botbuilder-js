"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_dialogs_adaptive_1 = require("botbuilder-dialogs-adaptive");
function getRecognizer() {
    switch (process.env.NODE_ENV) {
        case 'development':
        default:
            return devRecognizer;
    }
}
exports.getRecognizer = getRecognizer;
const devRecognizer = new botbuilder_dialogs_adaptive_1.RegExpRecognizer()
    .addIntent('AddToDo', /(?:add|create) .*(?:to-do|todo|task) .*(?:called|named) (?<title>.*)/i)
    .addIntent('AddToDo', /(?:add|create) .*(?:to-do|todo|task)/i)
    .addIntent('DeleteToDo', /(?:delete|remove|clear) .*(?:to-do|todo|task) .*(?:called|named) (?<title>.*)/i)
    .addIntent('DeleteToDo', /(?:delete|remove|clear) .*(?:to-do|todo|task)/i)
    .addIntent('ClearToDos', /(?:delete|remove|clear) (?:all|every) (?:to-dos|todos|tasks)/i)
    .addIntent('ShowToDos', /(?:show|see|view) .*(?:to-do|todo|task)/i)
    .addIntent('Help', /^help/i)
    .addIntent('Cancel', /^cancel/i);
//# sourceMappingURL=recognizer.js.map