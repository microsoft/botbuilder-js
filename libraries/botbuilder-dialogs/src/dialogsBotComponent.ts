// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BotComponent } from 'botbuilder-core';
import { Configuration, ServiceCollection } from 'botbuilder-dialogs-adaptive-runtime-core';
import { MemoryScope, PathResolver } from './memory';

import {
    ClassMemoryScope,
    ConversationMemoryScope,
    DialogClassMemoryScope,
    DialogContextMemoryScope,
    DialogMemoryScope,
    SettingsMemoryScope,
    ThisMemoryScope,
    TurnMemoryScope,
    UserMemoryScope,
} from './memory/scopes';

import {
    AtAtPathResolver,
    AtPathResolver,
    DollarPathResolver,
    HashPathResolver,
    PercentPathResolver,
} from './memory/pathResolvers';

export class DialogsBotComponent extends BotComponent {
    configureServices(services: ServiceCollection, _configuration: Configuration): void {
        services.composeFactory<MemoryScope[]>('memoryScopes', (memoryScopes) => {
            return memoryScopes.concat(
                new TurnMemoryScope(),
                new SettingsMemoryScope(),
                new DialogMemoryScope(),
                new DialogContextMemoryScope(),
                new DialogClassMemoryScope(),
                new ClassMemoryScope(),
                new ThisMemoryScope(),
                new ConversationMemoryScope(),
                new UserMemoryScope()
            );
        });

        services.composeFactory<PathResolver[]>('pathResolvers', (pathResolvers) =>
            pathResolvers.concat(
                new DollarPathResolver(),
                new HashPathResolver(),
                new AtAtPathResolver(),
                new AtPathResolver(),
                new PercentPathResolver()
            )
        );
    }
}
