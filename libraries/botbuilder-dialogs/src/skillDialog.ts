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
    CardFactory,
    ConversationReference,
    DeliveryModes,
    ExpectedReplies,
    ExtendedUserTokenProvider,
    OAuthCard,
    SkillConversationIdFactoryOptions,
    TokenExchangeInvokeRequest,
    tokenExchangeOperationName,
    TokenResponse,
    TurnContext,
    Attachment,
    StatusCodes
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

/**
 * A specialized Dialog that can wrap remote calls to a skill.
 * @remarks
 * The options parameter in beginDialog must be a BeginSkillDialogOptions instance
 * with the initial parameters for the dialog.
 */
export class SkillDialog extends Dialog<Partial<BeginSkillDialogOptions>> {
    protected dialogOptions: SkillDialogOptions;

    // This key uses a simple namespace as Symbols are not serializable.
    private readonly DeliveryModeStateKey: string = 'SkillDialog.deliveryMode';
    private readonly SkillConversationIdStateKey: string = 'SkillDialog.skillConversationId';

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

    /**
     * Called when the skill dialog is started and pushed onto the dialog stack.
     * @param dc The DialogContext for the current turn of conversation.
     * @param options Initial information to pass to the dialog.
     * @returns A Promise representing the asynchronous operation.
     * @remarks
     * If the task is successful, the result indicates whether the dialog is still active after the turn has been processed by the dialog.
     */
    public async beginDialog(dc: DialogContext, options: BeginSkillDialogOptions): Promise<DialogTurnResult> {
        const dialogArgs = this.validateBeginDialogArgs(options);

        await dc.context.sendTraceActivity(`${ this.id }.beginDialog()`, undefined, undefined, `Using activity of type: ${ dialogArgs.activity.type }`);

        // Create deep clone of the original activity to avoid altering it before forwarding it.
        const clonedActivity = this.cloneActivity(dialogArgs.activity);

        // Apply conversation reference and common properties from incoming activity before sending.
        const skillActivity = TurnContext.applyConversationReference(clonedActivity, TurnContext.getConversationReference(dc.context.activity), true) as Activity;

        // Store delivery mode and connection name in dialog state for later use.
        dc.activeDialog.state[this.DeliveryModeStateKey] = dialogArgs.activity.deliveryMode;

        // Create the conversationId and store it in the dialog context state so we can use it later.
        const skillConversationId = await this.createSkillConversationId(dc.context, dc.context.activity);
        dc.activeDialog.state[this.SkillConversationIdStateKey] = skillConversationId;

        // Send the activity to the skill.
        const eocActivity = await this.sendToSkill(dc.context, skillActivity, skillConversationId);
        if (eocActivity) {
            return await dc.endDialog(eocActivity.value);
        }
        return Dialog.EndOfTurn;
    }

    /**
     * Called when the skill dialog is _continued_, where it is the active dialog and the
     * user replies with a new activity.
     * @param dc The DialogContext for the current turn of conversation.
     * @returns A Promise representing the asynchronous operation.
     * @remarks 
     * If the task is successful, the result indicates whether the dialog is still
     * active after the turn has been processed by the dialog. The result may also contain a
     * return value.
     */
    public async continueDialog(dc: DialogContext): Promise<DialogTurnResult> {
        if (!this.onValidateActivity(dc.context.activity)) {
            return Dialog.EndOfTurn;
        }

        await dc.context.sendTraceActivity(`${ this.id }.continueDialog()`, undefined, undefined, `ActivityType: ${ dc.context.activity.type }`);

        // Handle EndOfConversation from the skill (this will be sent to the this dialog by the SkillHandler if received from the Skill)
        if (dc.context.activity.type === ActivityTypes.EndOfConversation) {
            await dc.context.sendTraceActivity(`${ this.id }.continueDialog()`, undefined, undefined, `Got ${ ActivityTypes.EndOfConversation }`);
            return await dc.endDialog(dc.context.activity.value);
        }

        // Create deep clone of the original activity to avoid altering it before forwarding it.
        const skillActivity: Activity = this.cloneActivity(dc.context.activity);

        skillActivity.deliveryMode = dc.activeDialog.state[this.DeliveryModeStateKey] as string;

        const skillConversationId: string = dc.activeDialog.state[this.SkillConversationIdStateKey];

        // Just forward to the remote skill
        const eocActivity = await this.sendToSkill(dc.context, skillActivity, skillConversationId);
        if (eocActivity) {
            return await dc.endDialog(eocActivity.value);
        }

        return Dialog.EndOfTurn;
    }

    /**
     * Called when the skill dialog is ending.
     * @param context The context object for this turn.
     * @param instance State information associated with the instance of this dialog on the dialog stack.
     * @param reason Reason why the dialog ended.
     * @returns A Promise representing the asynchronous operation.
     */
    public async endDialog(context: TurnContext, instance: DialogInstance, reason: DialogReason): Promise<void> {
        // Send of of conversation to the skill if the dialog has been cancelled. 
        if (reason == DialogReason.cancelCalled || reason == DialogReason.replaceCalled) {
            await context.sendTraceActivity(`${ this.id }.endDialog()`, undefined, undefined, `ActivityType: ${ context.activity.type }`);

            const reference = TurnContext.getConversationReference(context.activity);
            // Apply conversation reference and common properties from incoming activity before sending.
            const activity = TurnContext.applyConversationReference({ type: ActivityTypes.EndOfConversation }, reference, true);
            activity.channelData = context.activity.channelData;

            const skillConversationId: string = this.getSkillConversationIdFromInstance(instance);

            // connectionName is not applicable during endDialog as we don't expect an OAuthCard in response.
            await this.sendToSkill(context, activity as Activity, skillConversationId);
        }

        await super.endDialog(context, instance, reason);
    }

    /**
     * Called when the skill dialog should re-prompt the user for input.
     * @param context The context object for this turn.
     * @param instance State information for this dialog.
     * @returns A Promise representing the asynchronous operation.
     */
    public async repromptDialog(context: TurnContext, instance: DialogInstance): Promise<void> {
        // Create and send an envent to the skill so it can resume the dialog.
        const repromptEvent = { type: ActivityTypes.Event, name: DialogEvents.repromptDialog };

        const reference = TurnContext.getConversationReference(context.activity);
        // Apply conversation reference and common properties from incoming activity before sending.
        const activity: Activity = TurnContext.applyConversationReference(repromptEvent, reference, true) as Activity;

        const skillConversationId: string = this.getSkillConversationIdFromInstance(instance);
        
        // connectionName is not applicable for a reprompt as we don't expect an OAuthCard in response.
        await this.sendToSkill(context, activity, skillConversationId);
    }

    /**
     * Called when a child skill dialog completed its turn, returning control to this dialog.
     * @param dc The dialog context for the current turn of the conversation.
     * @param reason Reason why the dialog resumed.
     * @param result Optional, value returned from the dialog that was called. The type
     * of the value returned is dependent on the child dialog.
     * @returns A Promise representing the asynchronous operation.
     */
    public async resumeDialog(dc: DialogContext, reason: DialogReason, result?: any): Promise<DialogTurnResult> {
        await this.repromptDialog(dc.context, dc.activeDialog);
        return Dialog.EndOfTurn;
    }

    /**
     * @protected
     * Validates the activity sent during continueDialog.
     * @remarks
     * Override this method to implement a custom validator for the activity being sent during the continueDialog.
     * This method can be used to ignore activities of a certain type if needed.
     * If this method returns false, the dialog will end the turn without processing the activity.
     * @param activity The Activity for the current turn of conversation.
     */
    protected onValidateActivity(activity: Activity): boolean {
        return true;
    }

    /**
     * @private
     * Clones the Activity entity.
     * @param activity Activity to clone.
     */
    private cloneActivity(activity: Partial<Activity>): Activity {
        return JSON.parse(JSON.stringify(activity));
    }

    /**
     * @private
     */
    private validateBeginDialogArgs(options: BeginSkillDialogOptions): BeginSkillDialogOptions {
        if (!options) {
            throw new TypeError('Missing options parameter');
        }

        if (!options.activity) {
            throw new TypeError(`"activity" is undefined or null in options.`);
        }

        return options;
    }

    /**
     * @private
     */
    private async sendToSkill(context: TurnContext, activity: Activity, skillConversationId: string): Promise<Activity> {
        if (activity.type === ActivityTypes.Invoke) {
            // Force ExpectReplies for invoke activities so we can get the replies right away and send them back to the channel if needed.
            // This makes sure that the dialog will receive the Invoke response from the skill and any other activities sent, including EoC.
            activity.deliveryMode = DeliveryModes.ExpectReplies;
        }

        // Always save state before forwarding
        // (the dialog stack won't get updated with the skillDialog and things won't work if you don't)
        const skillInfo = this.dialogOptions.skill;
        await this.dialogOptions.conversationState.saveChanges(context, true);

        const response = await this.dialogOptions.skillClient.postActivity<ExpectedReplies>(this.dialogOptions.botId, skillInfo.appId, skillInfo.skillEndpoint, this.dialogOptions.skillHostEndpoint, skillConversationId, activity);

        // Inspect the skill response status
        if (!isSuccessStatusCode(response.status)) {
            throw new Error(`Error invoking the skill id: "${ skillInfo.id }" at "${ skillInfo.skillEndpoint }" (status is ${ response.status }). \r\n ${ response.body }`);
        }

        let eocActivity: Activity;
        const activities = typeof response.body !== 'undefined' && (response.body as ExpectedReplies).activities;
        if (activity.deliveryMode === DeliveryModes.ExpectReplies && Array.isArray(activities)) {
            // Process replies in the response.body.
            for (const activityFromSkill of activities) {
                if (activityFromSkill.type === ActivityTypes.EndOfConversation) {
                    // Capture the EndOfConversation activity if it was sent from skill
                    eocActivity = activityFromSkill;
                } else if (await this.interceptOAuthCards(context, activityFromSkill, this.dialogOptions.connectionName)) {
                    // Do nothing. The token exchange succeeded, so no OAuthCard needs to be shown to the user.
                } else {
                    await context.sendActivity(activityFromSkill);
                }
            };
        }

        return eocActivity;
    }

    /**
     * Tells us if we should intercept the OAuthCard message.
     * @remarks
     * The SkillDialog only attempts to intercept OAuthCards when the following criteria are met:
     * 1. An OAuthCard was sent from the skill
     * 2. The SkillDialog was called with a connectionName
     * 3. The current adapter supports token exchange
     * If any of these criteria are false, return false.
     * @private
     */
    private async interceptOAuthCards(context: TurnContext, activity: Activity, connectionName: string): Promise<boolean> {
        if (!connectionName || !('exchangeToken' in context.adapter)) {
            // The adapter may choose not to support token exchange, in which case we fallback to showing skill's OAuthCard to the user.
            return false;
        }

        const oAuthCardAttachment: Attachment = (activity.attachments || []).find((c) => c.contentType === CardFactory.contentTypes.oauthCard);
        if (oAuthCardAttachment) {
            const tokenExchangeProvider: ExtendedUserTokenProvider = context.adapter as ExtendedUserTokenProvider;
            const oAuthCard: OAuthCard = oAuthCardAttachment.content;

            const uri = oAuthCard && oAuthCard.tokenExchangeResource && oAuthCard.tokenExchangeResource.uri;
            if (uri) {
                try {
                    const result: TokenResponse = await tokenExchangeProvider.exchangeToken(
                        context,
                        connectionName,
                        context.activity.from.id,
                        { uri });
                    
                    if (result && result.token) {
                        // If token above is null or undefined, then SSO has failed and we return false.
                        // If not, send an invoke to the skill with the token.
                        return await this.sendTokenExchangeInvokeToSkill(activity, oAuthCard.tokenExchangeResource.id, oAuthCard.connectionName, result.token);
                    }
                } catch (err) {
                    // Failures in token exchange are not fatal. They simply mean that the user needs to be shown the skill's OAuthCard.
                    return false;
                }
            }
        }
        return false;
    }

    /**
     * @private
     */
    private async sendTokenExchangeInvokeToSkill(incomingActivity: Activity, id: string, connectionName: string, token: string): Promise<boolean> {
        const ref: Partial<ConversationReference> = TurnContext.getConversationReference(incomingActivity);
        const activity: Activity = TurnContext.applyConversationReference({ ...incomingActivity }, ref) as any;
        activity.type = ActivityTypes.Invoke;
        activity.name = tokenExchangeOperationName;
        activity.value = { connectionName, id, token } as TokenExchangeInvokeRequest;

        // Send the activity to the Skill
        const skillInfo = this.dialogOptions.skill;
        const response = await this.dialogOptions.skillClient.postActivity<ExpectedReplies>(this.dialogOptions.botId, skillInfo.appId, skillInfo.skillEndpoint, this.dialogOptions.skillHostEndpoint, incomingActivity.conversation.id, activity);

        // Check response status: true if success, false if failure
        return isSuccessStatusCode(response.status);
    }

    /**
     * @private
     * Create a conversationId to interact with the skill and send the activity.
     * @param context Context for the current turn of conversation with the user.
     * @param activity Activity to send.
     * @returns The Skill Conversation ID.
     */
    private async createSkillConversationId(context: TurnContext, activity: Activity) {
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
        return skillConversationId;
    }

    /**
     * @private
     * Gets the Skill Conversation ID from a given instance.
     * @param instance Instance from which to look for its ID.
     * @returns Instance conversation ID.
     */
    private getSkillConversationIdFromInstance(instance: DialogInstance): string {
        if (instance && instance.state) {
            return instance.state[this.SkillConversationIdStateKey];
        }

        return null;
    }
}

function isSuccessStatusCode(status: number): boolean {
    return status >= StatusCodes.OK && status < StatusCodes.MULTIPLE_CHOICES;
}
