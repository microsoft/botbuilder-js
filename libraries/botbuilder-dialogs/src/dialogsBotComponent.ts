// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BotComponent } from 'botbuilder-core';
import { Configuration, ServiceCollection } from 'botbuilder-runtime-core';
import { Dictionary, Unknown } from 'runtypes';
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
    configureServices(services: ServiceCollection, configuration: Configuration): void {
        services.composeFactory<MemoryScope[]>('memoryScopes', (memoryScopes) => {
            const rootConfiguration = configuration.get([]);
            const initialSettings = Dictionary(Unknown).guard(rootConfiguration) ? rootConfiguration : {};

            return memoryScopes.concat(
                new TurnMemoryScope(),
                new SettingsMemoryScope(initialSettings),
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
