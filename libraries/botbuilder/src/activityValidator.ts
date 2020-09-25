/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Activity, ActivityTimestamps } from 'botbuilder-core';

/**
 * Validates an activity and formats the timestamp fields.
 * @param activity Activity to be validated.
 */
export function validateAndFixActivity(activity: Activity): Activity {
    if (typeof activity !== 'object') { throw new Error(`validateAndFixActivity(): invalid request body.`); }
    if (typeof activity.type !== 'string') { throw new Error(`validateAndFixActivity(): missing activity type.`); }
    if (typeof activity.timestamp === 'string') {
        (activity as ActivityTimestamps).rawTimestamp = activity.timestamp;
        activity.timestamp = new Date(activity.timestamp);
    }
    if (typeof activity.expiration === 'string') {
        (activity as ActivityTimestamps).rawExpiration = activity.expiration;
        activity.expiration = new Date(activity.expiration);
    }
    if (typeof activity.localTimestamp === 'string') {
        (activity as ActivityTimestamps).rawLocalTimestamp = activity.localTimestamp;
        activity.localTimestamp = new Date(activity.localTimestamp);
    }
    return activity;
}
