/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Dialog } from 'botbuilder-dialogs';
import { Converter, ResourceExplorer } from 'botbuilder-dialogs-declarative';
import { ActionScope } from './actionScope';

export class Case extends ActionScope {
    public constructor(value?: string, actions: Dialog[] = []) {
        super(actions);
        this.value = value;
    }

    /**
     * Gets or sets value expression to be compared against condition.
     */
    public value: string;
}

export class CaseConverter implements Converter {
    private _resourceExplorer: ResourceExplorer;

    public constructor(resourceExplorer: ResourceExplorer) {
        this._resourceExplorer = resourceExplorer;
    }
    public convert(config: { value: string; actions: Dialog[] }): Case {
        return new Case(config.value, config.actions);
    }
}
