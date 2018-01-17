var assert = require('assert');
var builder = require('../');

/*
describe('dialogs', function () {
    this.timeout(5000);
    it('should redirect to another dialog with arguments', function (done) {
        var connector = new builder.ConsoleConnector();
        var bot = new builder.UniversalBot(connector);
        bot.dialog('/', [
            function (session) {
                session.beginDialog('/child', { foo: 'bar' })
            },
            function (session, results) {
                assert(results.response.bar === 'foo');
                session.send('done');
            }
        ]);
        bot.dialog('/child', function (session, args) {
            assert(args.foo === 'bar');
            session.endDialog({ response: { bar: 'foo' } });
        });
        bot.on('send', function (message) {
            assert(message.text == 'done');
            done();
        });
        connector.processMessage('start');
    });

    it('should process a waterfall of all built-in prompt types', function (done) {
        var step = 0;
        var connector = new builder.ConsoleConnector();
        var bot = new builder.UniversalBot(connector);
        bot.dialog('/', [
            function (session) {
                assert(session.message.text == 'start');
                builder.Prompts.text(session, 'enter text');
            },
            function (session, results) {
                assert(results.response === 'some text');
                builder.Prompts.number(session, 'enter a number');
            },
            function (session, results) {
                assert(results.response === 42);
                builder.Prompts.choice(session, 'pick a color', 'red|green|blue');
            },
            function (session, results) {
                assert(results.response && results.response.entity === 'green');
                builder.Prompts.confirm(session, 'Is green your choice?');
            },
            function (session, results) {
                assert(results.response && results.response === true);
                builder.Prompts.time(session, 'enter a time');
            },
            function (session, results) {
                assert(results.response);
                var date = builder.EntityRecognizer.resolveTime([results.response]);
                assert(date);
                session.send('done');
            }
        ]);
        bot.on('send', function (message) {
            switch (++step) {
                case 1:
                    assert(message.text == 'enter text');
                    connector.processMessage('some text');
                    break;
                case 2:
                    connector.processMessage('42');
                    break;
                case 3:
                    connector.processMessage('green');
                    break;
                case 4:
                    connector.processMessage('yes');
                    break;
                case 5:
                    connector.processMessage('in 5 minutes');
                    break;
                case 6:
                    assert(message.text == 'done');
                    done();
                    break;
            }
        });
        connector.processMessage('start');
    });

    it("should process default action for intentDialog onBegin", function (done) {
        var connector = new builder.ConsoleConnector();
        var bot = new builder.UniversalBot(connector);

        var intentDialog = new builder.IntentDialog({ recognizeMode: builder.RecognizeMode.onBegin })
            .onBegin((session, args, next) => {
                session.dialogData.begin = true;
                next();
            })
            .onDefault((session) => {
                assert(session.dialogData.begin == true);
                done();
            });

        bot.dialog('/intentDialog', intentDialog);

        bot.dialog('/', function (session) {
            session.beginDialog("/intentDialog");
        });
        connector.processMessage("test");
    });
    
    it('should process a waterfall of text prompts with maxLength and minLength requirements', function (done) {
        var step = 0;
        var connector = new builder.ConsoleConnector();       
        var bot = new builder.UniversalBot(connector);
        bot.dialog('/', [
            function (session, results) {
                assert(session.message.text == 'start');
                builder.Prompts.text(session, 'enter at least 3 characters', { minLength: 3 });
            },
            function (session, results) {
                assert(session.message.text == 'three');
                builder.Prompts.text(session, 'enter at less than 7 characters', { maxLength: 7 });    
            },
            function (session, results) {
                assert(session.message.text == 'seven');
                builder.Prompts.text(session, 'do not enter more than 7 characters', { maxLength: 7 });    
            },
            function (session, results) {
                assert(session.message.text == 'seven');
                builder.Prompts.text(session, 'do not enter less than 3 characters', { minLength: 3 });  
            },
            function (session, results) {
                assert(session.message.text == 'two');
                session.send('done');
            }
        ]);
        bot.on('send', function (message) {
            switch (++step) {
                case 1:
                    assert(message.text == 'enter at least 3 characters');
                    connector.processMessage('three');
                    break;
                case 2:
                    connector.processMessage('seven');
                    break;
                case 3:
                    connector.processMessage('seven characters');
                    break;
                case 4:
                    var re = /The text you entered was above the maximum allowed length of 7\. Please enter a valid text\./
                    assert(re.test(message.text))
                    connector.processMessage('seven');
                    break;
                case 5:
                    connector.processMessage('2');
                    break;
                case 6:
                    var re = /The text you entered was below the minimum allowed length of 3\. Please enter a valid text\./
                    assert(re.test(message.text))
                    connector.processMessage('two');
                    break;
                case 7:
                    assert(message.text == 'done');
                    done();
                    break;
            }
        });
        connector.processMessage('start');
    });
});
*/