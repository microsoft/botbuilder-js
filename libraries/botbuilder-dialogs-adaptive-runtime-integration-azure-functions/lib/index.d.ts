import * as t from 'runtypes';
import type { AzureFunction } from '@azure/functions';
import { Configuration } from 'botbuilder-dialogs-adaptive-runtime';
import { ServiceCollection } from 'botbuilder-dialogs-adaptive-runtime-core';
declare const TypedOptions: t.Record<{
    /**
     * Log errors to stderr
     */
    logErrors: t.Boolean;
    /**
     * Path inside applicationRoot that should be served as static files
     */
    staticDirectory: t.Constraint<t.String, string, unknown>;
}, false>;
/**
 * Options for runtime Azure Functions adapter
 */
export declare type Options = t.Static<typeof TypedOptions>;
/**
 * Create azure function triggers using the azure restify integration.
 *
 * @param runtimeServices result of calling `once(() => getRuntimeServices(...))`
 * @param applicationRoot application root directory
 * @param options options bag for configuring Azure Functions
 * @returns azure function triggers for `module.exports`
 */
export declare function makeTriggers(runtimeServices: () => Promise<[ServiceCollection, Configuration]>, applicationRoot: string, options?: Partial<Options>): Record<string, AzureFunction>;
/**
 * Create azure function triggers using the azure restify integration.
 *
 * @param applicationRoot application root directory
 * @param settingsDirectory settings directory
 * @param options options bag for configuring Azure Functions
 * @returns azure function triggers for `module.exports`
 */
export declare function triggers(applicationRoot: string, settingsDirectory: string, options?: Partial<Options>): Record<string, AzureFunction>;
export {};
//# sourceMappingURL=index.d.ts.map