// Refer to the online docs for more details:
// https://nightwatchjs.org/gettingstarted/configuration/
//

//  _   _  _         _      _                     _          _
// | \ | |(_)       | |    | |                   | |        | |
// |  \| | _   __ _ | |__  | |_ __      __  __ _ | |_   ___ | |__
// | . ` || | / _` || '_ \ | __|\ \ /\ / / / _` || __| / __|| '_ \
// | |\  || || (_| || | | || |_  \ V  V / | (_| || |_ | (__ | | | |
// \_| \_/|_| \__, ||_| |_| \__|  \_/\_/   \__,_| \__| \___||_| |_|
//             __/ |
//            |___/

const dotenv = require('dotenv');
dotenv.config();

const { DEFAULT_BROWSER, browsers } = require('./utils');
const { validate } = require('./requirements');

const config = {
    // An array of folders (excluding subfolders) where your tests are located;
    // if this is not specified, the test source must be passed as the second argument to the test runner.
    src_folders: ['nightwatch/tests'],

    // See https://nightwatchjs.org/guide/concepts/page-object-model.html
    page_objects_path: ['nightwatch/pages'],

    // See https://nightwatchjs.org/guide/extending-nightwatch/adding-custom-commands.html
    custom_commands_path: [],

    // See https://nightwatchjs.org/guide/extending-nightwatch/adding-custom-assertions.html
    custom_assertions_path: [],

    // See https://nightwatchjs.org/guide/extending-nightwatch/adding-plugins.html
    plugins: [],

    // See https://nightwatchjs.org/guide/concepts/test-globals.html
    // globals_path: './globals.js',
    globals: {
        asyncHookTimeout: 10 * 60 * 1000, // 10 minutes
        async before() {
            const valid = await validate();
            if (!valid) {
                process.exit(1);
            }
        },
    },

    webdriver: {},

    test_workers: {
        enabled: true,
    },

    test_settings: {
        default: {
            disable_error_log: false,
            launch_url: process.env.TestURI,

            screenshots: {
                enabled: false,
                path: 'screens',
                on_failure: true,
            },

            desiredCapabilities: {
                browserName: DEFAULT_BROWSER,
            },

            webdriver: {
                start_process: true,
                server_path: '',
            },
        },

        [browsers.firefox.key]: {
            desiredCapabilities: {
                browserName: browsers.firefox.id,
                alwaysMatch: {
                    acceptInsecureCerts: true,
                    'moz:firefoxOptions': {
                        args: [
                            // '-headless',
                            // '-verbose'
                        ],
                    },
                },
            },
            webdriver: {
                start_process: true,
                server_path: '',
                cli_args: [
                    // very verbose geckodriver logs
                    // '-vv'
                ],
            },
        },

        [browsers.chrome.key]: {
            desiredCapabilities: {
                browserName: browsers.chrome.id,
                'goog:chromeOptions': {
                    // More info on Chromedriver: https://sites.google.com/a/chromium.org/chromedriver/
                    args: [
                        //'--no-sandbox',
                        //'--ignore-certificate-errors',
                        //'--allow-insecure-localhost',
                        //'--headless=new'
                    ],
                },
            },

            webdriver: {
                start_process: true,
                server_path: '',
                cli_args: [
                    // --verbose
                ],
            },
        },

        [browsers.edge.key]: {
            desiredCapabilities: {
                browserName: browsers.edge.id,
                'ms:edgeOptions': {
                    // More info on EdgeDriver: https://docs.microsoft.com/en-us/microsoft-edge/webdriver-chromium/capabilities-edge-options
                    args: [
                        //'--headless=new'
                    ],
                },
            },

            webdriver: {
                start_process: true,
                server_path: '',
                cli_args: [
                    // --verbose
                ],
            },
        },
    },
};

module.exports = config;
