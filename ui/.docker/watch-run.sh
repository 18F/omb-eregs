#!/bin/bash
set -e

# On file change, rebuild CSS
./node_modules/.bin/webpack --watch &
node server/index.js
