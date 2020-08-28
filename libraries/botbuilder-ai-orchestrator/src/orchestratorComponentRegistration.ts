/**
 * @module botbuilder-ai-orchestrator
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { BoolExpressionConverter, NumberExpressionConverter, StringExpressionConverter } from 'adaptive-expressions';
import { BuilderRegistration, ComponentRegistration, DefaultTypeBuilder, ResourceExplorer } from 'botbuilder-dialogs-declarative';

import { OrchestratorAdaptiveRecognizer } from './orchestratorAdaptiveRecognizer';

export class OrchestratorComponentRegistration implements ComponentRegistration {
    public getBuilderRegistrations(resourceExplorer: ResourceExplorer): BuilderRegistration[] {
        return [{
            kind: 'Microsoft.OrchestratorRecognizer',
            builder: new DefaultTypeBuilder(OrchestratorAdaptiveRecognizer, resourceExplorer, {
                modelPath: new StringExpressionConverter(),
                snapshotPath: new StringExpressionConverter(),
                disambiguationScoreThreshold: new NumberExpressionConverter(),
                detectAmbiguousIntents: new BoolExpressionConverter(),
            })
        }];
    }
};
