exports.config = {
    directConnect: true,

    // Capabilities to be passed to the webdriver instance.
    capabilities: {
        'browserName': 'chrome'
    },

    // Framework to use. Jasmine is recommended.
    framework: 'jasmine',
    seleniumAddress: 'http://localhost:4444/wd/hub',

    //chromeOnly: true,
    //chromeDriver: './node_modules/protractor/node_modules/selenium-webdriver/chrome.js',

    // Spec patterns are relative to the current working directory when
    // protractor is called.
    specs: ['end2end-test/*spec.js'],
    baseUrl: 'https://ita-event-manager.herokuapp.com/',

    // Options to be passed to Jasmine.
    jasmineNodeOpts: {
        showColors: true,
        defaultTimeoutInterval: 30000
    }
};
