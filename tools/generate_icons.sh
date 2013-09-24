#!/bin/bash

SRC=$1

OUT=../www/res/icon

# Android
PLAT=android
for SIZE in 36 48 72 96
do
echo Generating $PLAT $SIZE
convert $SRC -geometry $SIZEx$SIZE -alpha on -background none -flatten $OUT/$PLAT/icon-$SIZE.png
done

# iOS
PLAT=ios
for SIZE in 57 72 114 144
do
echo Generating $PLAT $SIZE
convert $SRC -geometry $SIZEx$SIZE -alpha on -background none -flatten $OUT/$PLAT/icon-$SIZE.png
done

# Misc
OUT=../www/icon.png
SIZE=128
echo Generating $OUT
convert $SRC -geometry $SIZEx$SIZE -alpha on -background none -flatten $OUT