#!/bin/bash

SRC=$1

OUT=../www/res/screen

# Android
PLAT=android
for SIZE in 800x480 480x800 320x200 200x320 480x320 320x480 1280x720 720x1280
do
echo Generating $PLAT $SIZE
convert $SRC -background "#000000" -gravity center -extent $SIZE -alpha on -flatten $OUT/$PLAT/screen-$SIZE.png
done

# iOS
PLAT=ios
for SIZE in 2008x1536 1024x783 1536x2008 768x1004 960x640 480x320 640x960 640x1136 320x480
do
echo Generating $PLAT $SIZE
convert $SRC -background "#000000" -gravity center -extent $SIZE -alpha on -flatten $OUT/$PLAT/screen-$SIZE.png
done