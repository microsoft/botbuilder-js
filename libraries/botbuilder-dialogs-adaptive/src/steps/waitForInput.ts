/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, Dialog, DialogContext, DialogConsultation, DialogConsultationDesire } from 'botbuilder-dialogs';
import { ActivityTypes } from 'botbuilder-core';

export class WaitForInput extends Dialog {

    protected onComputeID(): string {
        return `waitForInput[]`;
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
                    return await dc.endDialog();
                } else {
                    return Dialog.EndOfTurn;
                }
            }
        };
    }
}