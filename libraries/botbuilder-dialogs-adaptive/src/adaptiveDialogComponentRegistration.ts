/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Choice, ListStyle, ChoiceFactoryOptions, FindChoicesOptions } from 'botbuilder-dialogs';
import { ComponentRegistration, DeclarativeType, ResourceExplorer } from 'botbuilder-dialogs-declarative';
import { AdaptiveDialog } from './adaptiveDialog';
import { BeginDialog, BeginSkill, BreakLoop, CancelAllDialogs, CancelDialog, ContinueLoop, DeleteActivity, DeleteProperties, DeleteProperty, EditActions, EditArray, EmitEvent, EndDialog, EndTurn, ForEach, ForEachPage, GetActivityMembers, GetConversationMembers, GotoAction, IfCondition, LogAction, RepeatDialog, ReplaceDialog, SendActivity, SetProperties, SetProperty, SignOutUser, SwitchCondition, TraceActivity, UpdateActivity, ArrayChangeType, PropertyAssignmentConverter, HttpRequest, HttpHeadersConverter, ResponsesTypes, DynamicBeginDialog } from './actions';
import { Ask, AttachmentInput, ChoiceInput, ConfirmInput, DateTimeInput, NumberInput, OAuthInput, TextInput, AttachmentOutputFormat, ChoiceOutputFormat } from './input';
import { OnActivity, OnAssignEntity, OnBeginDialog, OnCancelDialog, OnChooseEntity, OnChooseIntent, OnChooseProperty, OnCondition, OnConversationUpdateActivity, OnDialogEvent, OnEndOfActions, OnEndOfConversationActivity, OnError, OnEventActivity, OnHandoffActivity, OnIntent, OnInvokeActivity, OnMessageActivity, OnMessageDeleteActivity, OnMessageReactionActivity, OnMessageUpdateActivity, OnQnAMatch, OnRepromptDialog, OnTypingActivity, OnUnknownIntent } from './conditions';
import { CrossTrainedRecognizerSet, MultiLanguageRecognizer, RecognizerSet, RegexRecognizer, IntentPatternConverter } from './recognizers';
import { AgeEntityRecognizer, ConfirmationEntityRecognizer, CurrencyEntityRecognizer, DateTimeEntityRecognizer, DimensionEntityRecognizer, EmailEntityRecognizer, GuidEntityRecognizer, HashtagEntityRecognizer, IpEntityRecognizer, MentionEntityRecognizer, NumberEntityRecognizer, OrdinalEntityRecognizer, PercentageEntityRecognizer, PhoneNumberEntityRecognizer, RegexEntityRecognizer, TemperatureEntityRecognizer, UrlEntityRecognizer } from './recognizers/entityRecognizers';
import { ObjectExpressionConverter, BoolExpressionConverter, StringExpressionConverter, EnumExpressionConverter, ValueExpressionConverter, NumberExpressionConverter, ExpressionConverter, ArrayExpressionConverter, IntExpressionConverter } from 'adaptive-expressions';
import { DialogExpressionConverter, TextTemplateConverter, ActivityTemplateConverter, RecognizerConverter, LanguageGeneratorConverter, MultiLanguageRecognizerConverter } from './converters';
import { ActionChangeType } from './actionChangeType';
import { CaseConverter } from './actions/case';
import { TemplateEngineLanguageGenerator, ResourceMultiLanguageGenerator } from './generators';
import { ConditionalSelector, FirstSelector, RandomSelector, TrueSelector } from './selectors';
import { LanguagePolicyConverter } from './languagePolicy';
import { CustomDialogLoader } from './customDialogLoader';

/**
 * Declarative components in adaptive dialogs.
 */
export class AdaptiveDialogComponentRegistration implements ComponentRegistration {
    public getDeclarativeTypes(resourceExplorer: ResourceExplorer): DeclarativeType[] {
        const baseInvokeDialogConverters = {
            'options': new ObjectExpressionConverter<object>(),
            'dialog': new DialogExpressionConverter(resourceExplorer),
            'activityProcessed': new BoolExpressionConverter()
        };
        const OnConditionConverters = {
            'condition': new BoolExpressionConverter(),
            'priority': new IntExpressionConverter()
        };
        const inputDialogConverters = {
            'alwaysPrompt': new BoolExpressionConverter(),
            'allowInterruptions': new BoolExpressionConverter(),
            'property': new StringExpressionConverter(),
            'value': new ValueExpressionConverter(),
            'prompt': new ActivityTemplateConverter(),
            'unrecognizedPrompt': new ActivityTemplateConverter(),
            'invalidPrompt': new ActivityTemplateConverter(),
            'defaultValueResponse': new ActivityTemplateConverter(),
            'maxTurnCount': new IntExpressionConverter(),
            'defaultValue': new ValueExpressionConverter(),
            'disabled': new BoolExpressionConverter()
        };
        const typeRegistrations: DeclarativeType[] = [{
            kind: 'Microsoft.AdaptiveDialog',
            factory: AdaptiveDialog,
            converters: {
                'generator': new LanguageGeneratorConverter(),
                'recognizer': new RecognizerConverter(resourceExplorer)
            }
        }, {
            kind: 'Microsoft.BeginSkill',
            factory: BeginSkill,
            converters: {
                'disabled': new BoolExpressionConverter(),
                'activityProcessed': new BoolExpressionConverter(),
                'resultProperty': new StringExpressionConverter(),
                'botId': new StringExpressionConverter(),
                'skillHostEndpoint': new StringExpressionConverter(),
                'skillAppId': new StringExpressionConverter(),
                'skillEndpoint': new StringExpressionConverter(),
                'activity': new ActivityTemplateConverter(),
                'connectionName': new StringExpressionConverter()
            }
        }, {
            kind: 'Microsoft.BeginDialog',
            factory: BeginDialog,
            converters: Object.assign(baseInvokeDialogConverters, {
                'resultProperty': new StringExpressionConverter(),
                'disabled': new BoolExpressionConverter()
            })
        }, {
            kind: 'Microsoft.BreakLoop',
            factory: BreakLoop,
            converters: {
                'disabled': new BoolExpressionConverter()
            }
        }, {
            kind: 'Microsoft.CancelAllDialogs',
            factory: CancelAllDialogs,
            converters: {
                'eventName': new StringExpressionConverter(),
                'eventValue': new ValueExpressionConverter(),
                'disabled': new BoolExpressionConverter(),
                'activityProcessed': new BoolExpressionConverter()
            }
        }, {
            kind: 'Microsoft.CancelDialog',
            factory: CancelDialog,
            converters: {
                'eventName': new StringExpressionConverter(),
                'eventValue': new ValueExpressionConverter(),
                'disabled': new BoolExpressionConverter(),
                'activityProcessed': new BoolExpressionConverter()
            }
        }, {
            kind: 'Microsoft.ContinueLoop',
            factory: ContinueLoop,
            converters: {
                'disabled': new BoolExpressionConverter()
            }
        }, {
            kind: 'Microsoft.DeleteActivity',
            factory: DeleteActivity,
            converters: {
                'activityId': new StringExpressionConverter(),
                'disabled': new BoolExpressionConverter()
            }
        }, {
            kind: 'Microsoft.DeleteProperties',
            factory: DeleteProperties,
            converters: {
                'properties': new StringExpressionConverter(),
                'disabled': new BoolExpressionConverter()
            }
        }, {
            kind: 'Microsoft.DeleteProperty',
            factory: DeleteProperty,
            converters: {
                'property': new StringExpressionConverter(),
                'disabled': new BoolExpressionConverter()
            }
        }, {
            kind: 'Microsoft.EditActions',
            factory: EditActions,
            converters: {
                'changeType': new EnumExpressionConverter(ActionChangeType),
                'disabled': new BoolExpressionConverter()
            }
        }, {
            kind: 'Microsoft.EditArray',
            factory: EditArray,
            converters: {
                'changeType': new EnumExpressionConverter(ArrayChangeType),
                'itemsProperty': new StringExpressionConverter(),
                'resultProperty': new StringExpressionConverter(),
                'value': new ValueExpressionConverter(),
                'disabled': new BoolExpressionConverter()
            }
        }, {
            kind: 'Microsoft.EmitEvent',
            factory: EmitEvent,
            converters: {
                'eventName': new StringExpressionConverter(),
                'eventValue': new ValueExpressionConverter(),
                'bubbleEvent': new BoolExpressionConverter(),
                'disabled': new BoolExpressionConverter()
            }
        }, {
            kind: 'Microsoft.EndDialog',
            factory: EndDialog,
            converters: {
                'value': new ValueExpressionConverter(),
                'disabled': new BoolExpressionConverter()
            }
        }, {
            kind: 'Microsoft.EndTurn',
            factory: EndTurn,
            converters: {
                'disabled': new BoolExpressionConverter()
            }
        }, {
            kind: 'Microsoft.Foreach',
            factory: ForEach,
            converters: {
                'itemsProperty': new StringExpressionConverter(),
                'index': new StringExpressionConverter(),
                'value': new StringExpressionConverter(),
                'disabled': new BoolExpressionConverter()
            }
        }, {
            kind: 'Microsoft.ForeachPage',
            factory: ForEachPage,
            converters: {
                'itemsProperty': new StringExpressionConverter(),
                'page': new StringExpressionConverter(),
                'pageIndex': new StringExpressionConverter(),
                'pageSize': new IntExpressionConverter(),
                'disabled': new BoolExpressionConverter()
            }
        }, {
            kind: 'Microsoft.GetActivityMembers',
            factory: GetActivityMembers,
            converters: {
                'activityId': new StringExpressionConverter(),
                'property': new StringExpressionConverter(),
                'disabled': new BoolExpressionConverter()
            }
        }, {
            kind: 'Microsoft.GetConversationMembers',
            factory: GetConversationMembers,
            converters: {
                'property': new StringExpressionConverter(),
                'disabled': new BoolExpressionConverter()
            }
        }, {
            kind: 'Microsoft.GotoAction',
            factory: GotoAction,
            converters: {
                'actionId': new StringExpressionConverter(),
                'disabled': new BoolExpressionConverter()
            }
        }, {
            kind: 'Microsoft.HttpRequest',
            factory: HttpRequest,
            converters: {
                'contentType': new StringExpressionConverter(),
                'url': new StringExpressionConverter(),
                'headers': new HttpHeadersConverter(),
                'body': new ValueExpressionConverter(),
                'responseType': new EnumExpressionConverter(ResponsesTypes),
                'resultProperty': new StringExpressionConverter(),
                'disabled': new BoolExpressionConverter()
            }
        }, {
            kind: 'Microsoft.IfCondition',
            factory: IfCondition,
            converters: {
                'condition': new BoolExpressionConverter(),
                'disabled': new BoolExpressionConverter()
            }
        }, {
            kind: 'Microsoft.LogAction',
            factory: LogAction,
            converters: {
                'text': new TextTemplateConverter(),
                'traceActivity': new BoolExpressionConverter(),
                'label': new StringExpressionConverter(),
                'disabled': new BoolExpressionConverter()
            }
        }, {
            kind: 'Microsoft.RepeatDialog',
            factory: RepeatDialog,
            converters: Object.assign(baseInvokeDialogConverters, {
                'disabled': new BoolExpressionConverter(),
                'allowLoop': new BoolExpressionConverter()
            })
        }, {
            kind: 'Microsoft.ReplaceDialog',
            factory: ReplaceDialog,
            converters: Object.assign(baseInvokeDialogConverters, {
                'disabled': new BoolExpressionConverter()
            })
        }, {
            kind: 'Microsoft.SendActivity',
            factory: SendActivity,
            converters: {
                'activity': new ActivityTemplateConverter(),
                'disabled': new BoolExpressionConverter()
            }
        }, {
            kind: 'Microsoft.SetProperties',
            factory: SetProperties,
            converters: {
                'assignments': new PropertyAssignmentConverter(),
                'disabled': new BoolExpressionConverter()
            }
        }, {
            kind: 'Microsoft.SetProperty',
            factory: SetProperty,
            converters: {
                'property': new StringExpressionConverter(),
                'value': new ValueExpressionConverter(),
                'disabled': new BoolExpressionConverter()
            }
        }, {
            kind: 'Microsoft.SignOutUser',
            factory: SignOutUser,
            converters: {
                'userId': new StringExpressionConverter(),
                'connectionName': new StringExpressionConverter(),
                'disabled': new BoolExpressionConverter()
            }
        }, {
            kind: 'Microsoft.SwitchCondition',
            factory: SwitchCondition,
            converters: {
                'condition': new ExpressionConverter(),
                'cases': new CaseConverter(resourceExplorer),
                'disabled': new BoolExpressionConverter()
            }
        }, {
            kind: 'Microsoft.TraceActivity',
            factory: TraceActivity,
            converters: {
                'name': new StringExpressionConverter(),
                'valueType': new StringExpressionConverter(),
                'value': new ValueExpressionConverter(),
                'label': new StringExpressionConverter(),
                'disabled': new BoolExpressionConverter()
            }
        }, {
            kind: 'Microsoft.UpdateActivity',
            factory: UpdateActivity,
            converters: {
                'activity': new ActivityTemplateConverter(),
                'activityId': new StringExpressionConverter(),
                'disabled': new BoolExpressionConverter()
            }
        }, {
            kind: 'Microsoft.OnActivity',
            factory: OnActivity,
            converters: OnConditionConverters
        }, {
            kind: 'Microsoft.OnAssignEntity',
            factory: OnAssignEntity,
            converters: OnConditionConverters
        }, {
            kind: 'Microsoft.OnBeginDialog',
            factory: OnBeginDialog,
            converters: OnConditionConverters
        }, {
            kind: 'Microsoft.OnCancelDialog',
            factory: OnCancelDialog,
            converters: OnConditionConverters
        }, {
            kind: 'Microsoft.OnChooseEntity',
            factory: OnChooseEntity,
            converters: OnConditionConverters
        }, {
            kind: 'Microsoft.OnChooseIntent',
            factory: OnChooseIntent,
            converters: OnConditionConverters
        }, {
            kind: 'Microsoft.OnChooseProperty',
            factory: OnChooseProperty,
            converters: OnConditionConverters
        }, {
            kind: 'Microsoft.OnCondition',
            factory: OnCondition,
            converters: OnConditionConverters
        }, {
            kind: 'Microsoft.OnConversationUpdateActivity',
            factory: OnConversationUpdateActivity,
            converters: OnConditionConverters
        }, {
            kind: 'Microsoft.OnDialogEvent',
            factory: OnDialogEvent,
            converters: OnConditionConverters
        }, {
            kind: 'Microsoft.OnEndOfActions',
            factory: OnEndOfActions,
            converters: OnConditionConverters
        }, {
            kind: 'Microsoft.OnEndOfConversationActivity',
            factory: OnEndOfConversationActivity,
            converters: OnConditionConverters
        }, {
            kind: 'Microsoft.OnError',
            factory: OnError,
            converters: OnConditionConverters
        }, {
            kind: 'Microsoft.OnEventActivity',
            factory: OnEventActivity,
            converters: OnConditionConverters
        }, {
            kind: 'Microsoft.OnHandoffActivity',
            factory: OnHandoffActivity,
            converters: OnConditionConverters
        }, {
            kind: 'Microsoft.OnIntent',
            factory: OnIntent,
            converters: OnConditionConverters
        }, {
            kind: 'Microsoft.OnInvokeActivity',
            factory: OnInvokeActivity,
            converters: OnConditionConverters
        }, {
            kind: 'Microsoft.OnMessageActivity',
            factory: OnMessageActivity,
            converters: OnConditionConverters
        }, {
            kind: 'Microsoft.OnMessageDeleteActivity',
            factory: OnMessageDeleteActivity,
            converters: OnConditionConverters
        }, {
            kind: 'Microsoft.OnMessageReactionActivity',
            factory: OnMessageReactionActivity,
            converters: OnConditionConverters
        }, {
            kind: 'Microsoft.OnMessageUpdateActivity',
            factory: OnMessageUpdateActivity,
            converters: OnConditionConverters
        }, {
            kind: 'Microsoft.OnQnAMatch',
            factory: OnQnAMatch,
            converters: OnConditionConverters
        }, {
            kind: 'Microsoft.OnRepromptDialog',
            factory: OnRepromptDialog,
            converters: OnConditionConverters
        }, {
            kind: 'Microsoft.OnTypingActivity',
            factory: OnTypingActivity,
            converters: OnConditionConverters
        }, {
            kind: 'Microsoft.OnUnknownIntent',
            factory: OnUnknownIntent,
            converters: OnConditionConverters
        }, {
            kind: 'Microsoft.Ask',
            factory: Ask,
            converters: {
                'expectedProperties': new ArrayExpressionConverter<string>(),
                'defaultOperation': new StringExpressionConverter(),
                'activity': new ActivityTemplateConverter(),
                'disabled': new BoolExpressionConverter()
            }
        }, {
            kind: 'Microsoft.AttachmentInput',
            factory: AttachmentInput,
            converters: Object.assign(inputDialogConverters, {
                'outputFormat': new EnumExpressionConverter(AttachmentOutputFormat)
            })
        }, {
            kind: 'Microsoft.ChoiceInput',
            factory: ChoiceInput,
            converters: Object.assign(inputDialogConverters, {
                'choices': new ArrayExpressionConverter<Choice>(),
                'style': new EnumExpressionConverter(ListStyle),
                'defaultLocale': new StringExpressionConverter(),
                'outputFormat': new EnumExpressionConverter(ChoiceOutputFormat),
                'choiceOptions': new ObjectExpressionConverter<ChoiceFactoryOptions>(),
                'recognizerOptions': new ObjectExpressionConverter<FindChoicesOptions>()
            })
        }, {
            kind: 'Microsoft.ConfirmInput',
            factory: ConfirmInput,
            converters: Object.assign(inputDialogConverters, {
                'defaultLocale': new StringExpressionConverter(),
                'style': new EnumExpressionConverter(ListStyle),
                'choiceOptions': new ObjectExpressionConverter<ChoiceFactoryOptions>(),
                'outputFormat': new StringExpressionConverter()
            })
        }, {
            kind: 'Microsoft.DateTimeInput',
            factory: DateTimeInput,
            converters: Object.assign(inputDialogConverters, {
                'defaultLocale': new StringExpressionConverter(),
                'outputFormat': new StringExpressionConverter()
            })
        }, {
            kind: 'Microsoft.NumberInput',
            factory: NumberInput,
            converters: Object.assign(inputDialogConverters, {
                'defaultLocale': new StringExpressionConverter(),
                'outputFormat': new NumberExpressionConverter()
            })
        }, {
            kind: 'Microsoft.OAuthInput',
            factory: OAuthInput,
            converters: Object.assign(inputDialogConverters, {
                'connectionName': new StringExpressionConverter(),
                'title': new StringExpressionConverter(),
                'text': new StringExpressionConverter(),
                'timeout': new IntExpressionConverter()
            })
        }, {
            kind: 'Microsoft.TextInput',
            factory: TextInput,
            converters: Object.assign(inputDialogConverters, {
                'outputFormat': new StringExpressionConverter()
            })
        }, {
            kind: 'Microsoft.CrossTrainedRecognizerSet',
            factory: CrossTrainedRecognizerSet,
            converters: {
                'recognizers': new RecognizerConverter(resourceExplorer)
            }
        }, {
            kind: 'Microsoft.MultiLanguageRecognizer',
            factory: MultiLanguageRecognizer,
            converters: {
                'languagePolicy': new LanguagePolicyConverter(),
                'recognizers': new MultiLanguageRecognizerConverter(resourceExplorer)
            }
        }, {
            kind: 'Microsoft.RecognizerSet',
            factory: RecognizerSet,
            converters: {
                'recognizers': new RecognizerConverter(resourceExplorer)
            }
        }, {
            kind: 'Microsoft.RegexRecognizer',
            factory: RegexRecognizer,
            converters: {
                'intents': new IntentPatternConverter()
            }
        }, {
            kind: 'Microsoft.AgeEntityRecognizer',
            factory: AgeEntityRecognizer
        }, {
            kind: 'Microsoft.ConfirmationEntityRecognizer',
            factory: ConfirmationEntityRecognizer
        }, {
            kind: 'Microsoft.CurrencyEntityRecognizer',
            factory: CurrencyEntityRecognizer
        }, {
            kind: 'Microsoft.DateTimeEntityRecognizer',
            factory: DateTimeEntityRecognizer
        }, {
            kind: 'Microsoft.DimensionEntityRecognizer',
            factory: DimensionEntityRecognizer
        }, {
            kind: 'Microsoft.EmailEntityRecognizer',
            factory: EmailEntityRecognizer
        }, {
            kind: 'Microsoft.GuidEntityRecognizer',
            factory: GuidEntityRecognizer
        }, {
            kind: 'Microsoft.HashtagEntityRecognizer',
            factory: HashtagEntityRecognizer
        }, {
            kind: 'Microsoft.IpEntityRecognizer',
            factory: IpEntityRecognizer
        }, {
            kind: 'Microsoft.MentionEntityRecognizer',
            factory: MentionEntityRecognizer
        }, {
            kind: 'Microsoft.NumberEntityRecognizer',
            factory: NumberEntityRecognizer
        }, {
            kind: 'Microsoft.OrdinalEntityRecognizer',
            factory: OrdinalEntityRecognizer
        }, {
            kind: 'Microsoft.PercentageEntityRecognizer',
            factory: PercentageEntityRecognizer
        }, {
            kind: 'Microsoft.PhoneNumberEntityRecognizer',
            factory: PhoneNumberEntityRecognizer
        }, {
            kind: 'Microsoft.RegexEntityRecognizer',
            factory: RegexEntityRecognizer
        }, {
            kind: 'Microsoft.TemperatureEntityRecognizer',
            factory: TemperatureEntityRecognizer
        }, {
            kind: 'Microsoft.UrlEntityRecognizer',
            factory: UrlEntityRecognizer
        }, {
            kind: 'Microsoft.TemplateEngineLanguageGenerator',
            factory: TemplateEngineLanguageGenerator
        }, {
            kind: 'Microsoft.ResourceMultiLanguageGenerator',
            factory: ResourceMultiLanguageGenerator,
            converters: {
                'languagePolicy': new LanguagePolicyConverter()
            }
        }, {
            kind: 'Microsoft.ConditionalSelector',
            factory: ConditionalSelector,
            converters: {
                'condition': new BoolExpressionConverter()
            }
        }, {
            kind: 'Microsoft.FirstSelector',
            factory: FirstSelector
        }, {
            kind: 'Microsoft.RandomSelector',
            factory: RandomSelector
        }, {
            kind: 'Microsoft.TrueSelector',
            factory: TrueSelector
        }];

        const schemas = resourceExplorer.getResources('.schema');
        for (const schema of schemas) {
            const resourceId = schema.id.replace(/.schema$/, '');
            if (resourceId.endsWith('.dialog')) {
                typeRegistrations.push({
                    kind: resourceId,
                    factory: DynamicBeginDialog,
                    loader: new CustomDialogLoader(resourceExplorer),
                    converters: {
                        'options': new ObjectExpressionConverter<object>(),
                        'dialog': new DialogExpressionConverter(resourceExplorer),
                        'activityProcessed': new BoolExpressionConverter(),
                        'resultProperty': new StringExpressionConverter(),
                        'disabled': new BoolExpressionConverter()
                    }
                });
            }
        }
        return typeRegistrations;
    }
}