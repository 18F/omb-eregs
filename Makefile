.PHONY: prod
prod: reqs/static/js/bundle.js requirements.txt
	docker-compose -f devops/prod-compose.yml up

.PHONY: dev
dev: reqs/static/js/bundle.js requirements_dev.txt
	docker-compose -f devops/dev-compose.yml up

.PHONY: rebuild
rebuild: reqs/static/js/bundle.js requirements.txt requirements_dev.txt
	docker-compose -f devops/dev-compose.yml build
	docker-compose -f devops/prod-compose.yml build
	docker-compose -f devops/piptools-compose.yml build

.PHONY: createsuperuser
createsuperuser: requirements.txt
	docker-compose -f devops/prod-compose.yml run web ./devops/wait_for_db_then ./manage.py migrate
	docker-compose -f devops/prod-compose.yml run web ./manage.py createsuperuser

.PHONY: loaddata
loaddata:
	docker-compose -f devops/prod-compose.yml run web ./devops/wait_for_db_then make native_loaddata


## Frontend files
reqs/static/js/bundle.js: $(shell find reqs/static/js | grep -v bundle.js) package.json
	docker run -it --rm -v `pwd`:/usr/src/app -w /usr/src/app node:6 npm install
	docker run -it --rm -v `pwd`:/usr/src/app -w /usr/src/app node:6 ./node_modules/.bin/webpack


## Pip-tools
requirements_dev.txt: requirements.txt requirements_dev.in
	docker-compose -f devops/piptools-compose.yml run compile --output-file requirements_dev.txt requirements_dev.in
requirements.txt: requirements.in
	docker-compose -f devops/piptools-compose.yml run compile --output-file requirements.txt requirements.in


## Tests
.PHONY: pytest
pytest:
	docker-compose -f devops/dev-compose.yml run web py.test
	docker-compose -f devops/dev-compose.yml run web flake8

.PHONY: integration_tests
integration_tests: data.csv
	docker-compose -f devops/integration-compose.yml run web
	docker-compose -f devops/integration-compose.yml down


## Commands which run in the container (Docker or Cloud.gov)
.PHONY: prod_native
prod_native:
	./manage.py migrate --noinput
	./manage.py collectstatic --noinput
	gunicorn omb_eregs.wsgi:application -b 0.0.0.0:$(PORT)

.PHONY: dev_native
dev_native:
	./manage.py migrate --noinput
	./manage.py runserver 0.0.0.0:$(PORT)

bad_encoding.csv:
	wget https://github.com/ombegov/policy-v2/raw/master/assets/Phase1_CombinedQA_AllPhase1_Nov21.csv -O bad_encoding.csv
data.csv: bad_encoding.csv
	iconv -f Windows-1252 -t utf-8 bad_encoding.csv > data.csv
.PHONY: loaddata_native
loaddata_native: data.csv
	./manage.py migrate --noinput
	./manage.py import_reqs data.csv
