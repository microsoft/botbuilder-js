/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */


/**
 * Activity helper methods for Teams.
 */

export function teamsGetChannelId(activity : object) {
    const channelData = ('channelData' in activity) ? activity['channelData'] : null;
    const channel = (validObject(channelData) && 'channel' in channelData) ? channelData['channel'] : null;
    return (validObject(channel) && 'id' in channel) ? channel['id'] : null;
}

export function teamsGetTeamId(activity : object) {
    const channelData = ('channelData' in activity) ? activity['channelData'] : null;
    const team = (validObject(channelData) && 'team' in channelData) ? channelData['team'] : null;
    return (validObject(team) && 'id' in team) ? team['id'] : null;
}

export function teamsNotifyUser(activity : object) {
    const channelData = (validObject(activity) && 'channelData' in activity) ? activity['channelData'] : { };
    channelData['Notification'] = { Alert: true };
    activity['channelData'] = channelData;
}    

function validObject(activity) {
    // Check make sure not a string
    if (activity == null || activity == undefined || activity instanceof String || typeof(activity) == 'string' ) {
        return false;
    }
    return true;
}