#!/bin/bash
# Grab the necessary libs and then deploy from CircleCI

export PATH=$HOME:$PATH
curl -L "https://cli.run.pivotal.io/stable?release=linux64-binary&source=github" | tar -zx
wget "https://github.com/contraband/autopilot/releases/download/0.0.3/autopilot-linux"
chmod a+x autopilot-linux
mv cf $HOME
mv autopilot-linux $HOME
cf install-plugin -f ~/autopilot-linux
./devops/deploy.sh $1
