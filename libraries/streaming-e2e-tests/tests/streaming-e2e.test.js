/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

const assert = require('assert');
const { Builder, By, Condition, Key, until, css } = require('selenium-webdriver');
const { Options } = require('selenium-webdriver/chrome');

const userMessage = 'Why hello there';
const reactAppEndpoint = 'http://localhost:3000';
// const reactAppEndpoint = 'https://ash-react-app.azurewebsites.net/';

describe('Chrome', function () {
  it('should receive an echo after sending a message', async function () {
    this.timeout(60000);

    const driver = createDriver('chrome');
    await echoMessageInBrowser(driver);
    const transcriptMessages = await getTranscriptMessages(driver, 2);
    
    console.log('Transcript received. Asserting...');
    assert.strictEqual(transcriptMessages[0], userMessage);
    assert.strictEqual(transcriptMessages[1], `Streaming Echo: ${userMessage}.`);
    assert.strictEqual(transcriptMessages.length, 2);

    await driver.quit();
  });
});

function createDriver(browser) {
    // For now, we are only using ChromeDriver
    // In future expansions on E2E streaming tests, we can expand to create options for multiple browsers
    const options = new Options().headless();
    const builder = new Builder()
        .setChromeOptions(options)
        .forBrowser(browser)
        .build();

  return builder;
}

async function echoMessageInBrowser(driver) {
  try {
    console.log(`Navigating to "${reactAppEndpoint}"...`);
    await driver.get(reactAppEndpoint);

    console.log('Sleeping to allow loading...');
    await driver.sleep(15000);

    console.log('Getting Web Chat sendbox...');
    let wcSendBox = await driver.wait(until.elementLocated(By.className('webchat__send-box-text-box__input')), 25000);
    console.log('Sending user message...');
    await wcSendBox.sendKeys(userMessage, Key.RETURN);

    return driver;

  } catch (error) {
    throw new Error(error.message);
  }
}

async function getTranscriptMessages(driver, minNumMessages) {
  console.log('Waiting for activities to load...');
  await driver.wait(minNumActivitiesShown(minNumMessages), 60000);

  console.log('Activities loaded. Getting transcript...');
  const transcript = await getTranscript(driver);
  const messageBubbles = await getBubbles(transcript);

  return await Promise.all(
    messageBubbles.map(async (bubble) => {
      return await bubble
        .findElement(By.css('p'))
        .getText();
    }));
}

function minNumActivitiesShown(numActivities) {
  return new Condition(`${numActivities} activities is shown`, async driver => {
    // To run hooks (WebChatTest.runHook), the code internally creates an activity.
    // Inside the activity renderer, it calls hooks, but returns empty visually.
    // This activity is invisible and should not count towards "minNumActivitiesShown".

    const activityElements = await driver.findElements(By.css(`.webchat__basic-transcript__activity`));

    const numActivitiesShown = await driver.executeScript(
      activityElements => [].reduce.call(
        activityElements,
        (numActivitiesShown, child) => numActivitiesShown + (child.children.length ? 1 : 0),
        0
      ),
      activityElements
    );

    return numActivitiesShown >= numActivities;
  });
}

async function getTranscript(driver) {
  return await driver.findElement(By.css('.webchat__basic-transcript'));
}

async function getBubbles(transcript) {
  return await transcript.findElements(By.className('webchat__bubble__content'));
}
