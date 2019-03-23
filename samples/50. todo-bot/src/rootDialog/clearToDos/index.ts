// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { AdaptiveDialog, BeginDialogRule, ChangeList, ChangeListType, SendActivity, EndDialog, IfProperty } from "botbuilder-rules";
import { user } from "../../schema";
import { getRecognizer } from "../recognizer";

export class ClearToDos extends AdaptiveDialog {
    constructor() {
        super('ClearToDos');

        // Use parents recognizer
        this.recognizer = getRecognizer();

        // Define main conversation flow
        this.addRule(new BeginDialogRule([
            new IfProperty(user.todoList, [
                new ChangeList(ChangeListType.clear, user.todoList),
                new SendActivity(`All todos removed.`)
            ]).else([
                new SendActivity(`No todos to clear.`)
            ]),
            new EndDialog()
        ]));
    }
}

