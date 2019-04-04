/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogCommand, DialogContext, DialogConfiguration } from 'botbuilder-dialogs';

export interface EmitEventConfiguration extends DialogConfiguration {
    eventName?: string;
    eventValue?: string;
    eventValueProperty?: string;
    bubbleEvent?: boolean;
    resultProperty?: string;
}

export class EmitEvent extends DialogCommand {

    constructor();
    constructor(eventName: string, eventValue?: string|object, bubbleEvent?: boolean);
    constructor(eventName?: string, eventValue?: string|object, bubbleEvent = true) {
        super();
        this.eventName = eventName;
        if (typeof eventValue == 'string') {
            this.eventValueProperty = eventValue;
        } else {
            this.eventValue = eventValue
        }
        this.bubbleEvent = bubbleEvent;
    }
    
    protected onComputeID(): string {
        return `emitEvent[${this.hashedLabel(this.eventName || '')}]`;
    }

    public eventName: string;

    public eventValue: object;

    public bubbleEvent: boolean;

    public set eventValueProperty(value: string) {
        this.inputProperties['eventValue'] = value;
    }

    public get eventValueProperty(): string {
        return this.inputProperties['eventValue'];
    }

    public set resultProperty(value: string) {
        this.outputProperty = value;
    }

    public get resultProperty(): string {
        return this.outputProperty;
    }

    public configure(config: EmitEventConfiguration): this {
        return super.configure(config);
    }
    
    protected async onRunCommand(dc: DialogContext, options: object): Promise<DialogTurnResult> {
        const opt = Object.assign({
            eventName: this.eventName,
            eventValue: this.eventValue,
            bubbleEvent: this.bubbleEvent
        }, options);

        const handled = await dc.emitEvent(opt.eventName, opt.eventValue, opt.bubbleEvent);
        return await dc.endDialog(handled);
    }
}