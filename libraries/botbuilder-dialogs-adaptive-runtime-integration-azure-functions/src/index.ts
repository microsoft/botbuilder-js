// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable @typescript-eslint/no-explicit-any */

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
 * @returns azure function triggers for `module.exports`
 */
export function makeTriggers(
    runtimeServices: () => Promise<[ServiceCollection, Configuration]>,
    applicationRoot: string
): Record<string, AzureFunction> {
    const instances = memoize(async () => {
        const [services] = await runtimeServices();
        return services.mustMakeInstances<{
            adapter: BotFrameworkAdapter;
            bot: ActivityHandlerBase;
            channelServiceHandler: ChannelServiceHandler;
        }>('adapter', 'bot', 'channelServiceHandler');
    });

    const staticDirectory = path.join(applicationRoot, 'public');

    return {
        messageTrigger: async (context: Context, req: HttpRequest) => {
            context.log('Messages endpoint triggered.');

            try {
                const { adapter, bot } = await instances();

                await adapter.processActivity(req, context.res as WebResponse, async (turnContext) => {
                    await bot.run(turnContext);
                });
            } catch (err) {
                context.log.error(err);
                throw err;
            }
        },

        skillsTrigger: async (context: Context, req: HttpRequest) => {
            context.log('Skill replyToActivity endpoint triggered.');

            try {
                const { channelServiceHandler: skillHandler } = await instances();

                const conversationId = context.bindingData.conversationId;
                const activityId = context.bindingData.activityId;

                const authHeader = req.headers.authorization || req.headers.Authorization || '';
                const result = await skillHandler.handleReplyToActivity(
                    authHeader,
                    conversationId,
                    activityId,
                    JSON.parse(req.body) as Activity
                );

                const res = context.res as WebResponse;
                res.status(200);
                res.send(result);
                res.end();
            } catch (err) {
                context.log.error(err);
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

                context.log.error(err);
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
 * @returns azure function triggers for `module.exports`
 */
export function triggers(applicationRoot: string, settingsDirectory: string): Record<string, AzureFunction> {
    return makeTriggers(
        memoize(() => getRuntimeServices(applicationRoot, settingsDirectory)),
        applicationRoot
    );
}
