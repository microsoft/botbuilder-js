const assert = require('assert');
const { TestAdapter, TurnContext } = require('botbuilder');
const { LuisRecognizer } = require('../');

const luisAppId = process.env.LUISAPPID;
const subscriptionKey = process.env.LUISAPPKEY;
const LuisBaseUri = "https://westus.api.cognitive.microsoft.com/luis";

class TestContext extends TurnContext {
    constructor(request) {
        super(new TestAdapter(), request);
        this.sent = undefined;
        this.onSendActivities((context, activities, next) => {
            this.sent = activities;
        });
    }
}

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
        var recognizer = new LuisRecognizer({ appId: luisAppId, subscriptionKey: subscriptionKey, verbose: true });
        var context = new TestContext({ text: 'My name is Emad' });
        recognizer.recognize(context).then(res => {
                assert(res);
                assert(res.text == 'My name is Emad');
                assert(Object.keys(res.intents).length == 1);
                assert(res.intents.SpecifyName);
                assert(res.intents.SpecifyName > 0 && res.intents.SpecifyName <= 1);
                assert(res.entities);
                assert(res.entities.Name);
                assert(res.entities.Name[0] === 'emad');
                assert(res.entities.$instance);
                assert(res.entities.$instance.Name);
                assert(res.entities.$instance.Name[0].startIndex === 11);
                assert(res.entities.$instance.Name[0].endIndex === 14);
                assert(res.entities.$instance.Name[0].score > 0 && res.entities.$instance.Name[0].score <= 1);
                done();
            });
    });

    it('should return multiple intents and prebuilt entities with a single value', function(done){
        var recognizer = new LuisRecognizer({ appId: luisAppId, subscriptionKey: subscriptionKey, verbose: true,  options: { verbose : true} });
        var context = new TestContext({ text: 'Please deliver February 2nd 2001' });
        recognizer.recognize(context).then(res => {
                assert(res);
                assert(res.text == 'Please deliver February 2nd 2001');
                assert(res.intents);
                assert(res.intents.Delivery);
                assert(res.intents.Delivery > 0 && res.intents.Delivery <= 1);
                assert(LuisRecognizer.topIntent(res) === 'Delivery');
                assert(res.entities);
                assert(res.entities.builtin_number);
                assert(res.entities.builtin_number[0] === 2001);
                assert(res.entities.builtin_datetimeV2_date);
                assert(res.entities.builtin_datetimeV2_date[0] === '2001-02-02');
                assert(res.entities.$instance);
                assert(res.entities.$instance.builtin_number);
                assert(res.entities.$instance.builtin_number[0].startIndex === 28);
                assert(res.entities.$instance.builtin_number[0].endIndex === 31);
                assert(res.entities.$instance.builtin_number[0].text);
                assert(res.entities.$instance.builtin_number[0].text === '2001');
                assert(res.entities.$instance.builtin_datetimeV2_date);
                assert(res.entities.$instance.builtin_datetimeV2_date[0].startIndex === 15);
                assert(res.entities.$instance.builtin_datetimeV2_date[0].endIndex === 31);
                assert(res.entities.$instance.builtin_datetimeV2_date[0].text);
                assert(res.entities.$instance.builtin_datetimeV2_date[0].text === 'february 2nd 2001');
                done();
            });
    });
 
    it('should return multiple intents and prebuilt entities with multiple values', function(done){
        var recognizer = new LuisRecognizer({ appId: luisAppId, subscriptionKey: subscriptionKey, verbose: true, options: { verbose : true} });
        var context = new TestContext({ text: 'Please deliver February 2nd 2001 in room 201' });
        recognizer.recognize(context).then(res => {
                assert(res);
                assert(res.text == 'Please deliver February 2nd 2001 in room 201');
                assert(res.intents);
                assert(res.intents.Delivery);
                assert(res.intents.Delivery > 0 && res.intents.Delivery <= 1);
                assert(res.entities);
                assert(res.entities.builtin_number);
                assert(res.entities.builtin_number.length == 2);
                assert(res.entities.builtin_number.indexOf(2001) > -1);
                assert(res.entities.builtin_number.indexOf(201) > -1);
                assert(res.entities.builtin_datetimeV2_date);
                assert(res.entities.builtin_datetimeV2_date[0] === '2001-02-02');
                done();
            });
    })
    

    it('should return multiple intents and a list entity with a single value', function(done){
        var recognizer = new LuisRecognizer({ appId: luisAppId, subscriptionKey: subscriptionKey, verbose: true, options: { verbose : true} });
        var context = new TestContext({ text: 'I want to travel on united' });
        recognizer.recognize(context).then(res => {
                assert(res);
                assert(res.text == 'I want to travel on united');
                assert(res.intents);
                assert(res.intents.Travel);
                assert(res.intents.Travel > 0 && res.intents.Travel <= 1);
                assert(res.entities);
                assert(res.entities.Airline);
                assert(res.entities.Airline[0][0] === 'United');
                assert(res.entities.$instance);
                assert(res.entities.$instance.Airline);
                assert(res.entities.$instance.Airline[0].startIndex);
                assert(res.entities.$instance.Airline[0].startIndex === 20);
                assert(res.entities.$instance.Airline[0].endIndex);
                assert(res.entities.$instance.Airline[0].endIndex === 25);
                assert(res.entities.$instance.Airline[0].text);
                assert(res.entities.$instance.Airline[0].text === 'united');
                done();
            });
    });
    
    it('should return multiple intents and a list entity with multiple values', function(done){
        var recognizer = new LuisRecognizer({ appId: luisAppId, subscriptionKey: subscriptionKey, verbose: true, options: { verbose : true} });
        var context = new TestContext({ text: 'I want to travel on DL' });
        recognizer.recognize(context).then(res => {
                assert(res);
                assert(res.text == 'I want to travel on DL');
                assert(res.intents);
                assert(res.intents.Travel);
                assert(res.intents.Travel > 0 && res.intents.Travel <= 1);
                assert(res.entities);
                assert(res.entities.Airline[0]);
                assert(res.entities.Airline[0].length == 2);
                assert(res.entities.Airline[0].indexOf('Delta') > -1);
                assert(res.entities.Airline[0].indexOf('Virgin') > -1);
                assert(res.entities.$instance);
                assert(res.entities.$instance.Airline);
                assert(res.entities.$instance.Airline[0].startIndex);
                assert(res.entities.$instance.Airline[0].startIndex === 20);
                assert(res.entities.$instance.Airline[0].endIndex);
                assert(res.entities.$instance.Airline[0].endIndex === 21);
                assert(res.entities.$instance.Airline[0].text);
                assert(res.entities.$instance.Airline[0].text === 'dl');
                done();
            });
    });

    it('should return multiple intents and a single composite entity', function(done){
        var recognizer = new LuisRecognizer({ appId: luisAppId, subscriptionKey: subscriptionKey, verbose: true, options: { verbose : true} });
        var context = new TestContext({ text: 'Please deliver it to 98033 WA' });
        recognizer.recognize(context).then(res => {
                assert(res);
                assert(res.text == 'Please deliver it to 98033 WA');
                assert(res.intents);
                assert(res.intents.Delivery);
                assert(res.intents.Delivery > 0 && res.intents.Delivery <= 1);
                assert(res.entities);
                assert(res.entities.builtin_number === undefined);
                assert(res.entities.State === undefined);
                assert(res.entities.Address);
                assert(res.entities.Address[0].builtin_number[0] === 98033);
                assert(res.entities.Address[0].State);
                assert(res.entities.Address[0].State[0] === "wa");
                assert(res.entities.$instance);
                assert(res.entities.$instance.builtin_number === undefined);
                assert(res.entities.$instance.State === undefined);
                assert(res.entities.$instance.Address);
                assert(res.entities.$instance.Address[0].startIndex);
                assert(res.entities.$instance.Address[0].startIndex === 21);
                assert(res.entities.$instance.Address[0].endIndex);
                assert(res.entities.$instance.Address[0].endIndex === 28);
                assert(res.entities.$instance.Address[0].score);
                assert(res.entities.$instance.Address[0].score > 0 && res.entities.$instance.Address[0].score <= 1);
                assert(res.entities.Address[0].$instance.builtin_number);
                assert(res.entities.Address[0].$instance.builtin_number[0].startIndex);
                assert(res.entities.Address[0].$instance.builtin_number[0].startIndex === 21);
                assert(res.entities.Address[0].$instance.builtin_number[0].endIndex);
                assert(res.entities.Address[0].$instance.builtin_number[0].endIndex === 25);
                assert(res.entities.Address[0].$instance.builtin_number[0].text);
                assert(res.entities.Address[0].$instance.builtin_number[0].text === "98033");
                assert(res.entities.Address[0].$instance.State);
                assert(res.entities.Address[0].$instance.State[0].startIndex);
                assert(res.entities.Address[0].$instance.State[0].startIndex === 27);
                assert(res.entities.Address[0].$instance.State[0].endIndex);
                assert(res.entities.Address[0].$instance.State[0].endIndex === 28);
                assert(res.entities.Address[0].$instance.State[0].score);
                assert(res.entities.Address[0].$instance.State[0].score > 0 && res.entities.Address[0].$instance.State[0].score <= 1);
                done();
            });
    });

    it('should run as a piece of middleware', function(done){
        var recognizer = new LuisRecognizer({ appId: luisAppId, subscriptionKey: subscriptionKey, verbose: true });
        var context = new TestContext({ text: 'My name is Emad' });
        recognizer.onTurn(context, () => {
            const res = recognizer.get(context);
            assert(res);
            assert(res.text == 'My name is Emad');
            done();
        });
    });

    it('should cache multiple calls to recognize()', function(done){
        var recognizer = new LuisRecognizer({ appId: luisAppId, subscriptionKey: subscriptionKey, verbose: true });
        var context = new TestContext({ text: 'My name is Emad' });
        recognizer.recognize(context).then(res => {
            assert(res);
            res.text = 'cached';
            recognizer.recognize(context).then(res => {
                assert(res);
                assert(res.text === 'cached');
                done();
            });
        });
    });

    it('should only return $instance metadata for entities if verbose flag set', function(done){
        var recognizer = new LuisRecognizer({ appId: luisAppId, subscriptionKey: subscriptionKey, verbose: false });
        var context = new TestContext({ text:  'My name is Emad' });
        recognizer.recognize(context).then(res => {
            assert(res);
            assert(res.entities);
            assert(res.entities.$instance === undefined);
            done();
        });
    });
    
    it('should only return $instance metadata for composite entities if verbose flag set', function(done){
        var recognizer = new LuisRecognizer({ appId: luisAppId, subscriptionKey: subscriptionKey, verbose: false });
        var context = new TestContext({ text: 'Please deliver it to 98033 WA' });
        recognizer.recognize(context).then(res => {
            assert(res);
            assert(res.entities);
            assert(res.entities.$instance === undefined);
            done();
        });
    });

    it('should only return "None" intent for undefined text', function(done){
        var recognizer = new LuisRecognizer({ appId: luisAppId, subscriptionKey: subscriptionKey, verbose: false });
        var context = new TestContext({ text: undefined });
        recognizer.recognize(context).then(res => {
            const top = LuisRecognizer.topIntent(res);
            assert(top === 'None');
            done();
        });
    });
    
    it('should return defaultIntent from topIntent() if results undefined', function(done){
        const top = LuisRecognizer.topIntent(undefined);
        assert(top === 'None');
        done();
    });

    it('should return defaultIntent from topIntent() if intent scores below threshold', function(done){
        const top = LuisRecognizer.topIntent({ intents: { TestIntent: 0.49 } }, 'None', 0.5);
        assert(top === 'None');
        done();
    });
});
