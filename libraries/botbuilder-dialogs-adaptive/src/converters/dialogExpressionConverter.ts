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

/**
 * Dialog expression converter that implements [Converter](xref:botbuilder-dialogs-declarative.Converter).
 */
export class DialogExpressionConverter implements Converter<Input, DialogExpression> {
    /**
     * Initializes a new instance of the [DialogExpressionConverter](xref:botbuilder-dialogs-adaptive.DialogExpressionConverter) class.
     *
     * @param _resourceExplorer Resource explorer to use for resolving references.
     */
    constructor(private readonly _resourceExplorer: ResourceExplorer) {}

    /**
     * Converts an object or string to a [DialogExpression](xref:botbuilder-dialogs-adaptive.DialogExpression) instance.
     *
     * @param value An object or string value.
     * @returns A new [DialogExpression](xref:botbuilder-dialogs-adaptive.DialogExpression) instance.
     */
    convert(value: Input | DialogExpression): DialogExpression {
        if (value instanceof DialogExpression) {
            return value;
        }
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
