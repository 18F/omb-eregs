#!/bin/bash

set -e

API="https://api.fr.cloud.gov"
ORG="omb-eregs"
SPACE=$1

MANIFEST="manifest_$SPACE.yml"
if [ ! -f $MANIFEST ]; then
  echo "Unknown space: $SPACE"
  exit
fi

if [ $SPACE == 'dev' ] && [ -n "$CF_USERNAME_DEV" ] && [ -n "$CF_PASSWORD_DEV" ]; then
  cf login -a $API -u $CF_USERNAME_DEV -p $CF_PASSWORD_DEV
elif [ $SPACE == 'prod' ] && [ -n "$CF_USERNAME_PROD" ] && [ -n "$CF_PASSWORD_PROD" ]; then
  cf login -a $API -u $CF_USERNAME_PROD -p $CF_PASSWORD_PROD
elif [ -n "$CF_USERNAME" ] && [ -n "$CF_PASSWORD" ]; then
  cf login -a $API -u $CF_USERNAME -p $CF_PASSWORD
fi
cf target -o $ORG -s $SPACE

# Note that this may deploy the app twice until
# https://github.com/contraband/autopilot/pull/24
# is included in the plugin
cf zero-downtime-push api -f $MANIFEST
cf zero-downtime-push ui -f $MANIFEST
