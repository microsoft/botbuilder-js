// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { AdaptiveDialog, SendActivity, EndDialog, IfCondition, SendList } from "botbuilder-dialogs-adaptive";
import { user } from "../../schema";
import { getRecognizer } from "../recognizer";

export class ShowToDos extends AdaptiveDialog {
    constructor() {
        super('ShowToDos', [
            new IfCondition(`user.todoList != null`, [
                new SendList(user.todoList, `Here are your todos:`)
            ]).else([
                new SendActivity(`You have no todos.`)
            ])
        ]);

        // Use parents recognizer
        this.recognizer = getRecognizer();
    }
}
