var assert = require('assert');
var builder = require('../');

/*
describe('speak', function() {
    this.timeout(5000);
    it('should say text', function (done) { 
        var connector = new builder.ConsoleConnector();       
        var bot = new builder.UniversalBot(connector, function (session, args) {
            session.say('some text').endDialog();
        });
        bot.on('send', function (message) {
            assert(message.text === 'some text');
            assert(!message.speak);
            assert(!message.attachments);
            done();
        });
        connector.processMessage('hi');
    });

    it('should say text and SSML', function (done) { 
        var connector = new builder.ConsoleConnector();       
        var bot = new builder.UniversalBot(connector, function (session, args) {
            session.say('some text', 'some ssml').endDialog();
        });
        bot.on('send', function (message) {
            assert(message.text === 'some text');
            assert(message.speak === 'some ssml');
            assert(!message.attachments);
            done();
        });
        connector.processMessage('hi');
    });

    it('should say text and attachments', function (done) { 
        var connector = new builder.ConsoleConnector();       
        var bot = new builder.UniversalBot(connector, function (session, args) {
            session.say('some text', {
                attachments: [
                    {
                        contentType: 'foo',
                        content: 'bar'
                    }
                ]
            }).endDialog();
        });
        bot.on('send', function (message) {
            assert(message.text === 'some text');
            assert(!message.speak);
            assert(message.attachments && message.attachments.length == 1);
            done();
        });
        connector.processMessage('hi');
    });

    it('should say text, SSML, and attachments', function (done) { 
        var connector = new builder.ConsoleConnector();       
        var bot = new builder.UniversalBot(connector, function (session, args) {
            session.say('some text', 'some ssml', {
                attachments: [
                    {
                        contentType: 'foo',
                        content: 'bar'
                    }
                ]
            }).endDialog();
        });
        bot.on('send', function (message) {
            assert(message.text === 'some text');
            assert(message.speak === 'some ssml');
            assert(message.attachments && message.attachments.length == 1);
            done();
        });
        connector.processMessage('hi');
    });
});
*/