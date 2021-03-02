// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import type { IConfiguration } from './configuration';
import type { IServices } from './services';
import type { ServiceCollection } from './serviceCollection';

/**
 * Plugin describes a callback function that receives a ServiceCollection instance and a Configuration
 * instance.
 */
export type TPlugin<S = IServices> = (
    serviceCollection: ServiceCollection<S>,
    configuration: IConfiguration
) => void | Promise<void>;

/**
 * Declare a plugin.
 *
 * @param plugin plugin
 * @returns a plugin function
 */
export function plugin<S = IServices>(plugin: TPlugin<S>): TPlugin<S> {
    return plugin;
}
