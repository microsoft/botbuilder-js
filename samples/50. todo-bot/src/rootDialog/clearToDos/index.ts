// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { AdaptiveDialog, EditArray, ArrayChangeType, SendActivity, EndDialog, IfCondition } from "botbuilder-dialogs-adaptive";
import { user } from "../../schema";
import { getRecognizer } from "../recognizer";

export class ClearToDos extends AdaptiveDialog {
    constructor() {
        super('ClearToDos', [
            new IfCondition(`!user.todoList`, [
                new SendActivity(`No todos to clear.`),
                new EndDialog()
            ]),
            new EditArray(ArrayChangeType.clear, user.todoList),
            new SendActivity(`All todos removed.`)
        ]);

        // Use parents recognizer
        this.recognizer = getRecognizer();
    }
}

