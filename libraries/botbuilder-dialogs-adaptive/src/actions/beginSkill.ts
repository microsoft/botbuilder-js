/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import {
    Activity,
    ActivityTypes,
    StringUtils,
    TurnContext,
    CACHED_BOT_STATE_SKIP_PROPERTIES_HANDLER_KEY,
} from 'botbuilder';
import { ActivityTemplate } from '../templates';
import { ActivityTemplateConverter } from '../converters';
import { AdaptiveEvents } from '../adaptiveEvents';
import { BoolProperty, StringProperty, TemplateInterfaceProperty } from '../properties';
import { skillClientKey, skillConversationIdFactoryKey } from '../skillExtensions';
import { TelemetryLoggerConstants } from '../telemetryLoggerConstants';

import {
    BoolExpression,
    BoolExpressionConverter,
    StringExpression,
    StringExpressionConverter,
} from 'adaptive-expressions';

import {
    BeginSkillDialogOptions,
    Converter,
    ConverterFactory,
    DialogContext,
    DialogTurnResult,
    DialogInstance,
    DialogReason,
    DialogConfiguration,
    DialogEvent,
    DialogEvents,
    DialogStateManager,
    SkillDialog,
    SkillDialogOptions,
    TemplateInterface,
} from 'botbuilder-dialogs';

export interface BeginSkillConfiguration extends DialogConfiguration {
    disabled?: BoolProperty;
    activityProcessed?: BoolProperty;
    resultProperty?: StringProperty;
    botId?: StringProperty;
    skillHostEndpoint?: StringProperty;
    skillAppId?: StringProperty;
    skillEndpoint?: StringProperty;
    activity?: TemplateInterfaceProperty<Partial<Activity>, DialogStateManager>;
    connectionName?: StringProperty;
    allowInterruptions?: BoolProperty;
}

/**
 * Begin a Skill.
 */
export class BeginSkill extends SkillDialog implements BeginSkillConfiguration {
    static $kind = 'Microsoft.BeginSkill';

    /**
     * Optional expression which if is true will disable this action.
     */
    disabled?: BoolExpression;

    /**
     * Value indicating whether the new dialog should process the activity.
     *
     * @remarks
     * The default for this will be true, which means the new dialog should not look at the activity.
     * You can set this to false to dispatch the activity to the new dialog.
     */
    activityProcessed = new BoolExpression(true);

    /**
     * Optional property path to store the dialog result in.
     */
    resultProperty?: StringExpression;

    /**
     * The Microsoft App ID that will be calling the skill.
     *
     * @remarks
     * Defauls to a value of `=settings.MicrosoftAppId` which retrievs the bots ID from settings.
     */
    botId = new StringExpression('=settings.MicrosoftAppId');

    /**
     * The callback Url for the skill host.
     *
     * @remarks
     * Defauls to a value of `=settings.SkillHostEndpoint` which retrieves the endpoint from settings.
     */
    skillHostEndpoint = new StringExpression('=settings.SkillHostEndpoint');

    /**
     * The Microsoft App ID for the skill.
     */
    skillAppId: StringExpression;

    /**
     * The `/api/messages` endpoint for the skill.
     */
    skillEndpoint: StringExpression;

    /**
     * Template for the activity.
     */
    activity: TemplateInterface<Partial<Activity>, DialogStateManager>;

    /**
     * Optional. The OAuth Connection Name for the Parent Bot.
     */
    connectionName: StringExpression;

    /**
     * The interruption policy.
     */
    allowInterruptions: BoolExpression;

    /**
     * @param property The key of the conditional selector configuration.
     * @returns The converter for the selector configuration.
     */
    getConverter(property: keyof BeginSkillConfiguration): Converter | ConverterFactory {
        switch (property) {
            case 'disabled':
                return new BoolExpressionConverter();
            case 'activityProcessed':
                return new BoolExpressionConverter();
            case 'resultProperty':
                return new StringExpressionConverter();
            case 'botId':
                return new StringExpressionConverter();
            case 'skillHostEndpoint':
                return new StringExpressionConverter();
            case 'skillAppId':
                return new StringExpressionConverter();
            case 'skillEndpoint':
                return new StringExpressionConverter();
            case 'activity':
                return new ActivityTemplateConverter();
            case 'connectionName':
                return new StringExpressionConverter();
            case 'allowInterruptions':
                return new BoolExpressionConverter();
            default:
                return undefined;
        }
    }

    // Used to cache DialogOptions for multi-turn calls across servers.
    private _dialogOptionsStateKey = `${this.constructor.name}.dialogOptionsData`;

    /**
     * Creates a new `BeginSkillDialog instance.
     *
     * @param options Optional options used to configure the skill dialog.
     */
    constructor(options?: SkillDialogOptions) {
        super(Object.assign({ skill: {} } as SkillDialogOptions, options));
    }

    /**
     * Called when the [Dialog](xref:botbuilder-dialogs.Dialog) is started and pushed onto the dialog stack.
     *
     * @param dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @param options Optional. Initial information to pass to the dialog.
     * @returns A `Promise` representing the asynchronous operation.
     */
    async beginDialog(dc: DialogContext, options?: BeginSkillDialogOptions): Promise<DialogTurnResult> {
        const dcState = dc.state;
        if (this.disabled && this.disabled.getValue(dcState)) {
            return await dc.endDialog();
        }

        // Setup the skill to call
        const botId = this.botId.getValue(dcState);
        const skillHostEndpoint = this.skillHostEndpoint.getValue(dcState);
        if (botId) {
            this.dialogOptions.botId = botId;
        }
        if (skillHostEndpoint) {
            this.dialogOptions.skillHostEndpoint = skillHostEndpoint;
        }
        if (this.skillAppId) {
            this.dialogOptions.skill.id = this.dialogOptions.skill.appId = this.skillAppId.getValue(dcState);
        }
        if (this.skillEndpoint) {
            this.dialogOptions.skill.skillEndpoint = this.skillEndpoint.getValue(dcState);
        }
        if (this.connectionName) {
            this.dialogOptions.connectionName = this.connectionName.getValue(dcState);
        }
        if (!this.dialogOptions.conversationState) {
            this.dialogOptions.conversationState = dc.context.turnState.get('ConversationState');
        }
        if (!this.dialogOptions.skillClient) {
            this.dialogOptions.skillClient = dc.context.turnState.get(skillClientKey);
        }
        if (!this.dialogOptions.conversationIdFactory) {
            this.dialogOptions.conversationIdFactory = dc.context.turnState.get(skillConversationIdFactoryKey);
        }

        // Store the initialized dialogOptions in state so we can restore these values when the dialog is resumed.
        dc.activeDialog.state[this._dialogOptionsStateKey] = this.dialogOptions;
        const skipProperties = dc.context.turnState.get(CACHED_BOT_STATE_SKIP_PROPERTIES_HANDLER_KEY);
        const props: (keyof SkillDialogOptions)[] = ['conversationIdFactory', 'conversationState'];
        skipProperties(this._dialogOptionsStateKey, props);

        // Get the activity to send to the skill.
        options = {} as BeginSkillDialogOptions;
        if (this.activityProcessed.getValue(dcState) && this.activity) {
            // The parent consumed the activity in context, use the Activity property to start the skill.
            const activity = await this.activity.bind(dc, dcState);

            this.telemetryClient.trackEvent({
                name: TelemetryLoggerConstants.GeneratorResultEvent,
                properties: {
                    template: this.activity,
                    result: activity || '',
                },
            });

            options.activity = activity;
        } else {
            // Send the turn context activity to the skill (pass through).
            options.activity = dc.context.activity;
        }

        // Call the base to invoke the skill
        return await super.beginDialog(dc, options);
    }

    /**
     * Called when the [Dialog](xref:botbuilder-dialogs.Dialog) is _continued_, where it is the active dialog and the
     * user replies with a new activity.
     *
     * @param dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @returns A `Promise` representing the asynchronous operation.
     */
    async continueDialog(dc: DialogContext): Promise<DialogTurnResult> {
        this.loadDialogOptions(dc.context, dc.activeDialog);
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
     * Called when the [Dialog](xref:botbuilder-dialogs.Dialog) should re-prompt the user for input.
     *
     * @param turnContext [TurnContext](xref:botbuilder-core.TurnContext), the context object for this turn.
     * @param instance [DialogInstance](xref:botbuilder-dialogs.DialogInstance), state information for this dialog.
     * @returns A `Promise` representing the asynchronous operation.
     */
    async repromptDialog(turnContext: TurnContext, instance: DialogInstance): Promise<void> {
        this.loadDialogOptions(turnContext, instance);
        return await super.repromptDialog(turnContext, instance);
    }

    /**
     * Called when a child [Dialog](xref:botbuilder-dialogs.Dialog) completed its turn, returning control to this dialog.
     *
     * @param dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @param reason [DialogReason](xref:botbuilder-dialogs.DialogReason), reason why the dialog resumed.
     * @param result Optional. Value returned from the dialog that was called. The type
     * of the value returned is dependent on the child dialog.
     * @returns A `Promise` representing the asynchronous operation.
     */
    async resumeDialog(dc: DialogContext, reason: DialogReason, result?: any): Promise<DialogTurnResult<any>> {
        this.loadDialogOptions(dc.context, dc.activeDialog);
        return await super.resumeDialog(dc, reason, result);
    }

    /**
     * Called when the [Dialog](xref:botbuilder-dialogs.Dialog) is ending.
     *
     * @param turnContext [TurnContext](xref:botbuilder-core.TurnContext), the context object for this turn.
     * @param instance [DialogInstance](xref:botbuilder-dialogs.DialogInstance), state information associated with the instance of this dialog on the dialog stack.
     * @param reason [DialogReason](xref:botbuilder-dialogs.DialogReason), reason why the dialog ended.
     * @returns A `Promise` representing the asynchronous operation.
     */
    async endDialog(turnContext: TurnContext, instance: DialogInstance, reason: DialogReason): Promise<void> {
        this.loadDialogOptions(turnContext, instance);
        return await super.endDialog(turnContext, instance, reason);
    }

    /**
     * @protected
     * Builds the compute Id for the [Dialog](xref:botbuilder-dialogs.Dialog).
     * @returns A `string` representing the compute Id.
     */
    protected onComputeId(): string {
        const appId = this.skillAppId ? this.skillAppId.toString() : '';
        if (this.activity instanceof ActivityTemplate) {
            return `BeginSkill['${appId}','${StringUtils.ellipsis(this.activity.template.trim(), 30)}']`;
        }
        return `BeginSkill['${appId}','${StringUtils.ellipsis(this.activity && this.activity.toString().trim(), 30)}']`;
    }

    protected async onPreBubbleEvent(dc: DialogContext, e: DialogEvent): Promise<boolean> {
        if (e.name === DialogEvents.activityReceived && dc.context.activity.type === ActivityTypes.Message) {
            // Ask parent to perform recognition.
            if (dc.parent) {
                await dc.parent.emitEvent(AdaptiveEvents.recognizeUtterance, dc.context.activity, false);
            }

            // Should we allow interruptions.
            let canInterrupt = true;
            if (this.allowInterruptions) {
                const { value: allowInterruptions, error } = this.allowInterruptions.tryGetValue(dc.state);
                canInterrupt = !error && allowInterruptions;
            }

            // Stop bubbling if interruptions are NOT allowed
            return !canInterrupt;
        }

        return false;
    }

    /**
     * @private
     * Regenerates the [SkillDialog.DialogOptions](xref:botbuilder-dialogs.SkillDialog.DialogOptions) based on the values used during the `BeginDialog` call.
     * @remarks The [Dialog](xref:botbuilder-dialogs.Dialog) can be resumed in another server or after redeploying the bot, this code ensure that the options used are the ones
     * used to call `BeginDialog`.
     * Also, if `ContinueConversation` or other methods are called on a server different than the one where `BeginDialog` was called,
     * `DialogOptions` will be empty and this code will make sure it has the right value.
     */
    private loadDialogOptions(context: TurnContext, instance: DialogInstance): void {
        const dialogOptions = <SkillDialogOptions>instance.state[this._dialogOptionsStateKey];

        this.dialogOptions.botId = dialogOptions.botId;
        this.dialogOptions.skillHostEndpoint = dialogOptions.skillHostEndpoint;

        this.dialogOptions.conversationIdFactory = context.turnState.get(skillConversationIdFactoryKey);
        if (this.dialogOptions.conversationIdFactory == null) {
            throw new ReferenceError('Unable to locate skillConversationIdFactoryBase in HostContext.');
        }

        this.dialogOptions.skillClient = context.turnState.get(skillClientKey);
        if (this.dialogOptions.skillClient == null) {
            throw new ReferenceError('Unable to get an instance of skillHttpClient from turnState.');
        }

        this.dialogOptions.conversationState = context.turnState.get('ConversationState');
        if (this.dialogOptions.conversationState == null) {
            throw new ReferenceError('Unable to get an instance of conversationState from turnState.');
        }

        this.dialogOptions.connectionName = dialogOptions.connectionName;

        // Set the skill to call.
        this.dialogOptions.skill = dialogOptions.skill;
    }
}
