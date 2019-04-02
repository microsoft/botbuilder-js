"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_dialogs_adaptive_1 = require("botbuilder-dialogs-adaptive");
const schema_1 = require("../../schema");
const recognizer_1 = require("../recognizer");
class AddToDo extends botbuilder_dialogs_adaptive_1.AdaptiveDialog {
    constructor() {
        super('AddToDo');
        // Use parents recognizer
        this.recognizer = recognizer_1.getRecognizer();
        // Add interruption rules
        this.addRule(new botbuilder_dialogs_adaptive_1.IntentRule(schema_1.intents.Cancel, [
            new botbuilder_dialogs_adaptive_1.CancelDialog(schema_1.events.CancelAdd)
        ]));
        // Define main conversation flow
        this.addRule(new botbuilder_dialogs_adaptive_1.BeginDialogRule([
            new botbuilder_dialogs_adaptive_1.SaveEntity(schema_1.variables.title, schema_1.entities.title),
            new botbuilder_dialogs_adaptive_1.TextInput(schema_1.variables.title, `What would you like to call your new todo?`),
            new botbuilder_dialogs_adaptive_1.ChangeList(botbuilder_dialogs_adaptive_1.ChangeListType.push, schema_1.user.todoList, schema_1.variables.title),
            new botbuilder_dialogs_adaptive_1.SendActivity(`Added a todo named "${schema_1.variables.print.title}". You can delete it by saying "delete todo named ${schema_1.variables.print.title}".`),
            new botbuilder_dialogs_adaptive_1.SendActivity(`To view your todos just ask me to "show my todos".`),
            new botbuilder_dialogs_adaptive_1.EndDialog()
        ]));
    }
}
exports.AddToDo = AddToDo;
//# sourceMappingURL=index.js.map