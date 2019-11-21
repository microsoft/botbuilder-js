// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { AdaptiveDialog, EditArray, ArrayChangeType, SendActivity, IfCondition, LogAction } from "botbuilder-dialogs-adaptive";
import { getRecognizer } from "../recognizer";

export class ClearToDos extends AdaptiveDialog {
    constructor() {
        super('ClearToDos', [
            new LogAction(`ClearToDos: todos = {dialog.todos}`),
            new IfCondition(`dialog.todos != null`, [
                new EditArray(ArrayChangeType.clear, 'dialog.todos'),
                new SendActivity(`All todos removed.`)
            ]).else([
                new SendActivity(`No todos to clear.`)
            ])
        ]);

        // Use parents recognizer
        this.recognizer = getRecognizer();
    }
}

