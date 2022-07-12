/**
 * @module botbuilder-dialogs-adaptive-testing
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Activity, ActivityTypes } from 'botbuilder-core';
import { AssertReplyActivity, AssertReplyActivityConfiguration } from './assertReplyActivity';

export interface AssertReplyConfiguration extends AssertReplyActivityConfiguration {
    text?: string;
    exact?: boolean;
}

/**
 * Test Script action to assert that the bots' reply matches expectations.
 */
export class AssertReply extends AssertReplyActivity implements AssertReplyConfiguration {
    static $kind = 'Microsoft.Test.AssertReply';

    /**
     * The text value to look for in the reply.
     */
    text: string;

    /**
     * A value indicating whether text should be an exact match.
     */
    exact = true;

    /**
     * Gets the text to assert for an activity.
     *
     * @returns String.
     */
    getConditionDescription(): string {
        return this.text;
    }

    /**
     * Validates the reply of an activity.
     *
     * @param activity The activity to verify.
     */
    validateReply(activity: Activity) {
        if (this.text) {
            if (this.exact) {
                if (activity.type == ActivityTypes.Message && activity.text != this.text) {
                    throw new Error(
                        this.description || `Text ${activity.text} didn't match expected text: ${this.text}`
                    );
                }
            } else {
                if (
                    activity.type == ActivityTypes.Message &&
                    !activity.text.toLowerCase().trim().includes(this.text.toLowerCase().trim())
                ) {
                    throw new Error(
                        this.description || `Text ${activity.text} didn't match expected text: ${this.text}`
                    );
                }
            }
        }

        super.validateReply(activity);
    }
}
