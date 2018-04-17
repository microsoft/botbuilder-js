const fs = require('fs-extra');
const path = require('path');
const uuid = require('uuid');
const uuidv3 = require('uuid/v3');
const mime = require('mime-types');
const { ActivityTypes, AttachmentLayoutTypes } = require('botframework-schema');
const Activity = require('./serializable/activity');
const ActivityField = require('./enums/activityField');
const Instructions = require('./enums/instructions');
const { cardContentTypes, isCard } = require('./enums/cardContentTypes');
const ChannelAccount = require('./serializable/channelAccount');
const ConversationAccount = require('./serializable/conversationAccount');
const Attachment = require('./serializable/attachment');

const NS = uuid();
// Matches [someActivityOrInstruction:argument0:argument1:argumentn...]
const commandRegExp = /(?:\[)([^\s]+)+(?=])/g;
const configurationRegExp = /^(bot|user|channelId)(?:=)/;
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
module.exports = async function readContents(fileContents, args) {
    // Resolve file paths based on the input file with a fallback to the cwd
    workingDirectory = args.in ? path.dirname(path.resolve(args.in)) : __dirname;
    const activities = [];
    const lines = fileLineIterator(fileContents.trim() + '\n');
    // Aggregate the contents of each line until
    // we reach a new activity.
    let aggregate = null;
    let currentActivity;
    // Read each line, derive activities with messages, then
    // return them as the payload
    let from;
    let recipient;
    for (let line of lines) {
        // signature for a new message
        if (configurationRegExp.test(line)) {
            const [optionName, value, ...rest] = line.trim().split('=');
            if (rest.length) {
                throw new Error('Malformed configurations options detected. Options must be in the format optionName=optionValue');
            }
            args[optionName.trim()] = value.trim();

            if (args.bot && args.user) {
                const botId = uuidv3(args.bot, NS);
                const userId = uuidv3(args.user, NS);
                args[args.bot.toLowerCase()] = args.bot;
                args[args.user.toLowerCase()] = args.user;
                args.botId = botId;
                args.userId = userId;
                args[botId] = new ChannelAccount({ id: botId, name: args.bot, role: 'bot' });
                args[userId] = new ChannelAccount({ id: userId, name: args.user, role: 'user' });
            }
            continue;
        }
        if (!args.bot || !args.user) {
            throw new ReferenceError('Cannot reference "bot" or "user"');
        }
        // If we've gotten to this point, we've defined
        // user, bot and other config options
        const { channelId = '1', user, bot } = args;
        const newMessageRegEx = new RegExp(`^(${user}|${bot}|bot|user):`, 'i');
        if (newMessageRegEx.test(line)) {
            // Complete the previous activity
            if (currentActivity) {
                currentActivity.text = currentActivity.text ? currentActivity.text.trim() : null;
                activities.push(currentActivity);
            }
            const fromId = args[newMessageRegEx.exec(line)[1].toLowerCase()];
            const fromChannelAccountId = fromId.toLowerCase() === args.bot.toLowerCase() ? args.botId : args.userId;
            const recipientChannelAccountId = fromId.toLowerCase() === args.bot.toLowerCase() ? args.userId : args.botId;

            from = args[fromChannelAccountId];
            recipient = args[recipientChannelAccountId];

            // Start the new activity
            currentActivity = createActivity({ recipient, from, channelId });
            currentActivity.timestamp = getIncrementedDate();

            // Trim off the user or bot and continue since
            // this line may still have a message or other
            // activities to parse.
            // e.g. Joe: Hello! [delay:1000] becomes Hello! [delay:1000]
            aggregate = line.trim().replace(newMessageRegEx, '');
        } else {
            // Not a new message but could contain
            // an activity on the line by itself.
            aggregate = line;
        }

        // signature for an activity that contains a type other than
        // message with or without arguments. e.g. [delay:3000]
        if (commandRegExp.test(aggregate)) {
            const newActivities = await readActivitiesFromAggregate(aggregate, currentActivity, recipient, from, channelId);
            if (newActivities) {
                activities.push(...newActivities);
                aggregate = null;
            }
        } else {
            currentActivity.text += (aggregate !== null ? aggregate : line).trim() + '\n';
        }
    }
    // We've run out of lines but may still have
    // an activity waiting.
    if (currentActivity) {
        activities.push(currentActivity);
    }
    return activities;
};

/**
 * Reads activities from a text aggregate. Aggregates
 * form when multiple activities occur in the context of a
 * single participant as is the case for attachments.
 *
 * @param {string} aggregate The aggregate text to derive activities from.
 * @param {Activity} currentActivity The Activity currently in context
 * @param {string} recipient The recipient of the Activity
 * @param {string} from The sender of the Activity
 * @param {string} channelId The id of the channel
 *
 * @returns {Promise<*>} Resolves to the number of new activities encountered or null if no new activities resulted
 */
async function readActivitiesFromAggregate(aggregate, currentActivity, recipient, from, channelId) {
    const newActivities = [];
    commandRegExp.lastIndex = 0;
    let result;
    while ((result = commandRegExp.exec(aggregate))) {
        // typeOrField should always be listed first
        let split = result[1].indexOf('=');
        let typeOrField = split > 0 ? result[1].substring(0, split) : result[0];
        let rest = (split > 0) ? result[1].substring(split + 1) : undefined;
        let args = [];
        let startParen = typeOrField.indexOf('(');
        let endParen = typeOrField.indexOf(')')
        if (startParen > 0 && endParen == typeOrField.length - 1) {
            args = typeOrField.substring(startParen + 1, endParen).split(',');
            typeOrField = typeOrField.substring(0, startParen);
        }
        const type = ActivityTypes[typeOrField];
        const field = ActivityField[typeOrField];
        const instruction = Instructions[typeOrField];
        // This isn't an activity - bail
        if (!type && !field && !instruction) {
            continue;
        }
        // Indicates a new activity -
        // As more activity types are supported, this should
        // become a util or helper class.
        if (type) {
            // We have encountered a new activity but
            // may have a fragment of a message to append
            // e.g. aggregate = "oh sure, I think I found something...[Typing][Delay:3000]"
            // we hit on [Typing] but need to append "oh sure, I think I found something..."
            // to the message.
            const index = aggregate.indexOf(`[${result[1]}]`);
            (currentActivity.text || (currentActivity.text = '')).concat(`\n${aggregate.substr(0, index).trim()}`);
            currentActivity = createActivity({ type, recipient, from, channelId });
            newActivities.push(currentActivity);
        }

        const delay = instruction === Instructions.Delay ? rest : messageTimeGap;
        currentActivity.timestamp = getIncrementedDate(delay);

        // As more activity fields are supported,
        // this should become a util or helper class.
        switch (field) {
            case ActivityField.Attachment:
                await addAttachment(currentActivity, args, rest);
                break;
            case ActivityField.AttachmentLayout:
                addAttachmentLayout(currentActivity, rest);
                break;
        }
        // Trim off this activity or activity field and continue.
        aggregate = aggregate.replace(`[${result[1]}]`, '');
        commandRegExp.lastIndex = 0;
    }
    // If we have text left on this line after extracting
    // all instructions or activities, treat it like a message fragment.
    if (aggregate) {
        currentActivity.text += aggregate.trim();
    }
    return newActivities.length ? newActivities : null;
}

function addAttachmentLayout(currentActivity, rest) {
    if (rest && rest.toLowerCase() == AttachmentLayoutTypes.Carousel)
        currentActivity.AttachmentLayout = AttachmentLayoutTypes.Carousel;
    else if (rest && rest.toLowerCase() == AttachmentLayoutTypes.List)
        currentActivity.AttachmentLayout = AttachmentLayoutTypes.List;
    else
        console.error(`AttachmentLayout of ${rest[0]} is not List or Carousel`);
}

/**
 * Adds an attachment to the activity. If a mimetype is
 * specified, it is used as is. Otherwise, it is derived
 * from the file extension.
 *
 * @param {Activity} activity The activity to add the attachment to
 * @param args array of strings from Attachment(args)
 * @param {*} contentUrl contenturl
 *
 * @returns {Promise<number>} The new number of attachments for the activity
 */
async function addAttachment(activity, args, contentUrl) {
    let contentType;
    if (args && args.length > 0) {
        if (cardContentTypes[args[0].toLowerCase()])
            contentType = cardContentTypes[args[0].toLowerCase()];
        else
            contentType = args[0];
    }
    else if (!contentType) {
        contentType = mime.lookup(contentUrl) || cardContentTypes[path.extname(contentUrl)];
    }

    const charset = mime.charset(contentType);

    // if not a url
    if (contentUrl.indexOf('http') != 0) {
        // read the file
        let content = await readAttachmentFile(contentUrl, contentType);
        // if it is not a card
        if (!isCard(contentType) && charset !== 'UTF-8') {
            // send as base64
            content = new Buffer(content).toString('base64');
        }
        return (activity.attachments || (activity.attachments = [])).push(new Attachment({ contentType, content }));
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
    let exists = await fs.pathExists(resolvedFileLocation);

    // fallback to cwd
    if (!exists) {
        resolvedFileLocation = path.resolve(fileLocation);
    }
    // Throws if the fallback does not exist.
    return contentType.includes('json') || isCard(contentType) ? fs.readJson(resolvedFileLocation) : fs.readFile(resolvedFileLocation);
}

/**
 * Utility for creating a new serializable Activity.
 *
 * @param {ActivityTypes} type The Activity type
 * @param {string} to The recipient of the Activity
 * @param {string} from The sender of the Activity
 * @param {string} channelId The id of the channel
 * @returns {Activity} The newly created activity
 */
function createActivity({ type = ActivityTypes.Message, recipient, from, channelId }) {
    const activity = new Activity({ from, recipient, type, text: '', id: uuid() });
    activity.conversation = new ConversationAccount({ id: channelId });
    return activity;
}

function getIncrementedDate(byThisAmount = messageTimeGap) {
    return new Date(now += +byThisAmount).toISOString();
}

/**
 * Generator producing a well-known Symbol for
 * iterating each line in the UTF-8 encoded string.
 *
 * @param {string} fileContents The contents containing the lines to iterate.
 */
function* fileLineIterator(fileContents) {
    const reg = /(.+)*(?:\s)+/g; // take the whole line except the delimiter
    let parts;
    while ((parts = reg.exec(fileContents))) {
        yield parts[1];
    }
}
