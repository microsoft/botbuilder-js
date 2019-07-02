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
        const bookingDetails = {};

        try {
            const recognizer = new LuisRecognizer({
                applicationId: this.config.LuisAppId,
                endpointKey: this.config.LuisAPIKey,
                endpoint: `https://${this.config.LuisAPIHostName}`
            }, {}, true);

            const recognizerResult = await recognizer.recognize(context);

            const intent = LuisRecognizer.topIntent(recognizerResult);

            bookingDetails.intent = intent;
            bookingDetails.unsupportedCities = [];

            if (intent === 'Book_flight') {
                // We need to get the result from the LUIS JSON which at every level returns an array
                bookingDetails.destination = this.parseCompositeEntity(recognizerResult, 'To', 'Airport');
                bookingDetails.origin = this.parseCompositeEntity(recognizerResult, 'From', 'Airport');

                if(!bookingDetails.destination) {
                    bookingDetails.unsupportedCities.push(this.getUnsupportedCity(recognizerResult, 'To'))
                }

                if(!bookingDetails.origin) {
                    bookingDetails.unsupportedCities.push(this.getUnsupportedCity(recognizerResult, 'From'))
                }

                // This value will be a TIMEX. And we are only interested in a Date so grab the first result and drop the Time part.
                // TIMEX is a format that represents DateTime expressions that include some ambiguity. e.g. missing a Year.
                bookingDetails.travelDate = this.parseDatetimeEntity(recognizerResult);
            }
        } catch (err) {
            logger.warn(`LUIS Exception: ${err} Check your LUIS configuration`);
        }
        return bookingDetails;
    }

    parseCompositeEntity(result, compositeName, entityName) {
        const compositeEntity = result.entities[compositeName];
        if (!compositeEntity || !compositeEntity[0]) return undefined;

        const entity = compositeEntity[0][entityName];
        if (!entity || !entity[0]) return undefined;

        const entityValue = entity[0][0];
        return entityValue;
    }

    parseDatetimeEntity(result) {
        const datetimeEntity = result.entities['datetime'];
        if (!datetimeEntity || !datetimeEntity[0]) return undefined;

        const timex = datetimeEntity[0]['timex'];
        if (!timex || !timex[0]) return undefined;

        const datetime = timex[0].split('T')[0];
        return datetime;
    }

    getUnsupportedCity(result, compositeName) {
        const cityEntity = result.luisResult.entities.find(entity => {
          return entity.type = compositeName;
        });
        return cityEntity.entity.toUpperCase();
    }
}

module.exports.FlightBookingRecognizer = FlightBookingRecognizer;
