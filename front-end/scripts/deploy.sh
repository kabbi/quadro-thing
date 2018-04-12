#!/bin/bash

set -ex

HOST=${1:-192.168.2.77}
REMOTE_PATH=/home/pi/projects/quadro/public

shift

ssh $* $HOST "rm -rf $REMOTE_PATH/*"
scp $* -rq build/* $HOST:$REMOTE_PATH/