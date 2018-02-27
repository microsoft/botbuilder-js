const assert = require('assert');
const ai = require('../');
const builder = require('botbuilder');

const luisAppId = process.env.LUISAPPID;
const subscriptionKey = process.env.LUISAPPKEY;
const LuisBaseUri = "https://westus.api.cognitive.microsoft.com/luis";

describe('LuisRecognizer', function () {
    this.timeout(10000);
    
    if (!luisAppId) 
    {
        console.warn('WARNING: skipping LuisRecognizer test suite because LUISAPPID environment variable is not defined');
        return;
    }
    if (!subscriptionKey) 
    {
        console.warn('WARNING: skipping LuisRecognizer test suite because LUISAPPKEY environment variable is not defined');
        return;
    }

    it('should return multiple intents and a simple entity', function(done){
        var recognizer = new ai.LuisRecognizer({ appId: luisAppId, subscriptionKey: subscriptionKey });
        var context = { request: { text: 'My name is Emad' } };
        recognizer.recognize(context).then(res => {
                assert(res);
                assert(res.length === 1);
                assert(res[0].text == 'My name is Emad');
                assert(Object.keys(res[0].intents).length == 1);
                assert(res[0].intents.SpecifyName);
                assert(res[0].intents.SpecifyName > 0 && res[0].intents.SpecifyName <= 1);
                assert(res[0].entities);
                assert(res[0].entities.Name);
                assert(res[0].entities.Name[0] === 'emad');
                assert(res[0].entities.$instance);
                assert(res[0].entities.$instance.Name);
                assert(res[0].entities.$instance.Name[0].startIndex === 11);
                assert(res[0].entities.$instance.Name[0].endIndex === 14);
                assert(res[0].entities.$instance.Name[0].score > 0 && res[0].entities.$instance.Name[0].score <= 1);
                done();
            });
    });

    it('should return multiple intents and prebuilt entities with a single value', function(done){
        var recognizer = new ai.LuisRecognizer({ appId: luisAppId, subscriptionKey: subscriptionKey, options: { verbose : true} });
        var context = { request: { text: 'Please deliver February 2nd 2001' } };
        recognizer.recognize(context).then(res => {
                assert(res);
                assert(res.length === 1);
                assert(res[0].text == 'Please deliver February 2nd 2001');
                assert(res[0].intents);
                assert(res[0].intents.Delivery);
                assert(res[0].intents.Delivery > 0 && res[0].intents.Delivery <= 1);
                assert(res[0].entities);
                assert(res[0].entities.builtin_number);
                assert(res[0].entities.builtin_number[0] === 2001);
                assert(res[0].entities.builtin_datetimeV2_date);
                assert(res[0].entities.builtin_datetimeV2_date[0] === '2001-02-02');
                assert(res[0].entities.$instance);
                assert(res[0].entities.$instance.builtin_number);
                assert(res[0].entities.$instance.builtin_number[0].startIndex === 28);
                assert(res[0].entities.$instance.builtin_number[0].endIndex === 31);
                assert(res[0].entities.$instance.builtin_number[0].text);
                assert(res[0].entities.$instance.builtin_number[0].text === '2001');
                assert(res[0].entities.$instance.builtin_datetimeV2_date);
                assert(res[0].entities.$instance.builtin_datetimeV2_date[0].startIndex === 15);
                assert(res[0].entities.$instance.builtin_datetimeV2_date[0].endIndex === 31);
                assert(res[0].entities.$instance.builtin_datetimeV2_date[0].text);
                assert(res[0].entities.$instance.builtin_datetimeV2_date[0].text === 'february 2nd 2001');
                done();
            });
    });
 
    it('should return multiple intents and prebuilt entities with multiple values', function(done){
        var recognizer = new ai.LuisRecognizer({ appId: luisAppId, subscriptionKey: subscriptionKey, options: { verbose : true} });
        var context = { request: { text: 'Please deliver February 2nd 2001 in room 201' } };
        recognizer.recognize(context).then(res => {
                assert(res);
                assert(res.length === 1);
                assert(res[0].text == 'Please deliver February 2nd 2001 in room 201');
                assert(res[0].intents);
                assert(res[0].intents.Delivery);
                assert(res[0].intents.Delivery > 0 && res[0].intents.Delivery <= 1);
                assert(res[0].entities);
                assert(res[0].entities.builtin_number);
                assert(res[0].entities.builtin_number.length == 2);
                assert(res[0].entities.builtin_number.indexOf(2001) > -1);
                assert(res[0].entities.builtin_number.indexOf(201) > -1);
                assert(res[0].entities.builtin_datetimeV2_date);
                assert(res[0].entities.builtin_datetimeV2_date[0] === '2001-02-02');
                done();
            });
    })
    

    it('should return multiple intents and a list entity with a single value', function(done){
        var recognizer = new ai.LuisRecognizer({ appId: luisAppId, subscriptionKey: subscriptionKey, options: { verbose : true} });
        var context = { request: { text: 'I want to travel on united' } };
        recognizer.recognize(context).then(res => {
                assert(res);
                assert(res.length === 1);
                assert(res[0].text == 'I want to travel on united');
                assert(res[0].intents);
                assert(res[0].intents.Travel);
                assert(res[0].intents.Travel > 0 && res[0].intents.Travel <= 1);
                assert(res[0].entities);
                assert(res[0].entities.Airline);
                assert(res[0].entities.Airline[0][0] === 'United');
                assert(res[0].entities.$instance);
                assert(res[0].entities.$instance.Airline);
                assert(res[0].entities.$instance.Airline[0].startIndex);
                assert(res[0].entities.$instance.Airline[0].startIndex === 20);
                assert(res[0].entities.$instance.Airline[0].endIndex);
                assert(res[0].entities.$instance.Airline[0].endIndex === 25);
                assert(res[0].entities.$instance.Airline[0].text);
                assert(res[0].entities.$instance.Airline[0].text === 'united');
                done();
            });
    });
    
    it('should return multiple intents and a list entity with multiple values', function(done){
        var recognizer = new ai.LuisRecognizer({ appId: luisAppId, subscriptionKey: subscriptionKey, options: { verbose : true} });
        var context = { request: { text: 'I want to travel on DL' } };
        recognizer.recognize(context).then(res => {
                assert(res);
                assert(res.length === 1);
                assert(res[0].text == 'I want to travel on DL');
                assert(res[0].intents);
                assert(res[0].intents.Travel);
                assert(res[0].intents.Travel > 0 && res[0].intents.Travel <= 1);
                assert(res[0].entities);
                assert(res[0].entities.Airline[0]);
                assert(res[0].entities.Airline[0].length == 2);
                assert(res[0].entities.Airline[0].indexOf('Delta') > -1);
                assert(res[0].entities.Airline[0].indexOf('Virgin') > -1);
                assert(res[0].entities.$instance);
                assert(res[0].entities.$instance.Airline);
                assert(res[0].entities.$instance.Airline[0].startIndex);
                assert(res[0].entities.$instance.Airline[0].startIndex === 20);
                assert(res[0].entities.$instance.Airline[0].endIndex);
                assert(res[0].entities.$instance.Airline[0].endIndex === 21);
                assert(res[0].entities.$instance.Airline[0].text);
                assert(res[0].entities.$instance.Airline[0].text === 'dl');
                done();
            });
    });

    it('should return multiple intents and a single composite entity', function(done){
        var recognizer = new ai.LuisRecognizer({ appId: luisAppId, subscriptionKey: subscriptionKey, options: { verbose : true} });
        var context = { request: { text: 'Please deliver it to 98033 WA' } };
        recognizer.recognize(context).then(res => {
                assert(res);
                assert(res.length === 1);
                assert(res[0].text == 'Please deliver it to 98033 WA');
                assert(res[0].intents);
                assert(res[0].intents.Delivery);
                assert(res[0].intents.Delivery > 0 && res[0].intents.Delivery <= 1);
                assert(res[0].entities);
                assert(res[0].entities.builtin_number === undefined);
                assert(res[0].entities.State === undefined);
                assert(res[0].entities.Address);
                assert(res[0].entities.Address[0].builtin_number[0] === 98033);
                assert(res[0].entities.Address[0].State);
                assert(res[0].entities.Address[0].State[0] === "wa");
                assert(res[0].entities.$instance);
                assert(res[0].entities.$instance.builtin_number === undefined);
                assert(res[0].entities.$instance.State === undefined);
                assert(res[0].entities.$instance.Address);
                assert(res[0].entities.$instance.Address[0].startIndex);
                assert(res[0].entities.$instance.Address[0].startIndex === 21);
                assert(res[0].entities.$instance.Address[0].endIndex);
                assert(res[0].entities.$instance.Address[0].endIndex === 28);
                assert(res[0].entities.$instance.Address[0].score);
                assert(res[0].entities.$instance.Address[0].score > 0 && res[0].entities.$instance.Address[0].score <= 1);
                assert(res[0].entities.Address[0].$instance.builtin_number);
                assert(res[0].entities.Address[0].$instance.builtin_number[0].startIndex);
                assert(res[0].entities.Address[0].$instance.builtin_number[0].startIndex === 21);
                assert(res[0].entities.Address[0].$instance.builtin_number[0].endIndex);
                assert(res[0].entities.Address[0].$instance.builtin_number[0].endIndex === 25);
                assert(res[0].entities.Address[0].$instance.builtin_number[0].text);
                assert(res[0].entities.Address[0].$instance.builtin_number[0].text === "98033");
                assert(res[0].entities.Address[0].$instance.State);
                assert(res[0].entities.Address[0].$instance.State[0].startIndex);
                assert(res[0].entities.Address[0].$instance.State[0].startIndex === 27);
                assert(res[0].entities.Address[0].$instance.State[0].endIndex);
                assert(res[0].entities.Address[0].$instance.State[0].endIndex === 28);
                assert(res[0].entities.Address[0].$instance.State[0].score);
                assert(res[0].entities.Address[0].$instance.State[0].score > 0 && res[0].entities.Address[0].$instance.State[0].score <= 1);
                done();
            });
    });
});
