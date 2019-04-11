// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { RegExpRecognizer, Recognizer } from 'botbuilder-dialogs-adaptive';

export function getRecognizer(): Recognizer {
    switch (process.env.NODE_ENV) {
        case 'development':
        default:
            return devRecognizer;
    }
}

const devRecognizer = new RegExpRecognizer()
    .addIntent('AddToDo', /(?:add|create) .*(?:to-do|todo|task) .*(?:called|named) (?<title>.*)/i)
    .addIntent('AddToDo', /(?:add|create) .*(?:to-do|todo|task)/i)
    .addIntent('DeleteToDo', /(?:delete|remove|clear) .*(?:to-do|todo|task) .*(?:called|named) (?<title>.*)/i)
    .addIntent('DeleteToDo', /(?:delete|remove|clear) .*(?:to-do|todo|task)/i)
    .addIntent('ClearToDos', /(?:delete|remove|clear) (?:all|every) (?:to-dos|todos|tasks)/i)
    .addIntent('ShowToDos', /(?:show|see|view) .*(?:to-do|todo|task)/i)
    .addIntent('Help', /^help/i)
    .addIntent('Cancel', /^cancel/i);

