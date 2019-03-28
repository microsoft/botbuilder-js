// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { AdaptiveDialog, BeginDialogRule, SendActivity, EndDialog, IfProperty, SendList } from "botbuilder-dialogs-adaptive";
import { user } from "../../schema";
import { getRecognizer } from "../recognizer";

export class ShowToDos extends AdaptiveDialog {
    constructor() {
        super('ShowToDos');

        // Use parents recognizer
        this.recognizer = getRecognizer();

        // Define main conversation flow
        this.addRule(new BeginDialogRule([
            new IfProperty(user.todoList, [
                new SendList(user.todoList, `Here are your todos:`)
            ]).else([
                new SendActivity(`You have no todos.`)
            ]),
            new EndDialog()
        ]));
    }
}
