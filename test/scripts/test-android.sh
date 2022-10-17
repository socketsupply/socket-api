#!/usr/bin/env bash

declare id=""
declare root=""

id="co.socketsupply.io.tests"
root="$(dirname "$(dirname "${BASH_SOURCE[0]}")")"

adb uninstall "$id"

ssc build --headless --platform=android -r -o .

adb shell rm -rf "/data/local/tmp/ssc-io-test-fixtures"
adb push "$root/fixtures/" "/data/local/tmp/ssc-io-test-fixtures"

"$root/scripts/poll-adb-logcat.sh"
