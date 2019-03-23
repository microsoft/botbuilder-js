"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_rules_1 = require("botbuilder-rules");
const schema_1 = require("../../schema");
const recognizer_1 = require("../recognizer");
class DeleteToDo extends botbuilder_rules_1.AdaptiveDialog {
    constructor() {
        super('DeleteToDo');
        // Use parents recognizer
        this.recognizer = recognizer_1.getRecognizer();
        // Add interruption rules
        this.addRule(new botbuilder_rules_1.IntentRule(schema_1.intents.Cancel, [
            new botbuilder_rules_1.CancelDialog(schema_1.events.CancelDelete)
        ]));
        // Define main conversation flow
        this.addRule(new botbuilder_rules_1.BeginDialogRule([
            new botbuilder_rules_1.IfProperty(schema_1.user.todoList, [
                new botbuilder_rules_1.SaveEntity(schema_1.variables.title, schema_1.entities.title),
                new botbuilder_rules_1.ChoiceInput(schema_1.variables.title, `Which todo would you like to remove?`, schema_1.user.todoList),
                new botbuilder_rules_1.ChangeList(botbuilder_rules_1.ChangeListType.remove, schema_1.user.todoList, schema_1.variables.title),
                new botbuilder_rules_1.SendActivity(`Deleted the todo named "${schema_1.variables.print.title}". You can delete all your todos by saying "delete all todos".`),
            ]).else([
                new botbuilder_rules_1.SendActivity(`No todos to delete.`)
            ]),
            new botbuilder_rules_1.EndDialog()
        ]));
    }
}
exports.DeleteToDo = DeleteToDo;
//# sourceMappingURL=index.js.map