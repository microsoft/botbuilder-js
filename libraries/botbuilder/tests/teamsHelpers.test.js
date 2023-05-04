/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

const assert = require('assert');
const {
    teamsGetChannelId,
    teamsGetSelectedChannelId,
    teamsGetTeamId,
    teamsGetTeamInfo,
    teamsNotifyUser,
    teamsGetTeamOnBehalfOf,
} = require('../');

function createActivityTeamId() {
    return {
        type: 'message',
        timestamp: Date.now,
        id: 1,
        text: 'testMessage',
        channelId: 'teams',
        from: { id: 'User1' },
        channelData: { team: { id: 'myId', aadGroupId: 'myaadGroupId' } },
        conversation: { id: 'conversationId' },
        recipient: { id: 'Bot1', name: '2' },
        serviceUrl: 'http://foo.com/api/messages',
    };
}

function createActivityNoTeamId() {
    return {
        type: 'message',
        timestamp: Date.now,
        id: 1,
        text: 'testMessage',
        channelId: 'teams',
        from: { id: 'User1' },
        channelData: { team: 'myTeams' },
        conversation: { id: 'conversationId' },
        recipient: { id: 'Bot1', name: '2' },
        serviceUrl: 'http://foo.com/api/messages',
    };
}

function createActivityNoChannelData() {
    return {
        type: 'message',
        timestamp: Date.now,
        id: 1,
        text: 'testMessage',
        channelId: 'teams',
        from: { id: 'User1' },
        conversation: { id: 'conversationId' },
        recipient: { id: 'Bot1', name: '2' },
        serviceUrl: 'http://foo.com/api/messages',
    };
}

describe('TeamsActivityHelpers method', function () {
    describe('teamsGetChannelId()', function () {
        it('should return null if activity.channelData is falsey', function () {
            const channelId = teamsGetChannelId(createActivityNoChannelData());
            assert(channelId === null);
        });

        it('should return null if activity.channelData.channel is falsey', function () {
            const activity = createActivityTeamId();
            const channelId = teamsGetChannelId(activity);
            assert(channelId === null);
        });

        it('should return null if activity.channelData.channel.id is falsey', function () {
            const activity = createActivityTeamId();
            activity.channelData.channel = {};
            const channelId = teamsGetChannelId(activity);
            assert(channelId === null);
        });

        it('should return channel id', function () {
            const activity = createActivityTeamId();
            activity.channelData.channel = { id: 'channelId' };
            const channelId = teamsGetChannelId(activity);
            assert.strictEqual(channelId, 'channelId');
        });

        it('should throw an error if no activity is passed in', function () {
            assert.throws(() => teamsGetChannelId(undefined), Error('Missing activity parameter'));
        });
    });

    describe('teamsGetTeamId()', function () {
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

        it('should throw an error if no activity is passed in', function () {
            assert.throws(() => teamsGetTeamId(undefined), Error('Missing activity parameter'));
        });
    });

    describe('teamsNotifyUser()', function () {
        it('should add notify with no notification in channelData', async function () {
            const activity = createActivityTeamId();
            teamsNotifyUser(activity);
            assert(activity.channelData.notification.alert === true);
            assert(activity.channelData.notification.alertInMeeting === false);
        });

        it('should add notify with no channelData', async function () {
            const activity = createActivityNoChannelData();
            teamsNotifyUser(activity);
            assert(activity.channelData.notification.alert === true);
            assert(activity.channelData.notification.alertInMeeting === false);
        });

        it('should throw an error if no activity is passed in', function () {
            assert.throws(() => teamsNotifyUser(undefined), Error('Missing activity parameter'));
        });

        it('should add notify with no notification in channelData, and externalUrl', async function () {
            const activity = createActivityTeamId();
            teamsNotifyUser(activity, true, 'externalUrl');
            assert(activity.channelData.notification.alert === false);
            assert(activity.channelData.notification.alertInMeeting === true);
            assert(activity.channelData.notification.externalResourceUrl === 'externalUrl');
        });

        it('should add notify with no channelData, and externalUrl', async function () {
            const activity = createActivityNoChannelData();
            teamsNotifyUser(activity, true, 'externalUrl');
            assert(activity.channelData.notification.alert === false);
            assert(activity.channelData.notification.alertInMeeting === true);
            assert(activity.channelData.notification.externalResourceUrl === 'externalUrl');
        });

        it('should throw an error if no activity is passed in, and externalUrl', function () {
            assert.throws(() => teamsNotifyUser(undefined, true, 'externalUrl'), Error('Missing activity parameter'));
        });
    });

    describe('teamsGetTeamInfo()', function () {
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

        it('should throw an error if no activity is passed in', function () {
            assert.throws(() => teamsGetTeamInfo(undefined), Error('Missing activity parameter'));
        });
    });

    describe('teamsGetSelectedChannelId()', function () {
        it('should return channel id', async function () {
            const activity = { channelData: { settings: { selectedChannel: { id: 'channel123' } } } };
            const channelId = teamsGetSelectedChannelId(activity);
            assert.strictEqual(channelId, 'channel123');
        });

        it('should return channel id with null settings', async function () {
            const activity = { channelData: { settings: null } };
            const channelId = teamsGetSelectedChannelId(activity);
            assert.strictEqual(channelId, '');
        });
    });

    describe('teamsGetTeamOnBehalfOf()', function () {
        it('should return onBehalfOf list', async function () {
            const activity = {
                channelData: {
                    onBehalfOf: [
                        {
                            itemId: 0,
                            displayName: 'onBehalfOfTest',
                            mentionType: 'person',
                            mri: 'mriTest',
                        },
                    ],
                },
            };
            const onBehalfOf = teamsGetTeamOnBehalfOf(activity)[0];
            assert.strictEqual(onBehalfOf.displayName, activity.channelData.onBehalfOf[0].displayName);
        });

        it('should return null with no channelData', async function () {
            const activity = createActivityNoChannelData();
            const onBehalfOf = teamsGetTeamOnBehalfOf(activity);
            assert(onBehalfOf === null);
        });

        it('should return null with no onBehalfOf list', async function () {
            const activity = { channelData: { onBehalfOf: null } };
            const onBehalfOf = teamsGetTeamOnBehalfOf(activity);
            assert(onBehalfOf === null);
        });
    });
});
