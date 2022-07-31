#!/usr/bin/env bash

declare id=""
declare pid=""

id="co.socketsupply.io.tests"

emulator -avd SSCAVD

## Start application
adb shell am start -n "$id/.MainWebViewActivity" || exit $?

## Probe for application process ID
pid="$(adb shell ps | grep "$id" | awk '{print $2}' 2>/dev/null)"

if [ -z "$pid" ]; then
  echo >&2 "error: Failed to determine PID for '$id'"
  exit 1
fi

## Process logs from 'adb logcat'
while read -r line; do
  if grep 'ExternalWebViewInterface' < <(echo "$line") >/dev/null; then
    line="$(echo "$line" | sed 's/.*ExternalWebViewInterface://g' | xargs)"
    echo "$line"

    if [[ "$line" =~ __EXIT_SIGNAL__ ]]; then
      status="${line//__EXIT_SIGNAL__=/}"
      exit "$status"
    fi

    if [ "$line" == "# ok" ]; then
      exit
    fi

    if [ "$line" == "# fail" ]; then
      exit 1
    fi
  fi
done < <(adb logcat --pid="$pid")

ssc compile --platform=android-emulator --quiet -r -o .
