/**
 * @module botbuilder-ai-orchestrator
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

export { LabelType, OrchestratorRecognizer } from './orchestratorRecognizer';

import { OrchestratorBotComponent } from './orchestratorBotComponent';
export { OrchestratorBotComponent };

// This export ensures that the botbuilder-ai-orchestrator package works as a component in the runtime
export default OrchestratorBotComponent;
