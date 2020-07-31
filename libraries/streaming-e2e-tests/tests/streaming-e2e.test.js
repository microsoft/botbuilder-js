const path = require('path');
const dotenv = require('dotenv');
const ENV_FILE = path.join(__dirname, '.env');
dotenv.config({ path: ENV_FILE });

const assert = require('assert');
const { Builder, By, Condition, Key, until, css } = require('selenium-webdriver');
const { Options } = require('selenium-webdriver/chrome');

const pathToChromeDriver = process.env.CHROME_DRIVER;

describe('Chrome', function () {
  it('should receive an echo after sending a message', async function () {
    this.timeout(15000);
    const driver = createDriver('chrome');
    await echoMessageInBrowser(driver);
    const transcriptMessages = await getTranscriptMessages(driver, 3);

    assert.strictEqual(transcriptMessages[0], 'Hello and welcome!');
    assert.strictEqual(transcriptMessages[1], 'Why hello there');
    assert.strictEqual(transcriptMessages[2], 'Streaming Echo: Why hello there.');
    assert.strictEqual(transcriptMessages.length, 3);

    await driver.quit();
  });
});

function createDriver(browser, driverBinPath) {
    // For now, we are only using ChromeDriver
    // In future expansions on E2E streaming tests, we can expand to create options for multiple browsers
    const options = new Options().setChromeBinaryPath(driverBinPath);
    const builder = new Builder()
        .setChromeOptions(options)
        .forBrowser(browser)
        .build();

  return builder;
}

async function echoMessageInBrowser(driver) {
  try {
    await driver.get(process.env.REACT_APP_ENDPOINT);
    await driver.sleep(2000);

    let wcSendBox = await driver.wait(until.elementLocated(By.className('webchat__send-box-text-box__input')), 10000);
    await wcSendBox.sendKeys('Why hello there', Key.RETURN);

    return driver;

  } catch (error) {
    throw new Error(error.message);
  }
}

async function getTranscriptMessages(driver, minNumMessages) {
  await driver.wait(minNumActivitiesShown(minNumMessages), 15000);

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
