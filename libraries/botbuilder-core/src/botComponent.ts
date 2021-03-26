// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Configuration, ServiceCollection } from 'botbuilder-runtime-core';
import { Test, tests } from 'botbuilder-stdlib';

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

export const isBotComponent: Test<BotComponent> = (val): val is BotComponent => {
    return tests.unsafe.isObjectAs<BotComponent>(val) && tests.isFunc(val.configureServices);
};
