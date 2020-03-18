/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Activity } from 'botbuilder-core';

export function validateActivity(activity: Activity): Activity {
    if (typeof activity !== 'object') { throw new Error(`validateActivity(): invalid request body.`); }
    if (typeof activity.type !== 'string') { throw new Error(`validateActivity(): missing activity type.`); }
    if (typeof activity.timestamp === 'string') { activity.timestamp = new Date(activity.timestamp); }
    if (typeof activity.expiration === 'string') { activity.expiration = new Date(activity.expiration); }
    if (typeof activity.localTimestamp === 'string') {
        // Since Javascript Date object is UTC, this code will pull the TimezoneOffset and put it
        // in activity.localTimezoneOffset to preserve the value.
        const [d, fullTime] = (activity.localTimestamp as string).split('T');
        if(fullTime) {
            const [t, tz] = fullTime.split(/(?=[+-])/);
            activity.localTimezoneOffset = tz;
        }
        activity.localTimestamp = new Date(activity.localTimestamp); 
    }
    return activity;
};
