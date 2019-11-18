import { PromptValidator, PromptOptions,  PromptRecognizerResult } from './prompt';
import { DialogTurnResult, Dialog } from '../dialog';
import { DialogContext } from '../dialogContext';
import { InputHints, TurnContext, Activity, Attachment } from '../../../botbuilder';

/**
 * Settings to control the behavior of AdaptiveCardPrompt
 */
export interface AdaptiveCardPromptSettings {
    /**
     * An Adaptive Card. Required.
     */
    card: Attachment;

    /**
     * Array of strings matching IDs of required input fields
     * 
     * @remarks
     * The ID strings must exactly match those used in the Adaptive Card JSON Input IDs
     * For JSON:
     * ```json
     * {
     *   "type": "Input.Text",
     *   "id": "myCustomId",
     * },
     *```
     * You would use `"myCustomId"` if you want that to be a required input.
     */
    requiredInputIds?: string[];

    /**
     * ID specific to this prompt.
     * 
     * @remarks
     * Card input is only accepted if SubmitAction.data.promptId matches the promptId.
     * This is set to a random string<number> and randomizes again on reprompts by default.
     *   If set manually, will not change between reprompts.
     */
    promptId?: string;
}

export enum AdaptiveCardInputPromptErrors {
    UserInputDoesNotMatchCardId = 'userInputDoesNotMatchCardId',
    MissingRequiredIds = 'missingRequiredIds',
    UserUsedTextInput = 'userUsedTextInput'
}

/**
 * Waits for Adaptive Card Input to be received.
 * 
 * @remarks
 * This prompt is similar to ActivityPrompt but provides features specific to Adaptive Cards:
 *   * Card can be passed in constructor or as prompt/reprompt activity attachment 
 *   * Includes validation for specified required input fields
 *   * Displays custom message if user replies via text and not card input
 *   * Ensures input is only valid if it comes from the appropriate card (not one shown previous to prompt)
 * DO NOT USE WITH CHANNELS THAT DON'T SUPPORT ADAPTIVE CARDS
 */
export class AdaptiveCardPrompt extends Dialog {
    private validator: PromptValidator<object>;
    private requiredInputIds: string[];
    private promptId: string;
    private card: Attachment;

    /**
     * Creates a new AdaptiveCardPrompt instance
     * @param dialogId Unique ID of the dialog within its parent `DialogSet` or `ComponentDialog`.
     * @param validator (optional) Validator that will be called each time a new activity is received. Validator should handle error messages on failures.
     * @param settings (optional) Additional options for AdaptiveCardPrompt behavior
     */
    public constructor(dialogId: string, settings: AdaptiveCardPromptSettings, validator?: PromptValidator<object>) {
        super(dialogId);
        if (!settings.card) {
            throw new Error('AdaptiveCardPrompt requires a card in `AdaptiveCardPromptSettings.card`');
        }

        this.validator = validator;

        this.requiredInputIds = settings.requiredInputIds || [];

        this.card = settings.card;

        this.promptId = settings.promptId;
    }

    public async beginDialog(dc: DialogContext, options: PromptOptions): Promise<DialogTurnResult> {
        // Initialize prompt state
        const state: AdaptiveCardPromptState = dc.activeDialog.state;
        state.options = options;
        state.state = {};

        // Send initial prompt
        await this.onPrompt(dc.context, state.state, state.options, false);

        return Dialog.EndOfTurn;
    }

    protected async onPrompt(context: TurnContext, state: object, options: PromptOptions, isRetry: boolean): Promise<void> {
        let prompt = isRetry && options.retryPrompt ? (options.retryPrompt as Partial<Activity>) : (options.prompt as Partial<Activity>);

        // Create a prompt if user didn't pass it in through PromptOptions
        if (!prompt || Object.keys(prompt).length === 0 || typeof(prompt) != 'object' || !prompt.attachments || prompt.attachments.length === 0) {
            prompt = {
                attachments: [],
                text: typeof(prompt) === 'string' ? prompt : undefined,
            };
        }

        // Use card passed in PromptOptions or if it doesn't exist, use the one passed in from the constructor
        const card = prompt.attachments && prompt.attachments[0] ? prompt.attachments[0] : this.card;

        this.validateIsCard(card, isRetry);

        prompt.attachments = [card];

        await context.sendActivity(prompt, undefined, InputHints.ExpectingInput);
    }

    // Override continueDialog so that we can catch activity.value (which is ignored, by default)
    public async continueDialog(dc: DialogContext): Promise<DialogTurnResult> {
        // Perform base recognition
        const state: AdaptiveCardPromptState = dc.activeDialog.state;
        const recognized: PromptRecognizerResult<object> = await this.onRecognize(dc.context);

        if (state.state['attemptCount'] === undefined) {
            state.state['attemptCount'] = 1;
        } else {
            state.state['attemptCount']++;
        }

        let isValid = false;

        if (recognized.succeeded) {
            if (this.validator) {
                isValid = await this.validator({
                    context: dc.context,
                    recognized: recognized,
                    state: state.state,
                    options: state.options,
                    attemptCount: state.state['attemptCount']
                });
            } else {
                isValid = true;
            }
        }

        // Return recognized value or re-prompt
        if (isValid) {
            return await dc.endDialog(recognized.value);
        } else {
            // Re-prompt
            await this.onPrompt(dc.context, state.state, state.options, true);
            return Dialog.EndOfTurn;
        }
    }

    protected async onRecognize(context: TurnContext): Promise<PromptRecognizerResult<object>> {
        // Ignore user input that doesn't come from adaptive card
        if (!context.activity.text && context.activity.value) {
            // Validate it comes from the correct card - This is only a worry while the prompt/dialog has not ended
            if (this.promptId && context.activity.value && context.activity.value['promptId'] != this.promptId) {
                return { succeeded: false, value: { error: AdaptiveCardInputPromptErrors.UserInputDoesNotMatchCardId }};
            }
            // Check for required input data, if specified in AdaptiveCardPromptSettings
            let missingIds = [];
            this.requiredInputIds.forEach((id): void => {
                if (!context.activity.value[id] || !context.activity.value[id].trim()) {
                    missingIds.push(id);
                }
            });
            // User did not submit inputs that were required
            if (missingIds.length > 0) {
                return { succeeded: false, value: { error: AdaptiveCardInputPromptErrors.MissingRequiredIds, missingIds } };
            }
            return { succeeded: true, value: context.activity.value };
        } else {
            // User used text input instead of card input
            return { succeeded: false, value: { error: AdaptiveCardInputPromptErrors.UserUsedTextInput } };
        }
    }

    private validateIsCard(cardAttachment: Attachment, isRetry: boolean): void {
        const adaptiveCardType = 'application/vnd.microsoft.card.adaptive';
        const cardLocation = isRetry ? 'retryPrompt' : 'prompt';

        if (!cardAttachment || !cardAttachment.content) {
            throw new Error(`No Adaptive Card provided. Include in the constructor or PromptOptions.${ cardLocation }.attachments[0]`);
        } else if (!cardAttachment.contentType || cardAttachment.contentType !== adaptiveCardType) {
            throw new Error(`Attachment is not a valid Adaptive Card.\n`+
            `Ensure card.contentType is '${ adaptiveCardType }'\n`+
            `and card.content contains the card json`);
        }
    }
}

/**
 * @private
 */
interface AdaptiveCardPromptState {
    state: object;
    options: PromptOptions;
}
