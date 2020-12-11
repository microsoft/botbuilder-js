// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import getStream = require('get-stream');
import { Activity, InvokeResponse, StatusCodes } from 'botbuilder-core';
import { Emitter, Request, Response } from './interfaces';
import { validateAndFixActivity } from './activityValidator';
import { tests } from 'botbuilder-stdlib';

/**
 * Returns the activity in a web request, or null.
 *
 * @param {Request} req request to read
 * @returns {Promise<Activity | null>} a promise that resolves to the request activity
 */
export async function readRequest(req: Request & Emitter): Promise<Activity | null> {
    const body = req.body ?? (await getStream(req));
    const parsed = tests.isDictionary(body) ? body : JSON.parse(body);
    return tests.isDictionary(parsed) ? validateAndFixActivity((parsed as unknown) as Activity) : null;
}

/**
 * Write invokeResponse to HTTP response
 *
 * @param {Response} res a response
 * @param {InvokeResponse} invokeResponse an invoke response
 */
export function writeResponse(res: Response, invokeResponse?: InvokeResponse): void {
    if (!invokeResponse) {
        res.status(StatusCodes.OK);
    } else {
        const { body, status } = invokeResponse;

        res.status(status);

        if (body) {
            res.header('Content-Type', 'application/json');
            res.send(JSON.stringify(body));
        }
    }

    res.end();
}
