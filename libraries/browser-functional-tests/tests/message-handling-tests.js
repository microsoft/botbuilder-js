/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

var botPage;
module.exports = {
    botPage: {},
    before: function(browser) {
        botPage = browser.page.echoBotPage();
    },
    afer: function(browser) {
        // End current page session
        botPage.end();
    },
    'Echo bot webchat is loaded': function(browser) {
        // Navigate to the Echo Bot page
        // This step is performed made in the first test since navigation can't be done in the 'before' hook
        botPage.navigate();

        // Check Webchat container is initialized and is present in the page
        botPage
            .assert.elementPresent('@webchatContainer');
    },
    'Echo bot webchat sends messages': async function(browser) {
        // Type 'Hello' in the webchat input box and send it to the bot
        botPage
            .setValue('@webchatMessageInput', 'Hello')
            .click('@webchatMessageInputSubtmitButton', function(result) {
                // Assertion to check the button was clickable and got triggered
                this.assert.strictEqual(result.status, 0, 'Message input working');
            })
            .pause(250);

        await assertMessageIsPresentInPage(botPage, 'Hello', 'Webchat contains user message');
    },
    'Echo bot webchat echoes messages': async function(browser) {
        await assertMessageIsPresentInPage(botPage, '1: You said “Hello”', 'Webchat contains bot reply');
    }
};

async function assertMessageIsPresentInPage(pageInstance, textSearch, assertMessage) {
    let messagesListPromises = [];
    // Get messages list from webchat
    await pageInstance.api.elements('@webchatMessagesList', function(messagesWebElements) {
        for (let index = 0; (index < messagesWebElements.value.length); index++) {
            const webElement = messagesWebElements.value[index];
            messagesListPromises.push(new Promise(function(resolve){
                pageInstance.api.elementIdText(webElement.ELEMENT, function(elementText) {
                    resolve(elementText.value == textSearch);
                });
            }));
        }
    }).then(function(){
        Promise.all(messagesListPromises)
        .then(function (results) {
            let messageExists = results.some(function (value) {
                return value;
            });
            pageInstance.assert.strictEqual(messageExists, true, assertMessage);
        });
    });
}
