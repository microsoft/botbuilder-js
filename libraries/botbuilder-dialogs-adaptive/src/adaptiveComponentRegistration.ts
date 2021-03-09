/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Expression } from 'adaptive-expressions';
import { ComponentRegistration } from 'botbuilder';
import {
    ResourceExplorer,
    ComponentDeclarativeTypes,
    DeclarativeType,
    CustomDeserializer,
} from 'botbuilder-dialogs-declarative';
import { AdaptiveDialog, AdaptiveDialogConfiguration } from './adaptiveDialog';
import {
    BeginDialog,
    BeginDialogConfiguration,
    BeginSkill,
    BeginSkillConfiguration,
    BreakLoop,
    BreakLoopConfiguration,
    CancelAllDialogs,
    CancelDialog,
    CancelAllDialogsBaseConfiguration,
    ContinueConversation,
    ContinueConversationConfiguration,
    ContinueConversationLater,
    ContinueConversationLaterConfiguration,
    ContinueLoop,
    ContinueLoopConfiguration,
    DeleteActivity,
    DeleteActivityConfiguration,
    DeleteProperties,
    DeletePropertiesConfiguration,
    DeleteProperty,
    DeletePropertyConfiguration,
    DynamicBeginDialog,
    EditActions,
    EditActionsConfiguration,
    EditArray,
    EditArrayConfiguration,
    EmitEvent,
    EmitEventConfiguration,
    EndDialog,
    EndDialogConfiguration,
    EndTurn,
    EndTurnConfiguration,
    ForEach,
    ForEachConfiguration,
    ForEachPage,
    ForEachPageConfiguration,
    GetActivityMembers,
    GetActivityMembersConfiguration,
    GetConversationMembers,
    GetConversationMembersConfiguration,
    GetConversationReference,
    GetConversationReferenceConfiguration,
    GotoAction,
    GotoActionConfiguration,
    HttpRequest,
    HttpRequestConfiguration,
    IfCondition,
    IfConditionConfiguration,
    LogAction,
    LogActionConfiguration,
    RepeatDialog,
    RepeatDialogConfiguration,
    ReplaceDialog,
    ReplaceDialogConfiguration,
    SendActivity,
    SendActivityConfiguration,
    SendHandoffActivity,
    SendHandoffActivityConfiguration,
    SetProperties,
    SetPropertiesConfiguration,
    SetProperty,
    SetPropertyConfiguration,
    SignOutUser,
    SignOutUserConfiguration,
    SwitchCondition,
    SwitchConditionConfiguration,
    TelemetryTrackEventAction,
    TelemetryTrackEventActionConfiguration,
    TraceActivity,
    TraceActivityConfiguration,
    ThrowException,
    ThrowExceptionConfiguration,
    UpdateActivity,
    UpdateActivityConfiguration,
} from './actions';
import {
    OnActivity,
    OnActivityConfiguration,
    OnAssignEntity,
    OnAssignEntityConfiguration,
    OnBeginDialog,
    OnCancelDialog,
    OnChooseEntity,
    OnChooseEntityConfiguration,
    OnChooseIntent,
    OnChooseIntentConfiguration,
    OnChooseProperty,
    OnCondition,
    OnConditionConfiguration,
    OnContinueConversation,
    OnConversationUpdateActivity,
    OnDialogEvent,
    OnDialogEventConfiguration,
    OnEndOfActions,
    OnEndOfConversationActivity,
    OnError,
    OnEventActivity,
    OnHandoffActivity,
    OnInstallationUpdateActivity,
    OnIntent,
    OnIntentConfiguration,
    OnInvokeActivity,
    OnMessageActivity,
    OnMessageDeleteActivity,
    OnMessageReactionActivity,
    OnMessageUpdateActivity,
    OnQnAMatch,
    OnRepromptDialog,
    OnTypingActivity,
    OnUnknownIntent,
} from './conditions';
import {
    Ask,
    AskConfiguration,
    AttachmentInput,
    AttachmentInputConfiguration,
    ChoiceInput,
    ChoiceInputConfiguration,
    ConfirmInput,
    ConfirmInputConfiguration,
    DateTimeInput,
    DateTimeInputConfiguration,
    NumberInput,
    NumberInputConfiguration,
    OAuthInput,
    OAuthInputConfiguration,
    TextInput,
    TextInputConfiguration,
} from './input';
import {
    AgeEntityRecognizer,
    ChannelMentionEntityRecognizer,
    ConfirmationEntityRecognizer,
    CrossTrainedRecognizerSet,
    CrossTrainedRecognizerSetConfiguration,
    CurrencyEntityRecognizer,
    DateTimeEntityRecognizer,
    DimensionEntityRecognizer,
    EmailEntityRecognizer,
    EntityRecognizerSet,
    GuidEntityRecognizer,
    HashtagEntityRecognizer,
    IpEntityRecognizer,
    MentionEntityRecognizer,
    MultiLanguageRecognizer,
    MultiLanguageRecognizerConfiguration,
    NumberEntityRecognizer,
    OrdinalEntityRecognizer,
    PercentageEntityRecognizer,
    PhoneNumberEntityRecognizer,
    RecognizerSet,
    RecognizerSetConfiguration,
    RegexEntityRecognizer,
    RegexEntityRecognizerConfiguration,
    RegexRecognizer,
    RegexRecognizerConfiguration,
    TemperatureEntityRecognizer,
    UrlEntityRecognizer,
} from './recognizers';
import {
    ResourceMultiLanguageGenerator,
    ResourceMultiLanguageGeneratorConfiguration,
    TemplateEngineLanguageGenerator,
    TemplateEngineLanguageGeneratorConfiguration,
} from './generators';
import {
    ConditionalSelector,
    ConditionalSelectorConfiguration,
    FirstSelector,
    MostSpecificSelector,
    MostSpecificSelectorConfiguration,
    RandomSelector,
    TrueSelector,
} from './selectors';
import { DynamicBeginDialogDeserializer } from './dynamicBeginDialogDeserializer';
import { HasPendingActionsFunction, IsDialogActiveFunction } from './functions';

type Type<T> = {
    $kind: string;
    new(...args: unknown[]): T;
};

/**
 * `ComponentRegistration` implementation for adaptive components.
 */
export class AdaptiveComponentRegistration extends ComponentRegistration implements ComponentDeclarativeTypes {
    private _declarativeTypes: DeclarativeType<unknown, unknown>[] = [];

    /**
     * Initializes a new instance of `AdaptiveComponentRegistration`.
     */
    public constructor() {
        super();

        // AdaptiveDialog
        this._addDeclarativeType<AdaptiveDialog, AdaptiveDialogConfiguration>(AdaptiveDialog);

        // Actions
        this._addDeclarativeType<BeginDialog, BeginDialogConfiguration>(BeginDialog);
        this._addDeclarativeType<BeginSkill, BeginSkillConfiguration>(BeginSkill);
        this._addDeclarativeType<BreakLoop, BreakLoopConfiguration>(BreakLoop);
        this._addDeclarativeType<CancelAllDialogs, CancelAllDialogsBaseConfiguration>(CancelAllDialogs);
        this._addDeclarativeType<CancelDialog, CancelAllDialogsBaseConfiguration>(CancelDialog);
        this._addDeclarativeType<ContinueConversation, ContinueConversationConfiguration>(ContinueConversation);
        this._addDeclarativeType<ContinueConversationLater, ContinueConversationLaterConfiguration>(
            ContinueConversationLater
        );
        this._addDeclarativeType<ContinueLoop, ContinueLoopConfiguration>(ContinueLoop);
        this._addDeclarativeType<DeleteActivity, DeleteActivityConfiguration>(DeleteActivity);
        this._addDeclarativeType<DeleteProperties, DeletePropertiesConfiguration>(DeleteProperties);
        this._addDeclarativeType<DeleteProperty, DeletePropertyConfiguration>(DeleteProperty);
        this._addDeclarativeType<EditActions, EditActionsConfiguration>(EditActions);
        this._addDeclarativeType<EditArray, EditArrayConfiguration>(EditArray);
        this._addDeclarativeType<EmitEvent, EmitEventConfiguration>(EmitEvent);
        this._addDeclarativeType<EndDialog, EndDialogConfiguration>(EndDialog);
        this._addDeclarativeType<EndTurn, EndTurnConfiguration>(EndTurn);
        this._addDeclarativeType<ForEach, ForEachConfiguration>(ForEach);
        this._addDeclarativeType<ForEachPage, ForEachPageConfiguration>(ForEachPage);
        this._addDeclarativeType<GetActivityMembers, GetActivityMembersConfiguration>(GetActivityMembers);
        this._addDeclarativeType<GetConversationMembers, GetConversationMembersConfiguration>(GetConversationMembers);
        this._addDeclarativeType<GetConversationReference, GetConversationReferenceConfiguration>(
            GetConversationReference
        );
        this._addDeclarativeType<GotoAction, GotoActionConfiguration>(GotoAction);
        this._addDeclarativeType<HttpRequest, HttpRequestConfiguration>(HttpRequest);
        this._addDeclarativeType<IfCondition, IfConditionConfiguration>(IfCondition);
        this._addDeclarativeType<LogAction, LogActionConfiguration>(LogAction);
        this._addDeclarativeType<RepeatDialog, RepeatDialogConfiguration>(RepeatDialog);
        this._addDeclarativeType<ReplaceDialog, ReplaceDialogConfiguration>(ReplaceDialog);
        this._addDeclarativeType<SendActivity, SendActivityConfiguration>(SendActivity);
        this._addDeclarativeType<SendHandoffActivity, SendHandoffActivityConfiguration>(SendHandoffActivity);
        this._addDeclarativeType<SetProperties, SetPropertiesConfiguration>(SetProperties);
        this._addDeclarativeType<SetProperty, SetPropertyConfiguration>(SetProperty);
        this._addDeclarativeType<SignOutUser, SignOutUserConfiguration>(SignOutUser);
        this._addDeclarativeType<SwitchCondition, SwitchConditionConfiguration>(SwitchCondition);
        this._addDeclarativeType<TelemetryTrackEventAction, TelemetryTrackEventActionConfiguration>(
            TelemetryTrackEventAction
        );
        this._addDeclarativeType<ThrowException, ThrowExceptionConfiguration>(ThrowException);
        this._addDeclarativeType<TraceActivity, TraceActivityConfiguration>(TraceActivity);
        this._addDeclarativeType<UpdateActivity, UpdateActivityConfiguration>(UpdateActivity);

        // Trigger conditions
        this._addDeclarativeType<OnActivity, OnActivityConfiguration>(OnActivity);
        this._addDeclarativeType<OnAssignEntity, OnAssignEntityConfiguration>(OnAssignEntity);
        this._addDeclarativeType<OnBeginDialog, OnDialogEventConfiguration>(OnBeginDialog);
        this._addDeclarativeType<OnCancelDialog, OnDialogEventConfiguration>(OnCancelDialog);
        this._addDeclarativeType<OnChooseEntity, OnChooseEntityConfiguration>(OnChooseEntity);
        this._addDeclarativeType<OnChooseIntent, OnChooseIntentConfiguration>(OnChooseIntent);
        this._addDeclarativeType<OnChooseProperty, OnDialogEventConfiguration>(OnChooseProperty);
        this._addDeclarativeType<OnCondition, OnConditionConfiguration>(OnCondition);
        this._addDeclarativeType<OnContinueConversation, OnActivityConfiguration>(OnContinueConversation);
        this._addDeclarativeType<OnConversationUpdateActivity, OnActivityConfiguration>(OnConversationUpdateActivity);
        this._addDeclarativeType<OnDialogEvent, OnDialogEventConfiguration>(OnDialogEvent);
        this._addDeclarativeType<OnEndOfActions, OnDialogEventConfiguration>(OnEndOfActions);
        this._addDeclarativeType<OnEndOfConversationActivity, OnActivityConfiguration>(OnEndOfConversationActivity);
        this._addDeclarativeType<OnError, OnDialogEventConfiguration>(OnError);
        this._addDeclarativeType<OnEventActivity, OnActivityConfiguration>(OnEventActivity);
        this._addDeclarativeType<OnHandoffActivity, OnActivityConfiguration>(OnHandoffActivity);
        this._addDeclarativeType<OnInstallationUpdateActivity, OnActivityConfiguration>(OnInstallationUpdateActivity);
        this._addDeclarativeType<OnIntent, OnIntentConfiguration>(OnIntent);
        this._addDeclarativeType<OnInvokeActivity, OnActivityConfiguration>(OnInvokeActivity);
        this._addDeclarativeType<OnMessageActivity, OnActivityConfiguration>(OnMessageActivity);
        this._addDeclarativeType<OnMessageDeleteActivity, OnActivityConfiguration>(OnMessageDeleteActivity);
        this._addDeclarativeType<OnMessageReactionActivity, OnActivityConfiguration>(OnMessageReactionActivity);
        this._addDeclarativeType<OnMessageUpdateActivity, OnActivityConfiguration>(OnMessageUpdateActivity);
        this._addDeclarativeType<OnQnAMatch, OnIntentConfiguration>(OnQnAMatch);
        this._addDeclarativeType<OnRepromptDialog, OnDialogEventConfiguration>(OnRepromptDialog);
        this._addDeclarativeType<OnTypingActivity, OnActivityConfiguration>(OnTypingActivity);
        this._addDeclarativeType<OnUnknownIntent, OnDialogEventConfiguration>(OnUnknownIntent);

        // Inputs
        this._addDeclarativeType<Ask, AskConfiguration>(Ask);
        this._addDeclarativeType<AttachmentInput, AttachmentInputConfiguration>(AttachmentInput);
        this._addDeclarativeType<ChoiceInput, ChoiceInputConfiguration>(ChoiceInput);
        this._addDeclarativeType<ConfirmInput, ConfirmInputConfiguration>(ConfirmInput);
        this._addDeclarativeType<DateTimeInput, DateTimeInputConfiguration>(DateTimeInput);
        this._addDeclarativeType<NumberInput, NumberInputConfiguration>(NumberInput);
        this._addDeclarativeType<OAuthInput, OAuthInputConfiguration>(OAuthInput);
        this._addDeclarativeType<TextInput, TextInputConfiguration>(TextInput);

        // Recognizers
        this._addDeclarativeType<CrossTrainedRecognizerSet, CrossTrainedRecognizerSetConfiguration>(
            CrossTrainedRecognizerSet
        );
        this._addDeclarativeType<MultiLanguageRecognizer, MultiLanguageRecognizerConfiguration>(
            MultiLanguageRecognizer
        );
        this._addDeclarativeType<RecognizerSet, RecognizerSetConfiguration>(RecognizerSet);
        this._addDeclarativeType<RegexRecognizer, RegexRecognizerConfiguration>(RegexRecognizer);
        this._addDeclarativeType<AgeEntityRecognizer, unknown>(AgeEntityRecognizer);
        this._addDeclarativeType<ChannelMentionEntityRecognizer, unknown>(ChannelMentionEntityRecognizer);
        this._addDeclarativeType<ConfirmationEntityRecognizer, unknown>(ConfirmationEntityRecognizer);
        this._addDeclarativeType<CurrencyEntityRecognizer, unknown>(CurrencyEntityRecognizer);
        this._addDeclarativeType<DateTimeEntityRecognizer, unknown>(DateTimeEntityRecognizer);
        this._addDeclarativeType<DimensionEntityRecognizer, unknown>(DimensionEntityRecognizer);
        this._addDeclarativeType<EmailEntityRecognizer, unknown>(EmailEntityRecognizer);
        this._addDeclarativeType<EntityRecognizerSet, unknown>(EntityRecognizerSet);
        this._addDeclarativeType<GuidEntityRecognizer, unknown>(GuidEntityRecognizer);
        this._addDeclarativeType<HashtagEntityRecognizer, unknown>(HashtagEntityRecognizer);
        this._addDeclarativeType<IpEntityRecognizer, unknown>(IpEntityRecognizer);
        this._addDeclarativeType<MentionEntityRecognizer, unknown>(MentionEntityRecognizer);
        this._addDeclarativeType<NumberEntityRecognizer, unknown>(NumberEntityRecognizer);
        this._addDeclarativeType<OrdinalEntityRecognizer, unknown>(OrdinalEntityRecognizer);
        this._addDeclarativeType<PercentageEntityRecognizer, unknown>(PercentageEntityRecognizer);
        this._addDeclarativeType<PhoneNumberEntityRecognizer, unknown>(PhoneNumberEntityRecognizer);
        this._addDeclarativeType<RegexEntityRecognizer, RegexEntityRecognizerConfiguration>(RegexEntityRecognizer);
        this._addDeclarativeType<TemperatureEntityRecognizer, unknown>(TemperatureEntityRecognizer);
        this._addDeclarativeType<UrlEntityRecognizer, unknown>(UrlEntityRecognizer);

        // Generators
        this._addDeclarativeType<TemplateEngineLanguageGenerator, TemplateEngineLanguageGeneratorConfiguration>(
            TemplateEngineLanguageGenerator
        );
        this._addDeclarativeType<ResourceMultiLanguageGenerator, ResourceMultiLanguageGeneratorConfiguration>(
            ResourceMultiLanguageGenerator
        );

        // Selectors
        this._addDeclarativeType<ConditionalSelector, ConditionalSelectorConfiguration>(ConditionalSelector);
        this._addDeclarativeType<FirstSelector, unknown>(FirstSelector);
        this._addDeclarativeType<RandomSelector, unknown>(RandomSelector);
        this._addDeclarativeType<TrueSelector, unknown>(TrueSelector);
        this._addDeclarativeType<MostSpecificSelector, MostSpecificSelectorConfiguration>(MostSpecificSelector);

        Expression.functions.add(IsDialogActiveFunction.functionName, new IsDialogActiveFunction());
        Expression.functions.add(IsDialogActiveFunction.functionAlias, new IsDialogActiveFunction());
        Expression.functions.add(HasPendingActionsFunction.functionName, new HasPendingActionsFunction());
    }

    /**
     * Gets adaptive `DeclarativeType` resources.
     * @param resourceExplorer `ResourceExplorer` with expected path to get all resources.
     * @returns Adaptive `DeclarativeType` resources.
     */
    public getDeclarativeTypes(resourceExplorer: ResourceExplorer): DeclarativeType[] {
        const declarativeTypes: DeclarativeType[] = [...this._declarativeTypes];
        resourceExplorer.getResources('.schema').forEach((schema) => {
            const resourceId = schema.id.replace(/.schema$/, '');
            if (resourceId.endsWith('.dialog')) {
                declarativeTypes.push({
                    kind: resourceId,
                    type: DynamicBeginDialog,
                    loader: new DynamicBeginDialogDeserializer(resourceExplorer, resourceId),
                });
            }
        });
        return declarativeTypes;
    }

    /**
     * @private
     */
    private _addDeclarativeType<T, C>(type: Type<T>, loader?: CustomDeserializer<T, C>): void {
        const declarativeType: DeclarativeType<T, C> = {
            kind: type.$kind,
            type,
            loader,
        };
        this._declarativeTypes.push(declarativeType);
    }
}
