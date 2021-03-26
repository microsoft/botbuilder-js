/**
 * @module botbuilder-ai-orchestrator
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ComponentDeclarativeTypes, DeclarativeType } from 'botbuilder-dialogs-declarative';
import { OrchestratorRecognizer } from './orchestratorRecognizer';

export class OrchestratorComponentRegistration implements ComponentDeclarativeTypes {
    public getDeclarativeTypes(_resourceExplorer: unknown): DeclarativeType[] {
        return [
            {
                kind: OrchestratorRecognizer.$kind,
                type: OrchestratorRecognizer,
            },
        ];
    }
}
