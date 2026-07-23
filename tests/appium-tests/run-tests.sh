#!/bin/bash

# Start Appium Server in background from the appium-tests directory
npx appium --log ./appium-server.log &

# Wait a few seconds for Appium to initialize
echo "Waiting for Appium to start..."
sleep 10

# Install App APK on Emulator
echo "Installing APK on emulator..."
adb install ../../android/app/build/outputs/apk/debug/app-debug.apk

# Run Jasmine test specs
echo "Running Jasmine test specs..."
npm test || true
