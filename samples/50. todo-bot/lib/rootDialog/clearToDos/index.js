"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_dialogs_adaptive_1 = require("botbuilder-dialogs-adaptive");
const schema_1 = require("../../schema");
const recognizer_1 = require("../recognizer");
class ClearToDos extends botbuilder_dialogs_adaptive_1.AdaptiveDialog {
    constructor() {
        super('ClearToDos');
        // Use parents recognizer
        this.recognizer = recognizer_1.getRecognizer();
        // Define main conversation flow
        this.addRule(new botbuilder_dialogs_adaptive_1.BeginDialogRule([
            new botbuilder_dialogs_adaptive_1.IfProperty(schema_1.user.todoList, [
                new botbuilder_dialogs_adaptive_1.ChangeList(botbuilder_dialogs_adaptive_1.ChangeListType.clear, schema_1.user.todoList),
                new botbuilder_dialogs_adaptive_1.SendActivity(`All todos removed.`)
            ]).else([
                new botbuilder_dialogs_adaptive_1.SendActivity(`No todos to clear.`)
            ]),
            new botbuilder_dialogs_adaptive_1.EndDialog()
        ]));
    }
}
exports.ClearToDos = ClearToDos;
//# sourceMappingURL=index.js.map