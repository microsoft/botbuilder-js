/**
 * @module botbuilder-ai-orchestrator
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { BoolExpressionConverter, NumberExpressionConverter, StringExpressionConverter } from 'adaptive-expressions';

import { OrchestratorAdaptiveRecognizer } from './orchestratorAdaptiveRecognizer';

export class OrchestratorComponentRegistration {
    public getDeclarativeTypes(_resourceExplorer: any) {
        return [{
            kind: 'Microsoft.OrchestratorRecognizer',
            factory: OrchestratorAdaptiveRecognizer,
            converters: {
                modelPath: new StringExpressionConverter(),
                snapshotPath: new StringExpressionConverter(),
                disambiguationScoreThreshold: new NumberExpressionConverter(),
                detectAmbiguousIntents: new BoolExpressionConverter(),
            }
        }];
    }
};
