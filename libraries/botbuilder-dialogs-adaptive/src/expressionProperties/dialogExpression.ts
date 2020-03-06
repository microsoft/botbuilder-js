/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Dialog } from 'botbuilder-dialogs';
import { ObjectExpression } from './objectExpression';

/**
 * DialogExpression - represents a property which is either a Dialog or a string expression for a dialog id.
 * @remarks
 * String values are always interpreted as as string with interpolation, unless it has '=' prefix.
 * The result is interpreted as a resource id or dialog id.
 */
export class DialogExpression extends ObjectExpression<Dialog> {
    public constructor(value: Dialog | string) {
        super(value);
    }

    public setValue(value: Dialog | string): void {
        if (typeof value == 'string') {
            if (!value.startsWith('=')) {
                /**
                 * Resource id will be resolved to actual dialog value
                 * if it is not a '=' then we want to convert it to a constant string expression
                 * to represent an external dialog id resolved by dc.findDialog()
                 */
                value = `='${ value }'`;
            }
        }
        super.setValue(value);
    }
}