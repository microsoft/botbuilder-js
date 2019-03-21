/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ActivityProperty } from '../activityProperty';
import { Activity } from 'botbuilder-core';
import * as dialogs from 'botbuilder-dialogs';

export interface PromptConfiguration extends dialogs.DialogConfiguration {
    /**
     * Initial prompt to send the user.
     */
    prompt?: string|Partial<Activity>;

    /**
     * (Optional) data binds the called dialogs input & output to the given property.
     * 
     * @remarks
     * The bound properties current value will be passed to the called dialog as part of its 
     * options and will be accessible within the dialog via `dialog.options.value`. The result
     * returned from the called dialog will then be copied to the bound property.
     */
    property?: string;

    /**
     * (Optional) If `true`, the prompt will always prompt the user regardless of the value of the 
     * in-memory [property](#property) the prompt is bound to. 
     * 
     * @remarks
     * Defaults to a value of `false`.
     */
    alwaysPrompt?: boolean;

    /**
     * (Optional) prompt to send the user if their input wasn't recognized. 
     * 
     * @remarks
     * The [prompt](#prompt) property will be sent if not specified. 
     */
    retryPrompt?: string|Partial<Activity>;

    /**
     * (Optional) prompt to send should the users input be recognized but is invalid.
     * 
     * @remarks
     * The [retryPrompt](#retryprompt) or [prompt](#prompt) property will be sent if not specified.     
     */
    invalidPrompt?: string|Partial<Activity>;
    
    /**
     * (Optional) prompt to send should the in-memory [property](#property) the prompt is bound to
     * starts off in a recognized but invalid state.
     * 
     * @remarks
     * The [prompt](#prompt) property will be sent if not specified.     
     */
    initialInvalidPrompt?: string|Partial<Activity>;
}

export abstract class Prompt extends dialogs.DialogCommand implements dialogs.DialogDependencies {
    private promptDialog: dialogs.Prompt<any>;

    constructor(promptDialog: dialogs.Prompt<any>) {
        super();
        this.promptDialog = promptDialog;
    }

    public getDependencies(): dialogs.Dialog[] {
        // Update prompts ID before returning.
        this.promptDialog.id = this.id + ':prompt';
        return [this.promptDialog];
    }

    /**
     * Initial prompt to send the user.
     */
    public prompt = new ActivityProperty();

    /**
     * (Optional) data binds the called dialogs input & output to the given property.
     * 
     * @remarks
     * The bound properties current value will be passed to the called dialog as part of its 
     * options and will be accessible within the dialog via `dialog.options.value`. The result
     * returned from the called dialog will then be copied to the bound property.
     */
    public property: string;

    /**
     * (Optional) If `true`, the prompt will always prompt the user regardless of the value of the 
     * in-memory [property](#property) the prompt is bound to. 
     * 
     * @remarks
     * Defaults to a value of `false`.
     */
    public alwaysPrompt: boolean;

    /**
     * (Optional) prompt to send the user if their input wasn't recognized. 
     * 
     * @remarks
     * The [prompt](#prompt) property will be sent if not specified. 
     */
    public retryPrompt = new ActivityProperty();

    /**
     * (Optional) prompt to send should the users input be recognized but is invalid.
     * 
     * @remarks
     * The [retryPrompt](#retryprompt) or [prompt](#prompt) property will be sent if not specified.     
     */
    public invalidPrompt = new ActivityProperty();
    
    /**
     * (Optional) prompt to send should the in-memory [property](#property) the prompt is bound to
     * starts off in a recognized but invalid state.
     * 
     * @remarks
     * The [prompt](#prompt) property will be sent if not specified.     
     */
    public initialInvalidPrompt = new ActivityProperty();

    public configure(config: PromptConfiguration): this {
        for (const key in config) {
            switch (key) {
                case 'prompt':
                case 'retryPrompt':
                case 'invalidPrompt':
                case 'initialInvalidPrompt':
                    (this[key] as ActivityProperty).value = config[key];
                    break;
                default:
                    super.configure({ [key]: config[key] });
                    break;
            }
        }
        return this;
    }

    public async onRunCommand(dc: dialogs.DialogContext): Promise<dialogs.DialogTurnResult> {
        const extraData: object = { utterance: dc.context.activity.text || '' };

        // Get initial value
        let value = this.property ? dc.state.getValue(this.property) : undefined;
        if (value == undefined || this.alwaysPrompt) {
            return await this.onInitialPrompt(dc, this.prompt.format(dc, extraData));
        } else if (!await this.onInitialValidation(dc, value)) {
            if (this.initialInvalidPrompt.hasValue()) {
                return await this.onInitialPrompt(dc, this.initialInvalidPrompt.format(dc, extraData));
            } else {
                return await this.onInitialPrompt(dc, this.prompt.format(dc, extraData));
            }
        } else {
            return await dc.endDialog();
        }
    }

    public async resumeDialog(dc: dialogs.DialogContext, reason: dialogs.DialogReason, result: any): Promise<dialogs.DialogTurnResult> {
        this.onSaveResult(dc, result);
        return await dc.endDialog();
    }

    protected abstract onInitialValidation(dc: dialogs.DialogContext, value: any): Promise<boolean>;

    protected async onInitialPrompt(dc: dialogs.DialogContext, activity: Partial<Activity>): Promise<dialogs.DialogTurnResult> {
        return await dc.prompt(this.promptDialog.id, activity);
    }

    protected onSaveResult(dc: dialogs.DialogContext, result: any): void {
        if (this.property) {
            dc.state.setValue(this.property, result);
        }
    }
}