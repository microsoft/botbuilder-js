/**
 * @module botbuilder-dialogs-adaptive-testing
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Activity, ActivityTypes } from 'botbuilder-core';
import { AssertReplyActivity } from './assertReplyActivity';

export class AssertReplyOneOf extends AssertReplyActivity {
    /**
     * The text variations.
     */
    public text: string[] = [];

    /**
     * A value indicating whether exact match policy should be used.
     */
    public exact: boolean = true;

    public getConditionDescription(): string {
        return this.text.join('\n');
    }

    public validateReply(activity: Activity) {
        let found = false;

        for (let i = 0; i < this.text.length; i++) {
            const reply = this.text[i];
            if (this.exact) {
                if (activity.type == ActivityTypes.Message && activity.text === reply) {
                    found = true;
                    break;
                }
            } else {
                if (activity.type == ActivityTypes.Message && activity.text.toLowerCase().trim().includes(reply.toLowerCase().trim())) {
                    found = true;
                    break;
                }
            }
        }

        if (!found) {
            throw new Error(this.description || `Text ${ activity.text } didn't match one of expected text: ${ this.text.join('\n') }`);
        }

        super.validateReply(activity);
    }
}