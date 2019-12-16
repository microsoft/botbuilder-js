/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ComponentRegistration, TypeRegistration, ConfigurableTypeBuilder, DefaultTypeBuilder, CustomTypeBuilder } from 'botbuilder-dialogs-declarative';
import { TextInput, ConfirmInput, NumberInput, ChoiceInput, AttachmentInput, DatetimeInput, InputDialog, OAuthInput } from './input';
import { IfCondition, CancelAllDialogs, DeleteProperty, EditArray, EditActions, EmitEvent, EndDialog, EndTurn, ForEach, ForEachPage, LogAction, RepeatDialog, ReplaceDialog, SendActivity, SendList, SetProperty, BeginDialog, CodeAction, InitProperty, HttpRequest, SwitchCondition, TraceActivity } from './actions';
import { OnActivity, OnBeginDialog, OnCancelDialog, OnCondition, OnConversationUpdateActivity, OnCustomEvent, OnDialogEvent, OnEndOfConversationActivity, OnError, OnEventActivity, OnHandoffActivity, OnIntent, OnInvokeActivity, OnMessageActivity, OnMessageDeleteActivity, OnMessageReactionActivity, OnMessageUpdateActivity, OnRepromptDialog, OnTypingActivity, OnUnknownIntent } from './conditions';
import { RegExpRecognizer } from './recognizers';
import { AdaptiveDialog } from './adaptiveDialog';

export class AdaptiveComponentRegistration implements ComponentRegistration {
    getTypes(): TypeRegistration[] {
        const types = [];

        // Input
        types.push(new TypeRegistration('Microsoft.AttachmentInput', new ConfigurableTypeBuilder(AttachmentInput)));
        types.push(new TypeRegistration('Microsoft.ChoiceInput', new ConfigurableTypeBuilder(ChoiceInput)));
        types.push(new TypeRegistration('Microsoft.ConfirmInput', new ConfigurableTypeBuilder(ConfirmInput)));
        types.push(new TypeRegistration('Microsoft.DatetimeInput', new ConfigurableTypeBuilder(DatetimeInput)));
        types.push(new TypeRegistration('Microsoft.FloatInput', new ConfigurableTypeBuilder(NumberInput)));
        types.push(new TypeRegistration('Microsoft.IntegerInput', new ConfigurableTypeBuilder(NumberInput)));
        types.push(new TypeRegistration('Microsoft.OAuthInput', new ConfigurableTypeBuilder(OAuthInput)));
        types.push(new TypeRegistration('Microsoft.TextInput', new ConfigurableTypeBuilder(TextInput)));

        // Actions
        types.push(new TypeRegistration('Microsoft.BeginDialog', new ConfigurableTypeBuilder(BeginDialog)));
        types.push(new TypeRegistration('Microsoft.CancelAllDialogs', new ConfigurableTypeBuilder(CancelAllDialogs)));
        types.push(new TypeRegistration('Microsoft.DeleteProperty', new ConfigurableTypeBuilder(DeleteProperty)));
        types.push(new TypeRegistration('Microsoft.EditArray', new ConfigurableTypeBuilder(EditArray)));
        types.push(new TypeRegistration('Microsoft.EditActions', new ConfigurableTypeBuilder(EditActions)));
        types.push(new TypeRegistration('Microsoft.ForEach', new ConfigurableTypeBuilder(ForEach)));
        types.push(new TypeRegistration('Microsoft.ForEachPage', new ConfigurableTypeBuilder(ForEachPage)));
        types.push(new TypeRegistration('Microsoft.EmitEvent', new ConfigurableTypeBuilder(EmitEvent)));
        types.push(new TypeRegistration('Microsoft.EndDialog', new ConfigurableTypeBuilder(EndDialog)));
        types.push(new TypeRegistration('Microsoft.EndTurn', new ConfigurableTypeBuilder(EndTurn)));
        types.push(new TypeRegistration('Microsoft.IfCondition', new ConfigurableTypeBuilder(IfCondition)));
        types.push(new TypeRegistration('Microsoft.LogAction', new ConfigurableTypeBuilder(LogAction)));
        types.push(new TypeRegistration('Microsoft.RepeatDialog', new ConfigurableTypeBuilder(RepeatDialog)));
        types.push(new TypeRegistration('Microsoft.ReplaceDialog', new ConfigurableTypeBuilder(ReplaceDialog)));
        types.push(new TypeRegistration('Microsoft.SendActivity', new ConfigurableTypeBuilder(SendActivity)));
        types.push(new TypeRegistration('Microsoft.SendList', new ConfigurableTypeBuilder(SendList)));
        types.push(new TypeRegistration('Microsoft.SetProperty', new ConfigurableTypeBuilder(SetProperty)));
        types.push(new TypeRegistration('Microsoft.InitProperty', new ConfigurableTypeBuilder(InitProperty)));
        types.push(new TypeRegistration('Microsoft.HttpRequest', new ConfigurableTypeBuilder(HttpRequest)));
        types.push(new TypeRegistration('Microsoft.SwitchCondition', new ConfigurableTypeBuilder(SwitchCondition)));
        types.push(new TypeRegistration('Microsoft.TraceActivity', new ConfigurableTypeBuilder(TraceActivity)));

        // Dialogs
        types.push(new TypeRegistration('Microsoft.AdaptiveDialog', new ConfigurableTypeBuilder(AdaptiveDialog)));

        // Conditions
        types.push(new TypeRegistration('Microsoft.OnActivity', new DefaultTypeBuilder(OnActivity)));
        types.push(new TypeRegistration('Microsoft.OnBeginDialog', new DefaultTypeBuilder(OnBeginDialog)));
        types.push(new TypeRegistration('Microsoft.OnCancelDialog', new DefaultTypeBuilder(OnCancelDialog)));
        types.push(new TypeRegistration('Microsoft.OnCondition', new DefaultTypeBuilder(OnCondition)));
        types.push(new TypeRegistration('Microsoft.OnConversationUpdateActivity', new DefaultTypeBuilder(OnConversationUpdateActivity)));
        types.push(new TypeRegistration('Microsoft.OnCustomEvent', new DefaultTypeBuilder(OnCustomEvent)));
        types.push(new TypeRegistration('Microsoft.OnDialogEvent', new DefaultTypeBuilder(OnDialogEvent)));
        types.push(new TypeRegistration('Microsoft.OnEndOfConversationActivity', new DefaultTypeBuilder(OnEndOfConversationActivity)));
        types.push(new TypeRegistration('Microsoft.OnError', new DefaultTypeBuilder(OnError)));
        types.push(new TypeRegistration('Microsoft.OnEventActivity', new DefaultTypeBuilder(OnEventActivity)));
        types.push(new TypeRegistration('Microsoft.OnHandoffActivity', new DefaultTypeBuilder(OnHandoffActivity)));
        types.push(new TypeRegistration('Microsoft.OnIntent', new DefaultTypeBuilder(OnIntent)));
        types.push(new TypeRegistration('Microsoft.OnInvokeActivity', new DefaultTypeBuilder(OnInvokeActivity)));
        types.push(new TypeRegistration('Microsoft.OnMessageActivity', new DefaultTypeBuilder(OnMessageActivity)));
        types.push(new TypeRegistration('Microsoft.OnMessageDeleteActivity', new DefaultTypeBuilder(OnMessageDeleteActivity)));
        types.push(new TypeRegistration('Microsoft.OnMessageReactionActivity', new DefaultTypeBuilder(OnMessageReactionActivity)));
        types.push(new TypeRegistration('Microsoft.OnMessageUpdateActivity', new DefaultTypeBuilder(OnMessageUpdateActivity)));
        types.push(new TypeRegistration('Microsoft.OnRepromptDialog', new DefaultTypeBuilder(OnRepromptDialog)));
        types.push(new TypeRegistration('Microsoft.OnTypingActivity', new DefaultTypeBuilder(OnTypingActivity)));
        types.push(new TypeRegistration('Microsoft.OnUnknownIntent', new DefaultTypeBuilder(OnUnknownIntent)));

        // Recognizers
        types.push(new TypeRegistration('Microsoft.RegexRecognizer', new CustomTypeBuilder((config) => {
            let recognizer = new RegExpRecognizer();

            if (config && config['intents']) {
                // The declarative format models intents and expressions as a dictionary
                const intents: { [intent: string]: string } = <{ [intent: string]: string }>config['intents'];

                if (intents) {
                    for (const [key, value] of Object.entries(intents)) {
                        recognizer.addIntent(key, new RegExp(value, 'i'));
                    }
                }
            }

            return recognizer;
        })));

        return types;
    }
}