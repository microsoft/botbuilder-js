/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogCommand, DialogContext, Dialog } from 'botbuilder-dialogs';
import { SequenceContext } from '../sequenceContext';

export type CodeActionHandler<T extends DialogContext = SequenceContext> = (context: T, options?: object) => Promise<DialogTurnResult>;

export class CodeAction<T extends DialogContext = SequenceContext, O extends object = {}> extends Dialog<O> {
    private handler: CodeActionHandler<T>;

    constructor(handler: CodeActionHandler<T>);
    constructor(id: string, handler: CodeActionHandler<T>);
    constructor(idOrHandler: string|CodeActionHandler<T>, handler?: CodeActionHandler<T>) {
        if (typeof idOrHandler === 'function') {
            handler = idOrHandler;
            idOrHandler = undefined;
        }
        super(idOrHandler as string);
        this.handler = handler;
    }

    protected onComputeId(): string {
        return `CodeAction[${this.handler.toString()}]`;
    }

    public async beginDialog(context: T, options: O): Promise<DialogTurnResult> {
        return await this.handler(context, options);
    }
}