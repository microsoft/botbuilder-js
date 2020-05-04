/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { SkillDialog, SkillDialogOptions, DialogContext, DialogTurnResult, DialogManager, BeginSkillDialogOptions } from 'botbuilder-dialogs';
import { BoolExpression, StringExpression } from 'adaptive-expressions';
import { TemplateInterface } from '../template';
import { Activity, ActivityTypes } from 'botbuilder-core';

const GLOBAL_SKILL_OPTIONS = Symbol('globalSkillOptions');

export class AdaptiveSkillDialog extends SkillDialog {

    /**
     * Optional expression which if is true will disable this action.
     */
    public disabled?: BoolExpression;

    /**
     * Value indicating whether the new dialog should process the activity.
     * 
     * @remarks
     * The default for this will be true, which means the new dialog should not look at the activity. 
     * You can set this to false to dispatch the activity to the new dialog.
     */
    public activityProcessed = new BoolExpression(true);

    /**
     * Optional property path to store the dialog result in.
     */
    public resultProperty?: StringExpression;

    /**
     * The Microsoft App ID that will be calling the skill.
     * 
     * @remarks
     * Defauls to a value of `=settings.MicrosoftAppId` which retrievs the bots ID from settings.
     */
    public botId = new StringExpression('=settings.MicrosoftAppId');

    /**
     * The callback Url for the skill host.
     * 
     * @remarks
     * Defauls to a value of `=settings.SkillHostEndpoint` which retrieves the endpoint from settings.
     */
    public skillHostEndpoint = new StringExpression('=settings.SkillHostEndpoint');

    /**
     * The Microsoft App ID for the skill.
     */
    public skillAppId: StringExpression;

    /**
     * The `/api/messages` endpoint for the skill.
     */
    public skillEndpoint: StringExpression;

    /**
     * Template for the activity.
     */
    public activity: TemplateInterface<Partial<Activity>>;

    /**
     * Optional. The OAuth Connection Name for the Parent Bot.
     */
    public connectionName: StringExpression;

    /**
     * Creates a new `AdaptiveSkillDialog instance.
     * @param options Optional options used to configure the skill dialog.
     */
    constructor(options?: SkillDialogOptions) {
        super(Object.assign({ skill: {} } as SkillDialogOptions, options));
    }

    public async beginDialog(dc: DialogContext, options: Partial<BeginSkillDialogOptions>): Promise<DialogTurnResult> {
        const dcState = dc.state;
        if (this.disabled && this.disabled.getValue(dcState)) {
            return await dc.endDialog();
        }

        // Update options with global options
        const globalOptions = dc.context.turnState.get(GLOBAL_SKILL_OPTIONS);
        if (globalOptions) {
               this.dialogOptions = Object.assign(globalOptions, this.dialogOptions);
        }
        if (!this.dialogOptions.conversationState) { dc.dialogManager.conversationState }

        // Setup the skill to call
        const botId = this.botId.getValue(dcState);
        const skillHostEndpoint = this.skillHostEndpoint.getValue(dcState);
        if (botId) { this.dialogOptions.botId = botId }
        if (skillHostEndpoint) { this.dialogOptions.skillHostEndpoint = skillHostEndpoint }
        if (this.skillAppId) { this.dialogOptions.skill.id = this.dialogOptions.skill.appId = this.skillAppId.getValue(dcState) }
        if (this.skillEndpoint) { this.dialogOptions.skill.skillEndpoint = this.skillEndpoint.getValue(dcState) }
        if (this.connectionName) { this.dialogOptions.connectionName = this.connectionName.getValue(dcState) }

        // Get the activity to send to the skill.
        options = {}
        if (this.activityProcessed.getValue(dcState) && this.activity) {
            // The parent consumed the activity in context, use the Activity property to start the skill.
            options.activity = await this.activity.bindToData(dc.context, dcState);
        } else {
            // Send the turn context activity to the skill (pass through).
            options.activity = dc.context.activity;
        }

        // Call the base to invoke the skill
        return await super.beginDialog(dc, options);
    }

    public async continueDialog(dc: DialogContext): Promise<DialogTurnResult> {
        const activity = dc.context.activity;
        if (activity.type == ActivityTypes.EndOfConversation) {
            // Capture the result of the dialog if the property is set
            if (this.resultProperty && activity.value) {
                const dcState = dc.state;
                dc.state.setValue(this.resultProperty.getValue(dcState), activity.value);
            }
        }

        return await super.continueDialog(dc);
    }

    /**
     * Configures the initial skill dialog options to use.
     * @param dm DialogManager to configure.
     * @param options Skill dialog options to use.
     */
    static setGlobalSkillOptions(dm: DialogManager, options: SkillDialogOptions): void {
        dm.initialTurnState.set(GLOBAL_SKILL_OPTIONS, options);
    }
}