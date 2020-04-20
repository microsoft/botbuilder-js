import { Activity,
    ActivityTypes,
    SkillConversationReferenceKey,
    StatePropertyAccessor,
    TurnContext
} from 'botbuilder-core';
import { DialogContext, DialogState } from './dialogContext';
import { Dialog, DialogTurnStatus } from './dialog';
import { DialogEvents } from './dialogEvents';
import { DialogSet } from './dialogSet';
import { isSkillClaim } from './prompts/skillsHelpers';

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

    const identity = context.turnState.get(context.adapter.BotIdentityKey);
    if (identity && isSkillClaim(identity.claims)) {
        // The bot is running as a skill.
        if (context.activity.type === ActivityTypes.EndOfConversation && dialogContext.stack.length > 0 &&  isEocComingFromParent(context)) {
            // Handle remote cancellation request if we have something in the stack.
            const activeDialogContext = getActiveDialogContext(dialogContext);
            
            const remoteCancelText = 'Skill was canceled through an EndOfConversation activity from the parent.';
            await context.sendTraceActivity(telemetryEventName, undefined, undefined, `${ remoteCancelText }`);

            // Send cancellation message to the top dialog in the stack to ensure all the parents are canceled in the right order. 
            await activeDialogContext.cancelAllDialogs(true);
        } else {
            // Process a reprompt event sent from the parent.
            if (context.activity.type === ActivityTypes.Event && context.activity.name === DialogEvents.repromptDialog && dialogContext.stack.length > 0) {
                await dialogContext.repromptDialog();
                return;
            }

            // Run the Dialog with the new message Activity and capture the results so we can send end of conversation if needed.
            let result = await dialogContext.continueDialog();
            if (result.status === DialogTurnStatus.empty) {
                const startMessageText = `Starting ${ dialog.id }.`;
                await context.sendTraceActivity(telemetryEventName, undefined, undefined, `${ startMessageText }`);
                result = await dialogContext.beginDialog(dialog.id, null);
            }

            // Send end of conversation if it is completed or cancelled.
            if (result.status === DialogTurnStatus.complete || result.status === DialogTurnStatus.cancelled) {
                const endMessageText = `Dialog ${ dialog.id } has **completed**. Sending EndOfConversation.`;
                await context.sendTraceActivity(telemetryEventName, result.result, undefined, `${ endMessageText }`);

                // Send End of conversation at the end.
                const activity: Partial<Activity> = { type: ActivityTypes.EndOfConversation, value: result.result };
                await context.sendActivity(activity);
            }
        }
    } else {
        // The bot is running as a standard bot.
        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(dialog.id);
        }
    }
}

// Recursively walk up the DC stack to find the active DC.
function getActiveDialogContext(dialogContext: DialogContext): DialogContext {
    const child = dialogContext.child;
    if (!child) {
        return dialogContext;
    }

    return getActiveDialogContext(child);
}

// We should only cancel the current dialog stack if the EoC activity is coming from a parent (a root bot or another skill).
// When the EoC is coming back from a child, we should just process that EoC normally through the 
// dialog stack and let the child dialogs handle that.
function isEocComingFromParent(context: TurnContext): boolean {
    // To determine the direction we check callerId property which is set to the parent bot
    // by the BotFrameworkHttpClient on outgoing requests.
    return !!context.activity.callerId;
}

function isFromParentToSkill(context: TurnContext): boolean {
    if (context.turnState.get(SkillConversationReferenceKey)) {
        return false;
    }

    const identity = context.turnState.get(context.adapter.BotIdentityKey);
    return identity && isSkillClaim(identity.claims);
}