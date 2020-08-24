/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Converter, ResourceExplorer } from 'botbuilder-dialogs-declarative';
import { Dialog } from 'botbuilder-dialogs';
import { DialogExpression } from '../expressions';

export class DialogExpressionConverter implements Converter {
    private _resourceExplorer: ResourceExplorer;

    public constructor(resouceExplorer: ResourceExplorer) {
        this._resourceExplorer = resouceExplorer;
    }

    public convert(value: string | object): DialogExpression {
        if (typeof value == 'string') {
            if (!value.startsWith('=')) {
                const dialog = this._resourceExplorer.loadType(`${ value }.dialog`) as Dialog;
                if (dialog) {
                    return new DialogExpression(dialog);
                }
            }
            return new DialogExpression(value);
        }
        return new DialogExpression(value as Dialog);
    }
}
