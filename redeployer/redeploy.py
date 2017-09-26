import argparse
import os
from datetime import datetime, timedelta
from time import sleep

import requests
from cfenv import AppEnv
from dateutil.parser import parse as parse_date

parser = argparse.ArgumentParser(
    description='Trigger a CircleCI job at a specified time')
parser.add_argument('time', help='UTC 24-hour time')


def sleep_until(time):
    now = datetime.now()
    while time < now:
        time = time + timedelta(days=1)
    diff = (time - now).total_seconds()
    print(f"Current time is {now}.")    # noqa
    print(f"Sleeping until  {time} ({diff} seconds)")   # noqa
    sleep(diff)


def start_job():
    service = AppEnv().get_service(name='redeployer-creds')
    token = service.credentials.get('API_TOKEN')

    branch = os.environ.get('CIRCLE_BRANCH', 'master')
    job = os.environ.get('CIRLCE_JOBNAME', 'build')
    org = os.environ.get('CIRCLE_ORGNAME')
    repo = os.environ.get('CIRCLE_REPONAME')
    vcs = os.environ.get('CIRCLE_VCS', 'github')

    url = f"https://{token}:@circleci.com/api/v1.1/project/{vcs}/{org}/{repo}"
    url += f"/tree/{branch}"
    result = requests.post(url, data={'build_parameters[CIRCLE_JOB]': job})
    result.raise_for_status()


if __name__ == '__main__':
    args = parser.parse_args()
    while True:
        time = parse_date(args.time)
        sleep_until(time)
        start_job()
