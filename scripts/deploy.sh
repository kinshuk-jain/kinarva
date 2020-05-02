#!/bin/bash -e

# build docker image
docker build . -t kinarva-image

# creates a container from image
docker create --name kinarva kinarva-image

# copy build from docker container to host machine
docker cp kinarva:/usr/src/app/build ./deploy/

# zip deploy directory
cd ./deploy
zip -r ../kinarva.zip .
cd ../

# delete deploy directory
rm -rf deploy/build/

# remove the container
docker rm -f kinarva

# upload zip file to lambda function
aws lambda update-function-code --function-name kinarva --region ap-south-1 --zip-file fileb://${PWD}/kinarva.zip

# remove zip file
rm kinarva.zip
