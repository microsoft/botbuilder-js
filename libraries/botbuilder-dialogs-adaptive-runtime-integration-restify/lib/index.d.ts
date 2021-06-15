import * as t from 'runtypes';
import restify from 'restify';
import { Configuration } from 'botbuilder-dialogs-adaptive-runtime';
import type { ServiceCollection } from 'botbuilder-dialogs-adaptive-runtime-core';
declare const TypedOptions: t.Record<{
    /**
     * Path that the server will listen to for [Activities](xref:botframework-schema.Activity)
     */
    messagingEndpointPath: t.Constraint<t.String, string, unknown>;
    /**
     * Path that the server will listen to for skills requests
     */
    skillsEndpointPrefix: t.Constraint<t.String, string, unknown>;
    /**
     * Port that server should listen on
     */
    port: t.Union2<t.Constraint<t.String, string, unknown>, t.Number>;
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
 * Options for runtime restify adapter
 */
export declare type Options = t.Static<typeof TypedOptions>;
/**
 * Start a bot using the runtime restify integration.
 *
 * @param applicationRoot application root directory
 * @param settingsDirectory settings directory
 * @param options options bag
 */
export declare function start(applicationRoot: string, settingsDirectory: string, options?: Partial<Options>): Promise<void>;
/**
 * Create a server using the runtime restify integration.
 *
 * @param services runtime service collection
 * @param configuration runtime configuration
 * @param applicationRoot application root directory
 * @param options options bag for configuring restify Server
 * @param server optional predefined restify server, useful to register middleware
 * @returns a restify Server ready to listen for connections
 */
export declare function makeServer(services: ServiceCollection, configuration: Configuration, applicationRoot: string, options?: Partial<Options>, server?: restify.Server): Promise<restify.Server>;
export {};
//# sourceMappingURL=index.d.ts.map