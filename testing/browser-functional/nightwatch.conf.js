const seleniumServer = require('selenium-server');
const geckodriver = require('geckodriver');

module.exports = {
    src_folders: ['tests'],
    page_objects_path: 'tests/tests_pages',
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
                port: 9515,
                server_path: seleniumServer.path,
                cli_args: {
                    'webdriver.gecko.driver': geckodriver.path,
                },
            },
            webdriver: {
                start_process: false,
            },
        },

        chrome: {
            silent: true,
            selenium: {
                start_process: false,
            },
            webdriver: {
                start_process: true,
                //The tests with the chrome browser are performed with the chromedriver binary 
                //which in the future should be updated to maintain compatibility with the browser.
                //Current version 120.0.6.
                server_path: "./chromedriver.exe",
                port: 9515,
            },
            desiredCapabilities: {
                browserName: 'chrome',
                javascriptEnabled: true,
                acceptSslCerts: true
            },
        },

        firefox: {
            extends: 'selenium',
            silent: true,
            desiredCapabilities: {
                browserName: 'firefox',
                javascriptEnabled: true,
                acceptSslCerts: true,
            },
        },
    },
};
