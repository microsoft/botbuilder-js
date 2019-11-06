/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogCommand, DialogContext, DialogConfiguration } from 'botbuilder-dialogs';

export interface CancelAllDialogsConfiguration extends DialogConfiguration {
    eventName?: string;
    eventValue?: string;
    eventValueProperty?: string;
}

export class CancelAllDialogs extends DialogCommand {

    constructor();
    constructor(eventName: string, eventValue?: string);
    constructor(eventName?: string, eventValue?: string) {
        super();
        this.eventName = eventName;
        this.eventValue = eventValue
    }
    
    protected onComputeId(): string {
        return `CancelAllDialogs[${this.eventName || ''}]`;
    }

    public eventName: string;

    public eventValue: string;

    public configure(config: CancelAllDialogsConfiguration): this {
        return super.configure(config);
    }
    
    protected async onRunCommand(dc: DialogContext, options: object): Promise<DialogTurnResult> {
        const opt = Object.assign({
            eventName: this.eventName,
            eventValue: this.eventValue
        }, options);
        return await dc.cancelAllDialogs(true, opt.eventName, opt.eventValue);
    }
}