#!/usr/bin/env bash

if [ -z "$DEBUG" ]; then
  ssc compile --headless --prod -r -o .
else
  ssc compile -r -o .
fi
