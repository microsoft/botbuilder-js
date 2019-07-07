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

    async executeLuisQuery(context, logger) {
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

    getFromEntities(result) {
        let fromValue = undefined;
        if (result.entities.$instance.From)
        {
            fromValue = result.entities.$instance.From[0].text
        }

        let fromAirportValue = undefined;
        if (fromValue && result.entities.From[0].Airport) {
            fromAirportValue = result.entities.From[0].Airport[0][0];
        }

        return  {from: fromValue, airport: fromAirportValue};
    }

    getToEntities(result) {
        let toValue = undefined;
        if (result.entities.$instance.To)
        {
            toValue = result.entities.$instance.To[0].text
        }

        let toAirportValue = undefined;
        if (toValue && result.entities.To[0].Airport) {
            toAirportValue = result.entities.To[0].Airport[0][0];
        }

        return  {to: toValue, airport: toAirportValue};
    }

    /**
     * This value will be a TIMEX. And we are only interested in a Date so grab the first result and drop the Time part.
     * TIMEX is a format that represents DateTime expressions that include some ambiguity. e.g. missing a Year.
     */
    getTravelDate(result) {
        const datetimeEntity = result.entities['datetime'];
        if (!datetimeEntity || !datetimeEntity[0]) return undefined;

        const timex = datetimeEntity[0]['timex'];
        if (!timex || !timex[0]) return undefined;

        const datetime = timex[0].split('T')[0];
        return datetime;
    }
}

module.exports.FlightBookingRecognizer = FlightBookingRecognizer;
