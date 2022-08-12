#!/usr/bin/env bash

declare emulator_flags=()

emulator_flags+=(
  -gpu swiftshader_indirect
  -camera-back none
  -no-boot-anim
  -no-window
  -noaudio
)

emulator @SSCAVD "${emulator_flags[@]}" >/dev/null
