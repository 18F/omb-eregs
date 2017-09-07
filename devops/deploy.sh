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

if [ -n "$CF_USERNAME" ] && [ -n "$CF_PASSWORD" ]; then
  cf login -a $API -u $CF_USERNAME -p $CF_PASSWORD
fi
cf target -o $ORG -s $SPACE

cf scale -i 1 api   # ensure we have 512M free
cf zero-downtime-push api -f $MANIFEST
cf scale -i 1 ui
cf zero-downtime-push ui -f $MANIFEST
cf zero-downtime-push redeployer -f $MANIFEST
