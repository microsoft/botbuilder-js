// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { TimexProperty } = require('@microsoft/recognizers-text-data-types-timex-expression');
const { InputHints } = require('botbuilder');
const { LuisRecognizer } = require('botbuilder-ai');
const { ComponentDialog, DialogSet, DialogTurnStatus, TextPrompt, WaterfallDialog } = require('botbuilder-dialogs');

const MAIN_WATERFALL_DIALOG = 'mainWaterfallDialog';

class MainDialog extends ComponentDialog {
    constructor(logger, luisRecognizer, bookingDialog) {
        super('MainDialog');

        if (!logger) {
            logger = console;
            logger.log('[MainDialog]: logger not passed in, defaulting to console');
        }

        this.logger = logger;
        this.luisRecognizer = luisRecognizer;

        if (!bookingDialog) throw new Error('[MainDialog]: Missing parameter \'bookingDialog\' is required');
        this.bookingDialog = bookingDialog;

        // Define the main dialog and its related components.
        // This is a sample "book a flight" dialog.
        this.addDialog(new TextPrompt('TextPrompt'))
            .addDialog(this.bookingDialog)
            .addDialog(new WaterfallDialog(MAIN_WATERFALL_DIALOG, [
                this.introStep.bind(this),
                this.actStep.bind(this),
                this.finalStep.bind(this)
            ]));

        this.initialDialogId = MAIN_WATERFALL_DIALOG;
    }

    /**
     * The run method handles the incoming activity (in the form of a TurnContext) and passes it through the dialog system.
     * If no dialog is active, it will start the default dialog.
     * @param {*} turnContext
     * @param {*} accessor
     */
    async run(turnContext, accessor) {
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);

        const dialogContext = await dialogSet.createContext(turnContext);
        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }

    /**
     * First step in the waterfall dialog. Prompts the user for a command.
     * Currently, this expects a booking request, like "book me a flight from Paris to Berlin on march 22"
     * Note that the sample LUIS model will only recognize Paris, Berlin, New York and London as airport cities.
     */
    async introStep(stepContext) {
        if (!this.luisRecognizer || !this.luisRecognizer.isConfigured()) {
            const messageText = 'NOTE: LUIS is not configured. To enable all capabilities, add `LuisAppId`, `LuisAPIKey` and `LuisAPIHostName` to the .env file.'
            await stepContext.context.sendActivity(messageText, messageText, InputHints.IgnoringInput);
            return await stepContext.next();
        }

        return await stepContext.prompt('TextPrompt', { prompt: 'What can I help you with today?\nSay something like "Book a flight from Paris to Berlin on March 22, 2020"' });
    }

    /**
     * Second step in the waterall.  This will use LUIS to attempt to extract the origin, destination and travel dates.
     * Then, it hands off to the bookingDialog child dialog to collect any remaining details.
     */
    async actStep(stepContext) {
        let bookingDetails = {};

        if (!this.luisRecognizer.isConfigured()) {
            return await stepContext.beginDialog('bookingDialog');
        }

        // Call LUIS and gather any potential booking details.
        // This will attempt to extract the origin, destination and travel date from the user's message
        // and will then pass those values into the booking dialog
        const recognizerResult = await this.luisRecognizer.executeLuisQuery(this.logger, stepContext.context);

        const getBookingDetails = (recognizerResult) => {
            const bookingDetails = {};
            const intent = LuisRecognizer.topIntent(recognizerResult);

            bookingDetails.intent = intent;
            bookingDetails.unsupportedCities = [];

            if (intent === 'Book_flight') {
                // We need to get the result from the LUIS JSON which at every level returns an array
                bookingDetails.destination = parseCompositeEntity(recognizerResult, 'To', 'Airport');
                bookingDetails.origin = parseCompositeEntity(recognizerResult, 'From', 'Airport');

                if(!bookingDetails.destination) {
                    bookingDetails.unsupportedCities.push(getUnsupportedCity(recognizerResult, 'To'))
                }

                if(!bookingDetails.origin) {
                    bookingDetails.unsupportedCities.push(getUnsupportedCity(recognizerResult, 'From'))
                }

                // This value will be a TIMEX. And we are only interested in a Date so grab the first result and drop the Time part.
                // TIMEX is a format that represents DateTime expressions that include some ambiguity. e.g. missing a Year.
                bookingDetails.travelDate = parseDatetimeEntity(recognizerResult);
            }
            return bookingDetails;
        }

        const parseCompositeEntity = (result, compositeName, entityName) => {
            const compositeEntity = result.entities[compositeName];
            if (!compositeEntity || !compositeEntity[0]) return undefined;

            const entity = compositeEntity[0][entityName];
            if (!entity || !entity[0]) return undefined;

            const entityValue = entity[0][0];
            return entityValue;
        }

        const parseDatetimeEntity = (result) => {
            const datetimeEntity = result.entities['datetime'];
            if (!datetimeEntity || !datetimeEntity[0]) return undefined;

            const timex = datetimeEntity[0]['timex'];
            if (!timex || !timex[0]) return undefined;

            const datetime = timex[0].split('T')[0];
            return datetime;
        }

        const getUnsupportedCity = (result, compositeName) => {
            const cityEntity = result.luisResult.entities.find(entity => {
                return entity.type = compositeName;
            });
            return cityEntity.entity.toUpperCase();
        }

        bookingDetails = getBookingDetails(recognizerResult);

        if(bookingDetails.unsupportedCities && bookingDetails.unsupportedCities.length) {
            const messageText = `Sorry but the following airports are not supported: ${bookingDetails.unsupportedCities.join(', ')}`;
            await stepContext.context.sendActivity(messageText, messageText, InputHints.IgnoringInput);
            return await stepContext.replaceDialog('MainDialog');
        }

        this.logger.log('LUIS extracted these booking details:', bookingDetails);

        // In this sample we only have a single intent we are concerned with. However, typically a scenario
        // will have multiple different intents each corresponding to starting a different child dialog.

        // Run the BookingDialog giving it whatever details we have from the LUIS call, it will fill out the remainder.
        return await stepContext.beginDialog('bookingDialog', bookingDetails);
    }

    /**
     * This is the final step in the main waterfall dialog.
     * It wraps up the sample "book a flight" interaction with a simple confirmation.
     */
    async finalStep(stepContext) {
        // If the child dialog ("bookingDialog") was cancelled or the user failed to confirm, the Result here will be null.
        if (stepContext.result) {
            const result = stepContext.result;
            // Now we have all the booking details.

            // This is where calls to the booking AOU service or database would go.

            // If the call to the booking service was successful tell the user.
            const timeProperty = new TimexProperty(result.travelDate);
            const travelDateMsg = timeProperty.toNaturalLanguage(new Date(Date.now()));
            const msg = `I have you booked to ${ result.destination } from ${ result.origin } on ${ travelDateMsg }.`;
            await stepContext.context.sendActivity(msg, msg, InputHints.IgnoringInput);
        } else {
            await stepContext.context.sendActivity('Thank you.');
        }
        return await stepContext.replaceDialog('MainDialog');
    }
}

module.exports.MainDialog = MainDialog;
