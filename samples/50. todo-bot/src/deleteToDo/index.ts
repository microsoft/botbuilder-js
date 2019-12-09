// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { AdaptiveDialog, OnIntent, CancelAllDialogs, EditArray, ArrayChangeType, SendActivity, IfCondition, ChoiceInput, LogAction, SetProperty, OnBeginDialog } from "botbuilder-dialogs-adaptive";
import { getRecognizer } from "../recognizer";

export class DeleteToDo extends AdaptiveDialog {
    constructor() {
        super('DeleteToDo');

        this.triggers.push(new OnBeginDialog([
            new LogAction(`DeleteToDo: todos = {user.todos}`),
            new IfCondition(`user.todos != null`, [
                new SetProperty('$title', '@title'),
                new ChoiceInput('$title', `Which todo would you like to remove?`, 'user.todos'),
                new EditArray(ArrayChangeType.remove, 'user.todos', '$title'),
                new SendActivity(`Deleted the todo named "@{$title}".`),
                new IfCondition(`user.tips.clearToDos != true`, [
                    new SendActivity(`You can delete all your todos by saying "delete all todos".`),
                    new SetProperty('user.tips.clearToDos', 'true')
                ])
            ]).else([
                new SendActivity(`No todos to delete.`)
            ])
        ]));

        // Add interruption rules
        this.triggers.push(new OnIntent('#Cancel', [], [
            new CancelAllDialogs('cancelDelete')
        ]));

        // Use parents recognizer
        this.recognizer = getRecognizer();
    }
}

