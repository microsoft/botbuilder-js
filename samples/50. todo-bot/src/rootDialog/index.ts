// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { AdaptiveDialog, SendActivity, IntentRule, EventRule, UnknownIntentRule, IfCondition, SetProperty  } from "botbuilder-dialogs-adaptive";
import { getRecognizer } from "./recognizer";
import { intents, events } from "../schema";
import { AddToDo } from "./addToDo";
import { DeleteToDo } from "./deleteToDo";
import { ClearToDos } from "./clearToDos";
import { ShowToDos } from "./showToDos";

export class RootDialog extends AdaptiveDialog {
    constructor() {
        super('main');

        // Bind to production/development recognizer
        this.recognizer = getRecognizer();

        // Handle recognized intents
        this.addRule(new IntentRule(intents.AddToDo, [
            new AddToDo()
        ]));

        this.addRule(new IntentRule(intents.DeleteToDo, [
            new DeleteToDo()
        ]));

        this.addRule(new IntentRule(intents.ClearToDos, [
            new ClearToDos()
        ]));

        this.addRule(new IntentRule(intents.ShowToDos, [
            new ShowToDos()
        ]));

        this.addRule(new UnknownIntentRule([
            new IfCondition(`user.greeted != true`, [
                new SendActivity(`Hi! I'm a ToDo bot. Say "add a todo named first one" to get started.`),
                new SetProperty(`user.greeted`, `true`)
            ]).else([
                new SendActivity(`Say "add a todo named first one" to get started.`)
            ])
        ]));

        // Define rules to handle cancel events
        this.addRule(new EventRule(events.CancelAdd, [
            new SendActivity(`Ok... Cancelled adding new alarm.`)
        ]));

        this.addRule(new EventRule(events.CancelDelete, [
            new SendActivity(`Ok...`)
        ]));

        // Define rules for handling errors
        this.addRule(new EventRule(events.Error, [
            new SendActivity(`Oops. An error occurred: {message}`)
        ]));
    }
}
