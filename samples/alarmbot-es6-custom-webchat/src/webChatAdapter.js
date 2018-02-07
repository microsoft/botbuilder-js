import {ActivityTypes} from "botbuilder";

const activitiesById = {};

export class WebChatAdapter {
    post(activities) {
        activitiesById[activities[0].replyToId] = activities;
        return Promise.resolve(activities);
    }

    onReceive(activity) {
        // overwritten by bot
    }

    getMessagePipelineToBot() {
        return async text => {
            const id = Date.now();
            const payload = {
                id,
                text,
                type: ActivityTypes.message,
                channelId: -1,
                from: {id: -1},
                conversation: {id: -1}
            };
            await this.onReceive(payload);
            const activities = activitiesById[id];
            delete activitiesById[id];
            return Promise.resolve(activities);
        }
    }
}