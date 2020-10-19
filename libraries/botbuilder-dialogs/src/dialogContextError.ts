/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogContext } from './dialogContext';
import { DialogInstance } from './dialog';

/**
 * An Error that includes extra dialog context, including the dialog stack
 */
export class DialogContextError extends Error {
    /**
     * Represents the state of a dialog when an error occurred
     */
    public readonly dialogContext: {
        activeDialog?: string;
        parent?: string;
        stack: DialogInstance[];
    };

    /**
     * Construct a DialogError
     * @param error Source error
     * @param dialogContext Dialog context that is the source of the error
     */
    constructor(source: Error | string, dialogContext: DialogContext) {
        if (!(source instanceof Error) && typeof source !== 'string') {
            throw new Error('`source` argument must be an Error or a string');
        }

        if (!(dialogContext instanceof DialogContext)) {
            throw new Error('`dialogContext` argument must be of type DialogContext');
        }

        super(source instanceof Error ? source.message : source);

        this.name = 'DialogContextError';

        if (source instanceof Error) {
            this.message = source.message;
            this.stack = source.stack;
        } else {
            this.message = source;
        }

        this.dialogContext = {
            activeDialog: dialogContext.activeDialog ? dialogContext.activeDialog.id : undefined,
            parent:
                dialogContext.parent && dialogContext.parent.activeDialog
                    ? dialogContext.parent.activeDialog.id
                    : undefined,
            stack: dialogContext.stack,
        };
    }
}
