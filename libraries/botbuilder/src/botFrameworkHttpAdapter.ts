// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BotLogic, Emitter, Request, Response } from './interfaces';

export interface BotFrameworkHttpAdapter {
    process(req: Request & Emitter, res: Response, logic: BotLogic): Promise<void>;
}
