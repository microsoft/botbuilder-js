/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ActivityTemplate, StaticActivityTemplate } from '../templates';
import { ActivityTemplateConverter } from '../converters';
import { ActivityTypes, Activity, InputHints, MessageFactory } from 'botbuilder';
import { AdaptiveEvents } from '../adaptiveEvents';
import { AttachmentInput } from './attachmentInput';
import { BoolProperty, IntProperty, StringProperty, TemplateInterfaceProperty, UnknownProperty } from '../properties';
import { TelemetryLoggerConstants } from '../telemetryLoggerConstants';

import {
    BoolExpression,
    BoolExpressionConverter,
    ExpressionParser,
    IntExpression,
    IntExpressionConverter,
    StringExpression,
    StringExpressionConverter,
    ValueExpression,
    ValueExpressionConverter,
} from 'adaptive-expressions';

import {
    Choice,
    ChoiceFactory,
    ChoiceFactoryOptions,
    Converter,
    ConverterFactory,
    Dialog,
    DialogConfiguration,
    DialogContext,
    DialogEvent,
    DialogEvents,
    DialogReason,
    DialogStateManager,
    DialogTurnResult,
    ListStyle,
    TemplateInterface,
    TurnPath,
} from 'botbuilder-dialogs';

export enum InputState {
    missing = 'missing',
    unrecognized = 'unrecognized',
    invalid = 'invalid',
    valid = 'valid',
}

export interface InputDialogConfiguration extends DialogConfiguration {
    alwaysPrompt?: BoolProperty;
    allowInterruptions?: BoolProperty;
    property?: StringProperty;
    value?: UnknownProperty;
    prompt?: TemplateInterfaceProperty<Partial<Activity>, DialogStateManager>;
    unrecognizedPrompt?: TemplateInterfaceProperty<Partial<Activity>, DialogStateManager>;
    invalidPrompt?: TemplateInterfaceProperty<Partial<Activity>, DialogStateManager>;
    defaultValueResponse?: TemplateInterfaceProperty<Partial<Activity>, DialogStateManager>;
    validations?: string[];
    maxTurnCount?: IntProperty;
    defaultValue?: UnknownProperty;
    disabled?: BoolProperty;
}

/**
 * Defines input dialogs.
 */
export abstract class InputDialog extends Dialog implements InputDialogConfiguration {
    static OPTIONS_PROPERTY = 'this.options';
    static VALUE_PROPERTY = 'this.value';
    static TURN_COUNT_PROPERTY = 'this.turnCount';

    /**
     * A value indicating whether the input should always prompt the user regardless of there being a value or not.
     */
    alwaysPrompt: BoolExpression;

    /**
     * Interruption policy.
     */
    allowInterruptions: BoolExpression;

    /**
     * The value expression which the input will be bound to.
     */
    property: StringExpression;

    /**
     * A value expression which can be used to initialize the input prompt.
     */
    value: ValueExpression;

    /**
     * The activity to send to the user.
     */
    prompt: TemplateInterface<Partial<Activity>, DialogStateManager>;

    /**
     * The activity template for retrying prompt.
     */
    unrecognizedPrompt: TemplateInterface<Partial<Activity>, DialogStateManager>;

    /**
     * The activity template to send to the user whenever the value provided is invalid or not.
     */
    invalidPrompt: TemplateInterface<Partial<Activity>, DialogStateManager>;

    /**
     * The activity template to send when maxTurnCount has be reached and the default value is used.
     */
    defaultValueResponse: TemplateInterface<Partial<Activity>, DialogStateManager>;

    /**
     * The expressions to run to validate the input.
     */
    validations: string[] = [];

    /**
     * Maximum number of times to ask the user for this value before the dialog gives up.
     */
    maxTurnCount?: IntExpression;

    /**
     * The default value for the input dialog when maxTurnCount is exceeded.
     */
    defaultValue?: ValueExpression;

    /**
     * An optional expression which if is true will disable this action.
     */
    disabled?: BoolExpression;

    /**
     * @param property The key of the conditional selector configuration.
     * @returns The converter for the selector configuration.
     */
    getConverter(property: keyof InputDialogConfiguration): Converter | ConverterFactory {
        switch (property) {
            case 'alwaysPrompt':
                return new BoolExpressionConverter();
            case 'allowInterruptions':
                return new BoolExpressionConverter();
            case 'property':
                return new StringExpressionConverter();
            case 'value':
                return new ValueExpressionConverter();
            case 'prompt':
                return new ActivityTemplateConverter();
            case 'unrecognizedPrompt':
                return new ActivityTemplateConverter();
            case 'invalidPrompt':
                return new ActivityTemplateConverter();
            case 'defaultValueResponse':
                return new ActivityTemplateConverter();
            case 'maxTurnCount':
                return new IntExpressionConverter();
            case 'defaultValue':
                return new ValueExpressionConverter();
            case 'disabled':
                return new BoolExpressionConverter();
            default:
                return super.getConverter(property);
        }
    }

    /**
     * Initializes a new instance of the [InputDialog](xref:botbuilder-dialogs-adaptive.InputDialog) class
     *
     * @param property Optional. The value expression which the input will be bound to.
     * @param prompt Optional. The [Activity](xref:botframework-schema.Activity) to send to the user,
     * if a string is specified it will instantiates an [ActivityTemplate](xref:botbuilder-dialogs-adaptive.ActivityTemplate).
     */
    constructor(property?: string, prompt?: Partial<Activity> | string) {
        super();
        if (property) {
            this.property = new StringExpression(property);
        }
        if (prompt) {
            if (typeof prompt === 'string') {
                this.prompt = new ActivityTemplate(prompt);
            } else {
                this.prompt = new StaticActivityTemplate(prompt);
            }
        }
    }

    /**
     * Called when the [Dialog](xref:botbuilder-dialogs.Dialog) is started and pushed onto the dialog stack.
     *
     * @param dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @param options Optional. Initial information to pass to the [Dialog](xref:botbuilder-dialogs.Dialog).
     * @returns A [DialogTurnResult](xref:botbuilder-dialogs.DialogTurnResult) `Promise` representing the asynchronous operation.
     */
    async beginDialog(dc: DialogContext, options?: any): Promise<DialogTurnResult> {
        if (this.disabled && this.disabled.getValue(dc.state)) {
            return await dc.endDialog();
        }

        // Initialize and persist options
        const opts = await this.onInitializeOptions(dc, options || {});
        dc.state.setValue(InputDialog.OPTIONS_PROPERTY, opts);

        // Initialize turn count & input
        dc.state.setValue(InputDialog.TURN_COUNT_PROPERTY, 0);
        if (this.property && this.alwaysPrompt && this.alwaysPrompt.getValue(dc.state)) {
            dc.state.deleteValue(this.property.getValue(dc.state));
        }

        // Recognize input
        const state =
            this.alwaysPrompt && this.alwaysPrompt.getValue(dc.state)
                ? InputState.missing
                : await this.recognizeInput(dc, 0);
        if (state == InputState.valid) {
            // Return input
            const property = this.property.getValue(dc.state);
            const value = dc.state.getValue(InputDialog.VALUE_PROPERTY);
            dc.state.setValue(property, value);
            return await dc.endDialog(value);
        } else {
            // Prompt user
            dc.state.setValue(InputDialog.TURN_COUNT_PROPERTY, 1);
            return await this.promptUser(dc, state);
        }
    }

    /**
     * Called when the [Dialog](xref:botbuilder-dialogs.Dialog) is _continued_, where it is the active dialog and the user replies with a new activity.
     *
     * @param dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @returns A [DialogTurnResult](xref:botbuilder-dialogs.DialogTurnResult) `Promise` representing the asynchronous operation.
     */
    async continueDialog(dc: DialogContext): Promise<DialogTurnResult> {
        const activity = dc.context.activity;

        // Interrupted dialogs reprompt so we can ignore the incoming activity.
        const interrupted = dc.state.getValue<boolean>(TurnPath.interrupted, false);
        if (!interrupted && activity.type !== ActivityTypes.Message) {
            return Dialog.EndOfTurn;
        }

        // Are we continuing after an interruption?
        const turnCount = dc.state.getValue(InputDialog.TURN_COUNT_PROPERTY, 0);
        const state = await this.recognizeInput(dc, interrupted ? 0 : turnCount);
        if (state === InputState.valid) {
            const input = dc.state.getValue(InputDialog.VALUE_PROPERTY);
            if (this.property) {
                dc.state.setValue(this.property.getValue(dc.state), input);
            }
            return await dc.endDialog(input);
        } else if (!this.maxTurnCount || turnCount < this.maxTurnCount.getValue(dc.state)) {
            if (!interrupted) {
                dc.state.setValue(InputDialog.TURN_COUNT_PROPERTY, turnCount + 1);
            }

            return await this.promptUser(dc, state);
        } else {
            if (this.defaultValue) {
                if (this.defaultValueResponse) {
                    const response = await this.defaultValueResponse.bind(dc, dc.state);
                    this.telemetryClient.trackEvent({
                        name: TelemetryLoggerConstants.GeneratorResultEvent,
                        properties: {
                            template: this.defaultValueResponse,
                            result: response || '',
                            context: TelemetryLoggerConstants.InputDialogResultEvent,
                        },
                    });

                    if (response != null) {
                        await dc.context.sendActivity(response);
                    }
                }

                const property = this.property.getValue(dc.state);
                const value = this.defaultValue.getValue(dc.state);
                dc.state.setValue(property, value);
                return await dc.endDialog(value);
            }
        }

        return await dc.endDialog();
    }

    /**
     * Called when a child [Dialog](xref:botbuilder-dialogs.Dialog) completes its turn, returning control to this dialog.
     *
     * @param dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @param _reason [DialogReason](xref:botbuilder-dialogs.DialogReason), reason why the dialog resumed.
     * @param _result Optional. Value returned from the [Dialog](xref:botbuilder-dialogs.Dialog) that was called.
     * The type of the value returned is dependent on the child dialog.
     * @returns A [DialogTurnResult](xref:botbuilder-dialogs.DialogTurnResult) `Promise` representing the asynchronous operation.
     */
    async resumeDialog(dc: DialogContext, _reason: DialogReason, _result?: any): Promise<DialogTurnResult> {
        // Re-send initial prompt
        return await this.promptUser(dc, InputState.missing);
    }

    /**
     * @protected
     * Called before an event is bubbled to its parent.
     * @param dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @param event [DialogEvent](xref:botbuilder-dialogs.DialogEvent), the event being raised.
     * @returns Whether the event is handled by the current [Dialog](xref:botbuilder-dialogs.Dialog) and further processing should stop.
     */
    protected async onPreBubbleEvent(dc: DialogContext, event: DialogEvent): Promise<boolean> {
        if (event.name === DialogEvents.activityReceived && dc.context.activity.type === ActivityTypes.Message) {
            if (dc.parent) {
                await dc.parent.emitEvent(AdaptiveEvents.recognizeUtterance, dc.context.activity, false);
            }

            // should we allow interruptions
            let canInterrupt = true;
            if (this.allowInterruptions) {
                const allowInterruptions = this.allowInterruptions.getValue(dc.state);
                canInterrupt = !!allowInterruptions;
            }

            // stop bubbling if interruptions are NOT allowed
            return !canInterrupt;
        }

        return false;
    }

    protected abstract onRecognizeInput(dc: DialogContext): Promise<InputState>;

    /**
     * @protected
     * Method which processes options.
     * @param _dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @param options Initial information to pass to the dialog.
     * @returns A promise representing the asynchronous operation.
     */
    protected onInitializeOptions(_dc: DialogContext, options: any): Promise<any> {
        return Promise.resolve(Object.assign({}, options));
    }

    /**
     * @protected
     * Method which renders the prompt to the user given the current input state.
     * @param dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @param state Dialog [InputState](xref:botbuilder-dialogs-adaptive.InputState).
     * @returns An [Activity](xref:botframework-schema.Activity) `Promise` representing the asynchronous operation.
     */
    protected async onRenderPrompt(dc: DialogContext, state: InputState): Promise<Partial<Activity>> {
        let msg: Partial<Activity>;
        let template: TemplateInterface<Partial<Activity>, DialogStateManager>;

        switch (state) {
            case InputState.unrecognized:
                if (this.unrecognizedPrompt) {
                    template = this.unrecognizedPrompt;
                    msg = await this.unrecognizedPrompt.bind(dc, dc.state);
                } else if (this.invalidPrompt) {
                    template = this.invalidPrompt;
                    msg = await this.invalidPrompt.bind(dc, dc.state);
                }
                break;
            case InputState.invalid:
                if (this.invalidPrompt) {
                    template = this.invalidPrompt;
                    msg = await this.invalidPrompt.bind(dc, dc.state);
                } else if (this.unrecognizedPrompt) {
                    template = this.unrecognizedPrompt;
                    msg = await this.unrecognizedPrompt.bind(dc, dc.state);
                }
                break;
        }

        if (!msg) {
            template = this.prompt;
            if (!template) throw new Error('InputDialog is missing Prompt.');
            msg = await this.prompt.bind(dc, dc.state);
        }

        if (msg != null && (typeof msg?.inputHint !== 'string' || !msg.inputHint)) {
            msg.inputHint = InputHints.ExpectingInput;
        }

        this.trackGeneratorResultEvent(dc, template, msg);

        return msg;
    }

    /**
     * @protected
     * Track GeneratorResultEvent telemetry event with InputDialogResultEvent context.
     * @param dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @param activityTemplate used to create the Activity.
     * @param msg The Partial [Activity](xref:botframework-schema.Activity) which will be sent.
     */
    protected trackGeneratorResultEvent(
        dc: DialogContext,
        activityTemplate: TemplateInterface<Partial<Activity>, DialogStateManager>,
        msg: Partial<Activity>
    ): void {
        this.telemetryClient.trackEvent({
            name: TelemetryLoggerConstants.GeneratorResultEvent,
            properties: {
                template: activityTemplate,
                result: msg,
                context: TelemetryLoggerConstants.InputDialogResultEvent,
            },
        });
    }

    /**
     * Helper function to compose an output activity containing a set of choices.
     *
     * @param prompt The prompt to append the users choices to.
     * @param channelId ID of the channel the prompt is being sent to.
     * @param choices List of choices to append.
     * @param style Configured style for the list of choices.
     * @param options (Optional) options to configure the underlying ChoiceFactory call.
     * @returns A bound activity ready to send to the user.
     */
    protected appendChoices(
        prompt: Partial<Activity>,
        channelId: string,
        choices: Choice[],
        style: ListStyle,
        options?: ChoiceFactoryOptions
    ): Partial<Activity> {
        // Create temporary msg
        let msg: Partial<Activity>;
        const text = prompt.text || '';
        switch (style) {
            case ListStyle.inline:
                msg = ChoiceFactory.inline(choices, text, null, options);
                break;

            case ListStyle.list:
                msg = ChoiceFactory.list(choices, text, null, options);
                break;

            case ListStyle.suggestedAction:
                msg = ChoiceFactory.suggestedAction(choices, text);
                break;

            case ListStyle.heroCard:
                msg = ChoiceFactory.heroCard(choices as Choice[], text);
                break;

            case ListStyle.none:
                msg = MessageFactory.text(text);
                break;

            default:
                msg = ChoiceFactory.forChannel(channelId, choices, text, null, options);
                break;
        }

        // Update clone of prompt with text, actions and attachments
        const clone = JSON.parse(JSON.stringify(prompt)) as Activity;
        clone.text = msg.text;
        if (
            msg.suggestedActions &&
            Array.isArray(msg.suggestedActions.actions) &&
            msg.suggestedActions.actions.length > 0
        ) {
            clone.suggestedActions = msg.suggestedActions;
        }

        if (msg.attachments) {
            clone.attachments = msg.attachments;
        }

        if (!clone.inputHint) {
            clone.inputHint = InputHints.ExpectingInput;
        }

        return clone;
    }

    /**
     * @private
     */
    private async recognizeInput(dc: DialogContext, turnCount: number): Promise<InputState> {
        let input: any;
        if (this.property) {
            const property = this.property.getValue(dc.state);
            input = dc.state.getValue(property);
            dc.state.deleteValue(property);
        }

        if (!input && this.value) {
            const value = this.value.getValue(dc.state);
            input = value;
        }

        const activityProcessed = dc.state.getValue(TurnPath.activityProcessed);
        if (!activityProcessed && !input && turnCount > 0) {
            if (this instanceof AttachmentInput) {
                input = dc.context.activity.attachments || [];
            } else {
                input = dc.context.activity.text;

                // if there is no visible text AND we have a value object, then fallback to that.
                if (!input && dc.context.activity.value != undefined) {
                    input = dc.context.activity.value;
                }
            }
        }

        dc.state.setValue(InputDialog.VALUE_PROPERTY, input);
        if (input) {
            const state = await this.onRecognizeInput(dc);
            if (state == InputState.valid) {
                for (let i = 0; i < this.validations.length; i++) {
                    const validation = this.validations[i];
                    const exp = new ExpressionParser().parse(validation);
                    const { value } = exp.tryEvaluate(dc.state);
                    if (!value) {
                        return InputState.invalid;
                    }
                }

                dc.state.setValue(TurnPath.activityProcessed, true);
                return InputState.valid;
            } else {
                return state;
            }
        } else {
            return InputState.missing;
        }
    }

    /**
     * @private
     */
    private async promptUser(dc: DialogContext, state: InputState): Promise<DialogTurnResult> {
        const prompt = await this.onRenderPrompt(dc, state);
        if (prompt == null) {
            throw new Error(`Call to onRenderPrompt() returned a null activity for state ${state}.`);
        }
        await dc.context.sendActivity(prompt);
        return Dialog.EndOfTurn;
    }
}
