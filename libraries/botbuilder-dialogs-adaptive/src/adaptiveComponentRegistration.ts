/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ComponentRegistration } from 'botbuilder-core';
import {
    ResourceExplorer,
    ComponentDeclarativeTypes,
    DeclarativeType,
    CustomDeserializer,
} from 'botbuilder-dialogs-declarative';
import { NonFunctionKeys } from 'utility-types';
import { AdaptiveDialog } from './adaptiveDialog';
import {
    BeginDialog,
    BeginSkill,
    BreakLoop,
    CancelAllDialogs,
    CancelDialog,
    ContinueLoop,
    DeleteActivity,
    DeleteProperties,
    DeleteProperty,
    DynamicBeginDialog,
    EditActions,
    EditArray,
    EmitEvent,
    EndDialog,
    EndTurn,
    ForEach,
    ForEachPage,
    GetActivityMembers,
    GetConversationMembers,
    GotoAction,
    HttpRequest,
    IfCondition,
    LogAction,
    RepeatDialog,
    ReplaceDialog,
    SendActivity,
    SetProperties,
    SetProperty,
    SignOutUser,
    SwitchCondition,
    TelemetryTrackEventAction,
    TraceActivity,
    UpdateActivity,
} from './actions';
import {
    OnActivity,
    OnAssignEntity,
    OnBeginDialog,
    OnCancelDialog,
    OnChooseEntity,
    OnChooseIntent,
    OnChooseProperty,
    OnCondition,
    OnConversationUpdateActivity,
    OnDialogEvent,
    OnEndOfActions,
    OnEndOfConversationActivity,
    OnError,
    OnEventActivity,
    OnHandoffActivity,
    OnIntent,
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
    AttachmentInput,
    ChoiceInput,
    ConfirmInput,
    DateTimeInput,
    NumberInput,
    OAuthInput,
    TextInput,
} from './input';
import {
    AgeEntityRecognizer,
    ConfirmationEntityRecognizer,
    CrossTrainedRecognizerSet,
    CurrencyEntityRecognizer,
    DateTimeEntityRecognizer,
    DimensionEntityRecognizer,
    EmailEntityRecognizer,
    GuidEntityRecognizer,
    HashtagEntityRecognizer,
    IpEntityRecognizer,
    MentionEntityRecognizer,
    MultiLanguageRecognizer,
    NumberEntityRecognizer,
    OrdinalEntityRecognizer,
    PercentageEntityRecognizer,
    PhoneNumberEntityRecognizer,
    RecognizerSet,
    RegexEntityRecognizer,
    RegexRecognizer,
    TemperatureEntityRecognizer,
    UrlEntityRecognizer,
} from './recognizers';
import { LuisAdaptiveRecognizer } from './luis';
import { QnAMakerRecognizer } from './qnaMaker';
import { ResourceMultiLanguageGenerator, TemplateEngineLanguageGenerator } from './generators';
import { ConditionalSelector, FirstSelector, MostSpecificSelector, RandomSelector, TrueSelector } from './selectors';
import { CustomDialogLoader } from './customDialogLoader';

type Type<T> = {
    $kind: string;
    new (...args: unknown[]): T;
};

type Configuration<T> = {
    [K in keyof Partial<T>]: unknown;
};

export class AdaptiveComponentRegistration extends ComponentRegistration implements ComponentDeclarativeTypes {
    private _declarativeTypes: DeclarativeType<unknown, unknown>[] = [];

    public constructor() {
        super();

        // AdaptiveDialog
        this._addDeclarativeType<AdaptiveDialog, NonFunctionKeys<AdaptiveDialog>>(AdaptiveDialog);

        // Actions
        this._addDeclarativeType<BeginDialog, NonFunctionKeys<BeginDialog>>(BeginDialog);
        this._addDeclarativeType<BeginSkill, NonFunctionKeys<BeginSkill>>(BeginSkill);
        this._addDeclarativeType<BreakLoop, NonFunctionKeys<BreakLoop>>(BreakLoop);
        this._addDeclarativeType<CancelAllDialogs, NonFunctionKeys<CancelAllDialogs>>(CancelAllDialogs);
        this._addDeclarativeType<CancelDialog, NonFunctionKeys<CancelDialog>>(CancelDialog);
        this._addDeclarativeType<ContinueLoop, NonFunctionKeys<ContinueLoop>>(ContinueLoop);
        this._addDeclarativeType<DeleteActivity, NonFunctionKeys<DeleteActivity>>(DeleteActivity);
        this._addDeclarativeType<DeleteProperties, NonFunctionKeys<DeleteProperties>>(DeleteProperties);
        this._addDeclarativeType<DeleteProperty, NonFunctionKeys<DeleteProperty>>(DeleteProperty);
        this._addDeclarativeType<EditActions, NonFunctionKeys<EditActions>>(EditActions);
        this._addDeclarativeType<EditArray, NonFunctionKeys<EditArray>>(EditArray);
        this._addDeclarativeType<EmitEvent, NonFunctionKeys<EmitEvent>>(EmitEvent);
        this._addDeclarativeType<EndDialog, NonFunctionKeys<EndDialog>>(EndDialog);
        this._addDeclarativeType<EndTurn, NonFunctionKeys<EndTurn>>(EndTurn);
        this._addDeclarativeType<ForEach, NonFunctionKeys<ForEach>>(ForEach);
        this._addDeclarativeType<ForEachPage, NonFunctionKeys<ForEachPage>>(ForEachPage);
        this._addDeclarativeType<GetActivityMembers, NonFunctionKeys<GetActivityMembers>>(GetActivityMembers);
        this._addDeclarativeType<GetConversationMembers, NonFunctionKeys<GetConversationMembers>>(
            GetConversationMembers
        );
        this._addDeclarativeType<GotoAction, NonFunctionKeys<GotoAction>>(GotoAction);
        this._addDeclarativeType<HttpRequest, NonFunctionKeys<HttpRequest>>(HttpRequest);
        this._addDeclarativeType<IfCondition, NonFunctionKeys<IfCondition>>(IfCondition);
        this._addDeclarativeType<LogAction, NonFunctionKeys<LogAction>>(LogAction);
        this._addDeclarativeType<RepeatDialog, NonFunctionKeys<RepeatDialog>>(RepeatDialog);
        this._addDeclarativeType<ReplaceDialog, NonFunctionKeys<ReplaceDialog>>(ReplaceDialog);
        this._addDeclarativeType<SendActivity, NonFunctionKeys<SendActivity>>(SendActivity);
        this._addDeclarativeType<SetProperties, NonFunctionKeys<SetProperties>>(SetProperties);
        this._addDeclarativeType<SetProperty, NonFunctionKeys<SetProperty>>(SetProperty);
        this._addDeclarativeType<SignOutUser, NonFunctionKeys<SignOutUser>>(SignOutUser);
        this._addDeclarativeType<SwitchCondition, NonFunctionKeys<SwitchCondition>>(SwitchCondition);
        this._addDeclarativeType<TelemetryTrackEventAction, NonFunctionKeys<TelemetryTrackEventAction>>(
            TelemetryTrackEventAction
        );
        this._addDeclarativeType<TraceActivity, NonFunctionKeys<TraceActivity>>(TraceActivity);
        this._addDeclarativeType<UpdateActivity, NonFunctionKeys<UpdateActivity>>(UpdateActivity);

        // Trigger conditions
        this._addDeclarativeType<OnActivity, NonFunctionKeys<OnActivity>>(OnActivity);
        this._addDeclarativeType<OnAssignEntity, NonFunctionKeys<OnAssignEntity>>(OnAssignEntity);
        this._addDeclarativeType<OnBeginDialog, NonFunctionKeys<OnBeginDialog>>(OnBeginDialog);
        this._addDeclarativeType<OnCancelDialog, NonFunctionKeys<OnCancelDialog>>(OnCancelDialog);
        this._addDeclarativeType<OnChooseEntity, NonFunctionKeys<OnChooseEntity>>(OnChooseEntity);
        this._addDeclarativeType<OnChooseIntent, NonFunctionKeys<OnChooseIntent>>(OnChooseIntent);
        this._addDeclarativeType<OnChooseProperty, NonFunctionKeys<OnChooseProperty>>(OnChooseProperty);
        this._addDeclarativeType<OnCondition, NonFunctionKeys<OnCondition>>(OnCondition);
        this._addDeclarativeType<OnConversationUpdateActivity, NonFunctionKeys<OnConversationUpdateActivity>>(
            OnConversationUpdateActivity
        );
        this._addDeclarativeType<OnDialogEvent, NonFunctionKeys<OnDialogEvent>>(OnDialogEvent);
        this._addDeclarativeType<OnEndOfActions, NonFunctionKeys<OnEndOfActions>>(OnEndOfActions);
        this._addDeclarativeType<OnEndOfConversationActivity, NonFunctionKeys<OnEndOfConversationActivity>>(
            OnEndOfConversationActivity
        );
        this._addDeclarativeType<OnError, NonFunctionKeys<OnError>>(OnError);
        this._addDeclarativeType<OnEventActivity, NonFunctionKeys<OnEventActivity>>(OnEventActivity);
        this._addDeclarativeType<OnHandoffActivity, NonFunctionKeys<OnHandoffActivity>>(OnHandoffActivity);
        this._addDeclarativeType<OnIntent, NonFunctionKeys<OnIntent>>(OnIntent);
        this._addDeclarativeType<OnInvokeActivity, NonFunctionKeys<OnInvokeActivity>>(OnInvokeActivity);
        this._addDeclarativeType<OnMessageActivity, NonFunctionKeys<OnMessageActivity>>(OnMessageActivity);
        this._addDeclarativeType<OnMessageDeleteActivity, NonFunctionKeys<OnMessageDeleteActivity>>(
            OnMessageDeleteActivity
        );
        this._addDeclarativeType<OnMessageReactionActivity, NonFunctionKeys<OnMessageReactionActivity>>(
            OnMessageReactionActivity
        );
        this._addDeclarativeType<OnMessageUpdateActivity, NonFunctionKeys<OnMessageUpdateActivity>>(
            OnMessageUpdateActivity
        );
        this._addDeclarativeType<OnQnAMatch, NonFunctionKeys<OnQnAMatch>>(OnQnAMatch);
        this._addDeclarativeType<OnRepromptDialog, NonFunctionKeys<OnRepromptDialog>>(OnRepromptDialog);
        this._addDeclarativeType<OnTypingActivity, NonFunctionKeys<OnTypingActivity>>(OnTypingActivity);
        this._addDeclarativeType<OnUnknownIntent, NonFunctionKeys<OnUnknownIntent>>(OnUnknownIntent);

        // Inputs
        this._addDeclarativeType<Ask, NonFunctionKeys<Ask>>(Ask);
        this._addDeclarativeType<AttachmentInput, NonFunctionKeys<AttachmentInput>>(AttachmentInput);
        this._addDeclarativeType<ChoiceInput, NonFunctionKeys<ChoiceInput>>(ChoiceInput);
        this._addDeclarativeType<ConfirmInput, NonFunctionKeys<ConfirmInput>>(ConfirmInput);
        this._addDeclarativeType<DateTimeInput, NonFunctionKeys<DateTimeInput>>(DateTimeInput);
        this._addDeclarativeType<NumberInput, NonFunctionKeys<NumberInput>>(NumberInput);
        this._addDeclarativeType<OAuthInput, NonFunctionKeys<OAuthInput>>(OAuthInput);
        this._addDeclarativeType<TextInput, NonFunctionKeys<TextInput>>(TextInput);

        // Recognizers
        this._addDeclarativeType<LuisAdaptiveRecognizer, NonFunctionKeys<LuisAdaptiveRecognizer>>(
            LuisAdaptiveRecognizer
        );
        this._addDeclarativeType<CrossTrainedRecognizerSet, NonFunctionKeys<CrossTrainedRecognizerSet>>(
            CrossTrainedRecognizerSet
        );
        this._addDeclarativeType<MultiLanguageRecognizer, NonFunctionKeys<MultiLanguageRecognizer>>(
            MultiLanguageRecognizer
        );
        this._addDeclarativeType<RecognizerSet, NonFunctionKeys<RecognizerSet>>(RecognizerSet);
        this._addDeclarativeType<RegexRecognizer, NonFunctionKeys<RegexRecognizer>>(RegexRecognizer);
        this._addDeclarativeType<AgeEntityRecognizer, NonFunctionKeys<AgeEntityRecognizer>>(AgeEntityRecognizer);
        this._addDeclarativeType<ConfirmationEntityRecognizer, NonFunctionKeys<ConfirmationEntityRecognizer>>(
            ConfirmationEntityRecognizer
        );
        this._addDeclarativeType<CurrencyEntityRecognizer, NonFunctionKeys<CurrencyEntityRecognizer>>(
            CurrencyEntityRecognizer
        );
        this._addDeclarativeType<DateTimeEntityRecognizer, NonFunctionKeys<DateTimeEntityRecognizer>>(
            DateTimeEntityRecognizer
        );
        this._addDeclarativeType<DimensionEntityRecognizer, NonFunctionKeys<DimensionEntityRecognizer>>(
            DimensionEntityRecognizer
        );
        this._addDeclarativeType<EmailEntityRecognizer, NonFunctionKeys<EmailEntityRecognizer>>(EmailEntityRecognizer);
        this._addDeclarativeType<GuidEntityRecognizer, NonFunctionKeys<GuidEntityRecognizer>>(GuidEntityRecognizer);
        this._addDeclarativeType<HashtagEntityRecognizer, NonFunctionKeys<HashtagEntityRecognizer>>(
            HashtagEntityRecognizer
        );
        this._addDeclarativeType<IpEntityRecognizer, NonFunctionKeys<IpEntityRecognizer>>(IpEntityRecognizer);
        this._addDeclarativeType<MentionEntityRecognizer, NonFunctionKeys<MentionEntityRecognizer>>(
            MentionEntityRecognizer
        );
        this._addDeclarativeType<NumberEntityRecognizer, NonFunctionKeys<NumberEntityRecognizer>>(
            NumberEntityRecognizer
        );
        this._addDeclarativeType<OrdinalEntityRecognizer, NonFunctionKeys<OrdinalEntityRecognizer>>(
            OrdinalEntityRecognizer
        );
        this._addDeclarativeType<PercentageEntityRecognizer, NonFunctionKeys<PercentageEntityRecognizer>>(
            PercentageEntityRecognizer
        );
        this._addDeclarativeType<PhoneNumberEntityRecognizer, NonFunctionKeys<PhoneNumberEntityRecognizer>>(
            PhoneNumberEntityRecognizer
        );
        this._addDeclarativeType<RegexEntityRecognizer, NonFunctionKeys<RegexEntityRecognizer>>(RegexEntityRecognizer);
        this._addDeclarativeType<TemperatureEntityRecognizer, NonFunctionKeys<TemperatureEntityRecognizer>>(
            TemperatureEntityRecognizer
        );
        this._addDeclarativeType<UrlEntityRecognizer, NonFunctionKeys<UrlEntityRecognizer>>(UrlEntityRecognizer);
        this._addDeclarativeType<QnAMakerRecognizer, NonFunctionKeys<QnAMakerRecognizer>>(QnAMakerRecognizer);

        // Generators
        this._addDeclarativeType<TemplateEngineLanguageGenerator, NonFunctionKeys<TemplateEngineLanguageGenerator>>(
            TemplateEngineLanguageGenerator
        );
        this._addDeclarativeType<ResourceMultiLanguageGenerator, NonFunctionKeys<ResourceMultiLanguageGenerator>>(
            ResourceMultiLanguageGenerator
        );

        // Selectors
        this._addDeclarativeType<ConditionalSelector, NonFunctionKeys<ConditionalSelector>>(ConditionalSelector);
        this._addDeclarativeType<FirstSelector, NonFunctionKeys<FirstSelector>>(FirstSelector);
        this._addDeclarativeType<RandomSelector, NonFunctionKeys<RandomSelector>>(RandomSelector);
        this._addDeclarativeType<TrueSelector, NonFunctionKeys<TrueSelector>>(TrueSelector);
        this._addDeclarativeType<MostSpecificSelector, NonFunctionKeys<MostSpecificSelector>>(MostSpecificSelector);
    }

    public getDeclarativeTypes(resourceExplorer: ResourceExplorer): DeclarativeType[] {
        const declarativeTypes: DeclarativeType[] = [...this._declarativeTypes];
        resourceExplorer.getResources('.schema').forEach((schema) => {
            const resourceId = schema.id.replace(/.schema$/, '');
            if (resourceId.endsWith('.dialog')) {
                declarativeTypes.push({
                    kind: resourceId,
                    type: DynamicBeginDialog,
                    loader: new CustomDialogLoader(resourceExplorer),
                });
            }
        });
        return declarativeTypes;
    }

    private _addDeclarativeType<T, C>(type: Type<T>, loader?: CustomDeserializer<T, C>): void {
        const declarativeType: DeclarativeType<T, C> = {
            kind: type.$kind,
            type,
            loader,
        };
        this._declarativeTypes.push(declarativeType);
    }
}
