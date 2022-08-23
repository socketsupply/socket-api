#!/usr/bin/env bash

declare id=""
declare uid=""
declare root=""

id="co.socketsupply.io.tests"
root="$(dirname "$(dirname "${BASH_SOURCE[0]}")")"

"$root/scripts/bootstrap-android-emulator.sh" &

echo "info: Waiting for Android Emulator to boot"
while ! adb shell getprop sys.boot_completed >/dev/null 2>&1 ; do
  sleep 0.5s
done
echo "info: Android Emulator booted"

adb uninstall "$id"
ssc compile --headless --platform=android -r -o . >/dev/null || {
  rc=$?
  echo "info: Shutting Android Emulator"
  adb devices | grep emulator | cut -f1 | while read -r line; do
    adb -s "$line" emu kill
  done
  exit "$rc"
}

adb root
uid="$(adb shell dumpsys package "$id" | grep userId | xargs | sed 's/userId=//g')"

adb shell rm -rf "/sdcard/Android/data/$id/files/fixtures"
adb push "$root/fixtures/" "/sdcard/Android/data/$id/files/fixtures"
adb shell chmod -R 777 "/sdcard/Android/data/$id/files"
adb shell chown -R "$uid:ext_data_rw" "/sdcard/Android/data/$id/files"

"$root/scripts/poll-adb-logcat.sh"

echo "info: Shutting Android Emulator"
adb devices | grep emulator | cut -f1 | while read -r line; do
  adb -s "$line" emu kill
done

adb unroot
adb kill-server
