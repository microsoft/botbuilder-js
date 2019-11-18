/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogCommand, DialogContext, DialogConfiguration, Dialog } from 'botbuilder-dialogs';

export interface EmitEventConfiguration extends DialogConfiguration {
    eventName?: string;
    eventValue?: string;
    bubbleEvent?: boolean;
    resultProperty?: string;
}

export class EmitEvent<O extends object = {}> extends Dialog<O> {

    constructor();
    constructor(eventName: string, eventValue?: string, bubbleEvent?: boolean);
    constructor(eventName?: string, eventValue?: string, bubbleEvent = true) {
        super();
        this.eventName = eventName;
        this.eventValue = eventValue;
        this.bubbleEvent = bubbleEvent;
    }

    protected onComputeId(): string {
        return `EmitEvent[${this.eventName || ''}]`;
    }

    public eventName: string;

    public eventValue: string;

    public bubbleEvent: boolean;

    public configure(config: EmitEventConfiguration): this {
        return super.configure(config);
    }

    public async beginDialog(dc: DialogContext, options: O): Promise<DialogTurnResult> {
        const opt = Object.assign({
            eventName: this.eventName,
            eventValue: this.eventValue,
            bubbleEvent: this.bubbleEvent
        }, options);

        const handled = await dc.emitEvent(opt.eventName, opt.eventValue, opt.bubbleEvent);
        if (handled) {
            // Defer continuation of plan until next turn
            return Dialog.EndOfTurn;
        } else {
            // Continue execution of plan
            return await dc.endDialog(false);
        }
    }

    public async continueDialog(dc: DialogContext): Promise<DialogTurnResult> {
        // Continue plan execution after interruption
        return await dc.endDialog(true);
    }
}