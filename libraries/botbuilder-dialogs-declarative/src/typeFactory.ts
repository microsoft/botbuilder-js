/**
 * @module botbuilder-dialogs-declarative
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Configurable, TextPrompt } from 'botbuilder-dialogs';
import { AdaptiveDialog, BeginDialog, SendActivity, TextInput, ConfirmInput, NumberInput, ChoiceInput, EndTurn, IfCondition, RegExpRecognizer, IntentRule, UnknownIntentRule } from 'botbuilder-dialogs-adaptive';

export interface ITypeBuilder {
    build(config: object) : object;
}

export class CustomTypeBuilder implements ITypeBuilder {

    constructor(private factory: (config: object) => object) {}

    public build(config: object) : object {
        return this.factory(config);
    }
}

export class DefaultTypeBuilder implements ITypeBuilder {

    constructor(private factory: new () => any) {}

    public build(config: object) : object {
        return new this.factory();
    }
}

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
        this.register('Microsoft.TextInput', new DefaultTypeBuilder(TextInput));
        this.register('Microsoft.ConfirmInput', new DefaultTypeBuilder(ConfirmInput));
        this.register('Microsoft.FloatInput', new DefaultTypeBuilder(NumberInput));
        this.register('Microsoft.IntegerInput', new DefaultTypeBuilder(NumberInput));
        this.register('Microsoft.ChoiceInput', new DefaultTypeBuilder(ChoiceInput));
        
        // Steps
        this.register('Microsoft.SendActivity', new DefaultTypeBuilder(SendActivity));
        this.register('Microsoft.EndTurn', new DefaultTypeBuilder(EndTurn));
        this.register('Microsoft.IfCondition', new DefaultTypeBuilder(IfCondition));
        
        // Dialogs
        this.register('Microsoft.AdaptiveDialog', new DefaultTypeBuilder(AdaptiveDialog));

        // Rules
        this.register('Microsoft.UnknownIntentRule', new DefaultTypeBuilder(UnknownIntentRule));
        this.register('Microsoft.IntentRule', new DefaultTypeBuilder(IntentRule));
        
        // Recognizers
        this.register('Microsoft.RegexRecognizer', new CustomTypeBuilder((config) => {
            let recognizer = new RegExpRecognizer();

            if (config && config['intents']) {
                // The declarative format models intents and expressions as a dictionary
                const intents: {[intent: string]: string} = <{[intent: string]: string}>config['intents'];
                            
                if (intents) {
                    for (const [key, value] of Object.entries(intents)) {
                        recognizer.addIntent(key, new RegExp(value));
                    }
                }
            }
            
            return recognizer;
        }));
    }
 }