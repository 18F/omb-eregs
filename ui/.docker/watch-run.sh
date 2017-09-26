#!/bin/bash
set -e

# Ensure we have _a_ build initially
./node_modules/.bin/webpack
# On file change, rebuild JS
./node_modules/.bin/webpack --watch &
node server/index.js
