const { Builder, Browser } = require('selenium-webdriver');
const echoPage = require('./pages/echo');

const DEFAULT_BROWSER = Browser.CHROME;

/**
 @typedef IBrowser
 @type {import('./types').IBrowser}
 */

/**
 @typedef IBrowserList
 @type {import('./types').IBrowserList}
 */

/**
 @typedef BrowserKeys
 @type {import('./types').BrowserKeys}
 */

/**
 * @type {IBrowserList}
 */
const browsers = {
    chrome: {
        key: 'chrome',
        id: Browser.CHROME,
        name: 'Chrome',
        url: 'https://www.google.com/chrome',
    },
    firefox: {
        key: 'firefox',
        id: Browser.FIREFOX,
        name: 'Firefox',
        url: 'https://www.mozilla.org/firefox/new',
    },
    edge: {
        key: 'edge',
        id: Browser.EDGE,
        name: 'Edge',
        url: 'https://www.microsoft.com/edge',
    },
};

const logs = {
    browserInstalledLog(browser) {
        console.info(`  ✅ Browser '${browser.name}' detected`);
    },
    browserNotFoundWarn(err) {
        console.warn(`  ⚠️  ${err.message} - Using default browser: ${DEFAULT_BROWSER}`);
    },
    browserNotFoundError(browser) {
        console.error(
            `  ❌ Browser '${browser.name}' binary not found - Please visit the following URL to download and install the required browser: ${browser.url()}`
        );
    },
    echoBotNotRunningError(err) {
        console.error(`  ❌ ${err.message} - Please start the bot by executing 'yarn start:echo' and try again`);
    },
    echoBotRunningLog() {
        console.info(`  ✅ The '${echoPage.name}' is running at '${process.env.TestURI}'`);
    },
};

/**
 * @param {IBrowser} browser
 * @returns {Promise<Error>}
 */
async function isBrowserInstalled(browser) {
    if (!browser) {
        return false;
    }

    let driver;
    try {
        driver = await new Builder().forBrowser(browser.id).build();
    } catch (e) {
        return e;
    } finally {
        await driver?.quit();
    }
}

/**
 * @param {IBrowser} browser
 * @returns {Promise<Error>}
 */
async function isBotRunning(browser) {
    let driver;
    try {
        driver = await new Builder().forBrowser(browser.id).build();
        await driver.navigate().to(process.env.TestURI);
    } catch (error) {
        return new Error(`The '${echoPage.name}' bot is not running at '${process.env.TestURI}'`);
    } finally {
        await driver?.quit();
    }
}

/**
 * @param {BrowserKeys} key
 * @returns {[IBrowser, Error]}
 */
function getBrowser(key) {
    const browser = key ?? '';
    const result = browsers[browser.trim().toLowerCase()];
    if (!result) {
        return ['', new Error(`Browser '${browser}' not found`)];
    }

    return [result, null];
}

/**
 * @param {string[]} flags
 * @returns {string}
 */
function getFlag(flags) {
    return process.argv.find((_, i, arr) => flags.includes(arr[i - 1]?.trim()));
}

module.exports = {
    DEFAULT_BROWSER,
    browsers,
    logs,
    isBrowserInstalled,
    isBotRunning,
    getBrowser,
    getFlag,
};
