// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ActivityTemplate, StaticActivityTemplate, TextTemplate } from './templates';
import { BotComponent } from 'botbuilder';
import { ComponentDeclarativeTypes } from 'botbuilder-dialogs-declarative';
import { Configuration, ServiceCollection } from 'botbuilder-runtime-core';

export class LanguageGenerationBotComponent extends BotComponent {
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
