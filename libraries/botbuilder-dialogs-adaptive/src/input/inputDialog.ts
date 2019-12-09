/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogConfiguration, Dialog, DialogContext, DialogTurnResult, DialogEvent, DialogReason, Choice, ListStyle, ChoiceFactoryOptions, ChoiceFactory, DialogEvents } from "botbuilder-dialogs";
import { ActivityTypes, Activity, InputHints, MessageFactory } from "botbuilder-core";
import { ActivityProperty } from "../activityProperty";
import { ExpressionPropertyValue, ExpressionProperty } from "../expressionProperty";
import { AdaptiveEventNames } from "../sequenceContext";

export type PromptType = string | Partial<Activity>;

export interface InputDialogConfiguration extends DialogConfiguration {
    allowInterruptions?: ExpressionPropertyValue<any>;
    alwaysPrompt?: boolean;
    value?: ExpressionPropertyValue<any>;
    prompt?: PromptType;
    unrecognizedPrompt?: PromptType;
    invalidPrompt?: PromptType;
    property?: string;
    validations?: ExpressionPropertyValue<boolean>[];
    maxTurnCount?: number;
    defaultValue?: ExpressionPropertyValue<any>;
}

export interface InputDialogOptions {

}

export enum InputState {
    missing = 'missing',
    unrecognized = 'unrecognized',
    invalid = 'invalid',
    valid = 'valid'
}

export abstract class InputDialog<O extends InputDialogOptions> extends Dialog<O> {
    static OPTIONS_PROPERTY = 'this.options';
    static VALUE_PROPERTY = 'this.value';
    static TURN_COUNT_PROPERTY = 'this.turnCount';

    public allowInterruptions?: ExpressionProperty<any>;

    public alwaysPrompt = false;

    public value?: ExpressionProperty<any>;

    public prompt = new ActivityProperty();

    public unrecognizedPrompt = new ActivityProperty();

    public invalidPrompt = new ActivityProperty();

    public readonly validations: ExpressionProperty<boolean>[] = [];

    public maxTurnCount?: number;

    public defaultValue?: ExpressionProperty<any>;

    constructor() {
        super();

        // Initialize input hints
        this.prompt.inputHint = InputHints.ExpectingInput;
        this.unrecognizedPrompt.inputHint = InputHints.ExpectingInput;
        this.invalidPrompt.inputHint = InputHints.ExpectingInput;
    }

    /**
     * (Optional) data binds the called dialogs input & output to the given property.
     *
     * @remarks
     * The bound properties current value will be passed to the called dialog as part of its
     * options and will be accessible within the dialog via `dialog.options.value`. The result
     * returned from the called dialog will then be copied to the bound property.
     */
    public property: string;

    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        // Initialize and persist options
        const opts = this.onInitializeOptions(dc, options || {} as O);
        dc.state.setValue(InputDialog.OPTIONS_PROPERTY, opts);

        // Initialize turn count & input
        dc.state.setValue(InputDialog.TURN_COUNT_PROPERTY, 0);
        if (this.property) {
            dc.state.setValue(InputDialog.VALUE_PROPERTY, dc.state.getValue(this.property));
        }

        // Recognize input
        const state = this.alwaysPrompt ? InputState.missing : await this.recognizeInput(dc, false);
        if (state == InputState.valid) {
            // Return input
            const value = dc.state.getValue(InputDialog.VALUE_PROPERTY);
            if (this.property) { dc.state.setValue(this.property, value) }
            return await dc.endDialog(value);
        } else {
            // Prompt user
            return await this.promptUser(dc, state);
        }
    }

    public async continueDialog(dc: DialogContext): Promise<DialogTurnResult> {
        // Filter to only message activities
        const activity = dc.context.activity;
        if (activity.type !== ActivityTypes.Message) {
            return Dialog.EndOfTurn;
        }

        // Are we continuing after an interruption?
        const stepCount = dc.state.getValue('turn.stepCount') || 0;
        if (stepCount > 0) {
            // Re-send initial prompt
            return await this.promptUser(dc, InputState.missing);
        }

        // Increment turn count
        const turnCount = dc.state.getValue(InputDialog.TURN_COUNT_PROPERTY) + 1;
        dc.state.setValue(InputDialog.TURN_COUNT_PROPERTY, turnCount);

        // Recognize input
        const state = await this.recognizeInput(dc, false);
        if (state == InputState.valid) {
            // Return input
            const value = dc.state.getValue(InputDialog.VALUE_PROPERTY);
            if (this.property) { dc.state.setValue(this.property, value) }
            return await dc.endDialog(value);
        } else if (this.maxTurnCount == undefined || turnCount < this.maxTurnCount) {
            // Prompt user
            return await this.promptUser(dc, state);
        } else {
            // Return default value
            const result = this.defaultValue ? this.defaultValue.evaluate(this.id, dc.state) : undefined;
            return await dc.endDialog(result);
        }
    }

    public async resumeDialog(dc: DialogContext, reason: DialogReason, result?: any): Promise<DialogTurnResult> {
        // Re-send initial prompt
        return await this.promptUser(dc, InputState.missing);
    }

    public addValidation(validation: ExpressionPropertyValue<boolean>): this {
        this.validations.push(new ExpressionProperty(validation));
        return this;
    }

    public configure(config: InputDialogConfiguration): this {
        for (const key in config) {
            if (config.hasOwnProperty(key)) {
                const value = config[key];
                switch (key) {
                    case 'prompt':
                        this.prompt.value = value;
                        break;
                    case 'unrecognizedPrompt':
                        this.unrecognizedPrompt.value = value;
                        break;
                    case 'invalidPrompt':
                        this.invalidPrompt.value = value;
                        break;
                    case 'validations':
                        (value as any[]).forEach((exp) => this.validations.push(new ExpressionProperty(exp)));
                        break;
                    case 'value':
                        this.value = new ExpressionProperty(value);
                    case 'defaultValue':
                        this.defaultValue = new ExpressionProperty(value);
                    default:
                        super.configure({ [key]: value });
                        break;
                }
            }
        }

        return this;
    }

    protected async onPreBubbleEvent(dc: DialogContext, event: DialogEvent): Promise<boolean> {
        if (event.name === DialogEvents.activityReceived && dc.context.activity.type === ActivityTypes.Message) {
            if (dc.parent) {
                dc.parent.emitEvent(AdaptiveEventNames.recognizeUtterance, dc.context.activity, false);
            }
            let canInterrupt: boolean = true;
            if (this.allowInterruptions) {
                const { value, error } = this.allowInterruptions.evaluate(this.id, dc.state);
                canInterrupt = error === null && value !== null && value as boolean;
            }
            return !canInterrupt;
        }

        return false;
    }

    protected abstract onRecognizeInput(dc: DialogContext, consultation: boolean): Promise<InputState>;

    protected onInitializeOptions(dc: DialogContext, options: O): O {
        return Object.assign({}, options);
    }

    protected onRenderPrompt(dc: DialogContext, state: InputState): Partial<Activity> {
        switch (state) {
            case InputState.unrecognized:
                if (this.unrecognizedPrompt.hasValue) {
                    return this.unrecognizedPrompt.format(dc);
                } else if (this.invalidPrompt.hasValue) {
                    return this.invalidPrompt.format(dc);
                }
                break;
            case InputState.invalid:
                if (this.invalidPrompt.hasValue) {
                    return this.invalidPrompt.format(dc);
                } else if (this.unrecognizedPrompt.hasValue) {
                    return this.unrecognizedPrompt.format(dc);
                }
                break;
        }

        return this.prompt.format(dc);
    }

    protected getDefaultInput(dc: DialogContext): any {
        const text = dc.context.activity.text;
        return typeof text == 'string' && text.length > 0 ? text : undefined;
    }


    /**
     * Helper function to compose an output activity containing a set of choices.
     * @param prompt The prompt to append the users choices to.
     * @param channelId ID of the channel the prompt is being sent to.
     * @param choices List of choices to append.
     * @param style Configured style for the list of choices.
     * @param options (Optional) options to configure the underlying ChoiceFactory call.
     */
    protected appendChoices(
        prompt: Partial<Activity>,
        channelId: string,
        choices: (string | Choice)[],
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
        if (msg.suggestedActions && Array.isArray(msg.suggestedActions.actions) && msg.suggestedActions.actions.length > 0) {
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

    private async recognizeInput(dc: DialogContext, consultation: boolean): Promise<InputState> {
        // Check for named entity first
        let input: any;
        if (this.value) {
            input = this.value.evaluate(this.id, dc.state);
        }

        // Use utterance or value passed in
        if (input == undefined) {
            const turnCount = dc.state.getValue(InputDialog.TURN_COUNT_PROPERTY);
            if (turnCount == 0) {
                input = dc.state.getValue(InputDialog.VALUE_PROPERTY);
            } else {
                input = this.getDefaultInput(dc);
            }
        }

        // Save input to memory
        dc.state.setValue(InputDialog.VALUE_PROPERTY, input);
        if (input != undefined) {
            // Recognize input
            const state = await this.onRecognizeInput(dc, consultation);
            if (state == InputState.valid) {
                // Run through validations
                const memory = dc.state;
                for (let i = 0; i < this.validations.length; i++) {
                    const value = this.validations[i].evaluate(this.id, memory);
                    if (!value) {
                        return InputState.invalid;
                    }
                }

                return InputState.valid;
            } else {
                return state;
            }
        } else {
            return InputState.missing;
        }
    }

    private async promptUser(dc: DialogContext, state: InputState): Promise<DialogTurnResult> {
        const prompt = this.onRenderPrompt(dc, state);
        await dc.context.sendActivity(prompt);
        return Dialog.EndOfTurn;
    }
}
