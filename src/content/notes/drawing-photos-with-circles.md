---
# Sample written for the notes prototype, about how this site works. Rewrite it in your own words.
title: Drawing a photo with 300 spinning circles
description: >-
  How the photos on the Fun page are traced: colour edges become one closed path, and a Fourier
  series turns that path into a chain of circles.
date: 2026-10-12
tags: [fourier, graphics]
---

The photography strip on the Fun page doesn't just show each photo. A chain of spinning circles
draws it first, then the photo develops underneath. It is the same trick as the Fourier sketch,
applied to a picture.

## From pixels to one line

A Fourier series needs a single closed path, but a photo is a grid of colours. The preparation
script finds the photo's strongest edges with Canny edge detection, measured on colour rather than
brightness, so a green parrot still stands out from grey-green leaves. It links the edge pixels
into strokes, keeps the strongest ones (in-focus detail outranks a blurred background) and joins
them, nearest end first, into one loop. The gaps between strokes stay in the loop, marked as places
where the pen lifts.

## From one line to circles

Sample the loop at 800 evenly spaced points and treat each one as a complex number, z = x + iy. The
discrete Fourier transform turns those 800 points into 800 rotating vectors:

```ts
// X_k = (1/N) Σ z_n e^(−2πikn/N)
for (let k = 0; k < n; k++) {
  let re = 0;
  let im = 0;
  for (let j = 0; j < n; j++) {
    const angle = (-2 * Math.PI * k * j) / n;
    re += z[j].x * Math.cos(angle) - z[j].y * Math.sin(angle);
    im += z[j].x * Math.sin(angle) + z[j].y * Math.cos(angle);
  }
  coefficients.push({ frequency: k <= n / 2 ? k : k - n, re: re / n, im: im / n });
}
```

Each coefficient is a circle: its size is the amplitude and its speed is the frequency. Chained tip
to tail, the 300 largest are enough to draw something recognisable; the other 500 mostly add fine
wobble.

DRAFT: rewrite this note in your own words before publishing.
