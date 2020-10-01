/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { StringUtils } from 'botbuilder-core';
import { DialogTurnResult, DialogContext, Dialog } from 'botbuilder-dialogs';
import { BoolExpression } from 'adaptive-expressions';

export type CodeActionHandler = (dc: DialogContext, options?: object) => Promise<DialogTurnResult>;

/**
 * Class representing a dialog code action.
 */
export class CodeAction<O extends object = {}> extends Dialog<O> {
    private codeHandler: CodeActionHandler;

    public disabled?: BoolExpression;

    /**
     * Initializes a new instance of the `CodeAction` class.
     * @param codeHandler Code handler for the action.
     */
    public constructor(codeHandler: CodeActionHandler) {
        super();
        this.codeHandler = codeHandler;
    }

    /**
     * Builds the compute Id for the dialog.
     * @returns A `string` representing the compute Id.
     */
    protected onComputeId(): string {
        return `CodeAction[${ StringUtils.ellipsis(this.codeHandler.toString(), 50) }]`;
    }

    /**
     * Called when the dialog is started and pushed onto the dialog stack.
     * @param dc The `DialogContext` for the current turn of conversation.
     * @param options Optional, initial information to pass to the dialog.
     * @returns A `Promise` representing the asynchronous operation.
     */
    public async beginDialog(dc: DialogContext, options: O): Promise<DialogTurnResult> {
        if (this.disabled && this.disabled.getValue(dc.state)) {
            return await dc.endDialog();
        }
        return await this.codeHandler(dc, options);
    }
}
