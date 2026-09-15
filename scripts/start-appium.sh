#!/bin/bash
set -e
APP_PORT=${APPIUM_PORT:-4723}
APP_HOST=${APPIUM_HOST:-127.0.0.1}

echo "Starting Appium server on ${APP_HOST}:${APP_PORT}"
appium --address "${APP_HOST}" --port "${APP_PORT}" --log appium.log
