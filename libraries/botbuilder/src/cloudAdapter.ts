// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * @module botbuilder
 */

import { BotFrameworkAuthentication } from 'botframework-connector';
import { BotFrameworkHttpAdapter } from './botFrameworkHttpAdapter';
import { CloudAdapterBase } from './cloudAdapterBase';
import { StatusCodes } from 'botbuilder-core';
import { readRequest, writeResponse } from './httpHelper';
import { assert, tests } from 'botbuilder-stdlib';

import {
    BotLogic,
    Emitter,
    Request,
    Response,
    assertBotLogic,
    assertEmitter,
    assertRequest,
    assertResponse,
} from './interfaces';

export class CloudAdapter extends CloudAdapterBase implements BotFrameworkHttpAdapter {
    /**
     * Construct a CloudAdapter.
     *
     * @param {BotFrameworkAuthentication} botFrameworkAuthentication the bot framework authentication, optional
     */
    constructor(botFrameworkAuthentication: BotFrameworkAuthentication, appId: string);
    constructor(botFrameworkAuthentication: unknown, appId: unknown) {
        BotFrameworkAuthentication.assert(botFrameworkAuthentication, ['botFrameworkAuthentication']);
        assert.string(appId, ['appId']);
        super(botFrameworkAuthentication, appId);
    }

    /**
     * Process an incoming HTTP request
     *
     * @param {Request & Emitter} req an HTTP request
     * @param {Response} res an HTTP response
     * @param {BotLogic} logic the bot logic
     * @returns {Promise<void>} a promise representing the asynchronous handling of the request/response lifecycle
     */
    async process(req: Request & Emitter, res: Response, logic: BotLogic): Promise<void>;
    async process(req: unknown, res: unknown, logic: unknown): Promise<void> {
        assertRequest(req, ['req']);
        assertEmitter(req, ['req']);
        assertResponse(res, ['res']);
        assertBotLogic(logic, ['logic']);

        const activity = await readRequest(req);
        if (!activity) {
            res.status(StatusCodes.BAD_REQUEST);
            res.end();
            return;
        }

        try {
            const maybeAuthHeaders = req.headers.Authorization ?? req.headers.authorization ?? [];
            const authHeader = tests.isString(maybeAuthHeaders) ? maybeAuthHeaders : maybeAuthHeaders[0] ?? '';
            const invokeResponse = await this.processActivity(authHeader, activity, logic);
            writeResponse(res, invokeResponse);
        } catch (err) {
            res.status(err.statusCode ?? StatusCodes.INTERNAL_SERVER_ERROR);
            res.end();
        }
    }
}
