// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { AdaptiveDialog, SendActivity, IfCondition, LogAction, OnBeginDialog } from "botbuilder-dialogs-adaptive";
import { getRecognizer } from "../recognizer";

export class ShowToDos extends AdaptiveDialog {
    constructor() {
        super('ShowToDos');

        this.triggers.push(new OnBeginDialog([
            new LogAction(`ShowToDos: todos = {user.todos}`, true),
            new IfCondition(`user.todos != null`, [
            ]).else([
                new SendActivity(`You have no todos.`)
            ])
        ]));

        // Use parents recognizer
        this.recognizer = getRecognizer();
    }
}
