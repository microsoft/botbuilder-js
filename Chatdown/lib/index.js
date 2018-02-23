const fs = require('fs-extra');
const path = require('path');
const mime = require('mime-types');

const Activity = require('./serializable/activity');
const ActivityType = require('./enums/activityType');
const ActivityField = require('./enums/activityField');
const Instructions = require('./enums/instructions');
const {cardContentTypes, isCard} = require('./enums/cardContentTypes');
const ChannelAccount = require('./serializable/channelAccount');
const ConversationAccount = require('./serializable/conversationAccount');
const Attachment = require('./serializable/attachment');

// Matches [someActivityOrInstruction:argument0:argument1:argumentn...]
const activityRegExp = /(?:\[)([\w+:/.-]*)+(?:])/g;
const messageTimeGap = 2000;
let now = Date.now();
now -= now % 1000; // nearest second

module.exports = async function readContents(fileContents, config) {
    const activities = [];
    const lines = fileLineIterator(fileContents.trim() + '\n');
    // Matches the user and bot from the arguments or from the merged config
    const {channelId, user, bot} = config;
    const newMessageRegEx = new RegExp(`(${user.toLowerCase()}|${bot.toLowerCase()}):`, 'i');
    // Aggregate the contents of each line until
    // we reach a new activity.
    let aggregate = null;
    let currentActivity;
    let to;
    let from;
    // Read each line, derive activities with messages, then
    // return them as the payload
    for (let line of lines) {
        // signature for a new message
        if (newMessageRegEx.test(line)) {
            from = newMessageRegEx.exec(line)[1];
            to = from === config.bot ? config.user : config.bot;
            if (currentActivity) {
                currentActivity.text = currentActivity.text ? currentActivity.text.trim() : null;
                activities.push(currentActivity);
            }
            currentActivity = createActivity({to, from, channelId});
            // Trim off the user or bot and continue since
            // this line may still have a message or other
            // activities to parse.
            // e.g. Joe: Hello! [delay:1000] becomes Hello! [delay:1000]
            aggregate = line.trim().replace(`${from}:`, '');
        } else {
            // Not a new message but could contain
            // an activity on the line by itself.
            aggregate = line;
        }

        // signature for an activity that contains a type other than
        // message with or without arguments. e.g. [delay:3000]
        if (activityRegExp.test(aggregate)) {
            const newActivities = await readActivitiesFromAggregate(aggregate, currentActivity, to, from, channelId);
            if (newActivities) {
                activities.push(...newActivities);
                aggregate = null;
            }
        } else {
            currentActivity.text += (aggregate !== null ? aggregate : line).trim() + '\n';
            currentActivity.timestamp = getIncrementedDate();
        }
    }
    // We've run out of lines but may still have
    // an activity waiting.
    if (currentActivity) {
        activities.push(currentActivity);
    }
    return activities;
};

async function readActivitiesFromAggregate(aggregate, currentActivity, to, from, channelId) {
    const newActivities = [];
    activityRegExp.lastIndex = 0;
    let result;
    while (result = activityRegExp.exec(aggregate)) {
        // typeOrField should always be listed first
        const [typeOrField, ...rest] = result[1].split(':');
        const type = ActivityType[typeOrField];
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
            currentActivity = createActivity({type, to, from, channelId});
            newActivities.push(currentActivity);
        }

        const delay = instruction === Instructions.Delay ? rest[0] : messageTimeGap;
        currentActivity.timestamp = getIncrementedDate(delay);
        // As more activity fields are supported,
        // this should become a util or helper class.
        if (field === ActivityField.Attachments) {
            await addAttachment(currentActivity, rest);
        }
        // Trim off this activity or activity field and continue.
        aggregate = aggregate.replace(`[${result[1]}]`, '');
        activityRegExp.lastIndex = 0;
    }
    // If we have text left on this line after extracting
    // all instructions or activities, treat it like a message fragment.
    if (aggregate) {
        currentActivity.text += aggregate.trim();
    }
    return newActivities.length ? newActivities : null;
}

async function addAttachment(activity, attachmentInfo) {
    let [fileLocation, contentType] = attachmentInfo;
    if (!contentType) {
        contentType = mime.lookup(fileLocation) || cardContentTypes[path.extname(fileLocation)];
    }
    const charset = mime.charset(contentType);
    let content = await readAttachmentFile(fileLocation, contentType);
    if (!isCard(contentType) && charset !== 'UTF-8') {
        content = new Buffer(content).toString('base64');
    }
    return (activity.attachments || (activity.attachments = [])).push(new Attachment({contentType, content}));
}

function readAttachmentFile(fileLocation, contentType) {
    const resolvedFileLocation = path.resolve(fileLocation);
    return contentType.includes('json') ? fs.readJson(resolvedFileLocation) : fs.readFile(resolvedFileLocation);
}

function createActivity({type = ActivityType.Message, to, from, channelId}) {
    const activity = new Activity({type, text: ''});
    activity.recipient = new ChannelAccount({id: channelId, name: to});
    activity.from = new ChannelAccount({id: channelId, name: from});
    activity.conversation = new ConversationAccount();
    return activity;
}

function getIncrementedDate(byThisAmount = messageTimeGap) {
    return new Date(now += +byThisAmount).toUTCString();
}

function* fileLineIterator(fileContents) {
    const reg = /(.+)*(?:\s)+/g; // take the whole line except the delimiter
    let parts;
    while (parts = reg.exec(fileContents)) {
        yield parts[1];
    }
}
