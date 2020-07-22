/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Activity,
    ActivityTypes,
    EndOfConversationCodes,
    SkillConversationReference,
    SkillConversationReferenceKey,
    StatePropertyAccessor,
    TurnContext,
} from 'botbuilder-core';
import { DialogContext, DialogState } from './dialogContext';
import { Dialog, DialogTurnStatus, DialogTurnResult } from './dialog';
import { DialogEvents } from './dialogEvents';
import { DialogSet } from './dialogSet';
import { AuthConstants, GovConstants, isSkillClaim } from './prompts/skillsHelpers';

export async function runDialog(dialog: Dialog, context: TurnContext, accessor: StatePropertyAccessor<DialogState>): Promise<void> {
    if (!dialog) {
        throw new Error('runDialog(): missing dialog');
    }

    if (!context) {
        throw new Error('runDialog(): missing context');
    }

    if (!context.activity) {
        throw new Error('runDialog(): missing context.activity');
    }

    if (!accessor) {
        throw new Error('runDialog(): missing accessor');
    }

    const dialogSet = new DialogSet(accessor);
    dialogSet.telemetryClient = dialog.telemetryClient;
    dialogSet.add(dialog);

    const dialogContext = await dialogSet.createContext(context);
    const telemetryEventName = `runDialog(${ dialog.constructor.name })`;

    // Handle EoC and Reprompt event from a parent bot (can be root bot to skill or skill to skill)
    if (isFromParentToSkill(context)) {
        // Handle remote cancellation request from parent.
        if (context.activity.type === ActivityTypes.EndOfConversation) {
            if (!dialogContext.stack.length) {
                // No dialogs to cancel, just return.
                return;
            }

            const activeDialogContext = getActiveDialogContext(dialogContext);
            const remoteCancelText = 'Skill was canceled through an EndOfConversation activity from the parent.';
            await context.sendTraceActivity(telemetryEventName, undefined, undefined, `${ remoteCancelText }`);

            // Send cancellation message to the top dialog in the stack to ensure all the parents are canceled in the right order. 
            await activeDialogContext.cancelAllDialogs(true);
            return;
        }

        // Process a reprompt event sent from the parent.
        if (context.activity.type === ActivityTypes.Event && context.activity.name === DialogEvents.repromptDialog) {
            if (!dialogContext.stack.length) {
                // No dialogs to reprompt, just return.
                return;
            }

            await dialogContext.repromptDialog();
            return;
        }
    }

    // Continue or start the dialog.
    const result = await dialogContext.continueDialog();
    if (result.status === DialogTurnStatus.empty) {
        await dialogContext.beginDialog(dialog.id);
    }

    if (result.status === DialogTurnStatus.complete || result.status === DialogTurnStatus.cancelled) {
        if (shouldSendEndOfConversationToParent(context, result)) {
            const endMessageText = `Dialog ${ dialog.id } has **completed**. Sending EndOfConversation.`;
            await context.sendTraceActivity(telemetryEventName, result.result, undefined, `${ endMessageText }`);

            // Send End of conversation at the end.
            const code = result.status == DialogTurnStatus.complete ? EndOfConversationCodes.CompletedSuccessfully : EndOfConversationCodes.UserCancelled;
            const activity: Partial<Activity> = { type: ActivityTypes.EndOfConversation, value: result.result, locale: context.activity.locale, code: code };
            await context.sendActivity(activity);
        }
    }
}

/**
 * Helper to determine if we should send an EoC to the parent or not.
 * @param context 
 */
export function shouldSendEndOfConversationToParent(context: TurnContext, turnResult: DialogTurnResult): boolean {
    if (!(turnResult.status == DialogTurnStatus.complete || turnResult.status == DialogTurnStatus.cancelled)) {
        // The dialog is still going, don't return EoC.
        return false;
    }

    const claimIdentity = context.turnState.get(context.adapter.BotIdentityKey);
    // Inspect the cached ClaimsIdentity to determine if the bot was called from another bot.
    if (claimIdentity && isSkillClaim(claimIdentity.claims)) {
        // EoC Activities returned by skills are bounced back to the bot by SkillHandler.
        // In those cases we will have a SkillConversationReference instance in state.
        const skillConversationReference: SkillConversationReference = context.turnState.get(SkillConversationReferenceKey);
        if (skillConversationReference) {
            // If the skillConversationReference.OAuthScope is for one of the supported channels, we are at the root and we should not send an EoC.
            return skillConversationReference.oAuthScope !== AuthConstants.ToBotFromChannelTokenIssuer && skillConversationReference.oAuthScope !== GovConstants.ToBotFromChannelTokenIssuer;
        }

        return true;
    }

    return false;
}

// Recursively walk up the DC stack to find the active DC.
export function getActiveDialogContext(dialogContext: DialogContext): DialogContext {
    const child = dialogContext.child;
    if (!child) {
        return dialogContext;
    }

    return getActiveDialogContext(child);
}

export function isFromParentToSkill(context: TurnContext): boolean {
    // If a SkillConversationReference exists, it was likely set by the SkillHandler and the bot is acting as a parent.
    if (context.turnState.get(SkillConversationReferenceKey)) {
        return false;
    }

    // Inspect the cached ClaimsIdentity to determine if the bot is acting as a skill.
    const identity = context.turnState.get(context.adapter.BotIdentityKey);
    return identity && isSkillClaim(identity.claims);
}
