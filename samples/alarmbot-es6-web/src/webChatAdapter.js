import {ActivityTypes} from "botbuilder";

export class WebChatAdapter {
    post(activities) {
        debugger
    }

    onReceive(activity) {
        debugger
    }

    listen() {
        return async text => {
            return await this.onReceive({
                text,
                type: ActivityTypes.message,
                channelId: -1,
                from: {id: -1},
                conversation: {id: -1}
            });
        }
    }
}