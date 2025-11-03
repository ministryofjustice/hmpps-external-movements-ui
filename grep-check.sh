#!/bin/sh
if grep -rw -e 'resetStubs' ./server; then
  exit 1
fi
