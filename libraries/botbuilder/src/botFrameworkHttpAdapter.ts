// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import type { INodeBuffer, INodeSocket } from 'botframework-streaming';
import { BotLogic, Request, Response } from './interfaces';

/**
 * BotFrameworkHttpAdapter is the interface that describes a Bot Framework
 * adapter that operates on HTTP requests.
 */
export interface BotFrameworkHttpAdapter {
    /**
     * `process` accepts a request, response, and a bot logic function. It should
     * decode the request, apply the bot logic function, and encodes the result in
     * the response.
     */
    process(req: Request, res: Response, logic: BotLogic): Promise<void>;

    /**
     * TODO(jpg) this
     */
    process(req: Request, socket: INodeSocket, head: INodeBuffer, logic: BotLogic): Promise<void>;
}
