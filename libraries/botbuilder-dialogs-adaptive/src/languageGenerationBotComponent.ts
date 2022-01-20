// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ActivityTemplate, StaticActivityTemplate, TextTemplate } from './templates';
import { BotComponent } from 'botbuilder';
import { ComponentDeclarativeTypes } from 'botbuilder-dialogs-declarative';
import { Configuration, ServiceCollection } from 'botbuilder-dialogs-adaptive-runtime-core';

/**
 * ComponentRegistration class for language generation resources.
 */
export class LanguageGenerationBotComponent extends BotComponent {
    /**
     * @param services Services Collection to register.
     * @param _configuration Configuration for the bot component.
     */
    configureServices(services: ServiceCollection, _configuration: Configuration): void {
        services.composeFactory<ComponentDeclarativeTypes[]>('declarativeTypes', (declarativeTypes) =>
            declarativeTypes.concat({
                getDeclarativeTypes() {
                    return [
                        {
                            kind: TextTemplate.$kind,
                            type: TextTemplate,
                        },
                        {
                            kind: ActivityTemplate.$kind,
                            type: ActivityTemplate,
                        },
                        {
                            kind: StaticActivityTemplate.$kind,
                            type: StaticActivityTemplate,
                        },
                    ];
                },
            })
        );
    }
}
