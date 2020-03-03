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
    TurnContext
} from 'botbuilder-core';
import {
    Dialog,
    DialogInstance,
    DialogReason,
    DialogTurnResult
} from './dialog';
import { DialogContext } from './dialogContext';
import { SkillDialogArgs } from './skillDialogArgs';
import { SkillDialogOptions } from './skillDialogOptions';

export class SkillDialog extends Dialog {
    protected dialogOptions: SkillDialogOptions;

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

    public async beginDialog(dc: DialogContext, options?: {}): Promise<DialogTurnResult> {
        const dialogArgs = SkillDialog.validateBeginDialogArgs(options);

        await dc.context.sendTraceActivity(`${ this.id }.beginDialog()`, undefined, undefined, `Using activity of type: ${ dialogArgs.activity.type }`);

        // Create deep clone of the original activity to avoid altering it before forwarding it.
        const clonedActivity = this.cloneActivity(dialogArgs.activity);

        // Apply conversation reference and common properties from incoming activity before sending.
        const skillActivity = TurnContext.applyConversationReference(clonedActivity, TurnContext.getConversationReference(dc.context.activity), true) as Activity;

        // Send the activity to the skill.
        await this.sendToSkill(dc.context, skillActivity);
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
            // Just forward to the remote skill
            await this.sendToSkill(dc.context, dc.context.activity);
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

    /**
     * Clones the Activity entity.
     * @param activity Activity to clone.
     */
    private cloneActivity(activity: Partial<Activity>): Activity {
        return Object.assign({} as Activity, activity);
    }

    private static validateBeginDialogArgs(options: any): SkillDialogArgs {
        if (!options) {
            throw new TypeError('Missing options parameter');
        }

        const dialogArgs = options as SkillDialogArgs;

        if (!dialogArgs.activity) {
            throw new TypeError(`"activity" is undefined or null in options.`);
        }

        // Only accept Message or Event activities
        if (dialogArgs.activity.type !== ActivityTypes.Message && dialogArgs.activity.type !== ActivityTypes.Event) {
            // Just forward to the remote skill
            throw new TypeError(`Only ${ ActivityTypes.Message } and ${ ActivityTypes.Event } activities are supported. Received activity of type ${ dialogArgs.activity.type } in options.`);
        }

        return dialogArgs;
    }

    private async sendToSkill(context: TurnContext, activity: Activity): Promise<void> {
        // Create a conversationId to interact with the skill and send the activity
        const skillConversationId = await this.dialogOptions.conversationIdFactory.createSkillConversationId(TurnContext.getConversationReference(activity) as ConversationReference);

        // Always save state before forwarding
        // (the dialog stack won't get updated with the skillDialog and things won't work if you don't)
        await this.dialogOptions.conversationState.saveChanges(context, true);
        const skillInfo = this.dialogOptions.skill;
        const response = await this.dialogOptions.skillClient.postActivity(this.dialogOptions.botId, skillInfo.appId, skillInfo.skillEndpoint, skillInfo.skillEndpoint, skillConversationId, activity);

        // Inspect the skill response status
        if (!(response.status >= 200 && response.status <= 299)) {
            throw new Error(`Error invoking the skill id: "${ skillInfo.id }" at "${ skillInfo.skillEndpoint }" (status is ${ response.status }). \r\n ${ response.body }`);
        }
    }
}
