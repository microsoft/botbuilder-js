// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BotComponent } from 'botbuilder-core';
import { ComponentDeclarativeTypes } from 'botbuilder-dialogs-declarative';
import { OrchestratorRecognizer } from './orchestratorRecognizer';
import { ServiceCollection, Configuration } from 'botbuilder-dialogs-adaptive-runtime-core';

/**
 * Define component assets for Orchestrator.
 */
export class OrchestratorBotComponent extends BotComponent {
    /**
     * @param services Services collection.
     * @param _configuration Configuration for the bot component.
     */
    configureServices(services: ServiceCollection, _configuration: Configuration): void {
        services.composeFactory<ComponentDeclarativeTypes[]>('declarativeTypes', (declarativeTypes) =>
            declarativeTypes.concat({
                getDeclarativeTypes() {
                    return [
                        {
                            kind: OrchestratorRecognizer.$kind,
                            type: OrchestratorRecognizer,
                        },
                    ];
                },
            })
        );
    }
}
