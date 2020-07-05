#!/bin/bash

# do not continue if there is an error
set -u

# source: https://stackoverflow.com/questions/59895/get-the-source-directory-of-a-bash-script-from-within-the-script-itself#246128
MY_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"

# reliably move to the etherpad base folder before running it
cd "${MY_DIR}/../../../"

# start Etherpad, assuming all dependencies are already installed.
#
# This is possible because the "install" section of .travis.yml already contains
# a call to bin/installDeps.sh
echo "Running Etherpad directly, assuming bin/installDeps.sh has already been run"
node node_modules/ep_etherpad-lite/node/server.js "${@}" > /dev/null &

echo "Now I will try for 15 seconds to connect to Etherpad on http://localhost:9001"

# wait for at most 15 seconds until Etherpad starts accepting connections
#
# modified from:
# https://unix.stackexchange.com/questions/5277/how-do-i-tell-a-script-to-wait-for-a-process-to-start-accepting-requests-on-a-po#349138
#
(timeout 15 bash -c 'until echo > /dev/tcp/localhost/9001; do sleep 0.5; done') || \
    (echo "Could not connect to Etherpad on http://localhost:9001" ; exit 1)

echo "Successfully connected to Etherpad on http://localhost:9001"

# a copy of settings.json is necessary for the backend tests to work
cp settings.json.template settings.json

# run the backend tests
echo "Now run the backend tests"
cd src

failed=0
npm run test || failed=1
npm run test-contentcollector || failed=1

exit $failed
