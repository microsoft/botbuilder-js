// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { AdaptiveDialog, OnBeginDialog, OnIntent, CancelAllDialogs, TextInput, EditArray, ArrayChangeType, SendActivity, IfCondition, SetProperty } from "botbuilder-dialogs-adaptive";
import { getRecognizer } from "../recognizer";

export class AddToDo extends AdaptiveDialog {
    constructor() {
        super('AddToDo');

        this.triggers.push(new OnBeginDialog([
            new TextInput('$title', '@title', `What would you like to call your new todo?`),
            new EditArray(ArrayChangeType.push, 'user.todos', '$title'),
            new SendActivity(`Added a todo named "@{$title}". You can delete it by saying "delete todo named {$title}".`),
            new IfCondition(`user.tips.showToDos != true`, [
                new SendActivity(`To view your todos just ask me to "show my todos".`),
                new SetProperty('user.tips.showToDos', 'true')
            ])
        ]))

        // Add interruption rules
        this.triggers.push(new OnIntent('#Cancel', [], [
            new CancelAllDialogs('cancelAdd')
        ]));

        // Use parents recognizer
        this.recognizer = getRecognizer();
    }
}

