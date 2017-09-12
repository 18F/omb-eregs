#!/bin/bash
set -v -e

docker-compose down   # free up ports

export COMPOSE_CMD='docker-compose -p integration_tests -f docker-compose.yml -f devops/integration-compose.yml'

$COMPOSE_CMD down -v # just in case there was an error previously

# start the selenium services; they must be up by the time we hit the py.tests
# below
$COMPOSE_CMD up -d selenium_chrome selenium_firefox

# wait for api to startup
until (curl http://localhost:9001 &>/dev/null)
do
  echo "Startup: Waiting for API"
  sleep 1
done

# Load data
$COMPOSE_CMD run --rm manage.py fetch_csv
$COMPOSE_CMD run --rm manage.py import_reqs data.csv
$COMPOSE_CMD run --rm manage.py loaddata devops/integration_tests/admin.json

# We disable the django plugin as it's misleading (for now). The database
# context isn't quite right
$COMPOSE_CMD run --rm selenium-py.test -p no:django --driver Remote --capability browserName chrome --host selenium_chrome devops/integration_tests/
$COMPOSE_CMD run --rm selenium-py.test -p no:django --driver Remote --capability browserName firefox --host selenium_firefox devops/integration_tests/

$COMPOSE_CMD down -v  # cleanup
