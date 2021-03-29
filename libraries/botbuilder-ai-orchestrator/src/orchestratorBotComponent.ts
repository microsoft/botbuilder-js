// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BotComponent } from 'botbuilder-core';
import { ComponentDeclarativeTypes } from 'botbuilder-dialogs-declarative';
import { OrchestratorRecognizer } from './orchestratorRecognizer';
import { ServiceCollection, Configuration } from 'botbuilder-dialogs-adaptive-runtime-core';

export class OrchestratorBotComponent extends BotComponent {
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
