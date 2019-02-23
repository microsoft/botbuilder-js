/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogConfiguration, Dialog, DialogContext, DialogConsultation, DialogConsultationDesire } from 'botbuilder-dialogs';
import { ActivityTypes } from 'botbuilder-core';

export interface WaitForInputConfiguration extends DialogConfiguration {
    /**
     * (Optional) in-memory state property that the users input should be saved to.
     * 
     * @remarks
     * This is just a convenience property for setting the dialogs [outputBinding](#outputbinding). 
     */
    resultProperty?: string;
}

export class WaitForInput extends Dialog {

    /**
     * Creates a new `WaitForInput` instance.
     * @param resultProperty (Optional) in-memory state property that the users input should be saved to.
     */
    constructor(resultProperty?: string) {
        super();
        if (resultProperty) { this.resultProperty = resultProperty }
    }

    protected onComputeID(): string {
        return `waitForInput[${this.hashedLabel(this.resultProperty || '')}]`;
    }

    /**
     * (Optional) in-memory state property that the users input should be saved to.
     * 
     * @remarks
     * This is just a convenience property for setting the dialogs [outputBinding](#outputbinding). 
     */
    public set resultProperty(value: string) {
        this.outputBinding = value;
    }

    public get resultProperty(): string {
        return this.outputBinding;
    }

    public configure(config: WaitForInputConfiguration): this {
        return super.configure(config);
    }

    public async beginDialog(dc: DialogContext): Promise<DialogTurnResult> {
        return Dialog.EndOfTurn;
    }

    public async consultDialog(dc: DialogContext): Promise<DialogConsultation> {
        return {
            desire: DialogConsultationDesire.canProcess,
            processor: async (dc) => {
                const activity = dc.context.activity;
                if (activity.type === ActivityTypes.Message) {
                    return await dc.endDialog(activity.text || '');
                } else {
                    return Dialog.EndOfTurn;
                }
            }
        };
    }
}