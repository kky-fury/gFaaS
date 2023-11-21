#!/bin/sh

ncc build ./src/index.ts -o dist
cd dist || return
pkg -t node16-linux-x64,node16-macos-x64,node16-win-x64 index.js
