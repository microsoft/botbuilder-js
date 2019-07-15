const assert = require('assert');
const { ActivityHandler, ActivityTypes, TurnContext, TestAdapter } = require('../lib');

describe('ActivityHandler', function() {

    const adapter = new TestAdapter();

    async function processActivity(activity, bot) {
        const context = new TurnContext(adapter, activity);
        await bot.run(context);
    }

    it(`should fire onTurn for any inbound activity`, async function (done) {

        const bot = new ActivityHandler();

        bot.onTurn(async(context, next) => {
            assert(true, 'onTurn not called');
            done();
            await next();
        });

        processActivity({type: 'any'}, bot);
    });

    it(`should fire onMessage for any message activities`, async function (done) {

        const bot = new ActivityHandler();

        bot.onMessage(async(context, next) => {
            assert(true, 'onMessage not called');
            done();
            await next();
        });

        processActivity({type: 'message'}, bot);
    });

    it(`calling  next allows following events to firing`, async function (done) {

        const bot = new ActivityHandler();

        bot.onTurn(async(context, next) => {
            assert(true, 'onTurn not called');
            await next();
        });

        bot.onMessage(async(context, next) => {
            assert(true, 'onMessage not called');
            done();
            await next();
        });

        processActivity({type: 'message'}, bot);
    });

    it(`omitting call to next prevents following events from firing`, async function (done) {

        const bot = new ActivityHandler();

        bot.onTurn(async(context, next) => {
            assert(true, 'onTurn not called');
            done();
        });

        bot.onMessage(async(context, next) => {
            assert(false, 'onMessage called improperly!');
            await next();
        });

        processActivity({type: 'message'}, bot);
    });

    it(`binding 2 methods to the same event both fire`, async function (done) {

        const bot = new ActivityHandler();
        let count = 0;

        bot.onMessage(async(context, next) => {
            assert(true, 'event 1 did not fire');
            count++;
            await next();
        });

        bot.onMessage(async(context, next) => {
            assert(true, 'event 2 did not fire');
            count++;

            assert(count === 2, 'all events did fire');
            done();
            await next();
        });

        processActivity({type: 'message'}, bot);
    });

    it(`should fire onConversationUpdate`, async function (done) {

        const bot = new ActivityHandler();

        bot.onConversationUpdate(async(context, next) => {
            assert(true, 'onConversationUpdate not called');
            done();
            await next();
        });

        processActivity({type: ActivityTypes.ConversationUpdate}, bot);
    });

    it(`should fire onMembersAdded`, async function (done) {

        const bot = new ActivityHandler();

        bot.onMembersAdded(async(context, next) => {
            assert(true, 'onConversationUpdate not called');
            done();
            await next();
        });

        processActivity({type: ActivityTypes.ConversationUpdate, membersAdded: [{id: 1}]}, bot);
    });

    it(`should fire onMembersRemoved`, async function (done) {

        const bot = new ActivityHandler();

        bot.onMembersRemoved(async(context, next) => {
            assert(true, 'onMembersRemoved not called');
            done();
            await next();
        });

        processActivity({type: ActivityTypes.ConversationUpdate, membersRemoved: [{id: 1}]}, bot);
    });

    it(`should fire onMessageReaction`, async function (done) {

        const bot = new ActivityHandler();

        bot.onMessageReaction(async(context, next) => {
            assert(true, 'onMessageReaction not called');
            done();
            await next();
        });

        processActivity({type: ActivityTypes.MessageReaction}, bot);
    });

    it(`should fire onReactionsAdded`, async function (done) {

        const bot = new ActivityHandler();

        bot.onReactionsAdded(async(context, next) => {
            assert(true, 'onReactionsAdded not called');
            done();
            await next();
        });

        processActivity({type: ActivityTypes.MessageReaction, reactionsAdded: [{type: 'like'}]}, bot);
    });

    it(`should fire onReactionsRemoved`, async function (done) {

        const bot = new ActivityHandler();

        bot.onReactionsRemoved(async(context, next) => {
            assert(true, 'onReactionsRemoved not called');
            done();
            await next();
        });

        processActivity({type: ActivityTypes.MessageReaction, reactionsRemoved: [{type: 'like'}]}, bot);
    });
    
    it(`should fire onEvent`, async function (done) {

        const bot = new ActivityHandler();

        bot.onEvent(async(context, next) => {
            assert(true, 'onEvent not called');
            done();
            await next();
        });

        processActivity({type: ActivityTypes.Event}, bot);
    });


    it(`should fire onUnrecognizedActivityType`, async function (done) {

        const bot = new ActivityHandler();

        bot.onUnrecognizedActivityType(async(context, next) => {
            assert(true, 'onUnrecognizedActivityType not called');
            done();
            await next();
        });

        processActivity({type: 'foo'}, bot);
    });

    it(`should fire onDialog`, async function (done) {

        const bot = new ActivityHandler();

        bot.onDialog(async(context, next) => {
            assert(true, 'onDialog not called');
            done();
            await next();
        });

        processActivity({type: 'foo'}, bot);
    });

});