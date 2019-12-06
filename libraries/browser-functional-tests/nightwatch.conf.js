const chromedriver = require('chromedriver');
const seleniumServer = require('selenium-server');
const geckodriver = require('geckodriver');

module.exports = {
    src_folders: ['tests'],
    page_objects_path: 'tests/tests_pages',
    test_settings: {
        selenium: {
            selenium: {
                start_process: true,
                port: 9515,
                server_path: seleniumServer.path,
                cli_args: {
                    'webdriver.gecko.driver': geckodriver.path,
                    'webdriver.chrome.driver': chromedriver.path
                }
            },
            webdriver: {
                start_process: false
            }
        },
      
        chrome: {
            extends: 'selenium',
            desiredCapabilities: {
                browserName: 'chrome',
                javascriptEnabled: true,
                acceptSslCerts: true,
                chromeOptions : {
                    w3c: false
                }
            }
        },
      
        firefox: {
            extends: 'selenium',
            silent: true,
            desiredCapabilities: {
                browserName: 'firefox',
                javascriptEnabled: true,
                acceptSslCerts: true
            }
        }
    }
};
