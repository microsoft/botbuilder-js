// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import type { BotLogic } from 'botbuilder-core';
import type { INodeBuffer, INodeSocket } from 'botframework-streaming';
import type { Request, Response } from './interfaces';

/**
 * BotFrameworkHttpAdapter is the interface that describes a Bot Framework
 * adapter that operates on HTTP requests.
 */
export interface BotFrameworkHttpAdapter {
    /**
     * Process a web request by applying a [BotLogic](xref:botbuilder.BotLogic) function.
     */
    process(req: Request, res: Response, logic: BotLogic): Promise<void>;

    /**
     * Handle a web socket connection by applying a [BotLogic](xref:botbuilder.BotLogic) function to
     * each streaming request.
     */
    process(req: Request, socket: INodeSocket, head: INodeBuffer, logic: BotLogic): Promise<void>;
}
