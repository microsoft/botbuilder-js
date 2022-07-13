/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Dialog } from 'botbuilder-dialogs';
import { ActionScope } from './actionScope';

/**
 * Cases of action scope.
 */
export class Case extends ActionScope {
    /**
     * Initializes a new instance of the [Case](xref:botbuilder-dialogs-adaptive.Case) class.
     *
     * @param value Optional. Case's string value.
     * @param actions Optional. Numerable list of [Dialog](xref:botbuilder-dialogs.Dialog) actions.
     */
    constructor(value?: string, actions: Dialog[] = []) {
        super(actions);
        this.value = value;
    }

    /**
     * Gets or sets value expression to be compared against condition.
     */
    value: string;
}
