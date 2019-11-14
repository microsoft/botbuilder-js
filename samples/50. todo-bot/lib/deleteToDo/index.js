"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_dialogs_adaptive_1 = require("botbuilder-dialogs-adaptive");
const recognizer_1 = require("../recognizer");
class DeleteToDo extends botbuilder_dialogs_adaptive_1.AdaptiveDialog {
    constructor() {
        super('DeleteToDo', [
            new botbuilder_dialogs_adaptive_1.LogAction(`DeleteToDo: todos = {user.todos}`),
            new botbuilder_dialogs_adaptive_1.IfCondition(`user.todos != null`, [
                new botbuilder_dialogs_adaptive_1.SetProperty('$title', '@title'),
                new botbuilder_dialogs_adaptive_1.ChoiceInput('$title', `Which todo would you like to remove?`, 'user.todos'),
                new botbuilder_dialogs_adaptive_1.EditArray(botbuilder_dialogs_adaptive_1.ArrayChangeType.remove, 'user.todos', '$title'),
                new botbuilder_dialogs_adaptive_1.SendActivity(`Deleted the todo named "{$title}".`),
                new botbuilder_dialogs_adaptive_1.IfCondition(`user.tips.clearToDos != true`, [
                    new botbuilder_dialogs_adaptive_1.SendActivity(`You can delete all your todos by saying "delete all todos".`),
                    new botbuilder_dialogs_adaptive_1.SetProperty('user.tips.clearToDos', 'true')
                ])
            ]).else([
                new botbuilder_dialogs_adaptive_1.SendActivity(`No todos to delete.`)
            ])
        ]);
        // Use parents recognizer
        this.recognizer = recognizer_1.getRecognizer();
        // Add interruption rules
        this.addRule(new botbuilder_dialogs_adaptive_1.OnIntent('#Cancel', null, [
            new botbuilder_dialogs_adaptive_1.CancelAllDialogs('cancelDelete')
        ]));
    }
}
exports.DeleteToDo = DeleteToDo;
//# sourceMappingURL=index.js.map