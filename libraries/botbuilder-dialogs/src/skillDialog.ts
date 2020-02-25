/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Activity, ActivityTypes, BotFrameworkSkill, ConversationState, ConversationReference, StatePropertyAccessor, TurnContext } from 'botbuilder-core';
import { Dialog, DialogTurnResult } from './dialog';
import { DialogContext } from './dialogContext';
import { SkillDialogArgs } from './skillDialogArgs';
import { SkillDialogOptions } from './skillDialogOptions';

export class SkillDialog extends Dialog {
    private readonly _activeSkillProperty: StatePropertyAccessor;
    private readonly _conversationState: ConversationState; // Why is this restricted to ConversationState?
    private readonly _dialogOptions: SkillDialogOptions;

    /**
     * A sample dialog that can wrap remote calls to a skill.
     * 
     * @remarks
     * The options parameter in `beginDialog()` must be a `SkillDialogArgs` object with the initial parameters
     * for the dialog.
     * 
     * @param SkillDialogOptions 
     * @param dialogOptions 
     * @param ConversationState 
     * @param conversationState 
     */
    public constructor(dialogOptions: SkillDialogOptions, conversationState: ConversationState) {
        super('SkillDialog'); // What about Dialog Id?
        if (!dialogOptions) {
            throw new TypeError('Missing dialogOptions parameter');
        }

        if (!conversationState) {
            throw new TypeError('Missing conversationState parameter');
        }
        
        this._dialogOptions = dialogOptions;
        this._conversationState = conversationState;

        this._activeSkillProperty = conversationState.createProperty<BotFrameworkSkill>('botbuilder-dialogs.SkillDialog.ActiveSkillProperty');
    }

    public async beginDialog(dc: DialogContext, options?: {}): Promise<DialogTurnResult> {
        const dialogArgs = SkillDialog.validateBeginDialogOptions(options);

        await dc.context.sendTraceActivity(`${ this.id }.beginDialog()`, undefined, undefined, `Using activity of type: ${ dialogArgs.activity.type }`);

        // Store Skill information for this dialog instance
        await this._activeSkillProperty.set(dc.context, dialogArgs.skill);

        // Create deep clone of the original activity to avoid altering it before forwarding it.
        const clonedActivity = this.cloneActivity(dialogArgs.activity);

        // Apply conversation reference and common properties from incoming activity before sending.
        const skillActivity = TurnContext.applyConversationReference(clonedActivity, TurnContext.getConversationReference(dc.context.activity), true) as Activity;

        // Send the activity to the skill.
        await this.sendToSkill(dc, skillActivity, dialogArgs.skill);
        return Dialog.EndOfTurn;
    }

    public async continueDialog(dc: DialogContext): Promise<DialogTurnResult> {
        await dc.context.sendTraceActivity(`${ this.id }.continueDialog()`, undefined, undefined, `ActivityType: ${ dc.context.activity.type }`);

        // Retrieve the current skill information from ConversationState
        var skillInfo = await this._activeSkillProperty.get(dc.context, null);

        // Handle EndOfConversation from the skill (this will be sent to the this dialog by the SkillHandler if received from the Skill)
        if (dc.context.activity.type === ActivityTypes.EndOfConversation) {
            await dc.context.sendTraceActivity(`${ this.id }.continueDialog()`, undefined, undefined, `Got ${ ActivityTypes.EndOfConversation }`);
            return await dc.endDialog(dc.context.activity.value);
        }

        // Forward only Message and Event activities to the skill
        if (dc.context.activity.type === ActivityTypes.Message || dc.context.activity.type === ActivityTypes.Event) {
            // Just forward to the remote skill
            await this.sendToSkill(dc, dc.context.activity, skillInfo);
        }

        return Dialog.EndOfTurn;
    }

    /**
     * Clones the Activity entity.
     * @param activity Activity to clone.
     */
    private cloneActivity(activity: Partial<Activity>): Activity {
        return Object.assign({} as Activity, activity);
    }

    private static validateBeginDialogOptions(options: any): SkillDialogArgs {
        if (!options) {
            throw new TypeError('Missing options parameter');
        }

        const dialogArgs = options as SkillDialogArgs;

        if (dialogArgs.skill == undefined || dialogArgs.skill == null) {
            throw new TypeError(`"skill" undefined or null in options`);
        }

        if (dialogArgs.activity === undefined || dialogArgs.activity === null) {
            throw new TypeError(`"activity" is undefined or null in options.`);
        }

        // Only accept Message or Event activities
        if (dialogArgs.activity.type !== ActivityTypes.Message && dialogArgs.activity.type !== ActivityTypes.Event) {
            // Just forward to the remote skill
            throw new TypeError(`Only ${ ActivityTypes.Message } and ${ ActivityTypes.Event } activities are supported. Received activity of type ${ dialogArgs.activity.type } in options.`);
        }

        return dialogArgs;
    }

    private async sendToSkill(dc: DialogContext, activity: Activity, skillInfo: BotFrameworkSkill): Promise<void> {
        // Always save state before forwarding
        // (the dialog stack won't get updated with the skillDialog and things won't work if you don't)
        await this._conversationState.saveChanges(dc.context, true);
    
        // Create a conversationId to interact with the skill and send the activity
        const skillConversationId = await this._dialogOptions.conversationIdFactory.createSkillConversationId(TurnContext.getConversationReference(activity) as ConversationReference);
        const response = await this._dialogOptions.skillClient.postActivity(this._dialogOptions.botId, skillInfo.appId, skillInfo.skillEndpoint, this._dialogOptions.skillHostEndpoint, skillConversationId, activity);
    
        // Inspect the skill response status
        if (!(response.status >= 200 && response.status <= 299)) {
            throw new Error(`Error invoking the skill id: "${ skillInfo.id }" at "${ skillInfo.skillEndpoint }" (status is ${ response.status }). \r\n ${ response.body }`);
        }
    }
}
