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

/**
 * Cases of action scope.
 */
export class Case extends ActionScope {
    /**
     * Initializes a new instance of the [Case](xref:botbuilder-dialogs-adaptive.Case) class.
     * @param value Optional. Case's string value.
     * @param actions Optional. Numerable list of [Dialog](xref:botbuilder-dialogs.Dialog) actions.
     */
    public constructor(value?: string, actions: Dialog[] = []) {
        super(actions);
        this.value = value;
    }

    /**
     * Gets or sets value expression to be compared against condition.
     */
    public value: string;
}

/**
 * `config` to [Case](xref:botbuilder-dialogs-adaptive.Case) converter class.
 */
export class CaseConverter implements Converter {
    private _resourceExplorer: ResourceExplorer;

    /**
     * Initializes a new instance of the [CaseConverter](xref:botbuilder-dialogs-adaptive.CaseConverter) class.
     * @param resourceExplorer [ResourceExplorer](xref:botbuilder-dialogs-declarative.ResourceExplorer) to use.
     */
    public constructor(resourceExplorer: ResourceExplorer) {
        this._resourceExplorer = resourceExplorer;
    }

    /**
     * Converts a `config` object into a [Case](xref:botbuilder-dialogs-adaptive.Case) object.
     * @param config Composed of the case `string` value and an numerable list of dialog actions.
     * @returns The [Case](xref:botbuilder-dialogs-adaptive.Case).
     */
    public convert(config: { value: string; actions: Dialog[] }): Case {
        return new Case(config.value, config.actions);
    }
}
