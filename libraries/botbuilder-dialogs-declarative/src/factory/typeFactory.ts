/**
 * @module botbuilder-dialogs-declarative
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { AdaptiveDialog, SendActivity, TextInput, ConfirmInput, NumberInput, ChoiceInput, EndTurn, IfCondition, RegExpRecognizer, OnIntent, OnUnknownIntent, CancelAllDialogs, DeleteProperty, EditArray, EditActions, EmitEvent, EndDialog, ForEach, ForEachPage, LogAction, RepeatDialog, ReplaceDialog, SendList, SetProperty, DatetimeInput, OAuthInput, SwitchCondition, InitProperty, TraceActivity, HttpMethod, HttpRequest } from 'botbuilder-dialogs-adaptive';

import { ConfigurableTypeBuilder } from './configurableTypeBuilder';
import { DefaultTypeBuilder } from './defaultTypeBuilder';
import { ITypeBuilder } from './typeBuilder';
import { CustomTypeBuilder } from './customTypeBuilder';

 /**
  * Declarative type factory
  */
 export class TypeFactory {

    /**
     * Internal type builder registry
     */
    private readonly registrations: { [name: string] : ITypeBuilder } = {};

    constructor() {
        this.registerBuiltIns();
    }

    /**
     * Registers a new type in the factory
     * @param name name under which to register the type
     * @param converter optional builder logic for the registered type. Will be invoked each time the type is built
     */
    public register(name: string, builder?: ITypeBuilder) : void {

        if (!name) {
            throw new Error(`TypeFactory: name must be provided to register in the factory`);
        }

        if (!builder) {
            throw new Error(`TypeFactory: builder must be provided to register in the factory`);
        }

        this.registrations[name] = builder;
    }

    public build(name: string, config: object) : object {

        if (!name) {
            throw new Error(`TypeFactory: type name must be provided.`)
        }

        const builder = this.registrations[name];

        if (!builder) {
            throw new Error(`TypeFactory: type ${name} not registered in factory.`)
        }

        return builder.build(config);
    }

    private registerBuiltIns(): void {
        // Input
        this.register('Microsoft.TextInput', new ConfigurableTypeBuilder(TextInput));
        this.register('Microsoft.ConfirmInput', new ConfigurableTypeBuilder(ConfirmInput));
        this.register('Microsoft.FloatInput', new ConfigurableTypeBuilder(NumberInput));
        this.register('Microsoft.IntegerInput', new ConfigurableTypeBuilder(NumberInput));
        this.register('Microsoft.ChoiceInput', new ConfigurableTypeBuilder(ChoiceInput));
        this.register('Microsoft.DatetimeInput', new ConfigurableTypeBuilder(DatetimeInput));
        this.register('Microsoft.OAuthInput', new ConfigurableTypeBuilder(OAuthInput));

        // Actions
        this.register('Microsoft.IfCondition', new ConfigurableTypeBuilder(IfCondition));
        this.register('Microsoft.CancelAllDialogs', new ConfigurableTypeBuilder(CancelAllDialogs));
        this.register('Microsoft.DeleteProperty', new ConfigurableTypeBuilder(DeleteProperty));
        this.register('Microsoft.EditArray', new ConfigurableTypeBuilder(EditArray));
        this.register('Microsoft.EditActions', new ConfigurableTypeBuilder(EditActions));
        this.register('Microsoft.EmitEvent', new ConfigurableTypeBuilder(EmitEvent));
        this.register('Microsoft.EndDialog', new ConfigurableTypeBuilder(EndDialog));
        this.register('Microsoft.EndTurn', new ConfigurableTypeBuilder(EndTurn));
        this.register('Microsoft.ForEach', new ConfigurableTypeBuilder(ForEach));
        this.register('Microsoft.ForEachPage', new ConfigurableTypeBuilder(ForEachPage));
        this.register('Microsoft.LogAction', new ConfigurableTypeBuilder(LogAction));
        this.register('Microsoft.RepeatDialog', new ConfigurableTypeBuilder(RepeatDialog));
        this.register('Microsoft.ReplaceDialog', new ConfigurableTypeBuilder(ReplaceDialog));
        this.register('Microsoft.SendActivity', new ConfigurableTypeBuilder(SendActivity));
        this.register('Microsoft.SendList', new ConfigurableTypeBuilder(SendList));
        this.register('Microsoft.SetProperty', new ConfigurableTypeBuilder(SetProperty));
        this.register('Microsoft.SwitchCondition', new ConfigurableTypeBuilder(SwitchCondition));
        this.register('Microsoft.InitProperty', new ConfigurableTypeBuilder(InitProperty));
        this.register('Microsoft.TraceActivity', new ConfigurableTypeBuilder(TraceActivity));
        this.register('Microsoft.HttpRequest', new ConfigurableTypeBuilder(HttpRequest));

        // Dialogs
        this.register('Microsoft.AdaptiveDialog', new ConfigurableTypeBuilder(AdaptiveDialog));

        // Conditions
        this.register('Microsoft.OnUnknownIntent', new DefaultTypeBuilder(OnUnknownIntent));
        this.register('Microsoft.OnIntent', new CustomTypeBuilder((config) => {
            let condition = new OnIntent();

            if(config && config['intent']) {
                condition.intent = config['intent'];
            }
            return condition;
        }));

        // Recognizers
        this.register('Microsoft.RegexRecognizer', new CustomTypeBuilder((config) => {
            let recognizer = new RegExpRecognizer();

            if (config && config['intents']) {
                // The declarative format models intents and expressions as a dictionary
                const intents: {[intent: string]: string} = <{[intent: string]: string}>config['intents'];

                if (intents) {
                    for (const [key, value] of Object.entries(intents)) {
                        recognizer.addIntent(key, new RegExp(value, 'i'));
                    }
                }
            }

            return recognizer;
        }));
    }
 }