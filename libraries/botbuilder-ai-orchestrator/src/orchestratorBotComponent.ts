// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BotComponent } from 'botbuilder-core';
import { ComponentDeclarativeTypes } from 'botbuilder-dialogs-declarative';
import { OrchestratorAdaptiveRecognizer } from './orchestratorAdaptiveRecognizer';
import { ServiceCollection, Configuration } from 'botbuilder-runtime-core';

export class OrchestratorBotComponent extends BotComponent {
    configureServices(services: ServiceCollection, _configuration: Configuration): void {
        services.composeFactory<ComponentDeclarativeTypes[]>('declarativeTypes', (declarativeTypes) =>
            declarativeTypes.concat({
                getDeclarativeTypes() {
                    return [
                        {
                            kind: OrchestratorAdaptiveRecognizer.$kind,
                            type: OrchestratorAdaptiveRecognizer,
                        },
                    ];
                },
            })
        );
    }
}
