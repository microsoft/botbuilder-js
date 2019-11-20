import { PromptValidator, PromptOptions,  PromptRecognizerResult } from './prompt';
import { DialogTurnResult, Dialog } from '../dialog';
import { DialogContext } from '../dialogContext';
import { InputHints, TurnContext, Activity, Attachment } from '../../../botbuilder/lib';

/**
 * Settings to control the behavior of AdaptiveCardPrompt
 */
export interface AdaptiveCardPromptSettings {
    /**
     * An Adaptive Card. Required.
     * @remarks
     * Add the card here. Do not pass it in to `Prompt.Attachments` or it will show twice.
     */
    card: Attachment;

    /**
     * Array of strings matching IDs of required input fields
     * 
     * @example
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
     * @requires
     * If used, you MUST add this promptId to every <submit>.data.promptId in your Adaptive Card.
     * 
     * @remarks
     * Card input is only accepted if SubmitAction.data.promptId matches the promptId.
     * Does not change between reprompts.
     */
    promptId?: string;
}

/**
 * Additional items to include on PromptRecognizerResult, as necessary
 */
export interface AdaptiveCardPromptResult {
    /**
     * The value of the user's input from the Adaptive Card.
     */
    data?: object;
    /**
     * If not recognized.succeeded, include reason why, if known
     */
    error?: AdaptiveCardPromptErrors;
    /**
     * Include which requiredIds were not included with user input
     */
    missingIds?: string[];
}

/**
 * AdaptiveCardPrompt catches certain common errors that are passed to validator, if present
 * This allows developers to handle these specific errors as they choose
 * These are given in validator context.recognized.value.error
 */
export enum AdaptiveCardPromptErrors {
    /**
     * No known user errors.
     */
    none,
    /**
     * Error presented if developer specifies AdaptiveCardPromptSettings.promptId,
     *  but user submits adaptive card input on a card where the ID does not match.
     * This error will also be present if developer AdaptiveCardPromptSettings.promptId,
     *  but forgets to add the promptId to every <submit>.data.promptId in your Adaptive Card.
     */
    userInputDoesNotMatchCardId,
    /**
     * Error presented if developer specifies AdaptiveCardPromptSettings.requiredIds,
     * but user does not submit input for all required input id's on the adaptive card
     */
    missingRequiredIds,
    /**
     * Error presented if user enters plain text instead of using Adaptive Card's input fields
     */
    userUsedTextInput
}

/**
 * Waits for Adaptive Card Input to be received.
 * 
 * @remarks
 * This prompt is similar to ActivityPrompt but provides features specific to Adaptive Cards:
 *   * Optionally allow specified input fields to be required
 *   * Optionally ensures input is only valid if it comes from the appropriate card (not one shown previous to prompt)
 *   * Provides ability to handle variety of common user errors related to Adaptive Cards 
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
     * @param settings (optional) Additional options for AdaptiveCardPrompt behavior
     * @param validator (optional) Validator that will be called each time a new activity is received. Validator should handle error messages on failures.
     */
    public constructor(dialogId: string, settings: AdaptiveCardPromptSettings, validator?: PromptValidator<object>) {
        super(dialogId);
        if (!settings || !settings.card) {
            throw new Error('AdaptiveCardPrompt requires a card in `AdaptiveCardPromptSettings.card`');
        }

        this.validator = validator;

        this.requiredInputIds = settings.requiredInputIds || [];

        this.throwIfNotAdaptiveCard(settings.card);
        this.card = settings.card;

        // Don't allow promptId to be something falsy
        if (settings.promptId !== undefined && !settings.promptId) {
            throw new Error('AdaptiveCardPromptSettings.promptId cannot be a falsy string');
        }
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
        // Since card is passed in via AdaptiveCardPromptSettings, PromptOptions may not be used.
        // Ensure we're working with RetryPrompt, as applicable
        let prompt: Partial<Activity> | string;
        if (options) {
            prompt = isRetry && options.retryPrompt ? options.retryPrompt || {} : options.prompt || {};
        } else {
            prompt = {};
        }
        
        // Clone the correct prompt so that we don't affect the one saved in state
        let clonedPrompt = JSON.parse(JSON.stringify(prompt));

        // Create a prompt if user didn't pass it in through PromptOptions or if they passed in a string
        if (!clonedPrompt || typeof(prompt) != 'object' || Object.keys(prompt).length === 0) {
            clonedPrompt = {
                text: typeof(prompt) === 'string' ? prompt : undefined,
            };
        }

        // Depending on how the prompt is called, when compiled to JS, activity attachments may be on prompt or options
        const existingAttachments = clonedPrompt.attachments || options ? options['attachments'] : [];
        // Add Adaptive Card as last attachment (user input should go last), keeping any others
        clonedPrompt.attachments = existingAttachments ? [...existingAttachments, this.card] : [this.card];

        await context.sendActivity(clonedPrompt, undefined, InputHints.ExpectingInput);
    }

    // Override continueDialog so that we can catch activity.value (which is ignored, by default)
    public async continueDialog(dc: DialogContext): Promise<DialogTurnResult> {
        // Perform base recognition
        const state: AdaptiveCardPromptState = dc.activeDialog.state;
        const recognized: PromptRecognizerResult<AdaptiveCardPromptResult> = await this.onRecognize(dc.context);

        if (state.state['attemptCount'] === undefined) {
            state.state['attemptCount'] = 1;
        } else {
            state.state['attemptCount']++;
        }

        let isValid = false;
        if (this.validator) {
            isValid = await this.validator({
                context: dc.context,
                recognized: recognized,
                state: state.state,
                options: state.options,
                attemptCount: state.state['attemptCount']
            });
        } else if (recognized.succeeded) {
            isValid = true;
        }

        // Return recognized value or re-prompt
        if (isValid) {
            return await dc.endDialog(recognized.value);
        } else {
            // Re-prompt
            if (!dc.context.responded) {
                await this.onPrompt(dc.context, state.state, state.options, true);
            }
            
            return Dialog.EndOfTurn;
        }
    }

    protected async onRecognize(context: TurnContext): Promise<PromptRecognizerResult<AdaptiveCardPromptResult>> {
        // Ignore user input that doesn't come from adaptive card
        if (!context.activity.text && context.activity.value) {
            const data = context.activity.value;
            // Validate it comes from the correct card - This is only a worry while the prompt/dialog has not ended
            if (this.promptId && context.activity.value && context.activity.value['promptId'] != this.promptId) {
                return { succeeded: false, value: { data, error: AdaptiveCardPromptErrors.userInputDoesNotMatchCardId }};
            }
            // Check for required input data, if specified in AdaptiveCardPromptSettings
            const missingIds = [];
            this.requiredInputIds.forEach((id): void => {
                if (!context.activity.value[id] || !context.activity.value[id].trim()) {
                    missingIds.push(id);
                }
            });
            // User did not submit inputs that were required
            if (missingIds.length > 0) {
                return { succeeded: false, value: { data, missingIds, error: AdaptiveCardPromptErrors.missingRequiredIds}};
            }
            return { succeeded: true, value: { data } };
        } else {
            // User used text input instead of card input
            return { succeeded: false, value: { error: AdaptiveCardPromptErrors.userUsedTextInput }};
        }
    }

    private throwIfNotAdaptiveCard(cardAttachment: Attachment): void {
        const adaptiveCardType = 'application/vnd.microsoft.card.adaptive';

        if (!cardAttachment || !cardAttachment.content) {
            throw new Error('No Adaptive Card provided. Include in the constructor or PromptOptions.prompt.attachments');
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
