/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

const assert = require('assert');
const { teamsGetChannelId, teamsGetTeamId, teamsNotifyUser, teamsNotifyMeeting, teamsGetTeamInfo } = require('../');

function createActivityTeamId() {
    return {
        type: 'message',
        timestamp: Date.now,
        id: 1,
        text: "testMessage",
        channelId: 'teams',
        from: { id: `User1` },
        channelData: { team: { id: 'myId', aadGroupId: 'myaadGroupId' } },
        conversation: { id: 'conversationId' },
        recipient: { id: 'Bot1', name: '2' },
        serviceUrl: 'http://foo.com/api/messages'
    };
}

function createActivityNoTeamId() {
    return {
        type: 'message',
        timestamp: Date.now,
        id: 1,
        text: "testMessage",
        channelId: 'teams',
        from: { id: `User1` },
        channelData: { team: 'myTeams' },
        conversation: { id: 'conversationId' },
        recipient: { id: 'Bot1', name: '2' },
        serviceUrl: 'http://foo.com/api/messages'
    };
}

function createActivityNoChannelData() {
    return {
        type: 'message',
        timestamp: Date.now,
        id: 1,
        text: "testMessage",
        channelId: 'teams',
        from: { id: `User1` },
        conversation: { id: 'conversationId' },
        recipient: { id: 'Bot1', name: '2' },
        serviceUrl: 'http://foo.com/api/messages'
    };
}

describe('TeamsActivityHelpers method', function () {
    describe('teamsGetChannelId()', () => {
        it('should return null if activity.channelData is falsey', () => {
            const channelId = teamsGetChannelId(createActivityNoChannelData());
            assert(channelId === null);
        });

        it('should return null if activity.channelData.channel is falsey', () => {
            const activity = createActivityTeamId();
            const channelId = teamsGetChannelId(activity);
            assert(channelId === null);
        });

        it('should return null if activity.channelData.channel.id is falsey', () => {
            const activity = createActivityTeamId();
            activity.channelData.channel = {};
            const channelId = teamsGetChannelId(activity);
            assert(channelId === null);
        });

        it('should return channel id', () => {
            const activity = createActivityTeamId();
            activity.channelData.channel = { id: 'channelId' };
            const channelId = teamsGetChannelId(activity);
            assert.strictEqual(channelId, 'channelId');
        });

        it('should throw an error if no activity is passed in', () => {
            assert.throws(
                () => teamsGetChannelId(undefined),
                Error('Missing activity parameter')
            );
        });
    });

    describe('teamsGetTeamId()', () => {
        it('should return team id', async function () {
            const activity = createActivityTeamId();
            const id = teamsGetTeamId(activity);
            assert(id === 'myId');
        });

        it('should return null with no team id', async function () {
            const activity = createActivityNoTeamId();
            const id = teamsGetTeamId(activity);
            assert(id === null);
        });

        it('should return null with no channelData', async function () {
            const activity = createActivityNoChannelData();
            const id = teamsGetTeamId(activity);
            assert(id === null);
        });

        it('should throw an error if no activity is passed in', () => {
            assert.throws(
                () => teamsGetTeamId(undefined),
                Error('Missing activity parameter')
            );
        });
    });

    describe('teamsNotifyUser()', () => {
        it('should add notify with no notification in channelData', async function () {
            const activity = createActivityTeamId();
            teamsNotifyUser(activity);
            assert(activity.channelData.notification.alert === true);
        });

        it('should add notify with no channelData', async function () {
            const activity = createActivityNoChannelData();
            teamsNotifyUser(activity);
            assert(activity.channelData.notification.alert === true);
        });

        it('should throw an error if no activity is passed in', () => {
            assert.throws(
                () => teamsNotifyUser(undefined),
                Error('Missing activity parameter')
            );
        });

        it('should add notify with no notification in channelData', async function () {
            const activity = createActivityTeamId();
            teamsNotifyUser(activity, true, 'externalUrl');
            assert(activity.channelData.notification.alertInMeeting === true);
            assert(activity.channelData.notification.externalResourceUrl === 'externalUrl');
        });

        it('should add notify with no channelData', async function () {
            const activity = createActivityNoChannelData();
            teamsNotifyUser(activity, true, 'externalUrl');
            assert(activity.channelData.notification.alertInMeeting === true);
            assert(activity.channelData.notification.externalResourceUrl === 'externalUrl');
        });

        it('should throw an error if no activity is passed in', () => {
            assert.throws(
                () => teamsNotifyUser(undefined, true, 'externalUrl'),
                Error('Missing activity parameter')
            );
        });
    });

    describe('teamsGetTeamInfo()', () => {
        it('should return team id', async function () {
            const activity = createActivityTeamId();
            const teamInfo = teamsGetTeamInfo(activity);
            assert(teamInfo.id === 'myId');
        });

        it('should return undefined with no team id', async function () {
            const activity = createActivityNoTeamId();
            const teamInfo = teamsGetTeamInfo(activity);
            assert(teamInfo.id === undefined);
        });

        it('should return null with no channelData', async function () {
            const activity = createActivityNoChannelData();
            const teamInfo = teamsGetTeamInfo(activity);
            assert(teamInfo === null);
        });

        it('should return aadGroupId', async function () {
            const activity = createActivityTeamId();
            const teamInfo = teamsGetTeamInfo(activity);
            assert(teamInfo.aadGroupId === 'myaadGroupId');
        });

        it('should throw an error if no activity is passed in', () => {
            assert.throws(
                () => teamsGetTeamInfo(undefined),
                Error('Missing activity parameter')
            );
        });
    });
});
