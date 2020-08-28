/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Choice, ListStyle, ChoiceFactoryOptions, FindChoicesOptions } from 'botbuilder-dialogs';
import { ComponentRegistration, ResourceExplorer, BuilderRegistration, DefaultTypeBuilder } from 'botbuilder-dialogs-declarative';
import { CustomDialogTypeBuilder } from './customDialogTypeBuilder';
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
import { LuisAdaptiveRecognizer } from './luis';
import { LanguagePolicyConverter } from './languagePolicy';

export class AdaptiveDialogComponentRegistration implements ComponentRegistration {
    public getBuilderRegistrations(resourceExplorer: ResourceExplorer): BuilderRegistration[] {
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
        const builderRegistrations: BuilderRegistration[] = [{
            kind: 'Microsoft.AdaptiveDialog',
            builder: new DefaultTypeBuilder(AdaptiveDialog, resourceExplorer, {
                'generator': new LanguageGeneratorConverter(),
                'recognizer': new RecognizerConverter(resourceExplorer)
            })
        }, {
            kind: 'Microsoft.BeginSkill',
            builder: new DefaultTypeBuilder(BeginSkill, resourceExplorer, {
                'disabled': new BoolExpressionConverter(),
                'activityProcessed': new BoolExpressionConverter(),
                'resultProperty': new StringExpressionConverter(),
                'botId': new StringExpressionConverter(),
                'skillHostEndpoint': new StringExpressionConverter(),
                'skillAppId': new StringExpressionConverter(),
                'skillEndpoint': new StringExpressionConverter(),
                'activity': new ActivityTemplateConverter(),
                'connectionName': new StringExpressionConverter()
            })
        }, {
            kind: 'Microsoft.BeginDialog',
            builder: new DefaultTypeBuilder(BeginDialog, resourceExplorer,
                Object.assign(baseInvokeDialogConverters, {
                    'resultProperty': new StringExpressionConverter(),
                    'disabled': new BoolExpressionConverter()
                }))
        }, {
            kind: 'Microsoft.BreakLoop',
            builder: new DefaultTypeBuilder(BreakLoop, resourceExplorer, {
                'disabled': new BoolExpressionConverter()
            })
        }, {
            kind: 'Microsoft.CancelAllDialogs',
            builder: new DefaultTypeBuilder(CancelAllDialogs, resourceExplorer, {
                'eventName': new StringExpressionConverter(),
                'eventValue': new ValueExpressionConverter(),
                'disabled': new BoolExpressionConverter(),
                'activityProcessed': new BoolExpressionConverter()
            })
        }, {
            kind: 'Microsoft.CancelDialog',
            builder: new DefaultTypeBuilder(CancelDialog, resourceExplorer, {
                'eventName': new StringExpressionConverter(),
                'eventValue': new ValueExpressionConverter(),
                'disabled': new BoolExpressionConverter(),
                'activityProcessed': new BoolExpressionConverter()
            })
        }, {
            kind: 'Microsoft.ContinueLoop',
            builder: new DefaultTypeBuilder(ContinueLoop, resourceExplorer, {
                'disabled': new BoolExpressionConverter()
            })
        }, {
            kind: 'Microsoft.DeleteActivity',
            builder: new DefaultTypeBuilder(DeleteActivity, resourceExplorer, {
                'activityId': new StringExpressionConverter(),
                'disabled': new BoolExpressionConverter()
            })
        }, {
            kind: 'Microsoft.DeleteProperties',
            builder: new DefaultTypeBuilder(DeleteProperties, resourceExplorer, {
                'properties': new StringExpressionConverter(),
                'disabled': new BoolExpressionConverter()
            })
        }, {
            kind: 'Microsoft.DeleteProperty',
            builder: new DefaultTypeBuilder(DeleteProperty, resourceExplorer, {
                'property': new StringExpressionConverter(),
                'disabled': new BoolExpressionConverter()
            })
        }, {
            kind: 'Microsoft.EditActions',
            builder: new DefaultTypeBuilder(EditActions, resourceExplorer, {
                'changeType': new EnumExpressionConverter(ActionChangeType),
                'disabled': new BoolExpressionConverter()
            })
        }, {
            kind: 'Microsoft.EditArray',
            builder: new DefaultTypeBuilder(EditArray, resourceExplorer, {
                'changeType': new EnumExpressionConverter(ArrayChangeType),
                'itemsProperty': new StringExpressionConverter(),
                'resultProperty': new StringExpressionConverter(),
                'value': new ValueExpressionConverter(),
                'disabled': new BoolExpressionConverter()
            })
        }, {
            kind: 'Microsoft.EmitEvent',
            builder: new DefaultTypeBuilder(EmitEvent, resourceExplorer, {
                'eventName': new StringExpressionConverter(),
                'eventValue': new ValueExpressionConverter(),
                'bubbleEvent': new BoolExpressionConverter(),
                'disabled': new BoolExpressionConverter()
            })
        }, {
            kind: 'Microsoft.EndDialog',
            builder: new DefaultTypeBuilder(EndDialog, resourceExplorer, {
                'value': new ValueExpressionConverter(),
                'disabled': new BoolExpressionConverter()
            })
        }, {
            kind: 'Microsoft.EndTurn',
            builder: new DefaultTypeBuilder(EndTurn, resourceExplorer, {
                'disabled': new BoolExpressionConverter()
            })
        }, {
            kind: 'Microsoft.Foreach',
            builder: new DefaultTypeBuilder(ForEach, resourceExplorer, {
                'itemsProperty': new StringExpressionConverter(),
                'index': new StringExpressionConverter(),
                'value': new StringExpressionConverter(),
                'disabled': new BoolExpressionConverter()
            })
        }, {
            kind: 'Microsoft.ForeachPage',
            builder: new DefaultTypeBuilder(ForEachPage, resourceExplorer, {
                'itemsProperty': new StringExpressionConverter(),
                'page': new StringExpressionConverter(),
                'pageIndex': new StringExpressionConverter(),
                'pageSize': new IntExpressionConverter(),
                'disabled': new BoolExpressionConverter()
            })
        }, {
            kind: 'Microsoft.GetActivityMembers',
            builder: new DefaultTypeBuilder(GetActivityMembers, resourceExplorer, {
                'activityId': new StringExpressionConverter(),
                'property': new StringExpressionConverter(),
                'disabled': new BoolExpressionConverter()
            })
        }, {
            kind: 'Microsoft.GetConversationMembers',
            builder: new DefaultTypeBuilder(GetConversationMembers, resourceExplorer, {
                'property': new StringExpressionConverter(),
                'disabled': new BoolExpressionConverter()
            })
        }, {
            kind: 'Microsoft.GotoAction',
            builder: new DefaultTypeBuilder(GotoAction, resourceExplorer, {
                'actionId': new StringExpressionConverter(),
                'disabled': new BoolExpressionConverter()
            })
        }, {
            kind: 'Microsoft.HttpRequest',
            builder: new DefaultTypeBuilder(HttpRequest, resourceExplorer, {
                'contentType': new StringExpressionConverter(),
                'url': new StringExpressionConverter(),
                'headers': new HttpHeadersConverter(),
                'body': new ValueExpressionConverter(),
                'responseType': new EnumExpressionConverter(ResponsesTypes),
                'resultProperty': new StringExpressionConverter(),
                'disabled': new BoolExpressionConverter()
            })
        }, {
            kind: 'Microsoft.IfCondition',
            builder: new DefaultTypeBuilder(IfCondition, resourceExplorer, {
                'condition': new BoolExpressionConverter(),
                'disabled': new BoolExpressionConverter()
            })
        }, {
            kind: 'Microsoft.LogAction',
            builder: new DefaultTypeBuilder(LogAction, resourceExplorer, {
                'text': new TextTemplateConverter(),
                'traceActivity': new BoolExpressionConverter(),
                'label': new StringExpressionConverter(),
                'disabled': new BoolExpressionConverter()
            })
        }, {
            kind: 'Microsoft.RepeatDialog',
            builder: new DefaultTypeBuilder(RepeatDialog, resourceExplorer,
                Object.assign(baseInvokeDialogConverters, {
                    'disabled': new BoolExpressionConverter(),
                    'allowLoop': new BoolExpressionConverter()
                }))
        }, {
            kind: 'Microsoft.ReplaceDialog',
            builder: new DefaultTypeBuilder(ReplaceDialog, resourceExplorer,
                Object.assign(baseInvokeDialogConverters, {
                    'disabled': new BoolExpressionConverter()
                }))
        }, {
            kind: 'Microsoft.SendActivity',
            builder: new DefaultTypeBuilder(SendActivity, resourceExplorer, {
                'activity': new ActivityTemplateConverter(),
                'disabled': new BoolExpressionConverter()
            })
        }, {
            kind: 'Microsoft.SetProperties',
            builder: new DefaultTypeBuilder(SetProperties, resourceExplorer, {
                'assignments': new PropertyAssignmentConverter(),
                'disabled': new BoolExpressionConverter()
            })
        }, {
            kind: 'Microsoft.SetProperty',
            builder: new DefaultTypeBuilder(SetProperty, resourceExplorer, {
                'property': new StringExpressionConverter(),
                'value': new ValueExpressionConverter(),
                'disabled': new BoolExpressionConverter()
            })
        }, {
            kind: 'Microsoft.SignOutUser',
            builder: new DefaultTypeBuilder(SignOutUser, resourceExplorer, {
                'userId': new StringExpressionConverter(),
                'connectionName': new StringExpressionConverter(),
                'disabled': new BoolExpressionConverter()
            })
        }, {
            kind: 'Microsoft.SwitchCondition',
            builder: new DefaultTypeBuilder(SwitchCondition, resourceExplorer, {
                'condition': new ExpressionConverter(),
                'cases': new CaseConverter(resourceExplorer),
                'disabled': new BoolExpressionConverter()
            })
        }, {
            kind: 'Microsoft.TraceActivity',
            builder: new DefaultTypeBuilder(TraceActivity, resourceExplorer, {
                'name': new StringExpressionConverter(),
                'valueType': new StringExpressionConverter(),
                'value': new ValueExpressionConverter(),
                'label': new StringExpressionConverter(),
                'disabled': new BoolExpressionConverter()
            })
        }, {
            kind: 'Microsoft.UpdateActivity',
            builder: new DefaultTypeBuilder(UpdateActivity, resourceExplorer, {
                'activity': new ActivityTemplateConverter(),
                'activityId': new StringExpressionConverter(),
                'disabled': new BoolExpressionConverter()
            })
        }, {
            kind: 'Microsoft.OnActivity',
            builder: new DefaultTypeBuilder(OnActivity, resourceExplorer, OnConditionConverters)
        }, {
            kind: 'Microsoft.OnAssignEntity',
            builder: new DefaultTypeBuilder(OnAssignEntity, resourceExplorer, OnConditionConverters)
        }, {
            kind: 'Microsoft.OnBeginDialog',
            builder: new DefaultTypeBuilder(OnBeginDialog, resourceExplorer, OnConditionConverters)
        }, {
            kind: 'Microsoft.OnCancelDialog',
            builder: new DefaultTypeBuilder(OnCancelDialog, resourceExplorer, OnConditionConverters)
        }, {
            kind: 'Microsoft.OnChooseEntity',
            builder: new DefaultTypeBuilder(OnChooseEntity, resourceExplorer, OnConditionConverters)
        }, {
            kind: 'Microsoft.OnChooseIntent',
            builder: new DefaultTypeBuilder(OnChooseIntent, resourceExplorer, OnConditionConverters)
        }, {
            kind: 'Microsoft.OnChooseProperty',
            builder: new DefaultTypeBuilder(OnChooseProperty, resourceExplorer, OnConditionConverters)
        }, {
            kind: 'Microsoft.OnCondition',
            builder: new DefaultTypeBuilder(OnCondition, resourceExplorer, OnConditionConverters)
        }, {
            kind: 'Microsoft.OnConversationUpdateActivity',
            builder: new DefaultTypeBuilder(OnConversationUpdateActivity, resourceExplorer, OnConditionConverters)
        }, {
            kind: 'Microsoft.OnDialogEvent',
            builder: new DefaultTypeBuilder(OnDialogEvent, resourceExplorer, OnConditionConverters)
        }, {
            kind: 'Microsoft.OnEndOfActions',
            builder: new DefaultTypeBuilder(OnEndOfActions, resourceExplorer, OnConditionConverters)
        }, {
            kind: 'Microsoft.OnEndOfConversationActivity',
            builder: new DefaultTypeBuilder(OnEndOfConversationActivity, resourceExplorer, OnConditionConverters)
        }, {
            kind: 'Microsoft.OnError',
            builder: new DefaultTypeBuilder(OnError, resourceExplorer, OnConditionConverters)
        }, {
            kind: 'Microsoft.OnEventActivity',
            builder: new DefaultTypeBuilder(OnEventActivity, resourceExplorer, OnConditionConverters)
        }, {
            kind: 'Microsoft.OnHandoffActivity',
            builder: new DefaultTypeBuilder(OnHandoffActivity, resourceExplorer, OnConditionConverters)
        }, {
            kind: 'Microsoft.OnIntent',
            builder: new DefaultTypeBuilder(OnIntent, resourceExplorer, OnConditionConverters)
        }, {
            kind: 'Microsoft.OnInvokeActivity',
            builder: new DefaultTypeBuilder(OnInvokeActivity, resourceExplorer, OnConditionConverters)
        }, {
            kind: 'Microsoft.OnMessageActivity',
            builder: new DefaultTypeBuilder(OnMessageActivity, resourceExplorer, OnConditionConverters)
        }, {
            kind: 'Microsoft.OnMessageDeleteActivity',
            builder: new DefaultTypeBuilder(OnMessageDeleteActivity, resourceExplorer, OnConditionConverters)
        }, {
            kind: 'Microsoft.OnMessageReactionActivity',
            builder: new DefaultTypeBuilder(OnMessageReactionActivity, resourceExplorer, OnConditionConverters)
        }, {
            kind: 'Microsoft.OnMessageUpdateActivity',
            builder: new DefaultTypeBuilder(OnMessageUpdateActivity, resourceExplorer, OnConditionConverters)
        }, {
            kind: 'Microsoft.OnQnAMatch',
            builder: new DefaultTypeBuilder(OnQnAMatch, resourceExplorer, OnConditionConverters)
        }, {
            kind: 'Microsoft.OnRepromptDialog',
            builder: new DefaultTypeBuilder(OnRepromptDialog, resourceExplorer, OnConditionConverters)
        }, {
            kind: 'Microsoft.OnTypingActivity',
            builder: new DefaultTypeBuilder(OnTypingActivity, resourceExplorer, OnConditionConverters)
        }, {
            kind: 'Microsoft.OnUnknownIntent',
            builder: new DefaultTypeBuilder(OnUnknownIntent, resourceExplorer, OnConditionConverters)
        }, {
            kind: 'Microsoft.Ask',
            builder: new DefaultTypeBuilder(Ask, resourceExplorer, {
                'expectedProperties': new ArrayExpressionConverter<string>(),
                'defaultOperation': new StringExpressionConverter(),
                'activity': new ActivityTemplateConverter(),
                'disabled': new BoolExpressionConverter()
            })
        }, {
            kind: 'Microsoft.AttachmentInput',
            builder: new DefaultTypeBuilder(AttachmentInput, resourceExplorer,
                Object.assign(inputDialogConverters, {
                    'outputFormat': new EnumExpressionConverter(AttachmentOutputFormat)
                }))
        }, {
            kind: 'Microsoft.ChoiceInput',
            builder: new DefaultTypeBuilder(ChoiceInput, resourceExplorer,
                Object.assign(inputDialogConverters, {
                    'choices': new ArrayExpressionConverter<Choice>(),
                    'style': new EnumExpressionConverter(ListStyle),
                    'defaultLocale': new StringExpressionConverter(),
                    'outputFormat': new EnumExpressionConverter(ChoiceOutputFormat),
                    'choiceOptions': new ObjectExpressionConverter<ChoiceFactoryOptions>(),
                    'recognizerOptions': new ObjectExpressionConverter<FindChoicesOptions>()
                }))
        }, {
            kind: 'Microsoft.ConfirmInput',
            builder: new DefaultTypeBuilder(ConfirmInput, resourceExplorer,
                Object.assign(inputDialogConverters, {
                    'defaultLocale': new StringExpressionConverter(),
                    'style': new EnumExpressionConverter(ListStyle),
                    'choiceOptions': new ObjectExpressionConverter<ChoiceFactoryOptions>(),
                    'outputFormat': new StringExpressionConverter()
                }))
        }, {
            kind: 'Microsoft.DateTimeInput',
            builder: new DefaultTypeBuilder(DateTimeInput, resourceExplorer,
                Object.assign(inputDialogConverters, {
                    'defaultLocale': new StringExpressionConverter(),
                    'outputFormat': new StringExpressionConverter()
                }))
        }, {
            kind: 'Microsoft.NumberInput',
            builder: new DefaultTypeBuilder(NumberInput, resourceExplorer,
                Object.assign(inputDialogConverters, {
                    'defaultLocale': new StringExpressionConverter(),
                    'outputFormat': new NumberExpressionConverter()
                }))
        }, {
            kind: 'Microsoft.OAuthInput',
            builder: new DefaultTypeBuilder(OAuthInput, resourceExplorer,
                Object.assign(inputDialogConverters, {
                    'connectionName': new StringExpressionConverter(),
                    'title': new StringExpressionConverter(),
                    'text': new StringExpressionConverter(),
                    'timeout': new IntExpressionConverter()
                }))
        }, {
            kind: 'Microsoft.TextInput',
            builder: new DefaultTypeBuilder(TextInput, resourceExplorer,
                Object.assign(inputDialogConverters, {
                    'outputFormat': new StringExpressionConverter()
                }))
        }, {
            kind: 'Microsoft.LuisRecognizer',
            builder: new DefaultTypeBuilder(LuisAdaptiveRecognizer, resourceExplorer, {
                'applicationId': new StringExpressionConverter(),
                'dynamicLists': new ArrayExpressionConverter(),
                'endpoint': new StringExpressionConverter(),
                'endpointKey': new StringExpressionConverter(),
                'logPersonalInformation': new BoolExpressionConverter()
            })
        }, {
            kind: 'Microsoft.CrossTrainedRecognizerSet',
            builder: new DefaultTypeBuilder(CrossTrainedRecognizerSet, resourceExplorer, {
                'recognizers': new RecognizerConverter(resourceExplorer)
            })
        }, {
            kind: 'Microsoft.MultiLanguageRecognizer',
            builder: new DefaultTypeBuilder(MultiLanguageRecognizer, resourceExplorer, {
                'languagePolicy': new LanguagePolicyConverter(),
                'recognizers': new MultiLanguageRecognizerConverter(resourceExplorer)
            })
        }, {
            kind: 'Microsoft.RecognizerSet',
            builder: new DefaultTypeBuilder(RecognizerSet, resourceExplorer, {
                'recognizers': new RecognizerConverter(resourceExplorer)
            })
        }, {
            kind: 'Microsoft.RegexRecognizer',
            builder: new DefaultTypeBuilder(RegexRecognizer, resourceExplorer, {
                'intents': new IntentPatternConverter()
            })
        }, {
            kind: 'Microsoft.AgeEntityRecognizer',
            builder: new DefaultTypeBuilder(AgeEntityRecognizer, resourceExplorer, {})
        }, {
            kind: 'Microsoft.ConfirmationEntityRecognizer',
            builder: new DefaultTypeBuilder(ConfirmationEntityRecognizer, resourceExplorer, {})
        }, {
            kind: 'Microsoft.CurrencyEntityRecognizer',
            builder: new DefaultTypeBuilder(CurrencyEntityRecognizer, resourceExplorer, {})
        }, {
            kind: 'Microsoft.DateTimeEntityRecognizer',
            builder: new DefaultTypeBuilder(DateTimeEntityRecognizer, resourceExplorer, {})
        }, {
            kind: 'Microsoft.DimensionEntityRecognizer',
            builder: new DefaultTypeBuilder(DimensionEntityRecognizer, resourceExplorer, {})
        }, {
            kind: 'Microsoft.EmailEntityRecognizer',
            builder: new DefaultTypeBuilder(EmailEntityRecognizer, resourceExplorer, {})
        }, {
            kind: 'Microsoft.GuidEntityRecognizer',
            builder: new DefaultTypeBuilder(GuidEntityRecognizer, resourceExplorer, {})
        }, {
            kind: 'Microsoft.HashtagEntityRecognizer',
            builder: new DefaultTypeBuilder(HashtagEntityRecognizer, resourceExplorer, {})
        }, {
            kind: 'Microsoft.IpEntityRecognizer',
            builder: new DefaultTypeBuilder(IpEntityRecognizer, resourceExplorer, {})
        }, {
            kind: 'Microsoft.MentionEntityRecognizer',
            builder: new DefaultTypeBuilder(MentionEntityRecognizer, resourceExplorer, {})
        }, {
            kind: 'Microsoft.NumberEntityRecognizer',
            builder: new DefaultTypeBuilder(NumberEntityRecognizer, resourceExplorer, {})
        }, {
            kind: 'Microsoft.OrdinalEntityRecognizer',
            builder: new DefaultTypeBuilder(OrdinalEntityRecognizer, resourceExplorer, {})
        }, {
            kind: 'Microsoft.PercentageEntityRecognizer',
            builder: new DefaultTypeBuilder(PercentageEntityRecognizer, resourceExplorer, {})
        }, {
            kind: 'Microsoft.PhoneNumberEntityRecognizer',
            builder: new DefaultTypeBuilder(PhoneNumberEntityRecognizer, resourceExplorer, {})
        }, {
            kind: 'Microsoft.RegexEntityRecognizer',
            builder: new DefaultTypeBuilder(RegexEntityRecognizer, resourceExplorer, {})
        }, {
            kind: 'Microsoft.TemperatureEntityRecognizer',
            builder: new DefaultTypeBuilder(TemperatureEntityRecognizer, resourceExplorer, {})
        }, {
            kind: 'Microsoft.UrlEntityRecognizer',
            builder: new DefaultTypeBuilder(UrlEntityRecognizer, resourceExplorer, {})
        }, {
            kind: 'Microsoft.TemplateEngineLanguageGenerator',
            builder: new DefaultTypeBuilder(TemplateEngineLanguageGenerator, resourceExplorer, {})
        }, {
            kind: 'Microsoft.ResourceMultiLanguageGenerator',
            builder: new DefaultTypeBuilder(ResourceMultiLanguageGenerator, resourceExplorer, {
                'languagePolicy': new LanguagePolicyConverter()
            })
        }, {
            kind: 'Microsoft.ConditionalSelector',
            builder: new DefaultTypeBuilder(ConditionalSelector, resourceExplorer, {
                'condition': new BoolExpressionConverter()
            })
        }, {
            kind: 'Microsoft.FirstSelector',
            builder: new DefaultTypeBuilder(FirstSelector, resourceExplorer, {})
        }, {
            kind: 'Microsoft.RandomSelector',
            builder: new DefaultTypeBuilder(RandomSelector, resourceExplorer, {})
        }, {
            kind: 'Microsoft.TrueSelector',
            builder: new DefaultTypeBuilder(TrueSelector, resourceExplorer, {})
        }];

        const schemas = resourceExplorer.getResources('.schema');
        for (const schema of schemas) {
            const resourceId = schema.id.replace(/.schema$/, '');
            if (resourceId.endsWith('.dialog')) {
                builderRegistrations.push({
                    kind: resourceId,
                    builder: new CustomDialogTypeBuilder(DynamicBeginDialog, resourceExplorer, {
                        'options': new ObjectExpressionConverter<object>(),
                        'dialog': new DialogExpressionConverter(resourceExplorer),
                        'activityProcessed': new BoolExpressionConverter(),
                        'resultProperty': new StringExpressionConverter(),
                        'disabled': new BoolExpressionConverter()
                    })
                });
            }
        }
        return builderRegistrations;
    }
}