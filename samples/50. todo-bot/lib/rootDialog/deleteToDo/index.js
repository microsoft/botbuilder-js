"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_dialogs_adaptive_1 = require("botbuilder-dialogs-adaptive");
const schema_1 = require("../../schema");
const recognizer_1 = require("../recognizer");
class DeleteToDo extends botbuilder_dialogs_adaptive_1.AdaptiveDialog {
    constructor() {
        super('DeleteToDo', [
            new botbuilder_dialogs_adaptive_1.LogStep(`DeleteToDo: todoList = {user.todoList}`),
            new botbuilder_dialogs_adaptive_1.IfCondition(`user.todoList != null`, [
                new botbuilder_dialogs_adaptive_1.SaveEntity(schema_1.variables.title, schema_1.entities.title),
                new botbuilder_dialogs_adaptive_1.ChoiceInput(schema_1.variables.title, `Which todo would you like to remove?`, schema_1.user.todoList),
                new botbuilder_dialogs_adaptive_1.EditArray(botbuilder_dialogs_adaptive_1.ArrayChangeType.remove, schema_1.user.todoList, schema_1.variables.title),
                new botbuilder_dialogs_adaptive_1.SendActivity(`Deleted the todo named "${schema_1.variables.print.title}". You can delete all your todos by saying "delete all todos".`)
            ]).else([
                new botbuilder_dialogs_adaptive_1.SendActivity(`No todos to delete.`)
            ])
        ]);
        // Use parents recognizer
        this.recognizer = recognizer_1.getRecognizer();
        // Add interruption rules
        this.addRule(new botbuilder_dialogs_adaptive_1.IntentRule(schema_1.intents.Cancel, [
            new botbuilder_dialogs_adaptive_1.CancelDialog(schema_1.events.CancelDelete)
        ]));
    }
}
exports.DeleteToDo = DeleteToDo;
//# sourceMappingURL=index.js.map