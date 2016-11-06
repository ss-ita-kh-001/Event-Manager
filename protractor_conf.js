exports.config = {

    // capabilities: {
    //     'browserstack.user': 'marynayelakova1',
    //     'browserstack.key': 'pe8cKNqc5y7hXG9kx5zM',
    //     browserName: 'chrome'
    // },

//    seleniumAddress: 'http://hub-cloud.browserstack.com/wd/hub',
    //seleniumAddress: 'http://localhost:4444/wd/hub',
    seleniumServerJar: './node_modules/protractor/selenium/latest.jar',
    framework: 'jasmine',

    chromeOnly: true,
    chromeDriver: './node_modules/selenium-webdriver/chrome.js',

    // Spec patterns are relative to the current working directory when
    // protractor is called.
    specs: ['end2end-test/*spec.js'],
    baseUrl: 'http://127.0.0.1:5000',

    // Options to be passed to Jasmine.
    jasmineNodeOpts: {
        showColors: true,
        defaultTimeoutInterval: 30000
    }
};
