const { drivers, browsers } = require('./globals');
const seleniumServer = require('selenium-server');

module.exports = {
    src_folders: ['tests'],
    page_objects_path: 'tests/tests_pages',
    globals_path: './globals.js',
    test_settings: {
        default: {
            request_timeout_options: {
                timeout: 100000,
                retry_attempts: 3,
            },
        },

        selenium: {
            selenium: {
                start_process: true,
                check_process_delay: 10000,
                port: drivers[browsers.FIREFOX].port,
                server_path: seleniumServer.path,
                cli_args: {
                    'webdriver.gecko.driver': drivers[browsers.FIREFOX].path,
                },
            },
            webdriver: {
                start_process: false,
            },
        },

        [browsers.CHROME]: {
            silent: true,
            selenium: {
                start_process: false,
            },
            webdriver: {
                start_process: true,
                server_path: drivers[browsers.CHROME].path,
                port: drivers[browsers.CHROME].port,
            },
            desiredCapabilities: {
                browserName: browsers.CHROME,
                javascriptEnabled: true,
                acceptSslCerts: true,
            },
        },

        [browsers.FIREFOX]: {
            extends: 'selenium',
            silent: true,
            desiredCapabilities: {
                browserName: browsers.FIREFOX,
                javascriptEnabled: true,
                acceptSslCerts: true,
            },
        },
    },
};
