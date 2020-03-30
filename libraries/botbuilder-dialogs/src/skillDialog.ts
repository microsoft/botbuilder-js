/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import {
    Activity,
    ActivityTypes,
    ConversationReference,
    DeliveryModes,
    ExpectedReplies,
    SkillConversationIdFactoryOptions,
    TurnContext
} from 'botbuilder-core';
import { BeginSkillDialogOptions } from './beginSkillDialogOptions';
import {
    Dialog,
    DialogInstance,
    DialogReason,
    DialogTurnResult
} from './dialog';
import { DialogContext } from './dialogContext';
import { DialogEvents } from './dialogEvents';
import { SkillDialogOptions } from './skillDialogOptions';

export class SkillDialog extends Dialog {
    protected dialogOptions: SkillDialogOptions;

    // This key uses a simple namespace as Symbols are not serializable.
    private readonly DeliveryModeStateKey: string = 'SkillDialog.deliveryMode';

    /**
     * A sample dialog that can wrap remote calls to a skill.
     * 
     * @remarks
     * The options parameter in `beginDialog()` must be a `SkillDialogArgs` object with the initial parameters
     * for the dialog.
     * 
     * @param dialogOptions 
     * @param dialogId
     */
    public constructor(dialogOptions: SkillDialogOptions, dialogId?: string) {
        super(dialogId);
        if (!dialogOptions) {
            throw new TypeError('Missing dialogOptions parameter');
        }
        this.dialogOptions = dialogOptions;
    }

    public async beginDialog(dc: DialogContext, options?: any): Promise<DialogTurnResult> {
        const dialogArgs = SkillDialog.validateBeginDialogArgs(options);

        await dc.context.sendTraceActivity(`${ this.id }.beginDialog()`, undefined, undefined, `Using activity of type: ${ dialogArgs.activity.type }`);

        // Create deep clone of the original activity to avoid altering it before forwarding it.
        const clonedActivity = this.cloneActivity(dialogArgs.activity);

        // Apply conversation reference and common properties from incoming activity before sending.
        const skillActivity = TurnContext.applyConversationReference(clonedActivity, TurnContext.getConversationReference(dc.context.activity), true) as Activity;

        // Store the deliveryMode of the first forwarded activity
        dc.activeDialog.state[this.DeliveryModeStateKey] = dialogArgs.activity.deliveryMode;

        // Send the activity to the skill.
        const eocActivity = await this.sendToSkill(dc.context, skillActivity);
        if (eocActivity) {
            return await dc.endDialog(eocActivity.value);
        }
        return Dialog.EndOfTurn;
    }

    public async continueDialog(dc: DialogContext): Promise<DialogTurnResult> {
        await dc.context.sendTraceActivity(`${ this.id }.continueDialog()`, undefined, undefined, `ActivityType: ${ dc.context.activity.type }`);


        // Handle EndOfConversation from the skill (this will be sent to the this dialog by the SkillHandler if received from the Skill)
        if (dc.context.activity.type === ActivityTypes.EndOfConversation) {
            await dc.context.sendTraceActivity(`${ this.id }.continueDialog()`, undefined, undefined, `Got ${ ActivityTypes.EndOfConversation }`);
            return await dc.endDialog(dc.context.activity.value);
        }

        // Forward only Message and Event activities to the skill
        if (dc.context.activity.type === ActivityTypes.Message || dc.context.activity.type === ActivityTypes.Event) {
            // Create deep clone of the original activity to avoid altering it before forwarding it.
            const skillActivity = this.cloneActivity(dc.context.activity);
            skillActivity.deliveryMode = dc.activeDialog.state[this.DeliveryModeStateKey] as string;

            // Just forward to the remote skill
            const eocActivity = await this.sendToSkill(dc.context, skillActivity);
            if (eocActivity) {
                return await dc.endDialog(eocActivity.value);
            }
        }

        return Dialog.EndOfTurn;
    }

    public async endDialog(context: TurnContext, instance: DialogInstance, reason: DialogReason): Promise<void> {
        // Send of of conversation to the skill if the dialog has been cancelled. 
        if (reason == DialogReason.cancelCalled || reason == DialogReason.replaceCalled) {
            await context.sendTraceActivity(`${ this.id }.EndDialogAsync()`, undefined, undefined, `ActivityType: ${ context.activity.type }`);

            const reference = TurnContext.getConversationReference(context.activity);
            // Apply conversation reference and common properties from incoming activity before sending.
            const activity = TurnContext.applyConversationReference({ type: ActivityTypes.EndOfConversation }, reference, true);
            activity.channelData = context.activity.channelData;

            await this.sendToSkill(context, activity as Activity);
        }

        await super.endDialog(context, instance, reason);
    }

    public async repromptDialog(context: TurnContext, instance: DialogInstance): Promise<void> {
        // Create and send an envent to the skill so it can resume the dialog.
        const repromptEvent = { type: ActivityTypes.Event, name: DialogEvents.repromptDialog };

        const reference = TurnContext.getConversationReference(context.activity);
        // Apply conversation reference and common properties from incoming activity before sending.
        const activity: Activity = TurnContext.applyConversationReference(repromptEvent, reference, true) as Activity;
        
        await this.sendToSkill(context, activity);
    }

    public async resumeDialog(dc: DialogContext, reason: DialogReason, result?: any): Promise<DialogTurnResult> {
        await this.repromptDialog(dc.context, dc.activeDialog);
        return Dialog.EndOfTurn;
    }

    /**
     * Clones the Activity entity.
     * @param activity Activity to clone.
     */
    private cloneActivity(activity: Partial<Activity>): Activity {
        return Object.assign({} as Activity, activity);
    }

    private static validateBeginDialogArgs(options: any): BeginSkillDialogOptions {
        if (!options) {
            throw new TypeError('Missing options parameter');
        }

        const dialogArgs = options as BeginSkillDialogOptions;

        if (!dialogArgs.activity) {
            throw new TypeError(`"activity" is undefined or null in options.`);
        }

        // Only accept Message or Event activities
        if (dialogArgs.activity.type !== ActivityTypes.Message && dialogArgs.activity.type !== ActivityTypes.Event) {
            // Just forward to the remote skill
            throw new TypeError(`Only "${ ActivityTypes.Message }" and "${ ActivityTypes.Event }" activities are supported. Received activity of type "${ dialogArgs.activity.type }" in options.`);
        }

        return dialogArgs;
    }

    private async sendToSkill(context: TurnContext, activity: Activity): Promise<Activity> {
        // Create a conversationId to interact with the skill and send the activity
        const conversationIdFactoryOptions: SkillConversationIdFactoryOptions = {
            fromBotOAuthScope: context.turnState.get(context.adapter.OAuthScopeKey),
            fromBotId: this.dialogOptions.botId,
            activity: activity,
            botFrameworkSkill: this.dialogOptions.skill
        };

        // Create a conversationId to interact with the skill and send the activity
        let skillConversationId: string;
        try {
            skillConversationId = await this.dialogOptions.conversationIdFactory.createSkillConversationIdWithOptions(conversationIdFactoryOptions);
        } catch (err) {
            if (err.message !== 'Not Implemented') throw err;
            // If the SkillConversationIdFactoryBase implementation doesn't support createSkillConversationIdWithOptions(),
            // use createSkillConversationId() instead.
            skillConversationId = await this.dialogOptions.conversationIdFactory.createSkillConversationId(TurnContext.getConversationReference(activity) as ConversationReference);
        }

        // Always save state before forwarding
        // (the dialog stack won't get updated with the skillDialog and things won't work if you don't)
        const skillInfo = this.dialogOptions.skill;
        await this.dialogOptions.conversationState.saveChanges(context, true);

        const response = await this.dialogOptions.skillClient.postActivity<ExpectedReplies>(this.dialogOptions.botId, skillInfo.appId, skillInfo.skillEndpoint, this.dialogOptions.skillHostEndpoint, skillConversationId, activity);

        // Inspect the skill response status
        if (!(response.status >= 200 && response.status <= 299)) {
            throw new Error(`Error invoking the skill id: "${ skillInfo.id }" at "${ skillInfo.skillEndpoint }" (status is ${ response.status }). \r\n ${ response.body }`);
        }

        let eocActivity: Activity;
        if (activity.deliveryMode == DeliveryModes.ExpectReplies && response.body && response.body.activities) {
            // Process replies in the response.Body.
            if (Array.isArray(response.body.activities)) {
                response.body.activities.forEach(async (fromSkillActivity: Activity): Promise<void> => {
                    if (fromSkillActivity.type === ActivityTypes.EndOfConversation) {
                        // Capture the EndOfConversation activity if it was sent from skill
                        eocActivity = fromSkillActivity;
                    } else {
                        await context.sendActivity(fromSkillActivity);
                    }
                });
            }
        }

        return eocActivity;
    }
}
