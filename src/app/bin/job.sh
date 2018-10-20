#!/usr/bin/env bash

for count in {1..100}; do
  echo $count
  echo $count > "$0.log"
  sleep 1.1
done
