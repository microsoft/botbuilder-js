const Activity = require('./activity');
const ActivityType = require('./activityType');
const ActivityField = require('./activityField');
const Attachment = require('./attachment');

async function readContents(fileContents, config) {
    const activities = [];
    const lines = fileLineIterator(fileContents);
    const userToken = config.user.toLowerCase() + ':';
    const botToken = config.bot.toLowerCase() + ':';
    let aggregate = '';
    let currentActivity;
    for (let line of lines) {
        if (line.startsWith(userToken) || line.startsWith(botToken)) {
            if (currentActivity) {
                currentActivity.message = aggregate.trim();
                activities.push(currentActivity);
                aggregate = '';
            }
            currentActivity = new Activity();
            continue;
        }

        if (line.startsWith('[') && line.endsWith(']')) {
            const activity = await readActivity(line);
        }
    }
}

module.exports = async function readFileContents(fileContents, config) {
    fileContents = fileContents.replace('\r', '');
    const { user, bot } = config;
    const activities = [];
    let currentActivity;
    let aggregate = '';
    let len = fileContents.length;
    let i = 0;
    for (; i < len; i++) {
        const char = fileContents.charAt(i);
        aggregate += char;
        if (aggregate.toLowerCase().endsWith(`\n${user}:`) || aggregate.toLowerCase().endsWith(`\n${bot}:`)) {
            if (currentActivity) {
                currentActivity.message = aggregate.trim();
            }
            continue;
        }
        if (aggregate && currentActivity) {
            currentActivity.message = aggregate.trim();
            aggregate = '';
        }
        const { index, activity } = await readActivity(++i, fileContents);
        i = index;
        currentActivity = activity;
        activities.push(activity);
    }
    return activities;
};

async function readActivity(index, fileContents) {
    let len = fileContents.length;
    let activity = new Activity();
    let aggregate = '';
    for (; index < len; index++) {
        const char = fileContents.charAt(index);
        if (char === ']') {
            break;
        }
        aggregate += char;
    }
    const [ typeOrField, ...rest ] = aggregate.split(':');
    const type = ActivityType[ typeOrField ];
    if (type) {
        activity.type = type;
    }

    const field = ActivityField[ typeOrField ];
    if (field === ActivityField.Attachments) {
        let [ contentType, content ] = rest;
        if (contentType.includes('json')) {
            try {
                content = JSON.parse(content);
            } catch (e) {
                throw new Error(`The attachment contentType was "${contentType}" but the contents failed to parse correctly.`);
            }
        }
        activity.attachments.push(new Attachment({ contentType, content }));
    }

    return { index, activity };
}

function* fileLineIterator(fileContents) {
    const reg = /(.+)*(?:\s)+/g; // take the whole line except the delimiter
    let parts;
    while (parts = reg.exec(fileContents)) {
        yield parts[ 1 ];
    }
}
