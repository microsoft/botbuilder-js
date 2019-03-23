// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { AdaptiveDialog, IntentRule, CancelDialog, BeginDialogRule, SaveEntity, TextInput, ChangeList, ChangeListType, SendActivity, EndDialog } from "botbuilder-rules";
import { intents, events, variables, entities, user } from "../../schema";
import { getRecognizer } from "../recognizer";

export class AddToDo extends AdaptiveDialog {
    constructor() {
        super('AddToDo');

        // Use parents recognizer
        this.recognizer = getRecognizer();

        // Add interruption rules
        this.addRule(new IntentRule(intents.Cancel, [
            new CancelDialog(events.CancelAdd)
        ]));

        // Define main conversation flow
        this.addRule(new BeginDialogRule([
            new SaveEntity(variables.title, entities.title),
            new TextInput(variables.title, `What would you like to call your new todo?`),
            new ChangeList(ChangeListType.push, user.todoList, variables.title),
            new SendActivity(`Added a todo named "${variables.print.title}". You can delete it by saying "delete todo named ${variables.print.title}".`),
            new SendActivity(`To view your todos just ask me to "show my todos".`),
            new EndDialog()
        ]));
    }
}

