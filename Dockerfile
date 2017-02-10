FROM python:3.5.2

WORKDIR /code
ENV PYTHONUNBUFFERED="1"
EXPOSE 8000

COPY ["requirements.txt", "requirements_dev.txt", "/code/"]

RUN pip install -r requirements.txt

COPY ["manage.py", "/code/"]
COPY ["omb_eregs", "/code/omb_eregs"]
COPY ["reqs", "/code/reqs"]
COPY ["devops", "/code/devops"]

ARG DEV_MODE=""
RUN [ -z $DEV_MODE ] || ./devops/dev_mode_install.sh

