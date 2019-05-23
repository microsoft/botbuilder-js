/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogConfiguration, Dialog, DialogContext, DialogTurnResult, DialogEvent, DialogReason } from "botbuilder-dialogs";
import { ActivityTypes, Activity, InputHints } from "botbuilder-core";
import { ActivityProperty } from "../activityProperty";
import { ExpressionEngine } from 'botbuilder-expression-parser';
import { Expression } from 'botbuilder-expression';
import { ExpressionDelegate } from '../steps/setProperty';

export interface InputDialogConfiguration extends DialogConfiguration {
    allowInterruptions?: boolean;
    alwaysPrompt?: boolean;
    entityName?: string;
    prompt?: string|Partial<Activity>;
    unrecognizedPrompt?: string|Partial<Activity>;
    invalidPrompt?: string|Partial<Activity>;
    property?: string;
    validations?: string[];
    maxTurnCount?: number;
    defaultValue?: any;
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
    static OPTIONS_PROPERTY = 'dialog._input';
    static INITIAL_VALUE_PROPERTY = 'dialog._input.value';
    static TURN_COUNT_PROPERTY = 'dialog._input.turnCount';
    static INPUT_PROPERTY = 'turn.input';

    public allowInterruptions = true;

    public alwaysPrompt = false;

    public entityName?: string;

    public prompt = new ActivityProperty();

    public unrecognizedPrompt = new ActivityProperty();

    public invalidPrompt = new ActivityProperty();

    public readonly validations: Expression[] = [];

    public maxTurnCount?: number;

    public defaultValue?: any;

    constructor() {
        super();

        // Inherit parents state
        this.inheritState = true;

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
    public set property(value: string) {
        this.inputProperties['value'] = value;
        this.outputProperty = value;
    }

    public get property(): string {
       return this.outputProperty; 
    }

    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        // Initialize turn count & input
        dc.state.setValue(InputDialog.TURN_COUNT_PROPERTY, 0);
        dc.state.setValue(InputDialog.INPUT_PROPERTY, undefined);

        // Initialize and persist options
        const opts = this.onInitializeOptions(options || {} as O);
        dc.state.setValue(InputDialog.OPTIONS_PROPERTY, opts);

        // Recognize input
        const state = this.alwaysPrompt ? InputState.missing : await this.recognizeInput(dc, false);
        if (state == InputState.valid) {
            // Return input
            const input = dc.state.getValue(InputDialog.INPUT_PROPERTY);
            return await dc.endDialog(input);
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
            const input = dc.state.getValue(InputDialog.INPUT_PROPERTY);
            return await dc.endDialog(input);
        } else if (this.maxTurnCount == undefined || turnCount < this.maxTurnCount) {
            // Prompt user
            return await this.promptUser(dc, state);
        } else {
            // Return default value
            return await dc.endDialog(this.defaultValue);
        }
    }

    public async resumeDialog(dc: DialogContext, reason: DialogReason, result?: any): Promise<DialogTurnResult> {
        // Re-send initial prompt
        return await this.promptUser(dc, InputState.missing);
    }

    public addValidation(validation: string|Expression|ExpressionDelegate<boolean>): this {
        switch (typeof validation) {
            case 'string':
                this.validations.push(engine.parse(validation));
                break; 
            case 'function':
                this.validations.push(Expression.Lambda(validation));
                break;
            default:
                this.validations.push(validation as Expression);
                break;
        }
        return this;
    }

    public configure(config: InputDialogConfiguration): this {
        for(const key in config) {
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
                        (value as string[]).forEach((exp) => this.validations.push(engine.parse(exp)));
                        break;
                    default:
                        super.configure({ [key]: value });
                        break;
                }
            }
        }

        return this;
    }

    protected async onPreBubbleEvent(dc: DialogContext, event: DialogEvent): Promise<boolean> {
        if (event.name == 'ActivityReceived' && dc.context.activity.type == ActivityTypes.Message) {
            if (this.allowInterruptions) {
                // By default we'll intercept ActivityReceived if we recognize the users input.
                const state = await this.recognizeInput(dc, true);
                return state == InputState.valid;
            } else {
                // Stop propagation if we don't allow interruptions.
                return true;
            }
        }

        return false;
    }

    protected abstract onRecognizeInput(dc: DialogContext, consultation: boolean): Promise<InputState>;

    protected onInitializeOptions(options: O): O {
        return Object.assign({}, options);
    }

    protected async onRenderPrompt(dc: DialogContext, state: InputState): Promise<Partial<Activity>> {
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

    private async recognizeInput(dc: DialogContext, consultation: boolean): Promise<InputState> {
        // Check for named entity first
        let input: string;
        if (this.entityName) {
            const entityName = this.entityName.indexOf('@') == 0 ? this.entityName : '@' + this.entityName;
            const value = dc.state.getValue(entityName);
            if (Array.isArray(value)) {
                input = value.length > 0 ? value[0] : undefined;
            } else if (value != undefined) {
                input = value;
            }
        }

        // Use utterance or value passed in
        if (input == undefined) {
            const activity = dc.context.activity;
            const turnCount = dc.state.getValue(InputDialog.TURN_COUNT_PROPERTY);
            if (turnCount == 0) {
                input = dc.state.getValue(InputDialog.INITIAL_VALUE_PROPERTY);
            } else if (activity.text) {
                input = activity.text;
            }
        }

        // Save input to memory
        dc.state.setValue(InputDialog.INPUT_PROPERTY, input);
        if (input != undefined) {
            // Recognize input
            const state = await this.onRecognizeInput(dc, consultation);
            if (state == InputState.valid) {
                // Run through validations
                const memory = dc.state.toJSON();
                for (let i = 0; i < this.validations.length; i++) {
                    const { value, error } = this.validations[i].tryEvaluate(memory);
                    if (error) { throw error }
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
        const prompt = await this.onRenderPrompt(dc, state);
        await dc.context.sendActivity(prompt);
        return Dialog.EndOfTurn;
    }
}

const engine = new ExpressionEngine();