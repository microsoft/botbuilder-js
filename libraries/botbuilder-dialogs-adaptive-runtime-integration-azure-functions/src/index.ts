// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable @typescript-eslint/no-explicit-any */

import * as t from 'runtypes';
import fs from 'fs';
import mime from 'mime';
import path from 'path';
import type { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { Configuration, getRuntimeServices } from 'botbuilder-dialogs-adaptive-runtime';
import { ServiceCollection } from 'botbuilder-dialogs-adaptive-runtime-core';

import type {
    Activity,
    ActivityHandlerBase,
    BotFrameworkAdapter,
    ChannelServiceHandler,
    WebResponse,
} from 'botbuilder';

const TypedOptions = t.Record({
    /**
     * Log errors to stderr
     */
    logErrors: t.Boolean,

    /**
     * Path inside applicationRoot that should be served as static files
     */
    staticDirectory: t.String.withConstraint((str) => str.length > 0 || 'must be non-empty string'),
});

/**
 * Options for runtime Azure Functions adapter
 */
export type Options = t.Static<typeof TypedOptions>;

const defaultOptions: Options = {
    logErrors: true,
    staticDirectory: 'wwwroot',
};

// helper function to memoize the result of `func`
function memoize<T>(func: () => T): () => T {
    let result: T;

    return () => {
        result ??= func();
        return result;
    };
}

// Content type overrides for specific file extensions
const extensionContentTypes: Record<string, string> = {
    '.lu': 'vnd.application/lu',
    '.qna': 'vnd.application/qna',
};

/**
 * Create azure function triggers using the azure restify integration.
 *
 * @param runtimeServices result of calling `once(() => getRuntimeServices(...))`
 * @param applicationRoot application root directory
 * @param options options bag for configuring Azure Functions
 * @returns azure function triggers for `module.exports`
 */
export function makeTriggers(
    runtimeServices: () => Promise<[ServiceCollection, Configuration]>,
    applicationRoot: string,
    options: Partial<Options> = {}
): Record<string, AzureFunction> {
    const resolvedOptions = TypedOptions.check(Object.assign({}, defaultOptions, options));

    const build = memoize(async () => {
        const [services, configuration] = await runtimeServices();

        const instances = services.mustMakeInstances<{
            adapter: BotFrameworkAdapter;
            bot: ActivityHandlerBase;
            channelServiceHandler: ChannelServiceHandler;
            customAdapters: Map<string, BotFrameworkAdapter>;
        }>('adapter', 'bot', 'channelServiceHandler', 'customAdapters');

        return { configuration, instances };
    });

    const staticDirectory = path.join(applicationRoot, resolvedOptions.staticDirectory);

    return {
        messageTrigger: async (context: Context, req: HttpRequest) => {
            context.log('Messages endpoint triggered.');

            const res = context.res as WebResponse;

            try {
                const route = context.bindingData.route;

                const {
                    configuration,
                    instances: { adapter, bot, customAdapters },
                } = await build();

                const defaultAdapterKey = '_defaultAdapter';
                customAdapters.set(defaultAdapterKey, adapter);

                const adapterSettings =
                    configuration.type(
                        ['runtimeSettings', 'adapters'],
                        t.Array(
                            t.Record({
                                name: t.String,
                                enabled: t.Boolean.optional(),
                                route: t.String,
                            })
                        )
                    ) ?? [];

                const adapterSetting = adapterSettings
                    .concat({ name: defaultAdapterKey, enabled: true, route: 'messages' })
                    .filter((settings) => settings.enabled)
                    .find((settings) => settings.route === route);

                if (!adapterSetting) {
                    res.status(404);
                    res.end();
                    return;
                }

                const resolvedAdapter = customAdapters.get(adapterSetting.name);
                if (!resolvedAdapter) {
                    res.status(404);
                    res.end();
                    return;
                }

                await resolvedAdapter.processActivity(req, res, async (turnContext) => {
                    await bot.run(turnContext);
                });
            } catch (err) {
                if (resolvedOptions.logErrors) {
                    context.log.error(err);
                }

                throw err;
            }
        },

        skillsTrigger: async (context: Context, req: HttpRequest) => {
            context.log('Skill replyToActivity endpoint triggered.');

            try {
                const {
                    instances: { channelServiceHandler: skillHandler },
                } = await build();

                const conversationId = context.bindingData.conversationId;
                const activityId = context.bindingData.activityId;

                const authHeader = req.headers.authorization || req.headers.Authorization || '';

                const activity: Activity = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

                const result = await skillHandler.handleReplyToActivity(
                    authHeader,
                    conversationId,
                    activityId,
                    activity
                );

                const res = context.res as WebResponse;
                res.status(200);
                res.send(result);
                res.end();
            } catch (err) {
                if (resolvedOptions.logErrors) {
                    context.log.error(err);
                }

                throw err;
            }
        },

        staticTrigger: async (context: Context) => {
            context.log('Static endpoint triggered.');

            const res = context.res as any;

            const filePath = context.bindingData.path;
            if (typeof filePath !== 'string') {
                return res.status(404).end();
            }

            const contentType = extensionContentTypes[path.extname(filePath)] ?? mime.getType(filePath);
            if (!contentType) {
                return res.status(404).end();
            }

            try {
                const contents = await new Promise((resolve, reject) =>
                    // eslint-disable-next-line security/detect-non-literal-fs-filename
                    fs.readFile(path.join(staticDirectory, filePath), 'utf8', (err, contents) =>
                        err ? reject(err) : resolve(contents)
                    )
                );

                res.status(200);
                res.set('Content-Type', contentType);
                res.end(contents);
            } catch (err) {
                if (err.message.includes('ENOENT')) {
                    return res.status(404).end();
                }

                if (resolvedOptions.logErrors) {
                    context.log.error(err);
                }

                throw err;
            }
        },
    };
}

/**
 * Create azure function triggers using the azure restify integration.
 *
 * @param applicationRoot application root directory
 * @param settingsDirectory settings directory
 * @param options options bag for configuring Azure Functions
 * @returns azure function triggers for `module.exports`
 */
export function triggers(
    applicationRoot: string,
    settingsDirectory: string,
    options: Partial<Options> = {}
): Record<string, AzureFunction> {
    return makeTriggers(
        memoize(() => getRuntimeServices(applicationRoot, settingsDirectory)),
        applicationRoot,
        options
    );
}
