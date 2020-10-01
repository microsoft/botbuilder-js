/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ComponentRegistration } from 'botbuilder-core';
import { ResourceExplorer, ComponentDeclarativeTypes, DeclarativeType, CustomDeserializer } from 'botbuilder-dialogs-declarative';
import { AdaptiveDialog } from './adaptiveDialog';
import { BeginDialog, BeginSkill, BreakLoop, CancelAllDialogs, CancelDialog, ContinueLoop, DeleteActivity, DeleteProperties, DeleteProperty, DynamicBeginDialog, EditActions, EditArray, EmitEvent, EndDialog, EndTurn, ForEach, ForEachPage, GetActivityMembers, GetConversationMembers, GotoAction, HttpRequest, IfCondition, LogAction, RepeatDialog, ReplaceDialog, SendActivity, SetProperties, SetProperty, SignOutUser, SwitchCondition, TelemetryTrackEventAction, TraceActivity, UpdateActivity } from './actions';
import { OnActivity, OnAssignEntity, OnBeginDialog, OnCancelDialog, OnChooseEntity, OnChooseIntent, OnChooseProperty, OnCondition, OnConversationUpdateActivity, OnDialogEvent, OnEndOfActions, OnEndOfConversationActivity, OnError, OnEventActivity, OnHandoffActivity, OnIntent, OnInvokeActivity, OnMessageActivity, OnMessageDeleteActivity, OnMessageReactionActivity, OnMessageUpdateActivity, OnQnAMatch, OnRepromptDialog, OnTypingActivity, OnUnknownIntent } from './conditions';
import { Ask, AttachmentInput, ChoiceInput, ConfirmInput, DateTimeInput, NumberInput, OAuthInput, TextInput } from './input';
import { AgeEntityRecognizer, ConfirmationEntityRecognizer, CrossTrainedRecognizerSet, CurrencyEntityRecognizer, DateTimeEntityRecognizer, DimensionEntityRecognizer, EmailEntityRecognizer, GuidEntityRecognizer, HashtagEntityRecognizer, IpEntityRecognizer, MentionEntityRecognizer, MultiLanguageRecognizer, NumberEntityRecognizer, OrdinalEntityRecognizer, PercentageEntityRecognizer, PhoneNumberEntityRecognizer, RecognizerSet, RegexEntityRecognizer, RegexRecognizer, TemperatureEntityRecognizer, UrlEntityRecognizer } from './recognizers';
import { LuisAdaptiveRecognizer } from './luis';
import { QnAMakerRecognizer } from './qnaMaker';
import { ResourceMultiLanguageGenerator, TemplateEngineLanguageGenerator } from './generators';
import { ConditionalSelector, FirstSelector, RandomSelector, TrueSelector } from './selectors';
import { CustomDialogLoader } from './customDialogLoader';

type Type = {
    $kind: string
    new(): unknown;
}

export class AdaptiveComponentRegistration extends ComponentRegistration implements ComponentDeclarativeTypes {
    private _declarativeTypes: DeclarativeType[] = [];

    public constructor() {
        super();

        // AdaptiveDialog
        this._addDeclarativeType(AdaptiveDialog);

        // Actions
        this._addDeclarativeType(BeginDialog);
        this._addDeclarativeType(BeginSkill);
        this._addDeclarativeType(BreakLoop);
        this._addDeclarativeType(CancelAllDialogs);
        this._addDeclarativeType(CancelDialog);
        this._addDeclarativeType(ContinueLoop);
        this._addDeclarativeType(DeleteActivity);
        this._addDeclarativeType(DeleteProperties);
        this._addDeclarativeType(DeleteProperty);
        this._addDeclarativeType(EditActions);
        this._addDeclarativeType(EditArray);
        this._addDeclarativeType(EmitEvent);
        this._addDeclarativeType(EndDialog);
        this._addDeclarativeType(EndTurn);
        this._addDeclarativeType(ForEach);
        this._addDeclarativeType(ForEachPage);
        this._addDeclarativeType(GetActivityMembers);
        this._addDeclarativeType(GetConversationMembers);
        this._addDeclarativeType(GotoAction);
        this._addDeclarativeType(HttpRequest);
        this._addDeclarativeType(IfCondition);
        this._addDeclarativeType(LogAction);
        this._addDeclarativeType(RepeatDialog);
        this._addDeclarativeType(ReplaceDialog);
        this._addDeclarativeType(SendActivity);
        this._addDeclarativeType(SetProperties);
        this._addDeclarativeType(SetProperty);
        this._addDeclarativeType(SignOutUser);
        this._addDeclarativeType(SwitchCondition);
        this._addDeclarativeType(TelemetryTrackEventAction);
        this._addDeclarativeType(TraceActivity);
        this._addDeclarativeType(UpdateActivity);

        // Trigger conditions
        this._addDeclarativeType(OnActivity);
        this._addDeclarativeType(OnAssignEntity);
        this._addDeclarativeType(OnBeginDialog);
        this._addDeclarativeType(OnCancelDialog);
        this._addDeclarativeType(OnChooseEntity);
        this._addDeclarativeType(OnChooseIntent);
        this._addDeclarativeType(OnChooseProperty);
        this._addDeclarativeType(OnCondition);
        this._addDeclarativeType(OnConversationUpdateActivity);
        this._addDeclarativeType(OnDialogEvent);
        this._addDeclarativeType(OnEndOfActions);
        this._addDeclarativeType(OnEndOfConversationActivity);
        this._addDeclarativeType(OnError);
        this._addDeclarativeType(OnEventActivity);
        this._addDeclarativeType(OnHandoffActivity);
        this._addDeclarativeType(OnIntent);
        this._addDeclarativeType(OnInvokeActivity);
        this._addDeclarativeType(OnMessageActivity);
        this._addDeclarativeType(OnMessageDeleteActivity);
        this._addDeclarativeType(OnMessageReactionActivity);
        this._addDeclarativeType(OnMessageUpdateActivity);
        this._addDeclarativeType(OnQnAMatch);
        this._addDeclarativeType(OnRepromptDialog);
        this._addDeclarativeType(OnTypingActivity);
        this._addDeclarativeType(OnUnknownIntent);

        // Inputs
        this._addDeclarativeType(Ask);
        this._addDeclarativeType(AttachmentInput);
        this._addDeclarativeType(ChoiceInput);
        this._addDeclarativeType(ConfirmInput);
        this._addDeclarativeType(DateTimeInput);
        this._addDeclarativeType(NumberInput);
        this._addDeclarativeType(OAuthInput);
        this._addDeclarativeType(TextInput);

        // Recognizers
        this._addDeclarativeType(LuisAdaptiveRecognizer);
        this._addDeclarativeType(CrossTrainedRecognizerSet);
        this._addDeclarativeType(MultiLanguageRecognizer);
        this._addDeclarativeType(RecognizerSet);
        this._addDeclarativeType(RegexRecognizer);
        this._addDeclarativeType(AgeEntityRecognizer);
        this._addDeclarativeType(ConfirmationEntityRecognizer);
        this._addDeclarativeType(CurrencyEntityRecognizer);
        this._addDeclarativeType(DateTimeEntityRecognizer);
        this._addDeclarativeType(DimensionEntityRecognizer);
        this._addDeclarativeType(EmailEntityRecognizer);
        this._addDeclarativeType(GuidEntityRecognizer);
        this._addDeclarativeType(HashtagEntityRecognizer);
        this._addDeclarativeType(IpEntityRecognizer);
        this._addDeclarativeType(MentionEntityRecognizer);
        this._addDeclarativeType(NumberEntityRecognizer);
        this._addDeclarativeType(OrdinalEntityRecognizer);
        this._addDeclarativeType(PercentageEntityRecognizer);
        this._addDeclarativeType(PhoneNumberEntityRecognizer);
        this._addDeclarativeType(RegexEntityRecognizer);
        this._addDeclarativeType(TemperatureEntityRecognizer);
        this._addDeclarativeType(UrlEntityRecognizer);
        this._addDeclarativeType(QnAMakerRecognizer);

        // Generators
        this._addDeclarativeType(TemplateEngineLanguageGenerator);
        this._addDeclarativeType(ResourceMultiLanguageGenerator);
        
        // Selectors
        this._addDeclarativeType(ConditionalSelector);
        this._addDeclarativeType(FirstSelector);
        this._addDeclarativeType(RandomSelector);
        this._addDeclarativeType(TrueSelector);
    }

    public getDeclarativeTypes(resourceExplorer: ResourceExplorer): DeclarativeType[] {
        const declarativeTypes: DeclarativeType[] = [...this._declarativeTypes];
        resourceExplorer.getResources('.schema').forEach(schema => {
            const resourceId = schema.id.replace(/.schema$/, '');
            if (resourceId.endsWith('.dialog')) {
                declarativeTypes.push({
                    kind: resourceId,
                    type: DynamicBeginDialog,
                    loader: new CustomDialogLoader(resourceExplorer)
                });
            }
        });
        return declarativeTypes;
    }


    private _addDeclarativeType(type: Type, loader?: CustomDeserializer): void {
        const declarativeType: DeclarativeType = {
            kind: type.$kind,
            type,
            loader
        };
        this._declarativeTypes.push(declarativeType);
    }
}