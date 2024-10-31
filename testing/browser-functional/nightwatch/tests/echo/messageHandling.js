/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

describe('Echo Bot: Message Handling', () => {
    const botPage = browser.page.echo();

    before(() => botPage.navigate());
    after((browser) => browser.quit());

    it('Echo bot webchat is loaded', () => {
        // Check Webchat container is initialized and is present in the page
        botPage.assert.elementPresent('@webchatContainer');
    });

    it('Echo bot webchat sends messages', async () => {
        // Type 'Hello' in the webchat input box and send it to the bot
        botPage.setValue('@webchatMessageInput', 'Hello');
        botPage.click('@webchatMessageInputSubmitButton', (result) => {
            // Assertion to check the button was clickable and got triggered
            browser.assert.strictEqual(result.status, 0, 'Message input working');
        });
        botPage.pause(250);

        await assertMessageIsPresentInPage(botPage, 'Hello', 'Webchat contains user message');
    });

    it('Echo bot webchat echoes messages', async () => {
        await assertMessageIsPresentInPage(botPage, '1: You said “Hello”', 'Webchat contains bot reply');
    });
});

async function assertMessageIsPresentInPage(pageInstance, textSearch, assertMessage) {
    let messagesListPromises = [];
    // Get messages list from webchat
    await pageInstance.api
        .elements('@webchatMessagesList', function (messagesWebElements) {
            for (let index = 0; index < messagesWebElements.value.length; index++) {
                const webElement = messagesWebElements.value[index];
                messagesListPromises.push(function (resolve) {
                    // Workaround for different implementations of the WebDriver API
                    // This will be fixed when all browsers makes use of Selenium Server v4 which is compliant with the W3C WebDriver standards
                    var elementId = webElement.ELEMENT != undefined ? webElement.ELEMENT : webElement.values()[0];
                    pageInstance.api.elementIdText(elementId, function (elementText) {
                        resolve(elementText.value == textSearch);
                    });
                });
            }
        })
        .then(function () {
            Promise.all(messagesListPromises).then(function (results) {
                let messageExists = results.some(function (value) {
                    return value;
                });
                // Check if any of the existing messages was equal to the needle.
                pageInstance.assert.strictEqual(messageExists, true, assertMessage);
            });
        });
}
