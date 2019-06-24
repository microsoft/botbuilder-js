# Bot Framework Testing Utilities

This library contains some helper classes useful for testing bots built with Bot Framework.

## Install

First, install this library from npm:
```bash
npm install --save botbuilder-testing
```

## Unit Tests for Dialogs

`DialogTestClient` provides a mechanism for testing dialogs outside of a bot, and without having to set up a working adapter.
This class can be used to write unit tests for dialogs that test responses on a step-by-step basis.  Any dialog built with `botbuilder-dialogs` should work.

Use the DialogTestClient to drive unit tests of your dialogs.

To create a test client:
```javascript
let client = new DialogTestClient(dialog_to_test, dialog_options, OptionalMiddlewares);
```

To "send messages" through the dialog:
```javascript
let reply = await client.sendActivity('test');
```

To check for additional messages:
```javascript
reply = await client.getNextReply();
```

Here is a sample unit test using assert:

```javascript
const { DialogTestClient, DialogTestLogger } = require('botbuilder-testing');
const assert = require('assert');

let my_dialog = new SomeDialog();
let options = { ... dialog options ... };

// set up a test client with a logger middleware that logs messages in and out
let client = new DialogTestClient(my_dialog, options, [new DialogTestLogger()]);

// send a test message, catch the reply
let reply = await client.sendActivity('hello');
assert(reply.text == 'hello yourself', 'first message was wrong');
// expecting 2 messages in a row?
reply = await client.getNextReply();
assert(reply.text == 'second message', 'second message as wrong');

// test end state
assert(client.dialogTurnResult.status == 'empty', 'dialog is not empty');
```

[Additional examples are available here](tests/)

### DialogTestLogger

This additional helper class will cause the messages in your dialog to be logged to the console.
By default, the transcript will be logged with the `mocha-logger` package. You may also provide
your own logger:

```javascript
let testlogger = new DialogTestLogger(console);
```

