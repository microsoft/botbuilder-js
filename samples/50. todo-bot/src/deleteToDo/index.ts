// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { AdaptiveDialog, OnIntent, CancelAllDialogs, EditArray, ArrayChangeType, SendActivity, IfCondition, ChoiceInput, LogAction, SetProperty } from "botbuilder-dialogs-adaptive";
import { getRecognizer } from "../recognizer";

export class DeleteToDo extends AdaptiveDialog {
    constructor() {
        super('DeleteToDo', [
            new LogAction(`DeleteToDo: todos = {dialog.todos}`),
            new IfCondition(`dialog.todos != null`, [
                new SetProperty('$title', '@title'),
                new ChoiceInput('$title', `Which todo would you like to remove?`, 'dialog.todos'),
                new EditArray(ArrayChangeType.remove, 'dialog.todos', '$title'),
                new SendActivity(`Deleted the todo named "{$title}".`),
                new IfCondition(`dialog.tips.clearToDos != true`, [
                    new SendActivity(`You can delete all your todos by saying "delete all todos".`),
                    new SetProperty('dialog.tips.clearToDos', 'true')
                ])
            ]).else([
                new SendActivity(`No todos to delete.`)
            ])
        ]);

        // Use parents recognizer
        this.recognizer = getRecognizer();

        // Add interruption rules
        this.addRule(new OnIntent('#Cancel', [], [
            new CancelAllDialogs('cancelDelete')
        ]));
    }
}

