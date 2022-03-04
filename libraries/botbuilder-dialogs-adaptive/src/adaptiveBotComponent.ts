// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { AdaptiveDialog } from './adaptiveDialog';
import { BotComponent } from 'botbuilder';
import { ComponentDeclarativeTypes } from 'botbuilder-dialogs-declarative';
import { ConditionalSelector, FirstSelector, MostSpecificSelector, RandomSelector, TrueSelector } from './selectors';
import { Configuration, ServiceCollection } from 'botbuilder-dialogs-adaptive-runtime-core';
import { DynamicBeginDialogDeserializer } from './dynamicBeginDialogDeserializer';
import { Expression } from 'adaptive-expressions';
import { HasPendingActionsFunction, IsDialogActiveFunction } from './functions';
import { ResourceMultiLanguageGenerator, TemplateEngineLanguageGenerator } from './generators';

import {
    BeginDialog,
    BeginSkill,
    BreakLoop,
    CancelAllDialogs,
    CancelDialog,
    ContinueConversation,
    ContinueConversationLater,
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
    GetConversationReference,
    GotoAction,
    HttpRequest,
    IfCondition,
    LogAction,
    RepeatDialog,
    ReplaceDialog,
    SendActivity,
    SendHandoffActivity,
    SetProperties,
    SetProperty,
    SignOutUser,
    SwitchCondition,
    TelemetryTrackEventAction,
    TraceActivity,
    ThrowException,
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
    OnCommandActivity,
    OnCommandResultActivity,
    OnCondition,
    OnContinueConversation,
    OnConversationUpdateActivity,
    OnDialogEvent,
    OnEndOfActions,
    OnEndOfConversationActivity,
    OnError,
    OnEventActivity,
    OnHandoffActivity,
    OnInstallationUpdateActivity,
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
    ChannelMentionEntityRecognizer,
    ConfirmationEntityRecognizer,
    CrossTrainedRecognizerSet,
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

/**
 * [BotComponent](xref:botbuilder-core.BotComponent) for adaptive components.
 */
export class AdaptiveBotComponent extends BotComponent {
    /**
     * @param services Services Collection to register.
     * @param _configuration Configuration for the bot component.
     */
    configureServices(services: ServiceCollection, _configuration: Configuration): void {
        Expression.functions.add(IsDialogActiveFunction.functionName, new IsDialogActiveFunction());
        Expression.functions.add(IsDialogActiveFunction.functionAlias, new IsDialogActiveFunction());
        Expression.functions.add(HasPendingActionsFunction.functionName, new HasPendingActionsFunction());

        services.composeFactory<ComponentDeclarativeTypes[]>('declarativeTypes', (declarativeTypes) =>
            declarativeTypes.concat(
                {
                    getDeclarativeTypes() {
                        return [
                            // Adaptive Dialog
                            { kind: AdaptiveDialog.$kind, type: AdaptiveDialog },

                            // Actions
                            { kind: BeginDialog.$kind, type: BeginDialog },
                            { kind: BeginSkill.$kind, type: BeginSkill },
                            { kind: BreakLoop.$kind, type: BreakLoop },
                            { kind: CancelAllDialogs.$kind, type: CancelAllDialogs },
                            { kind: CancelDialog.$kind, type: CancelDialog },
                            { kind: ContinueConversation.$kind, type: ContinueConversation },
                            { kind: ContinueConversationLater.$kind, type: ContinueConversation },
                            { kind: ContinueLoop.$kind, type: ContinueLoop },
                            { kind: DeleteActivity.$kind, type: DeleteActivity },
                            { kind: DeleteProperties.$kind, type: DeleteProperties },
                            { kind: DeleteProperty.$kind, type: DeleteProperty },
                            { kind: EditActions.$kind, type: EditActions },
                            { kind: EditArray.$kind, type: EditArray },
                            { kind: EmitEvent.$kind, type: EmitEvent },
                            { kind: EndDialog.$kind, type: EndDialog },
                            { kind: EndTurn.$kind, type: EndTurn },
                            { kind: ForEach.$kind, type: ForEach },
                            { kind: ForEachPage.$kind, type: ForEachPage },
                            { kind: GetActivityMembers.$kind, type: GetActivityMembers },
                            { kind: GetConversationMembers.$kind, type: GetConversationMembers },
                            { kind: GetConversationReference.$kind, type: GetConversationReference },
                            { kind: GotoAction.$kind, type: GotoAction },
                            { kind: HttpRequest.$kind, type: HttpRequest },
                            { kind: IfCondition.$kind, type: IfCondition },
                            { kind: LogAction.$kind, type: LogAction },
                            { kind: RepeatDialog.$kind, type: RepeatDialog },
                            { kind: ReplaceDialog.$kind, type: ReplaceDialog },
                            { kind: SendActivity.$kind, type: SendActivity },
                            { kind: SendHandoffActivity.$kind, type: SendHandoffActivity },
                            { kind: SetProperties.$kind, type: SetProperties },
                            { kind: SetProperty.$kind, type: SetProperty },
                            { kind: SignOutUser.$kind, type: SignOutUser },
                            { kind: SwitchCondition.$kind, type: SwitchCondition },
                            { kind: TelemetryTrackEventAction.$kind, type: TelemetryTrackEventAction },
                            { kind: ThrowException.$kind, type: ThrowException },
                            { kind: TraceActivity.$kind, type: TraceActivity },
                            { kind: UpdateActivity.$kind, type: UpdateActivity },

                            // Trigger conditions
                            { kind: OnActivity.$kind, type: OnActivity },
                            { kind: OnAssignEntity.$kind, type: OnAssignEntity },
                            { kind: OnBeginDialog.$kind, type: OnBeginDialog },
                            { kind: OnCancelDialog.$kind, type: OnCancelDialog },
                            { kind: OnChooseEntity.$kind, type: OnChooseEntity },
                            { kind: OnChooseIntent.$kind, type: OnChooseIntent },
                            { kind: OnChooseProperty.$kind, type: OnChooseProperty },
                            { kind: OnCommandActivity.$kind, type: OnCommandActivity },
                            { kind: OnCommandResultActivity.$kind, type: OnCommandResultActivity },
                            { kind: OnCondition.$kind, type: OnCondition },
                            { kind: OnContinueConversation.$kind, type: OnContinueConversation },
                            { kind: OnConversationUpdateActivity.$kind, type: OnConversationUpdateActivity },
                            { kind: OnDialogEvent.$kind, type: OnDialogEvent },
                            { kind: OnEndOfActions.$kind, type: OnEndOfActions },
                            { kind: OnEndOfConversationActivity.$kind, type: OnEndOfConversationActivity },
                            { kind: OnError.$kind, type: OnError },
                            { kind: OnEventActivity.$kind, type: OnEventActivity },
                            { kind: OnHandoffActivity.$kind, type: OnHandoffActivity },
                            { kind: OnInstallationUpdateActivity.$kind, type: OnInstallationUpdateActivity },
                            { kind: OnIntent.$kind, type: OnIntent },
                            { kind: OnInvokeActivity.$kind, type: OnInvokeActivity },
                            { kind: OnMessageActivity.$kind, type: OnMessageActivity },
                            { kind: OnMessageDeleteActivity.$kind, type: OnMessageDeleteActivity },
                            { kind: OnMessageReactionActivity.$kind, type: OnMessageReactionActivity },
                            { kind: OnMessageUpdateActivity.$kind, type: OnMessageUpdateActivity },
                            { kind: OnQnAMatch.$kind, type: OnQnAMatch },
                            { kind: OnRepromptDialog.$kind, type: OnRepromptDialog },
                            { kind: OnTypingActivity.$kind, type: OnTypingActivity },
                            { kind: OnUnknownIntent.$kind, type: OnUnknownIntent },

                            // Inputs
                            { kind: Ask.$kind, type: Ask },
                            { kind: AttachmentInput.$kind, type: AttachmentInput },
                            { kind: ChoiceInput.$kind, type: ChoiceInput },
                            { kind: ConfirmInput.$kind, type: ConfirmInput },
                            { kind: DateTimeInput.$kind, type: DateTimeInput },
                            { kind: NumberInput.$kind, type: NumberInput },
                            { kind: OAuthInput.$kind, type: OAuthInput },
                            { kind: TextInput.$kind, type: TextInput },

                            // Recognizers
                            { kind: CrossTrainedRecognizerSet.$kind, type: CrossTrainedRecognizerSet },
                            { kind: MultiLanguageRecognizer.$kind, type: MultiLanguageRecognizer },
                            { kind: RecognizerSet.$kind, type: RecognizerSet },
                            { kind: RegexRecognizer.$kind, type: RegexRecognizer },
                            { kind: AgeEntityRecognizer.$kind, type: AgeEntityRecognizer },
                            { kind: ChannelMentionEntityRecognizer.$kind, type: ChannelMentionEntityRecognizer },
                            { kind: ConfirmationEntityRecognizer.$kind, type: ConfirmationEntityRecognizer },
                            { kind: CurrencyEntityRecognizer.$kind, type: CurrencyEntityRecognizer },
                            { kind: DateTimeEntityRecognizer.$kind, type: DateTimeEntityRecognizer },
                            { kind: DimensionEntityRecognizer.$kind, type: DimensionEntityRecognizer },
                            { kind: EmailEntityRecognizer.$kind, type: EmailEntityRecognizer },
                            { kind: EntityRecognizerSet.$kind, type: EntityRecognizerSet },
                            { kind: GuidEntityRecognizer.$kind, type: GuidEntityRecognizer },
                            { kind: HashtagEntityRecognizer.$kind, type: HashtagEntityRecognizer },
                            { kind: IpEntityRecognizer.$kind, type: IpEntityRecognizer },
                            { kind: MentionEntityRecognizer.$kind, type: MentionEntityRecognizer },
                            { kind: NumberEntityRecognizer.$kind, type: NumberEntityRecognizer },
                            { kind: OrdinalEntityRecognizer.$kind, type: OrdinalEntityRecognizer },
                            { kind: PercentageEntityRecognizer.$kind, type: PercentageEntityRecognizer },
                            { kind: PhoneNumberEntityRecognizer.$kind, type: PhoneNumberEntityRecognizer },
                            { kind: RegexEntityRecognizer.$kind, type: RegexEntityRecognizer },
                            { kind: TemperatureEntityRecognizer.$kind, type: TemperatureEntityRecognizer },
                            { kind: UrlEntityRecognizer.$kind, type: UrlEntityRecognizer },

                            // Generators
                            { kind: TemplateEngineLanguageGenerator.$kind, type: TemplateEngineLanguageGenerator },
                            { kind: ResourceMultiLanguageGenerator.$kind, type: ResourceMultiLanguageGenerator },

                            // Selectors
                            { kind: ConditionalSelector.$kind, type: ConditionalSelector },
                            { kind: FirstSelector.$kind, type: FirstSelector },
                            { kind: RandomSelector.$kind, type: RandomSelector },
                            { kind: TrueSelector.$kind, type: TrueSelector },
                            { kind: MostSpecificSelector.$kind, type: MostSpecificSelector },
                        ];
                    },
                },
                {
                    getDeclarativeTypes(resourceExplorer) {
                        return resourceExplorer
                            .getResources('.schema')
                            .map((schema) => schema.id.replace(/.schema$/, ''))
                            .filter((resourceId) => resourceId.endsWith('.dialog'))
                            .map((resourceId) => ({
                                kind: resourceId,
                                type: DynamicBeginDialog,
                                loader: new DynamicBeginDialogDeserializer(resourceExplorer, resourceId),
                            }));
                    },
                }
            )
        );
    }
}
