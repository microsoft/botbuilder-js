// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Assertion, assert } from 'botbuilder-stdlib';
import { Configuration, ServiceCollection } from 'botbuilder-dialogs-adaptive-runtime-core';

/**
 * Definition of a BotComponent that allows registration of services, custom actions, memory scopes and adapters.
 *
 * To make your components available to the system you derive from BotComponent and register services to add functionality.
 * These components then are consumed in appropriate places by the systems that need them. When using Composer, configureServices
 * gets called automatically on the components by the bot runtime, as long as the components are registered in the configuration.
 */
export abstract class BotComponent {
    abstract configureServices(services: ServiceCollection, configuration: Configuration): void;
}

export const assertBotComponent: Assertion<BotComponent> = (val, path) => {
    assert.unsafe.castObjectAs<BotComponent>(val, path);
    assert.func(val.configureServices, path.concat('configureServices'));
};
