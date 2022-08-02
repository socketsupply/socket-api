#!/usr/bin/env bash

declare id=""
declare root=""

id="co.socketsupply.io.tests"
root="$(dirname "$(dirname "${BASH_SOURCE[0]}")")"

adb uninstall "$id"

ssc compile --headless --quiet --platform=android -r -o .

"$root/scripts/poll-adb-logcat.sh"
