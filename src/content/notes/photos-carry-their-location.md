---
# Sample written for the notes prototype, about how this site works. Rewrite it in your own words.
title: Photos carry their GPS location
description: >-
  Five of the eleven photos on this site recorded where they were taken. How the preparation script
  removes that, and what it keeps.
date: 2026-10-12
tags: [privacy, tooling]
---

Cameras and phones write metadata into every photo: the camera model, the lens and exposure
settings, the date, and often the exact place it was taken. Of the eleven originals on this site,
five carried GPS coordinates.

## Dropping everything, keeping what's useful

The preparation script uses sharp, which writes no metadata into its output unless you ask it to.
The one thing worth carrying over is the orientation, so the photo is turned upright first:

```js
await sharp(input)
  .rotate() // apply the EXIF orientation before it is dropped
  .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile(output); // no .withMetadata(): nothing from the original's EXIF survives
```

The camera settings that make a nice caption (body, focal length, aperture, shutter speed, ISO) are
read from the original separately and saved to a data file, without the location.

## Checking

Reading the prepared files back confirms it: no EXIF block at all, and no GPS tag in any of them.

DRAFT: rewrite this note in your own words before publishing.
