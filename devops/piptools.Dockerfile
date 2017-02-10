# Install pip-tools to a container so that we can run pip-compile
FROM python:3.5.2

WORKDIR /code
ENV PYTHONUNBUFFERED="1"

RUN pip install pip-tools==1.8.0

ENTRYPOINT ["pip-compile"]
