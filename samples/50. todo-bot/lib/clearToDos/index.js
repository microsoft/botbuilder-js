"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_dialogs_adaptive_1 = require("botbuilder-dialogs-adaptive");
const recognizer_1 = require("../recognizer");
class ClearToDos extends botbuilder_dialogs_adaptive_1.AdaptiveDialog {
    constructor() {
        super('ClearToDos');
        this.addRule(new botbuilder_dialogs_adaptive_1.OnBeginDialog([
            new botbuilder_dialogs_adaptive_1.LogAction(`ClearToDos: todos = {user.todos}`),
            new botbuilder_dialogs_adaptive_1.IfCondition(`user.todos != null`, [
                new botbuilder_dialogs_adaptive_1.EditArray(botbuilder_dialogs_adaptive_1.ArrayChangeType.clear, 'user.todos'),
                new botbuilder_dialogs_adaptive_1.SendActivity(`All todos removed.`)
            ]).else([
                new botbuilder_dialogs_adaptive_1.SendActivity(`No todos to clear.`)
            ])
        ]));
        // Use parents recognizer
        this.recognizer = recognizer_1.getRecognizer();
    }
}
exports.ClearToDos = ClearToDos;
//# sourceMappingURL=index.js.map