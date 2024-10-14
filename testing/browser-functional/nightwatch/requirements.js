const { DEFAULT_BROWSER, getFlag, getBrowser, logs, isBrowserInstalled, isBotRunning } = require('./utils');

async function validate() {
    const inputs = getFlag(['-e', '--env']).split(',');

    let isBotValidated = false;
    for (const input of inputs) {
        let /** @type {import('./types').IBrowser} */ browser, /** @type {Error} */ err;
        [browser, err] = getBrowser(input);
        if (err) {
            logs.browserNotFoundWarn(err);
            [browser] = getBrowser(DEFAULT_BROWSER);
        }

        if(!isBotValidated){
            err = await isBotRunning(browser);
            isBotValidated = true;
            if (err) {
                logs.echoBotNotRunningError(err);
                return false;
            } else {
                logs.echoBotRunningLog();
            }
        }

        err = await isBrowserInstalled(browser);
        if (err) {
            logs.browserNotFoundError(browser);
            return false;
        } else {
            logs.browserInstalledLog(browser);
        }
    }

    return true;
}

module.exports = { validate };
