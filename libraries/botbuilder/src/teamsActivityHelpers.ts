/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Activity, TeamInfo, TeamsChannelData } from 'botbuilder-core';

function isTeamsChannelData(channelData: unknown): channelData is TeamsChannelData {
    return typeof channelData === 'object';
}

function validateActivity(activity: Activity): void {
    if (!activity) {
        throw new Error('Missing activity parameter');
    }
}

/**
 * Activity helper methods for Teams.
 */

export function teamsGetTeamInfo(activity: Activity): TeamInfo | null {
    validateActivity(activity);

    const channelData = activity.channelData;
    if (isTeamsChannelData(channelData)) {
        const team = channelData.team;
        return team || null;
    }

    return null;
}

export function teamsGetTeamId(activity: Activity): string | null {
    const team = teamsGetTeamInfo(activity);
    return team && team.id ? team.id : null;
}

export function teamsGetChannelId(activity: Activity): string | null {
    validateActivity(activity);

    const channelData = activity.channelData;
    if (isTeamsChannelData(channelData)) {
        const channel = channelData.channel;
        return channel && channel.id ? channel.id : null;
    }

    return null;
}

export function teamsNotifyUser(activity: Activity, alertInMeeting?: boolean, externalResourceUrl?: string): void {
    validateActivity(activity);

    if (!isTeamsChannelData(activity.channelData)) {
        activity.channelData = {};
    }

    if (isTeamsChannelData(activity.channelData)) {
        activity.channelData.notification = { alert: true, alertInMeeting, externalResourceUrl };
    }
}
