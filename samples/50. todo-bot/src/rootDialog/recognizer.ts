// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { RegExpRecognizer, Recognizer } from 'botbuilder-dialogs-adaptive';
import { intents } from '../schema';

export function getRecognizer(): Recognizer {
    switch (process.env.NODE_ENV) {
        case 'development':
        default:
            return devRecognizer;
    }
}

const devRecognizer = new RegExpRecognizer()
    .addIntent(intents.AddToDo, /(?:add|create) .*(?:to-do|todo|task) .*(?:called|named) (?<title>.*)/i)
    .addIntent(intents.AddToDo, /(?:add|create) .*(?:to-do|todo|task)/i)
    .addIntent(intents.DeleteToDo, /(?:delete|remove|clear) .*(?:to-do|todo|task) .*(?:called|named) (?<title>.*)/i)
    .addIntent(intents.DeleteToDo, /(?:delete|remove|clear) .*(?:to-do|todo|task)/i)
    .addIntent(intents.ClearToDos, /(?:delete|remove|clear) (?:all|every) (?:to-dos|todos|tasks)/i)
    .addIntent(intents.ShowToDos, /(?:show|see|view) .*(?:to-do|todo|task)/i)
    .addIntent(intents.Help, /^help/i)
    .addIntent(intents.Cancel, /^cancel/i);

