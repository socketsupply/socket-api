#!/usr/bin/env bash

declare id=""
declare root=""

id="co.socketsupply.io.tests"
root="$(dirname "$(dirname "${BASH_SOURCE[0]}")")"

adb uninstall "$id"

ssc compile --headless --quiet --platform=android -r -o .

adb shell rm -rf "/data/local/tmp/fixtures"
adb push "$root/fixtures/" "/data/local/tmp/fixtures"

"$root/scripts/poll-adb-logcat.sh"
