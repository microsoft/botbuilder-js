/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

const assert = require('assert');
const { Builder, By, Condition, Key, until, logging } = require('selenium-webdriver');
const { Options } = require('selenium-webdriver/chrome');

const userMessage = 'Why hello there';
const reactAppEndpoint = 'http://localhost:3000';

describe('Chrome', function () {
    it('should receive an echo after sending a message', async function () {
        this.timeout(120000);

        const driver = createDriver('chrome');
        await echoMessageInBrowser(driver);
        const transcriptMessages = await getTranscriptMessages(driver, 2);

        await ensureNoBrowserErrors(driver);

        console.log('Transcript received. Asserting...');
        assert.deepStrictEqual(transcriptMessages, [userMessage, `Streaming Echo: ${userMessage}.`]);

        await driver.quit();
    });
});

/**
 * @param {string} browser browser to use when creating driver
 * @returns {import('selenium-webdriver').WebDriver} selenium driver
 */
function createDriver(browser) {
    // For now, we are only using ChromeDriver
    // In future expansions on E2E streaming tests, we can expand to create options for multiple browsers
    const options = new Options().headless();

    const preferences = new logging.Preferences();
    preferences.setLevel(logging.Type.BROWSER, logging.Level.SEVERE);
    options.setLoggingPrefs(preferences);

    return new Builder().setChromeOptions(options).forBrowser(browser).build();
}

/**
 * @param {import('selenium-webdriver').WebDriver} driver selenium driver
 */
async function echoMessageInBrowser(driver) {
    console.log(`Navigating to "${reactAppEndpoint}"...`);
    await driver.get(reactAppEndpoint);

    await ensureNoBrowserErrors(driver);

    console.log('Waiting for webchat to load or error is reported...');
    await Promise.race([
        driver
            .wait(until.elementLocated(By.id('webchat-error')), 10000, 'timed out finding webchat-error')
            .getText()
            .then((message) => {
                throw new Error(`Found #webchat-error DOM element: ${message}`);
            }),
        driver.wait(until.elementLocated(By.id('react-webchat')), 10000, 'timed out finding react-webchat'),
    ]);

    console.log('Getting Web Chat sendbox...');
    const wcSendBox = await driver.wait(
        until.elementLocated(By.className('webchat__send-box-text-box__input')),
        10000,
        'timed out locating webchat sendbox'
    );

    console.log('Sending user message...');
    await wcSendBox.sendKeys(userMessage, Key.RETURN);
}

/**
 * @param {import('selenium-webdriver').WebDriver} driver selenium driver
 */
async function ensureNoBrowserErrors(driver) {
    console.log('Getting browser logs...');
    const browserConsoleErrors = await driver.manage().logs().get(logging.Type.BROWSER);

    if (browserConsoleErrors.length) {
        browserConsoleErrors.forEach((error) => console.error(error.level.name, error.message));

        throw new Error('SEVERE-level error found in browser.');
    }
}

/**
 * @param {import('selenium-webdriver').WebDriver} driver selenium driver
 * @param {number} minNumMessages minimum number of messages to wait for
 */
async function getTranscriptMessages(driver, minNumMessages) {
    console.log('Waiting for activities to load...');
    await driver.wait(minNumActivitiesShown(minNumMessages), 20000, 'timed out waiting for activities to load');

    console.log('Activities loaded. Getting transcript...');
    const transcript = await getTranscript(driver);
    const messageBubbles = await getBubbles(transcript);

    return await Promise.all(messageBubbles.map((bubble) => bubble.findElement(By.css('p')).getText()));
}

/**
 * @param {number} numActivities minimum number of activities
 * @returns {import('selenium-webdriver').Condition<Promise<boolean>>} selenium condition
 */
function minNumActivitiesShown(numActivities) {
    return new Condition(`${numActivities} activities is shown`, async (driver) => {
        // To run hooks (WebChatTest.runHook), the code internally creates an activity.
        // Inside the activity renderer, it calls hooks, but returns empty visually.
        // This activity is invisible and should not count towards "minNumActivitiesShown".

        const activityElements = await driver.findElements(By.css(`.webchat__basic-transcript__activity`));

        const numActivitiesShown = await driver.executeScript(
            (activityElements) =>
                [].reduce.call(
                    activityElements,
                    (numActivitiesShown, child) => numActivitiesShown + (child.children.length ? 1 : 0),
                    0
                ),
            activityElements
        );

        return numActivitiesShown >= numActivities;
    });
}

/**
 * @param {import('selenium-webdriver').WebDriver} driver selenium driver
 * @returns {Promise<import('selenium-webdriver').WebElement>} transcript element
 */
function getTranscript(driver) {
    return driver.findElement(By.css('.webchat__basic-transcript'));
}

/**
 * @param {import('selenium-webdriver').WebDriver} driver selenium driver
 * @returns {Promise<Array<import('selenium-webdriver').WebElement>>} bubble elements
 */
function getBubbles(driver) {
    return driver.findElements(By.className('webchat__bubble__content'));
}
