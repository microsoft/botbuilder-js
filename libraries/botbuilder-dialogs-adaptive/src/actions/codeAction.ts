/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogCommand, DialogContext } from 'botbuilder-dialogs';
import { SequenceContext } from '../sequenceContext';

export type CodeActionHandler<T extends DialogContext = SequenceContext> = (context: T, options?: object) => Promise<DialogTurnResult>;

export class CodeAction<T extends DialogContext = SequenceContext> extends DialogCommand {
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

    protected onComputeID(): string {
        return `codeAction[${this.hashedLabel(this.handler.toString())}]`;
    }

    protected async onRunCommand(context: T, options: object): Promise<DialogTurnResult> {
        return await this.handler(context, options);
    }
}