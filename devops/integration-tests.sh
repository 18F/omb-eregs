set -v -e

docker-compose down   # free up ports

export COMPOSE_PROJECT_NAME='integration_tests'

# start the selenium services; they must be up by the time we hit the py.tests
# below
docker-compose up -d selenium_chrome selenium_firefox
sleep 20  # wait for api to startup

# Load data
docker-compose run --rm manage.py fetch_csv
docker-compose run --rm manage.py import_reqs data.csv

docker-compose run --rm py.test --driver Remote --capability browserName chrome --host selenium_chrome devops/integration_tests/
docker-compose run --rm py.test --driver Remote --capability browserName firefox --host selenium_firefox devops/integration_tests/

docker-compose down -v  # cleanup
