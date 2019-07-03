// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { LuisRecognizer } = require('botbuilder-ai');

class FlightBookingRecognizer {
    /**
     * Returns an object with preformatted LUIS results for the bot's dialogs to consume.
     * @param {*} logger
     * @param {TurnContext} context
     */
    constructor(config) {
        this.config = config;
    }

    isConfigured() {
        return (this.config && this.config.LuisAppId && this.config.LuisAPIKey && this.config.LuisAPIHostName) ? true : false
    }

    async executeLuisQuery(logger, context) {
        try {
            const recognizer = new LuisRecognizer({
                applicationId: this.config.LuisAppId,
                endpointKey: this.config.LuisAPIKey,
                endpoint: `https://${this.config.LuisAPIHostName}`
            }, {}, true);

            return await recognizer.recognize(context);
        } catch (err) {
            logger.warn(`LUIS Exception: ${err} Check your LUIS configuration`);
        }
    }

}

module.exports.FlightBookingRecognizer = FlightBookingRecognizer;
