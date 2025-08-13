/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * PORTED AND ADAPTED FROM => "@microsoft/bf-chatdown": "^4.15.0"
 */

/* eslint-disable */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const mime = require('mime-types');
const { ActivityTypes, AttachmentLayoutTypes } = require('botframework-schema');
const axios = require('axios');
const NEWLINE = require('os').EOL;

let activityId = 1;

const activityfield = {
    attachment: 'attachment',
    attachmentlayout: 'attachmentlayout',
    suggestions: 'suggestions',
    herocard: 'herocard',
    thumbnailcard: 'thumbnailcard',
    mediacard: 'mediacard',
    animationcard: 'animationcard',
    audiocard: 'audiocard',
    videocard: 'videocard',
    oauthcard: 'oauthcard',
    signincard: 'signincard',
    receiptcard: 'receiptcard',
};

const instructions = {
    delay: 'delay',
};

const activitytypes = {
    message: 'message',
    contactrelationupdate: 'contactRelationUpdate',
    conversationupdate: 'conversationUpdate',
    typing: 'typing',
    ping: 'ping',
    endofconversation: 'endOfConversation',
    event: 'event',
    invoke: 'invoke',
    deleteuserdata: 'deleteUserData',
    messageupdate: 'messageUpdate',
    messagedelete: 'messageDelete',
    installationupdate: 'installationUpdate',
    messagereaction: 'messageReaction',
    suggestion: 'suggestion',
};

const base = 'application/vnd.microsoft.card.';
const cardContentTypes = {
    animation: `${base}animation`,
    audio: `${base}audio`,
    hero: `${base}hero`,
    receipt: `${base}receipt`,
    thumbnail: `${base}thumbnail`,
    signin: `${base}signin`,
    oauth: `${base}oauth`,
    media: `${base}media`,
    video: `${base}video`,
    adaptivecard: `${base}adaptive`,
};
function isCard(contentType) {
    return contentType.includes(base);
}

const consoleColors = {
    BgRed: '\x1b[41m',
    Reset: '\x1b[0m',
};

// Matches [someActivityOrInstruction=value]
const commandRegExp = /(?:\[)([\s\S]*?)(?:])/i;
const configurationRegExp = /^(bot|user|users|channelId)(?:=)/;
const messageTimeGap = 2000;
let now = Date.now();
now -= now % 1000; // nearest second
let workingDirectory;

/**
 * Entry for dialog parsing.
 *
 * @param fileContents UTF-8 encoded bytes to parse.
 * @param args The k/v pair representing the configuration options
 * @returns {Promise<Array>} Resolves with an array of Activity objects.
 */
module.exports = async function readContents(fileContents, args = {}) {
    if (args.stamp || args.s) {
        now = new Date(2015, 9, 15, 12, 0, 0, 0).getTime();
    }
    // Resolve file paths based on the input file with a fallback to the cwd
    workingDirectory = args.in ? path.dirname(path.resolve(args.in)) : __dirname;
    const activities = [];
    const lines = fileLineIterator(fileContents.trim() + NEWLINE);
    // Aggregate the contents of each line until
    // we reach a new activity.
    let aggregate = '';
    // Read each line, derive activities with messages, then
    // return them as the payload
    const conversationId = getHashCode(fileContents);

    args.bot = 'bot';
    args.users = [];
    let inHeader = true;
    for (const line of lines) {
        // skip line if it is just a comment
        if (line.indexOf('>') === 0) continue;

        // pick up settings from the first lines
        if (inHeader && configurationRegExp.test(line)) {
            const [optionName, value, ...rest] = line.trim().split('=');
            if (rest.length) {
                throw new Error(
                    'Malformed configurations options detected. Options must be in the format optionName=optionValue'
                );
            }
            switch (optionName.trim()) {
                case 'user':
                case 'users':
                    args.users = value.split(',');
                    break;
                case 'bot':
                    args.bot = value.trim();
                    break;
            }
            continue;
        }

        if (inHeader) {
            inHeader = false;
            if (!Array.isArray(args.users) || !args.users.length) args.users = ['user'];

            // starting the transcript, initialize the bot/user data accounts
            initConversation(args, conversationId, activities);
        }

        // process transcript lines
        if (args.newMessageRegEx.test(line)) {
            // process aggregate activites
            aggregate = aggregate.trim();
            if (aggregate.length > 0) {
                const newActivities = await readCommandsFromAggregate(args, aggregate);
                if (newActivities) {
                    activities.push(...newActivities);
                }
            }

            const matches = args.newMessageRegEx.exec(line);
            const speaker = matches[1];
            const customRecipient = matches[3];
            args.from = args.accounts[speaker.toLowerCase()];

            if (customRecipient) {
                args.recipient = args.accounts[customRecipient.toLowerCase()];
            } else {
                // pick recipient based on role
                if (args.from.role == 'bot') {
                    // default for bot is last user
                    args.recipient = args.accounts[args.user.toLowerCase()];
                } else {
                    // default recipient for a user is the bot
                    args.recipient = args.accounts[args.bot.toLowerCase()];
                    // remember this user as last user to speak
                    args.user = args.from.name;
                    args.accounts.user = args.accounts[args.user.toLowerCase()];
                }
            }
            // aggregate starts new with this line
            aggregate = line.substr(matches[0].length).trim() + NEWLINE;
        } else {
            // Not a new message but could contain
            // an activity on the line by itself.
            aggregate += line + NEWLINE;
        }
    }

    // end of file, process aggregate
    if (aggregate && aggregate.trim().length > 0) {
        const newActivities = await readCommandsFromAggregate(args, aggregate);
        if (newActivities) {
            activities.push(...newActivities);
        }
    }
    return activities;
};

function initConversation(args, conversationId, activities) {
    args.conversation = new ConversationAccount({ id: conversationId });
    args.accounts = {};
    args.accounts.bot = new ChannelAccount({ id: getHashCode(args.bot), name: args.bot, role: 'bot' });
    args.accounts[args.bot.toLowerCase()] = args.accounts.bot;

    // first activity should be a ConversationUpdate, create and add it
    const conversationUpdate = createConversationUpdate(
        args,
        /* membersAdded */ [args.accounts.bot],
        /* membersRemoved*/ []
    );

    for (let user of args.users) {
        user = user.trim();
        args.accounts[user.toLowerCase()] = new ChannelAccount({ id: getHashCode(user), name: user, role: 'user' });
        // conversationUpdate.membersAdded.push(args.accounts[user.toLowerCase()]);
        if (!args.user) {
            // first user is default user
            args.user = user;
            args.accounts.user = args.accounts[user.toLowerCase()];
        }
    }
    conversationUpdate.recipient = args.accounts.bot;
    conversationUpdate.from = args.accounts.user;

    // define matching statements regex for users
    args.newMessageRegEx = new RegExp(
        `^(${args.users.join('|')}|${args.bot}|bot|user)(->(${args.users.join('|')}))??:`,
        'i'
    );
    activities.push(conversationUpdate);
}

/**
 * create ConversationUpdate Activity
 *
 * @param {*} args
 * @param {ChannelAccount} from
 * @param {ChannelAccount[]} membersAdded
 * @param {ChannelAccount[]} membersRemoved
 */
function createConversationUpdate(args, membersAdded, membersRemoved) {
    const conversationUpdateActivity = createActivity({
        type: activitytypes.conversationupdate,
        recipient: args[args.botId],
        conversationId: args.conversation.id,
    });
    conversationUpdateActivity.membersAdded = membersAdded || [];
    conversationUpdateActivity.membersRemoved = membersRemoved || [];
    conversationUpdateActivity.timestamp = getIncrementedDate(100);
    return conversationUpdateActivity;
}

/**
 * Reads activities from a text aggregate. Aggregates
 * form when multiple activities occur in the context of a
 * single participant as is the case for attachments.
 *
 * @param {string} aggregate The aggregate text to derive activities from.
 * @param {Activity} currentActivity The Activity currently in context
 * @param {string} recipient The recipient of the Activity
 * @param {string} from The sender of the Activity
 * @param {string} conversationId The id of the channel
 *
 * @returns {Promise<*>} Resolves to the number of new activities encountered or null if no new activities resulted
 */
async function readCommandsFromAggregate(args, aggregate) {
    const newActivities = [];
    commandRegExp.lastIndex = 0;
    let result;
    let delay = messageTimeGap;
    let currentActivity = createActivity({
        type: activitytypes.Message,
        from: args.from,
        recipient: args.recipient,
        conversationId: args.conversation.id,
    });
    currentActivity.text = '';
    while ((result = commandRegExp.exec(aggregate))) {
        // typeOrField should always be listed first
        const match = result[1]; // result[] doesn't have [] on it
        const lines = match.split(NEWLINE);
        const split = lines[0].indexOf('=');
        const typeOrField = split > 0 ? lines[0].substring(0, split).trim() : lines[0].trim();
        let rest = split > 0 ? lines[0].substring(split + 1).trim() : undefined;
        if (lines.length > 1) rest = match.substr(match.indexOf(NEWLINE) + NEWLINE.length);
        const type = activitytypes[typeOrField.toLowerCase()];
        const field = activityfield[typeOrField.toLowerCase()];
        const instruction = instructions[typeOrField.toLowerCase()];
        // This isn't an activity - bail
        if (!type && !field && !instruction) {
            // skip unknown tag
            const value = aggregate.substr(0, result.index + result[0].length);
            currentActivity.text += value;
            aggregate = aggregate.substring(value.length);
            continue;
        }

        // Indicates a new activity -
        // As more activity types are supported, this should
        // become a util or helper class.
        if (type) {
            const text = aggregate.substr(0, result.index).trim();
            if (text.length > 0) {
                currentActivity.text = text;
                currentActivity.timestamp = getIncrementedDate(delay);
                newActivities.push(currentActivity);
                // reset
                delay = messageTimeGap;
                currentActivity = createActivity({
                    type: activitytypes.Message,
                    from: args.from,
                    recipient: args.recipient,
                    conversationId: args.conversation.id,
                });
                currentActivity.text = '';
            }
            aggregate = aggregate.substr(result.index);

            switch (type) {
                case activitytypes.typing: {
                    const newActivity = createActivity({
                        type,
                        recipient: args.recipient,
                        from: args.from,
                        conversationId: args.conversation.id,
                    });
                    newActivity.timestamp = getIncrementedDate(100);
                    newActivities.push(newActivity);
                    break;
                }
                case activitytypes.conversationupdate:
                    processConversationUpdate(args, newActivities, rest);
                    break;
            }
        } else if (instruction) {
            switch (instruction) {
                case instructions.delay:
                    delay = parseInt(rest);
                    break;
            }
        } else if (field) {
            // As more activity fields are supported,
            // this should become a util or helper class.
            switch (field) {
                case activityfield.attachment:
                    await addAttachment(currentActivity, rest);
                    break;
                case activityfield.attachmentlayout:
                    addAttachmentLayout(currentActivity, rest);
                    break;
                case activityfield.suggestions:
                    addSuggestions(currentActivity, rest);
                    break;
                case activityfield.basiccard:
                case activityfield.herocard:
                    addCard(cardContentTypes.hero, currentActivity, rest);
                    break;
                case activityfield.thumbnailcard:
                    addCard(cardContentTypes.thumbnail, currentActivity, rest);
                    break;
                case activityfield.animationcard:
                    addCard(cardContentTypes.animation, currentActivity, rest);
                    break;
                case activityfield.mediacard:
                    addCard(cardContentTypes.media, currentActivity, rest);
                    break;
                case activityfield.audiocard:
                    addCard(cardContentTypes.audio, currentActivity, rest);
                    break;
                case activityfield.videocard:
                    addCard(cardContentTypes.video, currentActivity, rest);
                    break;
                // case activityfield.receiptcard:
                //     addCard(cardContentTypes.receipt, currentActivity, rest);
                //     break;
                case activityfield.signincard:
                    addCard(cardContentTypes.signin, currentActivity, rest);
                    break;
                case activityfield.oauthcard:
                    addCard(cardContentTypes.oauth, currentActivity, rest);
                    break;
            }
        }
        // Trim off this activity or activity field and continue.
        aggregate = aggregate.replace(`[${result[1]}]`, '');
        commandRegExp.lastIndex = 0;
    }
    currentActivity.text += aggregate.trim();
    currentActivity.timestamp = getIncrementedDate(delay);

    // if we have content, then add it
    if (
        currentActivity.text.length > 0 ||
        (currentActivity.attachments && currentActivity.attachments.length > 0) ||
        (currentActivity.suggestedActions && currentActivity.suggestedActions.actions.length > 0)
    ) {
        newActivities.push(currentActivity);
    }
    return newActivities.length ? newActivities : null;
}

function processConversationUpdate(args, activities, rest) {
    const conversationUpdate = createConversationUpdate(
        args,
        /*from*/ null,
        /* membersAdded*/ [],
        /* membersRemoved*/ []
    );
    conversationUpdate.timestamp = getIncrementedDate(100);

    const lines = rest.split(NEWLINE);
    for (const line of lines) {
        const start = line.indexOf('=');
        const property = line.substr(0, start).trim().toLowerCase();
        const value = line.substr(start + 1).trim();
        switch (property) {
            case 'added':
            case 'membersadded': {
                const membersAdded = value.split(',');
                for (let memberAdded of membersAdded) {
                    memberAdded = memberAdded.trim();

                    // add the account if we don't know it already
                    if (!args.accounts[memberAdded.toLowerCase()]) {
                        args.accounts[memberAdded.toLowerCase()] = new ChannelAccount({
                            id: getHashCode(memberAdded),
                            name: memberAdded,
                            role: 'user',
                        });
                    }

                    conversationUpdate.membersAdded.push(args.accounts[memberAdded.toLowerCase()]);
                }
                break;
            }
            case 'removed':
            case 'membersremoved': {
                const membersRemoved = value.split(',');
                for (let memberRemoved of membersRemoved) {
                    memberRemoved = memberRemoved.trim();
                    conversationUpdate.membersRemoved.push(args.accounts[memberRemoved.toLowerCase()]);
                }
                break;
            }
            default:
                throw new Error(`Unknown ConversationUpdate Property ${property}`);
        }
    }
    activities.push(conversationUpdate);
}

function addAttachmentLayout(currentActivity, rest) {
    if (rest && rest.toLowerCase() == AttachmentLayoutTypes.Carousel)
        currentActivity.attachmentLayout = AttachmentLayoutTypes.Carousel;
    else if (rest && rest.toLowerCase() == AttachmentLayoutTypes.List)
        currentActivity.attachmentLayout = AttachmentLayoutTypes.List;
    else console.error(`AttachmentLayout of ${rest[0]} is not List or Carousel`);
}

/**
 * Add suggested actions support
 * Example: [suggestions=Option 1|Option 2|Option 3]
 *
 * @param {*} currentActivity
 * @param {*} rest
 */
function addSuggestions(currentActivity, rest) {
    currentActivity.suggestedActions = { actions: [] };
    const actions = rest.split('|');
    for (const action of actions) {
        currentActivity.suggestedActions.actions.push({ title: action.trim(), type: 'imBack', value: action.trim() });
    }
}

/**
 * Add card
 * Example: [herocard=
 *     Title:xxx
 *     subtitle: xxx
 *     Text: xxxx
 *     image: url
 *     Buttons: Option 1|Option 2|Option 3]
 *
 * @param {*} currentActivity
 * @param {*} rest
 */
function addCard(contentType, currentActivity, rest) {
    const card = { buttons: [] };
    const lines = rest.split('\n');
    for (const line of lines) {
        const start = line.indexOf('=');
        const property = line.substr(0, start).trim().toLowerCase();
        const value = line.substr(start + 1).trim();
        switch (property) {
            case 'title':
            case 'subtitle':
            case 'text':
            case 'aspect':
            case 'value':
            case 'connectioname':
                card[property] = value;
                break;
            case 'image':
                card.image = { url: value };
                break;
            case 'images':
                if (!card.images) {
                    card.images = [];
                }
                card.images.push({ url: value });
                break;
            case 'media':
                if (!card.media) card.media = [];
                card.media.push({ url: value });
                break;
            case 'buttons':
                for (const button of value.split('|')) {
                    card.buttons.push({ title: button.trim(), type: 'imBack', value: button.trim() });
                }
                break;
            case 'autostart':
            case 'sharable':
            case 'autoloop':
                card[property] = value.toLowerCase() == 'true';
                break;
            case '':
                break;
            default:
                console.warn(
                    `${consoleColors.BgRed}%s${consoleColors.Reset}`,
                    `Skipping unknown card property ${property}\n${line}`
                );
                break;
        }
    }
    const attachment = { contentType: contentType, content: card };
    (currentActivity.attachments || (currentActivity.attachments = [])).push(attachment);
}

/**
 * Adds an attachment to the activity. If a mimetype is
 * specified, it is used as is. Otherwise, it is derived
 * from the file extension.
 *
 * @param {Activity} activity The activity to add the attachment to
 * @param {*} contentUrl contenturl
 * @param {*} contentType contentType
 *
 * @returns {Promise<number>} The new number of attachments for the activity
 */
async function addAttachment(activity, arg) {
    const parts = arg.trim().split(' ');
    let contentUrl = parts[0].trim();
    let contentType = parts.length > 1 ? parts[1].trim() : undefined;
    if (contentType) {
        contentType = contentType.toLowerCase();
        if (cardContentTypes[contentType]) contentType = cardContentTypes[contentType];
    } else {
        contentType = mime.lookup(contentUrl) || cardContentTypes[path.extname(contentUrl)];

        if (!contentType && contentUrl && contentUrl.indexOf('http') == 0) {
            const response = await axios.get(contentUrl, { method: 'HEAD' });
            contentType = response.headers['content-type'].split(';')[0];
        }
    }

    const charset = mime.charset(contentType);

    // if not a url
    if (contentUrl.indexOf('http') != 0) {
        // read the file
        let content = await readAttachmentFile(contentUrl, contentType);
        // if it is not a card
        if (!isCard(contentType) && charset !== 'UTF-8') {
            // send as base64
            contentUrl = `data:${contentType};base64,${Buffer.from(content).toString('base64')}`;
            content = undefined;
        } else {
            contentUrl = undefined;
        }
        return (activity.attachments || (activity.attachments = [])).push(
            new Attachment({ contentType, contentUrl, content })
        );
    }
    // send as contentUrl
    return (activity.attachments || (activity.attachments = [])).push(new Attachment({ contentType, contentUrl }));
}

/**
 * Utility function for reading the attachment
 *
 * @param fileLocation
 * @param contentType
 * @returns {*}
 */
async function readAttachmentFile(fileLocation, contentType) {
    let resolvedFileLocation = path.join(workingDirectory, fileLocation);
    const exists = fs.existsSync(resolvedFileLocation);

    // fallback to cwd
    if (!exists) {
        resolvedFileLocation = path.resolve(fileLocation);
    }
    // Throws if the fallback does not exist.
    const content = fs.readFileSync(resolvedFileLocation);
    if (contentType.includes('json') || isCard(contentType)) {
        return JSON.parse(content);
    } else {
        return content;
    }
}

/**
 * Utility for creating a new serializable Activity.
 *
 * @param {ActivityTypes} type The Activity type
 * @param {string} to The recipient of the Activity
 * @param {string} from The sender of the Activity
 * @param {string} conversationId The id of the conversation
 * @returns {Activity} The newly created activity
 */
function createActivity({ type = ActivityTypes.Message, recipient, from, conversationId }) {
    const activity = new Activity({ from, recipient, type, id: '' + activityId++ });
    activity.conversation = new ConversationAccount({ id: conversationId });
    return activity;
}

function getIncrementedDate(byThisAmount = messageTimeGap) {
    return new Date((now += byThisAmount)).toISOString();
}

/**
 * Generator producing a well-known Symbol for
 * iterating each line in the UTF-8 encoded string.
 *
 * @param {string} fileContents The contents containing the lines to iterate.
 */
function* fileLineIterator(fileContents) {
    const parts = fileContents.split(/\r?\n/);
    for (const part of parts) {
        yield part;
    }
}

function getHashCode(contents) {
    return crypto.createHash('sha512').update(contents).digest('base64');
}

class Activity {
    /**
     *
     * @property {Attachment[]} attachments
     */

    /**
     * @property text
     */

    /**
     * @property timestamp
     */

    /**
     * @property id
     */

    /**
     * @property type
     */

    /**
     * @property from
     */

    /**
     * @property recipient
     */

    /**
     * @property conversation
     */

    /**
     *
     * @param attachments
     * @param conversation
     * @param id
     * @param recipient
     * @param from
     * @param text
     * @param timestamp
     * @param type
     * @param channelId
     */
    constructor({
        attachments,
        conversation,
        id,
        recipient,
        from,
        text,
        timestamp,
        type,
        channelId = 'chatdown',
    } = {}) {
        Object.assign(this, { attachments, conversation, id, recipient, from, text, timestamp, type, channelId });
    }
}

class ChannelAccount {
    /**
     * @property id
     */

    /**
     * @property name
     */

    /**
     * @property role
     */

    /**
     *
     * @param id
     * @param name
     * @param role
     */
    constructor({ id = 'joe@smith.com', name, role } = {}) {
        Object.assign(this, { id, name, role });
    }
}

class ConversationAccount {
    /**
     * @property isGroup
     */
    /**
     * @property name
     */

    /**
     * @property id
     */

    /**
     *
     * @param isGroup
     * @param name
     * @param id
     */
    constructor({ isGroup, name, id } = {}) {
        Object.assign(this, { isGroup, name, id });
    }
}

class Attachment {
    /**
     * @property contentType
     */

    /**
     * @property contentUrl
     */

    /**
     * @property content
     */

    /**
     *
     * @param contentType
     * @param contentUrl
     * @param content
     */
    constructor({ contentType = '', contentUrl = undefined, content = undefined } = {}) {
        Object.assign(this, { contentType, contentUrl, content });
    }
}
