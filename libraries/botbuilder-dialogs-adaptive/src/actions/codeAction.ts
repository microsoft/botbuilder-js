/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { BoolExpression, BoolExpressionConverter } from 'adaptive-expressions';
import { StringUtils } from 'botbuilder-core';
import { Converter, ConverterFactory, Dialog, DialogContext, DialogTurnResult } from 'botbuilder-dialogs';
import { NonFunctionKeys } from 'utility-types';

export type CodeActionHandler = (dc: DialogContext, options?: object) => Promise<DialogTurnResult>;

export class CodeAction<O extends object = {}> extends Dialog<O> {
    private codeHandler: CodeActionHandler;

    public disabled?: BoolExpression;

    public getConverter(property: NonFunctionKeys<CodeAction>): Converter | ConverterFactory {
        switch (property) {
            case 'disabled':
                return new BoolExpressionConverter();
            default:
                return super.getConverter(property);
        }
    }

    public constructor(codeHandler: CodeActionHandler) {
        super();
        this.codeHandler = codeHandler;
    }

    protected onComputeId(): string {
        return `CodeAction[${StringUtils.ellipsis(this.codeHandler.toString(), 50)}]`;
    }

    public async beginDialog(dc: DialogContext, options: O): Promise<DialogTurnResult> {
        if (this.disabled && this.disabled.getValue(dc.state)) {
            return await dc.endDialog();
        }
        return await this.codeHandler(dc, options);
    }
}
