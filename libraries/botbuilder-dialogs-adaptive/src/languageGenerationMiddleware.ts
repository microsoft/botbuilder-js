/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Middleware, TurnContext } from 'botbuilder-core';
import { ResourceExplorer } from 'botbuilder-dialogs-declarative';
import { LanguageGenerator } from './languageGenerator';
import { ResourceMultiLanguageGenerator } from './generators/resourceMultiLanguageGenerator';
import { TemplateEngineLanguageGenerator, LanguageGeneratorManager } from './generators';

export class LanguageGeneratorMiddleWare implements Middleware {
    private readonly _resourceExplorer: ResourceExplorer;
    private readonly _defaultLg: string;
    private readonly languageGeneratorManagerKey = 'LanguageGeneratorManager';
    private readonly languageGeneratorKey = 'LanguageGenerator';
    private readonly languagePolicyKey = 'languagePolicy';
    private _languageGeneratorManager: LanguageGeneratorManager;
    private _languageGenerator: LanguageGenerator;
    private _languagePolicy: object;

    public constructor(resourceExpolrer: ResourceExplorer = undefined, defaultLg: string = undefined, defaultLanguagePolicy = undefined) {
        this._resourceExplorer = resourceExpolrer? resourceExpolrer : new ResourceExplorer();
        this._defaultLg = defaultLg? defaultLg : 'main.lg';
        this._languagePolicy = defaultLanguagePolicy;
    }

    /**
     * Store the incoming activity on the App Insights Correlation Context and optionally calls the TelemetryLoggerMiddleware
     * @param context The context object for this turn.
     * @param next The delegate to call to continue the bot middleware pipeline
     */
    public async onTurn(context: TurnContext, next: () => Promise<void>): Promise<void> {
        if (context === undefined) {
            throw new Error('context is null');
        }

        if (!this._languageGeneratorManager) {
            this._languageGeneratorManager = new LanguageGeneratorManager(this._resourceExplorer);
            await this._languageGeneratorManager.loadResources();
        }

        if (!this._languageGenerator) {
            const resource = await this._resourceExplorer.getResource(this._defaultLg);
            if (resource !== undefined) {
                this._languageGenerator = new ResourceMultiLanguageGenerator(this._defaultLg);
            } else {
                this._languageGenerator = new TemplateEngineLanguageGenerator();
            }
        }

        // miss LanguageGenerationComponentRegistration
        if (context.turnState.get(this.languageGeneratorManagerKey) === undefined) {
            context.turnState.set(this.languageGeneratorManagerKey, this._languageGeneratorManager);
        }
        
        if (this._languageGenerator === undefined) {
            throw new Error('no language generator defined');
        } else{
            context.turnState.set(this.languageGeneratorKey, this._languageGenerator);
        }

        if (this._languagePolicy !== undefined) {
            context.turnState.set(this.languagePolicyKey, this._languagePolicy);
        }
        
        if (next) {
            await next();
        }
    }
}