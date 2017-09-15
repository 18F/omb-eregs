#!/bin/bash

# Ensure we have _a_ build initially
./node_modules/.bin/webpack
# On file change, rebuild JS
./node_modules/.bin/webpack --watch &
# On server.js change, restart node server
./node_modules/.bin/nodemon --watch dist/server.js dist/server.js
