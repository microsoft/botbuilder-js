"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @private
 */
exports.channels = {
    facebook: 'facebook',
    skype: 'skype',
    msteams: 'msteams',
    telegram: 'telegram',
    kik: 'kik',
    email: 'email',
    slack: 'slack',
    groupme: 'groupme',
    sms: 'sms',
    emulator: 'emulator',
    directline: 'directline',
    webchat: 'webchat',
    console: 'console',
    cortana: 'cortana'
};
/**
 * @private
 * @param channelId
 * @param buttonCnt
 */
function supportsSuggestedActions(channelId, buttonCnt = 100) {
    switch (channelId) {
        case exports.channels.facebook:
        case exports.channels.skype:
            return (buttonCnt <= 10);
        case exports.channels.kik:
            return (buttonCnt <= 20);
        case exports.channels.slack:
        case exports.channels.telegram:
        case exports.channels.emulator:
            return (buttonCnt <= 100);
        default:
            return false;
    }
}
exports.supportsSuggestedActions = supportsSuggestedActions;
/**
 * @private
 * @param channelId
 * @param buttonCnt
 */
function supportsCardActions(channelId, buttonCnt = 100) {
    switch (channelId) {
        case exports.channels.facebook:
        case exports.channels.skype:
        case exports.channels.msteams:
            return (buttonCnt <= 3);
        case exports.channels.slack:
        case exports.channels.emulator:
        case exports.channels.directline:
        case exports.channels.webchat:
        case exports.channels.cortana:
            return (buttonCnt <= 100);
        default:
            return false;
    }
}
exports.supportsCardActions = supportsCardActions;
/**
 * @private
 * @param channelId
 */
function hasMessageFeed(channelId) {
    switch (channelId) {
        case exports.channels.cortana:
            return false;
        default:
            return true;
    }
}
exports.hasMessageFeed = hasMessageFeed;
/**
 * @private
 * @param channelId
 */
function maxActionTitleLength(channelId) {
    return 20;
}
exports.maxActionTitleLength = maxActionTitleLength;
/**
 * @private
 * @param context
 */
function getChannelId(context) {
    return context.activity.channelId || '';
}
exports.getChannelId = getChannelId;
//# sourceMappingURL=channel.js.map