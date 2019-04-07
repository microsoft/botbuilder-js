// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { AdaptiveDialog, EditArray, ArrayChangeType, SendActivity, EndDialog, IfCondition } from "botbuilder-dialogs-adaptive";
import { user } from "../../schema";
import { getRecognizer } from "../recognizer";

export class ClearToDos extends AdaptiveDialog {
    constructor() {
        super('ClearToDos', [
            new IfCondition(`user.todoList != null`, [
                new EditArray(ArrayChangeType.clear, user.todoList),
                new SendActivity(`All todos removed.`)
            ]).else([
                new SendActivity(`No todos to clear.`)
            ])
        ]);

        // Use parents recognizer
        this.recognizer = getRecognizer();
    }
}

