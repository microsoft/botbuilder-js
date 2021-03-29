// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BotComponent } from 'botbuilder-core';
import { ComponentDeclarativeTypes } from 'botbuilder-dialogs-declarative';
import { Configuration, ServiceCollection } from 'botbuilder-dialogs-adaptive-runtime-core';
import { LuisAdaptiveRecognizer } from './luisAdaptiveRecognizer';

export class LuisBotComponent extends BotComponent {
    configureServices(services: ServiceCollection, _configuration: Configuration): void {
        services.composeFactory<ComponentDeclarativeTypes[]>('declarativeTypes', (declarativeTypes) =>
            declarativeTypes.concat({
                getDeclarativeTypes() {
                    return [
                        {
                            kind: LuisAdaptiveRecognizer.$kind,
                            type: LuisAdaptiveRecognizer,
                        },
                    ];
                },
            })
        );
    }
}
