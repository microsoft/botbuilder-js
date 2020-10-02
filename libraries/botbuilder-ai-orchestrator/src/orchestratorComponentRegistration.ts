/**
 * @module botbuilder-ai-orchestrator
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { BoolExpressionConverter, NumberExpressionConverter, StringExpressionConverter } from 'adaptive-expressions';
import { AdaptiveTypeBuilder } from 'botbuilder-dialogs-adaptive';
import { BuilderRegistration, ComponentRegistration, ResourceExplorer } from 'botbuilder-dialogs-declarative';

import { OrchestratorAdaptiveRecognizer } from './orchestratorAdaptiveRecognizer';

/**
 * Define component assets for Luis.
 */
export class OrchestratorComponentRegistration implements ComponentRegistration {
    private readonly _builderRegistrations: BuilderRegistration[] = [];
    private _resourceExplorer: ResourceExplorer;

    /**
     * Gets all the builder registration instances.
     * @returns An array of `BuilderRegistration`.
     */
    public getTypeBuilders(): BuilderRegistration[] {
        return this._builderRegistrations;
    }

    /**
     * Initializes a new instance of the `OrchestratorComponentRegistration` class.
     * @param resourceExplorer `ResourceExplorer` to get all schema resources.
     */
    public constructor(resourceExplorer: ResourceExplorer) {
        this._resourceExplorer = resourceExplorer;

        this._builderRegistrations.push(
            new BuilderRegistration('Microsoft.OrchestratorRecognizer', new AdaptiveTypeBuilder(OrchestratorAdaptiveRecognizer, this._resourceExplorer, {
                modelPath: new StringExpressionConverter(),
                snapshotPath: new StringExpressionConverter(),
                disambiguationScoreThreshold: new NumberExpressionConverter(),
                detectAmbiguousIntents: new BoolExpressionConverter(),
            }))
        );
    }
};
