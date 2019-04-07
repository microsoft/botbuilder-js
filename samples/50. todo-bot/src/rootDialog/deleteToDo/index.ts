// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { AdaptiveDialog, IntentRule, CancelDialog, SaveEntity, EditArray, ArrayChangeType, SendActivity, EndDialog, IfCondition, ChoiceInput } from "botbuilder-dialogs-adaptive";
import { intents, events, variables, entities, user } from "../../schema";
import { getRecognizer } from "../recognizer";

export class DeleteToDo extends AdaptiveDialog {
    constructor() {
        super('DeleteToDo', [
            new IfCondition(`user.todoList != null`, [
                new SaveEntity(variables.title, entities.title),
                new ChoiceInput(variables.title, `Which todo would you like to remove?`, user.todoList),
                new EditArray(ArrayChangeType.remove, user.todoList, variables.title),
                new SendActivity(`Deleted the todo named "${variables.print.title}". You can delete all your todos by saying "delete all todos".`)
            ]).else([
                new SendActivity(`No todos to delete.`)
            ])
        ]);

        // Use parents recognizer
        this.recognizer = getRecognizer();

        // Add interruption rules
        this.addRule(new IntentRule(intents.Cancel, [
            new CancelDialog(events.CancelDelete)
        ]));
    }
}

