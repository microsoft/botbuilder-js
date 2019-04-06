// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { AdaptiveDialog, IntentRule, CancelDialog, SaveEntity, TextInput, EditArray, ArrayChangeType, SendActivity, EndDialog } from "botbuilder-dialogs-adaptive";
import { intents, events, variables, entities, user } from "../../schema";
import { getRecognizer } from "../recognizer";

export class AddToDo extends AdaptiveDialog {
    constructor() {
        super('AddToDo', [
            new SaveEntity(variables.title, entities.title),
            new TextInput(variables.title, `What would you like to call your new todo?`),
            new EditArray(ArrayChangeType.push, user.todoList, variables.title),
            new SendActivity(`Added a todo named "${variables.print.title}". You can delete it by saying "delete todo named ${variables.print.title}".`),
            new SendActivity(`To view your todos just ask me to "show my todos".`)
        ]);

        // Use parents recognizer
        this.recognizer = getRecognizer();

        // Add interruption rules
        this.addRule(new IntentRule(intents.Cancel, [
            new CancelDialog(events.CancelAdd)
        ]));
    }
}

