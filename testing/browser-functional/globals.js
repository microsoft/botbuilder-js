const axios = require('axios');
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const driversDir = 'drivers';

const browsers = {
    CHROME: 'chrome',
    FIREFOX: 'firefox',
};

const drivers = {
    [browsers.CHROME]: {
        name: 'chromedriver.exe',
        path: path.join(__dirname, driversDir, 'chromedriver.exe'),
        port: 9515,
        url: 'https://googlechromelabs.github.io/chrome-for-testing',
        browser: {
            name: browsers.CHROME,
            url: 'https://www.google.com/chrome',
            exists(driver) {
                return browserExists(driver.port, 'cannot find Chrome binary');
            },
        },
    },
    [browsers.FIREFOX]: {
        name: 'geckodriver.exe',
        path: path.join(__dirname, driversDir, 'geckodriver.exe'),
        port: 4444,
        url: 'https://github.com/mozilla/geckodriver/releases',
        browser: {
            name: browsers.FIREFOX,
            url: 'https://www.mozilla.org/firefox/new',
            exists(driver) {
                return browserExists(driver.port, 'unable to find binary');
            },
        },
    },
};

async function requirements() {
    const driver = drivers[process.argv[process.argv.indexOf('-e') + 1]?.trim().toLowerCase()];

    if (!driver) {
        return true;
    }

    console.log('[Validating Requirements]');

    const exists = fs.existsSync(driver.path);
    if (!exists) {
        console.error(
            `  ❌ Driver : ${driver.name}
      - The current Nightwatch configuration (nightwatch.conf.js) requires the '${driver.name}' to be installed inside the '${driversDir}' folder.
        Visit '${driver.url}' website to download the '${driver.browser.name}' driver.
        Make sure to take into account OS 'platform', 'architecture', and 'version'.`
        );
        return false;
    }
    console.log(`  ✅ Driver : ${driver.name}`);

    if(process.env.TF_BUILD != undefined) {
        console.log(`  ✅ Browser: ${driver.browser.name}`);
        return true;
    }

    const exe = cp.spawn(driver.path, [`--port=${driver.port}`], {
        encoding: 'utf-8',
        shell: false,
        detached: true,
        windowsHide: true,
    });

    const isDriverRunning = await new Promise((res) => exe.stdout.on('data', () => res(true)));
    const browserExists = isDriverRunning && (await driver.browser.exists(driver));
    process.kill(exe.pid, 'SIGKILL');
    if (browserExists) {
        console.log(`  ✅ Browser: ${driver.browser.name}`);
        return true;
    }

    console.error(
        `  ❌ Browser: ${driver.browser.name}
     - The current Nightwatch configuration (nightwatch.conf.js) requires the '${driver.browser.name}' browser to be installed.
       Visit '${driver.browser.url}' website to download and install it.`
    );
    return false;
}

async function browserExists(port, assertion) {
    try {
        const { data } = await axios.post(`http://localhost:${port}/session`, { capabilities: {} });
        await axios.delete(`http://localhost:${port}/session/${data.value.sessionId}`);
        return true;
    } catch (error) {
        if (error?.response?.data?.value?.message?.includes(assertion)) {
            return false;
        }

        throw error;
    }
}

module.exports = {
    drivers,
    browsers,
    async before() {
        if (!(await requirements())) {
            process.exit(1);
        }
    },
};
