/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

import { Activity, BotContext, BatchOutput, ActivityTypes, InputHints } from 'botbuilder';


 export function sendPrompt(context: BotContext, prompt: string|Partial<Activity>, speak?: string): Promise<void> {
    // Compose activity
    const msg: Partial<Activity> = typeof prompt === 'string' ? { text: prompt } : Object.assign({}, prompt);
    if (speak) { msg.speak = speak }
    if (!msg.type) { msg.type = ActivityTypes.Message }
    if (!msg.inputHint) { msg.inputHint = InputHints.ExpectingInput }

    // Send using batch output to ensure that prompt gets appended if batching is being used.
    return new BatchOutput(context).reply(msg).flush().then(() => { 
        // eat response body 
    });
 }