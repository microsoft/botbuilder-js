// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { AdaptiveDialog, IntentRule, CancelDialog, BeginDialogRule, SaveEntity, TextInput, ChangeList, ChangeListType, SendActivity, EndDialog, IfProperty, ChoiceInput } from "botbuilder-rules";
import { intents, events, variables, entities, user } from "../../schema";
import { getRecognizer } from "../recognizer";

export class DeleteToDo extends AdaptiveDialog {
    constructor() {
        super('DeleteToDo');

        // Use parents recognizer
        this.recognizer = getRecognizer();

        // Add interruption rules
        this.addRule(new IntentRule(intents.Cancel, [
            new CancelDialog(events.CancelDelete)
        ]));

        // Define main conversation flow
        this.addRule(new BeginDialogRule([
            new IfProperty(user.todoList, [
                new SaveEntity(variables.title, entities.title),
                new ChoiceInput(variables.title, `Which todo would you like to remove?`, user.todoList),
                new ChangeList(ChangeListType.remove, user.todoList, variables.title),
                new SendActivity(`Deleted the todo named "${variables.print.title}". You can delete all your todos by saying "delete all todos".`),
            ]).else([
                new SendActivity(`No todos to delete.`)
            ]),
            new EndDialog()
        ]));
    }
}

