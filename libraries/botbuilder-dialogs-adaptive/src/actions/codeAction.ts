/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { BoolExpression, BoolExpressionConverter, Expression } from 'adaptive-expressions';
import { StringUtils } from 'botbuilder';
import {
    Converter,
    ConverterFactory,
    Dialog,
    DialogConfiguration,
    DialogContext,
    DialogTurnResult,
} from 'botbuilder-dialogs';

export type CodeActionHandler = (dc: DialogContext, options?: object) => Promise<DialogTurnResult>;

export interface CodeActionConfiguration extends DialogConfiguration {
    disabled?: boolean | string | Expression | BoolExpression;
}

/**
 * Class representing a [Dialog](xref:botbuilder-dialogs.Dialog) code action.
 */
export class CodeAction<O extends object = {}> extends Dialog<O> {
    private codeHandler: CodeActionHandler;

    public disabled?: BoolExpression;

    public getConverter(property: keyof CodeActionConfiguration): Converter | ConverterFactory {
        switch (property) {
            case 'disabled':
                return new BoolExpressionConverter();
            default:
                return super.getConverter(property);
        }
    }

    /**
     * Initializes a new instance of the [CodeAction](xref:botbuilder-dialogs-adaptive.CodeAction) class.
     * @param codeHandler [CodeActionHandler](xref:botbuilder-dialogs-adaptive.CodeActionHandler), code handler for the action.
     */
    public constructor(codeHandler: CodeActionHandler) {
        super();
        this.codeHandler = codeHandler;
    }

    /**
     * Builds the compute Id for the [Dialog](xref:botbuilder-dialogs.Dialog).
     * @returns A `string` representing the compute Id.
     */
    protected onComputeId(): string {
        return `CodeAction[${StringUtils.ellipsis(this.codeHandler.toString(), 50)}]`;
    }

    /**
     * Called when the [Dialog](xref:botbuilder-dialogs.Dialog) is started and pushed onto the dialog stack.
     * @param dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @param options Optional. Initial information to pass to the dialog.
     * @returns A `Promise` representing the asynchronous operation.
     */
    public async beginDialog(dc: DialogContext, options: O): Promise<DialogTurnResult> {
        if (this.disabled && this.disabled.getValue(dc.state)) {
            return await dc.endDialog();
        }
        return await this.codeHandler(dc, options);
    }
}
