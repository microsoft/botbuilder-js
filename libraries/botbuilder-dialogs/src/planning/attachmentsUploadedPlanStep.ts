/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { RecognizerResult, ActivityTypes, ChannelAccount } from 'botbuilder-core';
import { PlanStep, RecognizedPlanStep } from './planStep';
import { PlanState } from './planState';
import { DialogContext } from '../dialogContext';

export class AttachmentsUploadedPlanStep extends PlanStep {
    public async recognizeStep(dc: DialogContext, recognized: RecognizerResult, planStack: PlanState[]): Promise<RecognizedPlanStep|undefined> {
        const activity = dc.context.activity;
        if (activity.type === ActivityTypes.Message && activity.attachments && activity.attachments.length > 0 && await this.activationRule(dc, planStack)) {
            // Create a new recognizer result containing the list of members
            const dialogOptions: RecognizerResult = {
                text: activity.text,
                intents: { [activity.type]: { score: 1.0 } },
                entities: {
                    attachments: activity.attachments
                }
            }

            // Return step
            return {
                transform: this.transform,
                dialogId: this.dialogId,
                dialogOptions: dialogOptions
            };
        }
    }
}