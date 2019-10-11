/**
 * @module botbuilder-skills
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext, Activity, ActivityTypes, ConversationReference, EndOfConversationCodes } from 'botbuilder-core';
import { Dialog, DialogInstance, DialogReason, DialogTurnResult, DialogContext } from 'botbuilder-dialogs';
import { SkillHostAdapter } from './skillHostAdapter';

export interface SkillDialogSettings {
    skillId: string;
}

const SKILL_CONVERSATION_KEY = 'skillConvo';

export class SkillDialog<O extends object = {}> extends Dialog<O> {
    private readonly settings: SkillDialogSettings;

    constructor(dialogId: string, settings: SkillDialogSettings) {
        super(dialogId);
        this.settings = Object.assign({}, settings);
    }

    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        const adapter = this.asSkillAdapter(dc.context);

        // Start skill conversation
        const skillConversation = adapter.createSkillConversation(dc.context);
        dc.activeDialog.state[SKILL_CONVERSATION_KEY] = skillConversation;

        // Copy options to initial activity
        const activity: Partial<Activity> = Object.assign({}, dc.context.activity);
        if (options !== undefined) {
            // Merge options with any existing values such that they override the
            // existing value.
            activity.value = Object.assign({}, activity.value, options);
        }

        // Forward activity to skill
        await adapter.forwardActivity(dc.context, this.settings.skillId, activity, skillConversation);
        return Dialog.EndOfTurn;
    }

    public async continueDialog(dc: DialogContext): Promise<DialogTurnResult> {
        // Check for notifications from the skill
        // - BUGBUG: there's a potential issue with this approach that the dialog could
        //   potentially miss the notification that the skill ended. If the skills dialog has
        //   been interrupted when the skill sends an EndOfConversation, the dialog won't see
        //   the notification. It's not clear how to easily fix this at this time.
        const activity = dc.context.activity;
        const skillConversation: Partial<ConversationReference> = dc.activeDialog.state[SKILL_CONVERSATION_KEY];
        if (activity.relatesTo != undefined) {
            // Is the notification for the current skill dialog instance?
            if (skillConversation.conversation.id == activity.relatesTo.conversation.id) {
                // Is the skill ending?
                if (activity.type == ActivityTypes.EndOfConversation) {
                    // Return result from skill
                    return dc.endDialog(activity.value);
                }
            }
        } else if (activity.type == ActivityTypes.Message) {
            // Forward users utterance to the skill
            const adapter = this.asSkillAdapter(dc.context);
            await adapter.forwardActivity(dc.context, this.settings.skillId, activity, skillConversation);
        }

        return Dialog.EndOfTurn;
    }

    public async endDialog(context: TurnContext, instance: DialogInstance, reason: DialogReason): Promise<void> {
        // Forward cancel to inner dialogs
        if (reason === DialogReason.cancelCalled) {
            // We've been cancelled locally so notify the skill
            const adapter = this.asSkillAdapter(context);
            const skillConversation: Partial<ConversationReference> = instance.state[SKILL_CONVERSATION_KEY];
            const activity: Partial<Activity> = { type: ActivityTypes.EndOfConversation, code: EndOfConversationCodes.UserCancelled }
            await adapter.forwardActivity(context, this.settings.skillId, activity, skillConversation);
        }
    }

    private asSkillAdapter(context: TurnContext): SkillHostAdapter {
        if (context instanceof SkillHostAdapter) {
            return context as SkillHostAdapter;
        } else {
            throw new Error(`SkillDialog: the current adapter is not an instance of a SkillHostAdapter.`)
        }
    }
}
