// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BotComponent } from 'botbuilder-core';
import { ComponentDeclarativeTypes } from 'botbuilder-dialogs-declarative';
import { Configuration, ServiceCollection } from 'botbuilder-dialogs-adaptive-runtime-core';
import { LuisAdaptiveRecognizer } from './luisAdaptiveRecognizer';

/**
 *LUIS @see cref="BotComponent" definition.
 */
export class LuisBotComponent extends BotComponent {
    /**
     * @param services Services collection to register dependency injection.
     * @param _configuration Configuration for the bot component.
     */
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
