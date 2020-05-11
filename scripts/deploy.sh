#!/bin/bash -e

# build docker image
docker build . -t kinarva-image

# creates a container from image
docker create --name kinarva kinarva-image

# copy build from docker container to host machine
docker cp kinarva:/usr/src/app/build ./build

# remove the container
docker rm -f kinarva

# upload to s3
cd build
aws s3 cp --acl 'public-read' . s3://www.kinarva.com/ --recursive
cd ../

# remove build directory
rm -rf build/
