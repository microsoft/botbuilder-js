/**
 * @module botbuilder-ai-orchestrator
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ComponentRegistration, ResourceExplorer, BuilderRegistration } from "botbuilder-dialogs-declarative";
import { OrchestratorAdaptiveRecognizer } from './orchestratorAdaptiveRecognizer';
import { AdaptiveTypeBuilder } from "botbuilder-dialogs-adaptive";
import { BoolExpressionConverter, StringExpressionConverter, NumberExpressionConverter } from 'adaptive-expressions';

export class OrchestratorComponentRegistration implements ComponentRegistration {
    private _builderRegistrations: BuilderRegistration[] = [];
    private _resourceExplorer: ResourceExplorer;

    getTypeBuilders(): BuilderRegistration[] {
        return this._builderRegistrations;
    }

    public constructor(resourceExplorer: ResourceExplorer) {
        this._resourceExplorer = resourceExplorer;

        this._builderRegistrations.push(
            new BuilderRegistration('Microsoft.OrchestratorRecognizer', new AdaptiveTypeBuilder(OrchestratorAdaptiveRecognizer, this._resourceExplorer, {
                'modelPath': new StringExpressionConverter(),
                'snapshotPath': new StringExpressionConverter(),
                'disambiguationScoreThreshold': new NumberExpressionConverter(),
                'detectAmbiguousIntents': new BoolExpressionConverter(),
            }))
        );    
    }
};
