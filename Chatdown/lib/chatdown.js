const Activity = require('./activity');
const ActivityType = require('./activityType');
const ActivityField = require('./activityField');
const Attachment = require('./attachment');

module.exports = async function readFileContents(fileContents) {
    const activities = [];
    let currentActivity;
    let aggregate = '';
    let len = fileContents.length;
    let i = 0;
    for (; i < len; i++) {
        const char = fileContents.charAt(i);
        if (char !== '[') {
            aggregate += char;
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
