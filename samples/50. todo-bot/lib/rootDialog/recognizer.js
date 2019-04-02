"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_dialogs_adaptive_1 = require("botbuilder-dialogs-adaptive");
const schema_1 = require("../schema");
function getRecognizer() {
    switch (process.env.NODE_ENV) {
        case 'development':
        default:
            return devRecognizer;
    }
}
exports.getRecognizer = getRecognizer;
const devRecognizer = new botbuilder_dialogs_adaptive_1.RegExpRecognizer()
    .addIntent(schema_1.intents.AddToDo, /(?:add|create) .*(?:to-do|todo|task) .*(?:called|named) (?<title>.*)/i)
    .addIntent(schema_1.intents.AddToDo, /(?:add|create) .*(?:to-do|todo|task)/i)
    .addIntent(schema_1.intents.DeleteToDo, /(?:delete|remove|clear) .*(?:to-do|todo|task) .*(?:called|named) (?<title>.*)/i)
    .addIntent(schema_1.intents.DeleteToDo, /(?:delete|remove|clear) .*(?:to-do|todo|task)/i)
    .addIntent(schema_1.intents.ClearToDos, /(?:delete|remove|clear) (?:all|every) (?:to-dos|todos|tasks)/i)
    .addIntent(schema_1.intents.ShowToDos, /(?:show|see|view) .*(?:to-do|todo|task)/i)
    .addIntent(schema_1.intents.Help, /^help/i)
    .addIntent(schema_1.intents.Cancel, /^cancel/i);
//# sourceMappingURL=recognizer.js.map