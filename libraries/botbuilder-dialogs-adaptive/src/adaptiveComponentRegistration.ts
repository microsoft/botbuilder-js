/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ComponentRegistration } from 'botbuilder-core';
import { Properties } from 'botbuilder-dialogs';
import {
    ResourceExplorer,
    ComponentDeclarativeTypes,
    DeclarativeType,
    CustomDeserializer,
} from 'botbuilder-dialogs-declarative';
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
        this._addDeclarativeType<AdaptiveDialog>(AdaptiveDialog);

        // Actions
        this._addDeclarativeType<BeginDialog>(BeginDialog);
        this._addDeclarativeType<BeginSkill>(BeginSkill);
        this._addDeclarativeType<BreakLoop>(BreakLoop);
        this._addDeclarativeType<CancelAllDialogs>(CancelAllDialogs);
        this._addDeclarativeType<CancelDialog>(CancelDialog);
        this._addDeclarativeType<ContinueLoop>(ContinueLoop);
        this._addDeclarativeType<DeleteActivity>(DeleteActivity);
        this._addDeclarativeType<DeleteProperties>(DeleteProperties);
        this._addDeclarativeType<DeleteProperty>(DeleteProperty);
        this._addDeclarativeType<EditActions>(EditActions);
        this._addDeclarativeType<EditArray>(EditArray);
        this._addDeclarativeType<EmitEvent>(EmitEvent);
        this._addDeclarativeType<EndDialog>(EndDialog);
        this._addDeclarativeType<EndTurn>(EndTurn);
        this._addDeclarativeType<ForEach>(ForEach);
        this._addDeclarativeType<ForEachPage>(ForEachPage);
        this._addDeclarativeType<GetActivityMembers>(GetActivityMembers);
        this._addDeclarativeType<GetConversationMembers>(GetConversationMembers);
        this._addDeclarativeType<GotoAction>(GotoAction);
        this._addDeclarativeType<HttpRequest>(HttpRequest);
        this._addDeclarativeType<IfCondition>(IfCondition);
        this._addDeclarativeType<LogAction>(LogAction);
        this._addDeclarativeType<RepeatDialog>(RepeatDialog);
        this._addDeclarativeType<ReplaceDialog>(ReplaceDialog);
        this._addDeclarativeType<SendActivity>(SendActivity);
        this._addDeclarativeType<SetProperties>(SetProperties);
        this._addDeclarativeType<SetProperty>(SetProperty);
        this._addDeclarativeType<SignOutUser>(SignOutUser);
        this._addDeclarativeType<SwitchCondition>(SwitchCondition);
        this._addDeclarativeType<TelemetryTrackEventAction>(TelemetryTrackEventAction);
        this._addDeclarativeType<TraceActivity>(TraceActivity);
        this._addDeclarativeType<UpdateActivity>(UpdateActivity);

        // Trigger conditions
        this._addDeclarativeType<OnActivity>(OnActivity);
        this._addDeclarativeType<OnAssignEntity>(OnAssignEntity);
        this._addDeclarativeType<OnBeginDialog>(OnBeginDialog);
        this._addDeclarativeType<OnCancelDialog>(OnCancelDialog);
        this._addDeclarativeType<OnChooseEntity>(OnChooseEntity);
        this._addDeclarativeType<OnChooseIntent>(OnChooseIntent);
        this._addDeclarativeType<OnChooseProperty>(OnChooseProperty);
        this._addDeclarativeType<OnCondition>(OnCondition);
        this._addDeclarativeType<OnConversationUpdateActivity>(OnConversationUpdateActivity);
        this._addDeclarativeType<OnDialogEvent>(OnDialogEvent);
        this._addDeclarativeType<OnEndOfActions>(OnEndOfActions);
        this._addDeclarativeType<OnEndOfConversationActivity>(OnEndOfConversationActivity);
        this._addDeclarativeType<OnError>(OnError);
        this._addDeclarativeType<OnEventActivity>(OnEventActivity);
        this._addDeclarativeType<OnHandoffActivity>(OnHandoffActivity);
        this._addDeclarativeType<OnIntent>(OnIntent);
        this._addDeclarativeType<OnInvokeActivity>(OnInvokeActivity);
        this._addDeclarativeType<OnMessageActivity>(OnMessageActivity);
        this._addDeclarativeType<OnMessageDeleteActivity>(OnMessageDeleteActivity);
        this._addDeclarativeType<OnMessageReactionActivity>(OnMessageReactionActivity);
        this._addDeclarativeType<OnMessageUpdateActivity>(OnMessageUpdateActivity);
        this._addDeclarativeType<OnQnAMatch>(OnQnAMatch);
        this._addDeclarativeType<OnRepromptDialog>(OnRepromptDialog);
        this._addDeclarativeType<OnTypingActivity>(OnTypingActivity);
        this._addDeclarativeType<OnUnknownIntent>(OnUnknownIntent);

        // Inputs
        this._addDeclarativeType<Ask>(Ask);
        this._addDeclarativeType<AttachmentInput>(AttachmentInput);
        this._addDeclarativeType<ChoiceInput>(ChoiceInput);
        this._addDeclarativeType<ConfirmInput>(ConfirmInput);
        this._addDeclarativeType<DateTimeInput>(DateTimeInput);
        this._addDeclarativeType<NumberInput>(NumberInput);
        this._addDeclarativeType<OAuthInput>(OAuthInput);
        this._addDeclarativeType<TextInput>(TextInput);

        // Recognizers
        this._addDeclarativeType<LuisAdaptiveRecognizer>(LuisAdaptiveRecognizer);
        this._addDeclarativeType<CrossTrainedRecognizerSet>(CrossTrainedRecognizerSet);
        this._addDeclarativeType<MultiLanguageRecognizer>(MultiLanguageRecognizer);
        this._addDeclarativeType<RecognizerSet>(RecognizerSet);
        this._addDeclarativeType<RegexRecognizer>(RegexRecognizer);
        this._addDeclarativeType<AgeEntityRecognizer>(AgeEntityRecognizer);
        this._addDeclarativeType<ConfirmationEntityRecognizer>(ConfirmationEntityRecognizer);
        this._addDeclarativeType<CurrencyEntityRecognizer>(CurrencyEntityRecognizer);
        this._addDeclarativeType<DateTimeEntityRecognizer>(DateTimeEntityRecognizer);
        this._addDeclarativeType<DimensionEntityRecognizer>(DimensionEntityRecognizer);
        this._addDeclarativeType<EmailEntityRecognizer>(EmailEntityRecognizer);
        this._addDeclarativeType<GuidEntityRecognizer>(GuidEntityRecognizer);
        this._addDeclarativeType<HashtagEntityRecognizer>(HashtagEntityRecognizer);
        this._addDeclarativeType<IpEntityRecognizer>(IpEntityRecognizer);
        this._addDeclarativeType<MentionEntityRecognizer>(MentionEntityRecognizer);
        this._addDeclarativeType<NumberEntityRecognizer>(NumberEntityRecognizer);
        this._addDeclarativeType<OrdinalEntityRecognizer>(OrdinalEntityRecognizer);
        this._addDeclarativeType<PercentageEntityRecognizer>(PercentageEntityRecognizer);
        this._addDeclarativeType<PhoneNumberEntityRecognizer>(PhoneNumberEntityRecognizer);
        this._addDeclarativeType<RegexEntityRecognizer>(RegexEntityRecognizer);
        this._addDeclarativeType<TemperatureEntityRecognizer>(TemperatureEntityRecognizer);
        this._addDeclarativeType<UrlEntityRecognizer>(UrlEntityRecognizer);
        this._addDeclarativeType<QnAMakerRecognizer>(QnAMakerRecognizer);

        // Generators
        this._addDeclarativeType<TemplateEngineLanguageGenerator>(TemplateEngineLanguageGenerator);
        this._addDeclarativeType<ResourceMultiLanguageGenerator>(ResourceMultiLanguageGenerator);

        // Selectors
        this._addDeclarativeType<ConditionalSelector>(ConditionalSelector);
        this._addDeclarativeType<FirstSelector>(FirstSelector);
        this._addDeclarativeType<RandomSelector>(RandomSelector);
        this._addDeclarativeType<TrueSelector>(TrueSelector);
        this._addDeclarativeType<MostSpecificSelector>(MostSpecificSelector);
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

    private _addDeclarativeType<T, C = Configuration<Properties<T>>>(
        type: Type<T>,
        loader?: CustomDeserializer<T, C>
    ): void {
        const declarativeType: DeclarativeType<T, C> = {
            kind: type.$kind,
            type,
            loader,
        };
        this._declarativeTypes.push(declarativeType);
    }
}
