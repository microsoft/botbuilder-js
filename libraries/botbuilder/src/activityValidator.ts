/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Activity } from 'botbuilder-core';

export function validateActivity(resolve: any, activity: Activity): void{
    if (typeof activity !== 'object') { throw new Error(`activityValidator.validateActivity(): invalid request body.`); }
    if (typeof activity.type !== 'string') { throw new Error(`activityValidator.validateActivity(): missing activity type.`); }
    if (typeof activity.timestamp === 'string') { activity.timestamp = new Date(activity.timestamp); }
    if (typeof activity.expiration === 'string') { activity.expiration = new Date(activity.expiration); }
    if (typeof activity.localTimestamp === 'string') { 
        // Since Javascript Date object is UTC, this code will pull the TimezoneOffset and put it
        // in activity.localTimezoneOffset to preserve the value.
        let [d, fullTime] = (activity.localTimestamp as string).split('T');
        if(fullTime){
            let [t, tz] = fullTime.split(/(?=[+-])/);
            activity.localTimezoneOffset = tz;
        }
        activity.localTimestamp = new Date(activity.localTimestamp); 
    }
    resolve(activity);
};
