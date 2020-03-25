/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ComponentRegistration, ResourceExplorer, TypeBuilder, BuilderRegistration } from 'botbuilder-dialogs-declarative';
import { Choice, ListStyle, ChoiceFactoryOptions, FindChoicesOptions } from 'botbuilder-dialogs';
import { AdaptiveTypeBuilder } from './adaptiveTypeBuilder';
import { AdaptiveDialog } from './adaptiveDialog';
import { BeginDialog, BreakLoop, CancelAllDialogs, ContinueLoop, DeleteActivity, DeleteProperties, DeleteProperty, EditActions, EditArray, EmitEvent, EndDialog, EndTurn, ForEach, ForEachPage, GetActivityMembers, GetConversationMembers, GotoAction, IfCondition, LogAction, RepeatDialog, ReplaceDialog, SendActivity, SetProperties, SetProperty, SignOutUser, SwitchCondition, TraceActivity, UpdateActivity, ArrayChangeType, PropertyAssignmentConverter } from './actions';
import { AttachmentInput, ChoiceInput, ConfirmInput, DateTimeInput, NumberInput, OAuthInput, TextInput, AttachmentOutputFormat, ChoiceOutputFormat } from './input';
import { OnActivity, OnAssignEntity, OnBeginDialog, OnCancelDialog, OnChooseEntity, OnChooseIntent, OnChooseProperty, OnClearProperty, OnCondition, OnConversationUpdateActivity, OnCustomEvent, OnDialogEvent, OnEndOfActions, OnEndOfConversationActivity, OnError, OnEventActivity, OnHandoffActivity, OnIntent, OnInvokeActivity, OnMessageActivity, OnMessageDeleteActivity, OnMessageReactionActivity, OnMessageUpdateActivity, OnRepromptDialog, OnTypingActivity, OnUnknownIntent } from './conditions';
import { CrossTrainedRecognizerSet, MultiLanguageRecognizer, RecognizerSet, ValueRecognizer, RegexRecognizer, IntentPatternConverter } from './recognizers';
import { AgeEntityRecognizer, ConfirmationEntityRecognizer, CurrencyEntityRecognizer, DateTimeEntityRecognizer, DimensionEntityRecognizer, EmailEntityRecognizer, GuidEntityRecognizer, HashtagEntityRecognizer, IpEntityRecognizer, MentionEntityRecognizer, NumberEntityRecognizer, OrdinalEntityRecognizer, PercentageEntityRecognizer, PhoneNumberEntityRecognizer, RegexEntityRecognizer, TemperatureEntityRecognizer, UrlEntityRecognizer } from './recognizers/entityRecognizers';
import { ObjectExpressionConverter, DialogExpressionConverter, BoolExpressionConverter, StringExpressionConverter, EnumExpressionConverter, ValueExpressionConverter, NumberExpressionConverter, TextTemplateConverter, ActivityTemplateConverter, ExpressionConverter, ArrayExpressionConverter } from './converters';
import { ActionChangeType } from './sequenceContext';
import { CaseConverter } from './actions/case';

export class AdaptiveDialogComponentRegistration implements ComponentRegistration {
    private _resourceExplorer: ResourceExplorer;
    private _builderRegistrations: BuilderRegistration[] = [];

    public constructor(resourceExplorer: ResourceExplorer) {
        this._resourceExplorer = resourceExplorer;

        this.registerBuilder('Microsoft.AdaptiveDialog', new AdaptiveTypeBuilder(AdaptiveDialog, this._resourceExplorer, {}));
        this.registerActions();
        this.registerConditions();
        this.registerInputs();
        this.registerRecognizers();
    }

    public getTypeBuilders(): BuilderRegistration[] {
        return this._builderRegistrations;
    }

    private registerBuilder(name: string, builder: TypeBuilder): void {
        this._builderRegistrations.push(
            new BuilderRegistration(name, builder)
        );
    }

    private registerActions(): void {
        const baseInvokeDialogConverters = {
            'options': new ObjectExpressionConverter<object>(),
            'dialog': new DialogExpressionConverter(this._resourceExplorer),
            'activityProcessed': new BoolExpressionConverter()
        };
        this.registerBuilder('Microsoft.BeginDialog', new AdaptiveTypeBuilder(BeginDialog, this._resourceExplorer,
            Object.assign(baseInvokeDialogConverters, {
                'resultProperty': new StringExpressionConverter(),
                'disabled': new BoolExpressionConverter()
            })));
        this.registerBuilder('Microsoft.BreakLoop', new AdaptiveTypeBuilder(BreakLoop, this._resourceExplorer, {
            'disabled': new BoolExpressionConverter()
        }));
        this.registerBuilder('Microsoft.CancelAllDialogs', new AdaptiveTypeBuilder(CancelAllDialogs, this._resourceExplorer, {
            'eventName': new StringExpressionConverter(),
            'eventValue': new StringExpressionConverter(),
            'disabled': new BoolExpressionConverter()
        }));
        this.registerBuilder('Microsoft.ContinueLoop', new AdaptiveTypeBuilder(ContinueLoop, this._resourceExplorer, {
            'disabled': new BoolExpressionConverter()
        }));
        this.registerBuilder('Microsoft.DeleteActivity', new AdaptiveTypeBuilder(DeleteActivity, this._resourceExplorer, {
            'activityId': new StringExpressionConverter(),
            'disabled': new BoolExpressionConverter()
        }));
        this.registerBuilder('Microsoft.DeleteProperties', new AdaptiveTypeBuilder(DeleteProperties, this._resourceExplorer, {
            'properties': new StringExpressionConverter(),
            'disabled': new BoolExpressionConverter()
        }));
        this.registerBuilder('Microsoft.DeleteProperty', new AdaptiveTypeBuilder(DeleteProperty, this._resourceExplorer, {
            'property': new StringExpressionConverter(),
            'disabled': new BoolExpressionConverter()
        }));
        this.registerBuilder('Microsoft.EditActions', new AdaptiveTypeBuilder(EditActions, this._resourceExplorer, {
            'changeType': new EnumExpressionConverter(ActionChangeType),
            'disabled': new BoolExpressionConverter()
        }));
        this.registerBuilder('Microsoft.EditArray', new AdaptiveTypeBuilder(EditArray, this._resourceExplorer, {
            'changeType': new EnumExpressionConverter(ArrayChangeType),
            'itemsProperty': new StringExpressionConverter(),
            'resultProperty': new StringExpressionConverter(),
            'value': new ValueExpressionConverter(),
            'disabled': new BoolExpressionConverter()
        }));
        this.registerBuilder('Microsoft.EmitEvent', new AdaptiveTypeBuilder(EmitEvent, this._resourceExplorer, {
            'eventName': new StringExpressionConverter(),
            'eventValue': new ValueExpressionConverter(),
            'bubbleEvent': new BoolExpressionConverter(),
            'disabled': new BoolExpressionConverter()
        }));
        this.registerBuilder('Microsoft.EndDialog', new AdaptiveTypeBuilder(EndDialog, this._resourceExplorer, {
            'value': new ValueExpressionConverter(),
            'disabled': new BoolExpressionConverter()
        }));
        this.registerBuilder('Microsoft.EndTurn', new AdaptiveTypeBuilder(EndTurn, this._resourceExplorer, {
            'disabled': new BoolExpressionConverter()
        }));
        this.registerBuilder('Microsoft.Foreach', new AdaptiveTypeBuilder(ForEach, this._resourceExplorer, {
            'itemsProperty': new StringExpressionConverter(),
            'disabled': new BoolExpressionConverter()
        }));
        this.registerBuilder('Microsoft.ForeachPage', new AdaptiveTypeBuilder(ForEachPage, this._resourceExplorer, {
            'itemsProperty': new StringExpressionConverter(),
            'pageSize': new NumberExpressionConverter(),
            'disabled': new BoolExpressionConverter()
        }));
        this.registerBuilder('Microsoft.GetActivityMembers', new AdaptiveTypeBuilder(GetActivityMembers, this._resourceExplorer, {
            'activityId': new StringExpressionConverter(),
            'property': new StringExpressionConverter(),
            'disabled': new BoolExpressionConverter()
        }));
        this.registerBuilder('Microsoft.GetConversationMembers', new AdaptiveTypeBuilder(GetConversationMembers, this._resourceExplorer, {
            'property': new StringExpressionConverter(),
            'disabled': new BoolExpressionConverter()
        }));
        this.registerBuilder('Microsoft.GotoAction', new AdaptiveTypeBuilder(GotoAction, this._resourceExplorer, {
            'actionId': new StringExpressionConverter(),
            'disabled': new BoolExpressionConverter()
        }));
        this.registerBuilder('Microsoft.IfCondition', new AdaptiveTypeBuilder(IfCondition, this._resourceExplorer, {
            'condition': new BoolExpressionConverter(),
            'disabled': new BoolExpressionConverter()
        }));
        this.registerBuilder('Microsoft.LogAction', new AdaptiveTypeBuilder(LogAction, this._resourceExplorer, {
            'text': new TextTemplateConverter(),
            'traceActivity': new BoolExpressionConverter(),
            'label': new StringExpressionConverter(),
            'disabled': new BoolExpressionConverter()
        }));
        this.registerBuilder('Microsoft.RepeatDialog', new AdaptiveTypeBuilder(RepeatDialog, this._resourceExplorer,
            Object.assign(baseInvokeDialogConverters, {
                'disabled': new BoolExpressionConverter()
            })));
        this.registerBuilder('Microsoft.ReplaceDialog', new AdaptiveTypeBuilder(ReplaceDialog, this._resourceExplorer,
            Object.assign(baseInvokeDialogConverters, {
                'disabled': new BoolExpressionConverter()
            })));
        this.registerBuilder('Microsoft.SendActivity', new AdaptiveTypeBuilder(SendActivity, this._resourceExplorer, {
            'activity': new ActivityTemplateConverter(),
            'disabled': new BoolExpressionConverter()
        }));
        this.registerBuilder('Microsoft.SetProperties', new AdaptiveTypeBuilder(SetProperties, this._resourceExplorer, {
            'assignments': new PropertyAssignmentConverter(),
            'disabled': new BoolExpressionConverter()
        }));
        this.registerBuilder('Microsoft.SetProperty', new AdaptiveTypeBuilder(SetProperty, this._resourceExplorer, {
            'property': new StringExpressionConverter(),
            'value': new ValueExpressionConverter(),
            'disabled': new BoolExpressionConverter()
        }));
        this.registerBuilder('Microsoft.SignOutUser', new AdaptiveTypeBuilder(SignOutUser, this._resourceExplorer, {
            'userId': new StringExpressionConverter(),
            'connectionName': new StringExpressionConverter(),
            'disabled': new BoolExpressionConverter()
        }));
        this.registerBuilder('Microsoft.SwitchCondition', new AdaptiveTypeBuilder(SwitchCondition, this._resourceExplorer, {
            'condition': new ExpressionConverter(),
            'cases': new CaseConverter(this._resourceExplorer),
            'disabled': new BoolExpressionConverter()
        }));
        this.registerBuilder('Microsoft.TraceActivity', new AdaptiveTypeBuilder(TraceActivity, this._resourceExplorer, {
            'name': new StringExpressionConverter(),
            'valueType': new StringExpressionConverter(),
            'value': new ValueExpressionConverter(),
            'label': new StringExpressionConverter(),
            'disabled': new BoolExpressionConverter()
        }));
        this.registerBuilder('Microsoft.UpdateActivity', new AdaptiveTypeBuilder(UpdateActivity, this._resourceExplorer, {
            'activity': new ActivityTemplateConverter(),
            'activityId': new StringExpressionConverter(),
            'disabled': new BoolExpressionConverter()
        }));
    }

    private registerConditions(): void {
        const OnConditionConverters = {
            'condition': new BoolExpressionConverter()
        };
        this.registerBuilder('Microsoft.OnActivity', new AdaptiveTypeBuilder(OnActivity, this._resourceExplorer, OnConditionConverters));
        this.registerBuilder('Microsoft.OnAssignEntity', new AdaptiveTypeBuilder(OnAssignEntity, this._resourceExplorer, OnConditionConverters));
        this.registerBuilder('Microsoft.OnBeginDialog', new AdaptiveTypeBuilder(OnBeginDialog, this._resourceExplorer, OnConditionConverters));
        this.registerBuilder('Microsoft.OnCancelDialog', new AdaptiveTypeBuilder(OnCancelDialog, this._resourceExplorer, OnConditionConverters));
        this.registerBuilder('Microsoft.OnChooseEntity', new AdaptiveTypeBuilder(OnChooseEntity, this._resourceExplorer, OnConditionConverters));
        this.registerBuilder('Microsoft.OnChooseIntent', new AdaptiveTypeBuilder(OnChooseIntent, this._resourceExplorer, OnConditionConverters));
        this.registerBuilder('Microsoft.OnChooseProperty', new AdaptiveTypeBuilder(OnChooseProperty, this._resourceExplorer, OnConditionConverters));
        this.registerBuilder('Microsoft.OnClearProperty', new AdaptiveTypeBuilder(OnClearProperty, this._resourceExplorer, OnConditionConverters));
        this.registerBuilder('Microsoft.OnCondition', new AdaptiveTypeBuilder(OnCondition, this._resourceExplorer, OnConditionConverters));
        this.registerBuilder('Microsoft.OnConversationUpdateActivity', new AdaptiveTypeBuilder(OnConversationUpdateActivity, this._resourceExplorer, OnConditionConverters));
        this.registerBuilder('Microsoft.OnCustomEvent', new AdaptiveTypeBuilder(OnCustomEvent, this._resourceExplorer, OnConditionConverters));
        this.registerBuilder('Microsoft.OnDialogEvent', new AdaptiveTypeBuilder(OnDialogEvent, this._resourceExplorer, OnConditionConverters));
        this.registerBuilder('Microsoft.OnEndOfActions', new AdaptiveTypeBuilder(OnEndOfActions, this._resourceExplorer, OnConditionConverters));
        this.registerBuilder('Microsoft.OnEndOfConversationActivity', new AdaptiveTypeBuilder(OnEndOfConversationActivity, this._resourceExplorer, OnConditionConverters));
        this.registerBuilder('Microsoft.OnError', new AdaptiveTypeBuilder(OnError, this._resourceExplorer, OnConditionConverters));
        this.registerBuilder('Microsoft.OnEventActivity', new AdaptiveTypeBuilder(OnEventActivity, this._resourceExplorer, OnConditionConverters));
        this.registerBuilder('Microsoft.OnHandoffActivity', new AdaptiveTypeBuilder(OnHandoffActivity, this._resourceExplorer, OnConditionConverters));
        this.registerBuilder('Microsoft.OnIntent', new AdaptiveTypeBuilder(OnIntent, this._resourceExplorer, OnConditionConverters));
        this.registerBuilder('Microsoft.OnInvokeActivity', new AdaptiveTypeBuilder(OnInvokeActivity, this._resourceExplorer, OnConditionConverters));
        this.registerBuilder('Microsoft.OnMessageActivity', new AdaptiveTypeBuilder(OnMessageActivity, this._resourceExplorer, OnConditionConverters));
        this.registerBuilder('Microsoft.OnMessageDeleteActivity', new AdaptiveTypeBuilder(OnMessageDeleteActivity, this._resourceExplorer, OnConditionConverters));
        this.registerBuilder('Microsoft.OnMessageReactionActivity', new AdaptiveTypeBuilder(OnMessageReactionActivity, this._resourceExplorer, OnConditionConverters));
        this.registerBuilder('Microsoft.OnMessageUpdateActivity', new AdaptiveTypeBuilder(OnMessageUpdateActivity, this._resourceExplorer, OnConditionConverters));
        this.registerBuilder('Microsoft.OnRepromptDialog', new AdaptiveTypeBuilder(OnRepromptDialog, this._resourceExplorer, OnConditionConverters));
        this.registerBuilder('Microsoft.OnTypingActivity', new AdaptiveTypeBuilder(OnTypingActivity, this._resourceExplorer, OnConditionConverters));
        this.registerBuilder('Microsoft.OnUnknownIntent', new AdaptiveTypeBuilder(OnUnknownIntent, this._resourceExplorer, OnConditionConverters));
    }

    private registerInputs(): void {
        const inputDialogConverters = {
            'alwaysPrompt': new BoolExpressionConverter(),
            'allowInterruptions': new BoolExpressionConverter(),
            'prompt': new ActivityTemplateConverter(),
            'unrecognizedPrompt': new ActivityTemplateConverter(),
            'invalidPrompt': new ActivityTemplateConverter(),
            'property': new StringExpressionConverter(),
            'value': new ValueExpressionConverter(),
            'defaultValue': new ValueExpressionConverter(),
            'maxTurnCount': new NumberExpressionConverter(),
            'disabled': new BoolExpressionConverter()
        };
        this.registerBuilder('Microsoft.AttachmentInput', new AdaptiveTypeBuilder(AttachmentInput, this._resourceExplorer,
            Object.assign(inputDialogConverters, {
                'outputFormat': new EnumExpressionConverter(AttachmentOutputFormat)
            })));
        this.registerBuilder('Microsoft.ChoiceInput', new AdaptiveTypeBuilder(ChoiceInput, this._resourceExplorer,
            Object.assign(inputDialogConverters, {
                'choices': new ArrayExpressionConverter<Choice>(),
                'style': new EnumExpressionConverter(ListStyle),
                'defaultLocale': new StringExpressionConverter(),
                'outputFormat': new EnumExpressionConverter(ChoiceOutputFormat),
                'choiceOptions': new ObjectExpressionConverter<ChoiceFactoryOptions>(),
                'recognizerOptions': new ObjectExpressionConverter<FindChoicesOptions>()
            })));
        this.registerBuilder('Microsoft.ConfirmInput', new AdaptiveTypeBuilder(ConfirmInput, this._resourceExplorer,
            Object.assign(inputDialogConverters, {
                'defaultLocale': new StringExpressionConverter(),
                'style': new EnumExpressionConverter(ListStyle),
                'choiceOptions': new ObjectExpressionConverter<ChoiceFactoryOptions>(),
                'outputFormat': new StringExpressionConverter()
            })));
        this.registerBuilder('Microsoft.DateTimeInput', new AdaptiveTypeBuilder(DateTimeInput, this._resourceExplorer,
            Object.assign(inputDialogConverters, {
                'defaultLocale': new StringExpressionConverter(),
                'outputFormat': new StringExpressionConverter()
            })));
        this.registerBuilder('Microsoft.NumberInput', new AdaptiveTypeBuilder(NumberInput, this._resourceExplorer,
            Object.assign(inputDialogConverters, {
                'defaultLocale': new StringExpressionConverter(),
                'outputFormat': new NumberExpressionConverter()
            })));
        this.registerBuilder('Microsoft.OAuthInput', new AdaptiveTypeBuilder(OAuthInput, this._resourceExplorer,
            Object.assign(inputDialogConverters, {
                'connectionName': new StringExpressionConverter(),
                'title': new StringExpressionConverter(),
                'text': new StringExpressionConverter(),
                'timeout': new NumberExpressionConverter()
            })));
        this.registerBuilder('Microsoft.TextInput', new AdaptiveTypeBuilder(TextInput, this._resourceExplorer,
            Object.assign(inputDialogConverters, {
                'outputFormat': new StringExpressionConverter()
            })));
    }

    private registerRecognizers(): void {
        this.registerBuilder('Microsoft.CrossTrainedRecognizerSet', new AdaptiveTypeBuilder(CrossTrainedRecognizerSet, this._resourceExplorer, {}));
        this.registerBuilder('Microsoft.MultiLanguageRecognizer', new AdaptiveTypeBuilder(MultiLanguageRecognizer, this._resourceExplorer, {}));
        this.registerBuilder('Microsoft.RecognizerSet', new AdaptiveTypeBuilder(RecognizerSet, this._resourceExplorer, {}));
        this.registerBuilder('Microsoft.ValueRecognizer', new AdaptiveTypeBuilder(ValueRecognizer, this._resourceExplorer, {}));
        this.registerBuilder('Microsoft.RegexRecognizer', new AdaptiveTypeBuilder(RegexRecognizer, this._resourceExplorer, {
            'intents': new IntentPatternConverter()
        }));
        this.registerBuilder('Microsoft.AgeEntityRecognizer', new AdaptiveTypeBuilder(AgeEntityRecognizer, this._resourceExplorer, {}));
        this.registerBuilder('Microsoft.ConfirmationEntityRecognizer', new AdaptiveTypeBuilder(ConfirmationEntityRecognizer, this._resourceExplorer, {}));
        this.registerBuilder('Microsoft.CurrencyEntityRecognizer', new AdaptiveTypeBuilder(CurrencyEntityRecognizer, this._resourceExplorer, {}));
        this.registerBuilder('Microsoft.DateTimeEntityRecognizer', new AdaptiveTypeBuilder(DateTimeEntityRecognizer, this._resourceExplorer, {}));
        this.registerBuilder('Microsoft.DimensionEntityRecognizer', new AdaptiveTypeBuilder(DimensionEntityRecognizer, this._resourceExplorer, {}));
        this.registerBuilder('Microsoft.EmailEntityRecognizer', new AdaptiveTypeBuilder(EmailEntityRecognizer, this._resourceExplorer, {}));
        this.registerBuilder('Microsoft.GuidEntityRecognizer', new AdaptiveTypeBuilder(GuidEntityRecognizer, this._resourceExplorer, {}));
        this.registerBuilder('Microsoft.HashtagEntityRecognizer', new AdaptiveTypeBuilder(HashtagEntityRecognizer, this._resourceExplorer, {}));
        this.registerBuilder('Microsoft.IpEntityRecognizer', new AdaptiveTypeBuilder(IpEntityRecognizer, this._resourceExplorer, {}));
        this.registerBuilder('Microsoft.MentionEntityRecognizer', new AdaptiveTypeBuilder(MentionEntityRecognizer, this._resourceExplorer, {}));
        this.registerBuilder('Microsoft.NumberEntityRecognizer', new AdaptiveTypeBuilder(NumberEntityRecognizer, this._resourceExplorer, {}));
        this.registerBuilder('Microsoft.OrdinalEntityRecognizer', new AdaptiveTypeBuilder(OrdinalEntityRecognizer, this._resourceExplorer, {}));
        this.registerBuilder('Microsoft.PercentageEntityRecognizer', new AdaptiveTypeBuilder(PercentageEntityRecognizer, this._resourceExplorer, {}));
        this.registerBuilder('Microsoft.PhoneNumberEntityRecognizer', new AdaptiveTypeBuilder(PhoneNumberEntityRecognizer, this._resourceExplorer, {}));
        this.registerBuilder('Microsoft.RegexEntityRecognizer', new AdaptiveTypeBuilder(RegexEntityRecognizer, this._resourceExplorer, {}));
        this.registerBuilder('Microsoft.TemperatureEntityRecognizer', new AdaptiveTypeBuilder(TemperatureEntityRecognizer, this._resourceExplorer, {}));
        this.registerBuilder('Microsoft.UrlEntityRecognizer', new AdaptiveTypeBuilder(UrlEntityRecognizer, this._resourceExplorer, {}));
    }
}