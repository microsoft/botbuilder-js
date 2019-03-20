/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogCommand, DialogContext } from 'botbuilder-dialogs';
import { PlanningContext } from '../planningContext';

export type CodeStepHandler<T extends DialogContext = PlanningContext> = (context: T, options?: object) => Promise<DialogTurnResult>;

export class CodeStep<T extends DialogContext = PlanningContext> extends DialogCommand {
    private handler: CodeStepHandler<T>;

    constructor(handler: CodeStepHandler<T>);
    constructor(id: string, handler: CodeStepHandler<T>);
    constructor(idOrHandler: string|CodeStepHandler<T>, handler?: CodeStepHandler<T>) {
        if (typeof idOrHandler === 'function') {
            handler = idOrHandler;
            idOrHandler = undefined;
        }
        super(idOrHandler as string);
        this.handler = handler;
    }
    
    protected onComputeID(): string {
        return `codeStep[${this.hashedLabel(this.handler.toString())}]`;
    }
    
    protected async onRunCommand(context: T, options: object): Promise<DialogTurnResult> {
        return await this.handler(context, options);
    }
}