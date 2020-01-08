/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import {
    ComponentRegistration, TypeRegistration, ConfigurableTypeBuilder
} from 'botbuilder-dialogs-declarative';
import {
    AttachmentInput, ChoiceInput, ConfirmInput, DateTimeInput,
    NumberInput, OAuthInput, TextInput
} from './input';
import {
    BeginDialog, CancelAllDialogs, DeleteActivity, DeleteProperties,
    DeleteProperty, EditArray, EditActions, EmitEvent, EndDialog, EndTurn,
    ForEach, ForEachPage, GetActivityMembers, GetConversationMembers,
    HttpRequest, IfCondition, InitProperty, LogAction,
    RepeatDialog, ReplaceDialog, SendActivity, SetProperties, SetProperty,
    SignOutUser, SwitchCondition, TraceActivity, UpdateActivity
} from './actions';
import {
    OnActivity, OnBeginDialog, OnCancelDialog, OnCondition,
    OnConversationUpdateActivity, OnCustomEvent, OnDialogEvent,
    OnEndOfConversationActivity, OnError, OnEventActivity, OnHandoffActivity,
    OnIntent, OnInvokeActivity, OnMessageActivity, OnMessageDeleteActivity,
    OnMessageReactionActivity, OnMessageUpdateActivity, OnRepromptDialog,
    OnTypingActivity, OnUnknownIntent
} from './conditions';
import { RegexRecognizer } from './recognizers';
import { AdaptiveDialog } from './adaptiveDialog';

export class AdaptiveComponentRegistration implements ComponentRegistration {
    public getTypes(): TypeRegistration[] {
        const types = [];

        // Input
        types.push(new TypeRegistration(AttachmentInput.declarativeType, new ConfigurableTypeBuilder(AttachmentInput)));
        types.push(new TypeRegistration(ChoiceInput.declarativeType, new ConfigurableTypeBuilder(ChoiceInput)));
        types.push(new TypeRegistration(ConfirmInput.declarativeType, new ConfigurableTypeBuilder(ConfirmInput)));
        types.push(new TypeRegistration(DateTimeInput.declarativeType, new ConfigurableTypeBuilder(DateTimeInput)));
        types.push(new TypeRegistration(NumberInput.declarativeType, new ConfigurableTypeBuilder(NumberInput)));
        types.push(new TypeRegistration(OAuthInput.declarativeType, new ConfigurableTypeBuilder(OAuthInput)));
        types.push(new TypeRegistration(TextInput.declarativeType, new ConfigurableTypeBuilder(TextInput)));

        // Actions
        types.push(new TypeRegistration(BeginDialog.declarativeType, new ConfigurableTypeBuilder(BeginDialog)));
        types.push(new TypeRegistration(CancelAllDialogs.declarativeType, new ConfigurableTypeBuilder(CancelAllDialogs)));
        types.push(new TypeRegistration(DeleteActivity.declarativeType, new ConfigurableTypeBuilder(DeleteActivity)));
        types.push(new TypeRegistration(DeleteProperties.declarativeType, new ConfigurableTypeBuilder(DeleteProperties)));
        types.push(new TypeRegistration(DeleteProperty.declarativeType, new ConfigurableTypeBuilder(DeleteProperty)));
        types.push(new TypeRegistration(EditArray.declarativeType, new ConfigurableTypeBuilder(EditArray)));
        types.push(new TypeRegistration(EditActions.declarativeType, new ConfigurableTypeBuilder(EditActions)));
        types.push(new TypeRegistration(EmitEvent.declarativeType, new ConfigurableTypeBuilder(EmitEvent)));
        types.push(new TypeRegistration(ForEach.declarativeType, new ConfigurableTypeBuilder(ForEach)));
        types.push(new TypeRegistration(ForEachPage.declarativeType, new ConfigurableTypeBuilder(ForEachPage)));
        types.push(new TypeRegistration(GetActivityMembers.declarativeType, new ConfigurableTypeBuilder(GetActivityMembers)));
        types.push(new TypeRegistration(GetConversationMembers.declarativeType, new ConfigurableTypeBuilder(GetConversationMembers)));
        types.push(new TypeRegistration(EndDialog.declarativeType, new ConfigurableTypeBuilder(EndDialog)));
        types.push(new TypeRegistration(EndTurn.declarativeType, new ConfigurableTypeBuilder(EndTurn)));
        types.push(new TypeRegistration(HttpRequest.declarativeType, new ConfigurableTypeBuilder(HttpRequest)));
        types.push(new TypeRegistration(IfCondition.declarativeType, new ConfigurableTypeBuilder(IfCondition)));
        types.push(new TypeRegistration(InitProperty.declarativeType, new ConfigurableTypeBuilder(InitProperty)));
        types.push(new TypeRegistration(LogAction.declarativeType, new ConfigurableTypeBuilder(LogAction)));
        types.push(new TypeRegistration(RepeatDialog.declarativeType, new ConfigurableTypeBuilder(RepeatDialog)));
        types.push(new TypeRegistration(ReplaceDialog.declarativeType, new ConfigurableTypeBuilder(ReplaceDialog)));
        types.push(new TypeRegistration(SendActivity.declarativeType, new ConfigurableTypeBuilder(SendActivity)));
        types.push(new TypeRegistration(SetProperties.declarativeType, new ConfigurableTypeBuilder(SetProperties)));
        types.push(new TypeRegistration(SetProperty.declarativeType, new ConfigurableTypeBuilder(SetProperty)));
        types.push(new TypeRegistration(SignOutUser.declarativeType, new ConfigurableTypeBuilder(SignOutUser)));
        types.push(new TypeRegistration(SwitchCondition.declarativeType, new ConfigurableTypeBuilder(SwitchCondition)));
        types.push(new TypeRegistration(TraceActivity.declarativeType, new ConfigurableTypeBuilder(TraceActivity)));
        types.push(new TypeRegistration(UpdateActivity.declarativeType, new ConfigurableTypeBuilder(UpdateActivity)));

        // Dialogs
        types.push(new TypeRegistration(AdaptiveDialog.declarativeType, new ConfigurableTypeBuilder(AdaptiveDialog)));

        // Conditions
        types.push(new TypeRegistration(OnActivity.declarativeType, new ConfigurableTypeBuilder(OnActivity)));
        types.push(new TypeRegistration(OnBeginDialog.declarativeType, new ConfigurableTypeBuilder(OnBeginDialog)));
        types.push(new TypeRegistration(OnCancelDialog.declarativeType, new ConfigurableTypeBuilder(OnCancelDialog)));
        types.push(new TypeRegistration(OnCondition.declarativeType, new ConfigurableTypeBuilder(OnCondition)));
        types.push(new TypeRegistration(OnConversationUpdateActivity.declarativeType, new ConfigurableTypeBuilder(OnConversationUpdateActivity)));
        types.push(new TypeRegistration(OnCustomEvent.declarativeType, new ConfigurableTypeBuilder(OnCustomEvent)));
        types.push(new TypeRegistration(OnDialogEvent.declarativeType, new ConfigurableTypeBuilder(OnDialogEvent)));
        types.push(new TypeRegistration(OnEndOfConversationActivity.declarativeType, new ConfigurableTypeBuilder(OnEndOfConversationActivity)));
        types.push(new TypeRegistration(OnError.declarativeType, new ConfigurableTypeBuilder(OnError)));
        types.push(new TypeRegistration(OnEventActivity.declarativeType, new ConfigurableTypeBuilder(OnEventActivity)));
        types.push(new TypeRegistration(OnHandoffActivity.declarativeType, new ConfigurableTypeBuilder(OnHandoffActivity)));
        types.push(new TypeRegistration(OnIntent.declarativeType, new ConfigurableTypeBuilder(OnIntent)));
        types.push(new TypeRegistration(OnInvokeActivity.declarativeType, new ConfigurableTypeBuilder(OnInvokeActivity)));
        types.push(new TypeRegistration(OnMessageActivity.declarativeType, new ConfigurableTypeBuilder(OnMessageActivity)));
        types.push(new TypeRegistration(OnMessageDeleteActivity.declarativeType, new ConfigurableTypeBuilder(OnMessageDeleteActivity)));
        types.push(new TypeRegistration(OnMessageReactionActivity.declarativeType, new ConfigurableTypeBuilder(OnMessageReactionActivity)));
        types.push(new TypeRegistration(OnMessageUpdateActivity.declarativeType, new ConfigurableTypeBuilder(OnMessageUpdateActivity)));
        types.push(new TypeRegistration(OnRepromptDialog.declarativeType, new ConfigurableTypeBuilder(OnRepromptDialog)));
        types.push(new TypeRegistration(OnTypingActivity.declarativeType, new ConfigurableTypeBuilder(OnTypingActivity)));
        types.push(new TypeRegistration(OnUnknownIntent.declarativeType, new ConfigurableTypeBuilder(OnUnknownIntent)));

        // Recognizers
        types.push(new TypeRegistration(RegexRecognizer.declarativeType, new ConfigurableTypeBuilder(RegexRecognizer)));

        return types;
    }
}