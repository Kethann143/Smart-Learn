#!/bin/bash

# Install App APK on Emulator
echo "Installing APK on emulator..."
adb install ../../android/app/build/outputs/apk/debug/app-debug.apk

# Run Jasmine test specs
echo "Running Jasmine test specs..."
npm test
