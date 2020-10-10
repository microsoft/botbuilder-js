/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Converter, Dialog } from 'botbuilder-dialogs';
import { ResourceExplorer } from 'botbuilder-dialogs-declarative';
import { DialogExpression } from '../expressions';

type Input = string | Record<string, unknown>;

export class DialogExpressionConverter implements Converter<Input, DialogExpression> {
    public constructor(private readonly _resourceExplorer: ResourceExplorer) {}

    public convert(value: Input): DialogExpression {
        if (typeof value == 'string') {
            if (!value.startsWith('=')) {
                const dialog = this._resourceExplorer.loadType<Dialog>(`${value}.dialog`);
                if (dialog) {
                    return new DialogExpression(dialog);
                }
            }
            return new DialogExpression(value);
        }
        return new DialogExpression((value as unknown) as Dialog);
    }
}
