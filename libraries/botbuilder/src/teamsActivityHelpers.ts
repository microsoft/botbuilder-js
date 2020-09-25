/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import {
    Activity,
    ChannelInfo,
    NotificationInfo,
    TeamInfo,
    TeamsChannelData
} from 'botbuilder-core';

/**
 * Activity helper methods for Teams.
 */
export function teamsGetChannelId(activity: Activity): string {
    if (!activity) {
        throw new Error('Missing activity parameter');
    }

    const channelData: TeamsChannelData = activity.channelData as TeamsChannelData;
    const channel: ChannelInfo = channelData ? channelData.channel : null;
    return channel && channel.id ? channel.id : null;
}

/**
 * Gets the Team Id from the current activity.
 * @param activity The current activity.
 * 
 * @returns The current activity's team's Id, or null.
 */
export function teamsGetTeamId(activity: Activity): string {
    if (!activity) {
        throw new Error('Missing activity parameter');
    }

    const channelData: TeamsChannelData = activity.channelData as TeamsChannelData;
    const team: TeamInfo = channelData ? channelData.team : null;
    return team && team.id ? team.id : null;
}

/**
 * Configures the current activity to generate a notification within Teams.
 * @param activity The current activity.
 */
export function teamsNotifyUser(activity: Activity): void {
    if (!activity) {
        throw new Error('Missing activity parameter');
    }

    if (!activity.channelData || typeof activity.channelData !== 'object') {
        activity.channelData = {};
    }

    const channelData: TeamsChannelData = activity.channelData as TeamsChannelData;
    channelData.notification = { alert: true } as NotificationInfo;
}

/**
 * Gets the TeamsInfo object from the current activity.
 * @param activity The current activity.
 * 
 * @returns The current activity's team's info, or null.
 */
export function teamsGetTeamInfo(activity: Activity): TeamInfo {
    if (!activity) {
        throw new Error('Missing activity parameter');
    }

    const channelData: TeamsChannelData = activity.channelData as TeamsChannelData;
    const team: TeamInfo = channelData ? channelData.team : null;
    return team;
}
