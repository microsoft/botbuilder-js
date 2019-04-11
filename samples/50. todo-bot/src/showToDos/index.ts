// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { AdaptiveDialog, SendActivity, IfCondition, SendList, LogStep } from "botbuilder-dialogs-adaptive";
import { getRecognizer } from "../recognizer";

export class ShowToDos extends AdaptiveDialog {
    constructor() {
        super('ShowToDos', [
            new LogStep(`ShowToDos: todos = {user.todos}`, true),
            new IfCondition(`user.todos != null`, [
                new SendList(`user.todos`, `Here are your todos:`)
            ]).else([
                new SendActivity(`You have no todos.`)
            ])
        ]);

        // Use parents recognizer
        this.recognizer = getRecognizer();
    }
}
