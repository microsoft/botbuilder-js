/**
 * @module botbuilder-ai-orchestrator
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ComponentDeclarativeTypes, DeclarativeType } from 'botbuilder-dialogs-declarative';
import { OrchestratorAdaptiveRecognizer } from './orchestratorAdaptiveRecognizer';

export class OrchestratorComponentRegistration implements ComponentDeclarativeTypes {
    public getDeclarativeTypes(_resourceExplorer: unknown): DeclarativeType[] {
        return [
            {
                kind: OrchestratorAdaptiveRecognizer.$kind,
                type: OrchestratorAdaptiveRecognizer,
            },
        ];
    }
}
