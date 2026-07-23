/**
 * wdio.conf.js
 * WebdriverIO + Appium Configuration for Smart Learn Mobile App
 * Target: Android via USB (com.smartlearn.companion)
 */

const path = require('path');

exports.config = {
  runner: 'local',
  autoCompileOpts: {
    autoCompile: false
  },
  specs: ['./tests/**/*.spec.js'],
  exclude: [],
  maxInstances: 1,

  // ==================================
  // Appium + Android Capabilities
  // ==================================
  capabilities: [{
    platformName: 'Android',
    'appium:deviceName': 'Android Device',
    'appium:automationName': 'UiAutomator2',
    'appium:appPackage': 'com.smartlearn.companion',
    'appium:appActivity': 'com.smartlearn.companion.MainActivity',
    'appium:noReset': false,
    'appium:fullReset': false,
    'appium:newCommandTimeout': 90,
    'appium:androidInstallTimeout': 120000,
    'appium:adbExecTimeout': 60000,
    'appium:nativeWebScreenshot': true,
    'appium:autoGrantPermissions': true,
  }],

  // Appium Service (starts Appium server automatically)
  services: [
    ['appium', {
      command: 'appium',
      args: {
        address: '127.0.0.1',
        port: 4723,
        log: './logs/appium.log',
        'relaxed-security': true,
      }
    }]
  ],

  // ==================================
  // Test Framework
  // ==================================
  framework: 'jasmine',
  jasmineOpts: {
    defaultTimeoutInterval: 60000,
    expectationResultHandler(passed, assertion) {
      if (!passed) {
        console.error(`❌ FAIL: ${assertion.message}`);
      }
    }
  },

  // ==================================
  // Reporters
  // ==================================
  reporters: [
    'spec',
    ['allure', {
      outputDir: './allure-results',
      disableWebdriverStepsReporting: false,
      disableWebdriverScreenshotsReporting: false,
    }]
  ],

  // ==================================
  // Timeouts
  // ==================================
  waitforTimeout: 15000,
  connectionRetryTimeout: 90000,
  connectionRetryCount: 3,

  // ==================================
  // Hooks
  // ==================================
  before(capabilities, specs) {
    const chai = require('chai');
    global.expect = chai.expect;
    global.assert = chai.assert;
    global.TIMEOUT = 15000;
  },

  afterTest(test, context, { error, result, duration, passed }) {
    const fs = require('fs');
    const path = require('path');
    
    let screenshotName = null;
    if (!passed) {
      try {
        const screenshotDir = path.join(__dirname, 'Test Results', 'Screenshots');
        if (!fs.existsSync(screenshotDir)) {
          fs.mkdirSync(screenshotDir, { recursive: true });
        }
        screenshotName = `${test.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
        const screenshotPath = path.join(screenshotDir, screenshotName);
        browser.saveScreenshot(screenshotPath);
        console.log(`Saved screenshot: ${screenshotPath}`);
      } catch (err) {
        console.error('Failed to take screenshot:', err.message);
      }
    }
    
    try {
      const resultsDir = path.join(__dirname, 'Test Results', 'Logs');
      if (!fs.existsSync(resultsDir)) {
        fs.mkdirSync(resultsDir, { recursive: true });
      }
      const runLogPath = path.join(resultsDir, 'test-runs-raw.jsonl');
      const testResult = {
        title: test.title,
        duration: duration,
        passed: passed,
        error: error ? error.message : null,
        screenshot: screenshotName,
        timestamp: new Date().toISOString()
      };
      fs.appendFileSync(runLogPath, JSON.stringify(testResult) + '\n');
    } catch (e) {
      console.error('Error writing test results:', e);
    }
  },

  onComplete(exitCode, config, capabilities, results) {
    console.log('\n============================================');
    console.log('  Smart Learn E2E Appium Test Run Complete');
    console.log(`  Exit Code: ${exitCode}`);
    console.log('============================================\n');
  }
};
