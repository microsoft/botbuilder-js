/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

import { Activity, TurnContext, ActivityTypes, InputHints } from 'botbuilder';


/**
 * @private
 * @param context 
 * @param prompt 
 * @param speak 
 */
export function sendPrompt(context: TurnContext, prompt: string|Partial<Activity>, speak?: string): Promise<void> {
    // Compose activity
    const msg: Partial<Activity> = typeof prompt === 'string' ? { text: prompt } : Object.assign({}, prompt);
    if (speak) { msg.speak = speak }
    if (!msg.type) { msg.type = ActivityTypes.Message }
    if (!msg.inputHint) { msg.inputHint = InputHints.ExpectingInput }

    // Send activity and eat response.
    return context.sendActivity(msg).then(() => { });
}