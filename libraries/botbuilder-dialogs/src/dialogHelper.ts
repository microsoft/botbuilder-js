import { Activity, ActivityTypes, TurnContext, StatePropertyAccessor } from 'botbuilder-core';
import { DialogContext, DialogState } from './dialogContext';
import { Dialog, DialogTurnStatus } from './dialog';
import { DialogEvents } from './dialogEvents';
import { DialogSet } from './dialogSet';
import { isSkillClaim } from './prompts/skillsHelpers';

export async function runDialog(dialog: Dialog, context: TurnContext, accessor: StatePropertyAccessor<DialogState>): Promise<void> {
    const dialogSet = new DialogSet(accessor);
    dialogSet.telemetryClient = dialog.telemetryClient;
    dialogSet.add(dialog);

    const dialogContext = await dialogSet.createContext(context);
    const telemetryEventName = `runDialog(${ dialog.constructor.name })`;

    const identity = context.turnState.get(context.adapter.BotIdentityKey);
    if (identity && isSkillClaim(identity.claims)) {
        // The bot is running as a skill.
        if (context.activity.type === ActivityTypes.EndOfConversation && dialogContext.stack.length > 0) {
            // Handle remote cancellation request if we have something in the stack.
            const activeDialogContext = getActiveDialogContext(dialogContext);
            
            const remoteCancelText = 'Skill was canceled by a request from the host.';
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
