---
# Sample written for the musings prototype, about how this site works. Rewrite it in your own words.
# The figures are inline SVG, generated from the site's own code (src/lib/fourier.ts,
# src/lib/photo-trace.ts and the steps of scripts/prepare-photos.mjs) run on the parrot photo.
title: Epic Epicycles
description: >-
  How a chain of circles can draw: Fourier series, DFT and FFT, and the edge detection
  that turns an arbitrary photo into one closed line.
# date: 2026-10-12
# tags: [fourier, maths, graphics, image processing]
---

The photography strip on the Fun page draws each photo using what seems to be a chain of spinning
circles, each one turning about a point on the rim of the one before. Let's explore how that works.

<!-- <figure class="fig">
<svg viewBox="0 0 600 400" role="img" aria-label="A chain of spinning circles part way through drawing the outline of a parrot. Half of the outline is drawn; the circles, largest first, link the middle of the picture to the pen."><path class="ink" d="M229 153L231 159L231 165L231 172L231 177L231 183L231 189L232 195L234 200L234 205L231 211L227 216L223 220L218 224L214 229L211 235L208 241L208 245L211 247L215 244L217 239L219 233L222 228L226 224L231 221L237 218L241 213L244 208L244 203L242 198L241 191L241 184L241 178L241 173L241 166L243 160L246 155L252 153L258 154L263 157L268 160L272 164L274 170L275 176L275 182L274 188L272 194L269 199L265 203L262 208L261 215L260 222L258 226L255 225L251 220L248 215L244 213L240 216M227 246L228 248L231 249L235 251L236 256L236 262L235 268L233 274L231 279L228 284L226 290L224 295L224 301M234 286L235 285L235 290L234 296L232 302L230 307L230 313L229 320L228 326L226 331L224 336L223 343L222 349L220 354M214 362L212 363L211 359L209 353L208 346L207 340L207 334L207 328L209 322L209 316L209 309L208 303L208 298L211 293L216 289L220 284L222 279L224 274L225 268L228 262L230 257M208 253L206 252L206 252L204 255L202 261L202 268L204 273L206 280L206 287L204 290M201 281L199 278L198 280L197 287L197 294L197 300L197 306L196 312L196 319L196 326L197 332L197 338L197 343L196 349L196 356L197 362L198 368L199 373L200 379L201 386L203 391M354 367L358 363L360 358L362 352L366 348L369 343L371 337L371 331L373 325L375 320L376 314L375 308L374 301L374 296L376 290L377 284L378 278L378 272L377 266L374 261L370 256M361 246L358 245L359 248L361 254L362 260L363 266L364 272L366 278L367 283L368 289L369 295L371 300M380 307L386 308L392 308L398 309L404 311L410 313L415 314L420 315L425 316L431 318L436 320L442 324L447 327L450 331M441 358L440 362L439 362L435 359L430 358L424 359L417 362L412 361L408 358L405 354L401 350L396 348L390 347L383 347L377 349L374 353L374 358M389 363L393 364L393 367L391 371L391 377L395 381L401 383L406 381L409 377L408 371L404 366L399 362M366 325L364 320L364 315L364 308L363 302L362 296L361 291L359 285L358 279L356 273L355 268L353 263L352 256L352 250L352 243L351 238L349 232L347 226L347 220L347 215L347 209L344 203L341 199L338 195L335 191L332 186L330 181L329 176L327 170L324 166L319 164L312 164L307 163L307 161M362 156L362 159L362 164L364 169L369 171L375 170L381 168L386 167L389 169M391 170L393 170L396 167L398 162L396 157L391 152L387 148L383 143L379 138L373 135L369 132M381 113L382 112L378 114L371 116L366 116L362 114L362 110L364 105L370 102L376 101L382 101M396 59L397 56L400 58L405 62L412 63L415 59L415 53L412 48L407 47L401 45L395 43L389 41M263 98L262 101L265 104L270 109L274 115L278 118L284 119L290 120L296 121L302 122L307 124L312 128L317 133L321 138L325 142L328 146L331 152L333 158L335 164L337 169"/><g class="guide"><circle cx="338.5" cy="223.2" r="103.3"/><circle cx="434.3" cy="261.7" r="82.9"/><circle cx="351.6" cy="266.4" r="63.8"/><circle cx="358.1" cy="202.9" r="55"/><circle cx="410.2" cy="185.6" r="51.2"/><circle cx="365.3" cy="161" r="30.7"/><circle cx="375.5" cy="132.1" r="27.1"/><circle cx="349.7" cy="140.4" r="25"/><circle cx="341" cy="163.8" r="17.1"/><circle cx="348.3" cy="179.3" r="16.8"/><circle cx="333.9" cy="187.9" r="15.9"/><circle cx="331.1" cy="203.6" r="14.9"/><circle cx="316.7" cy="199.9" r="10.6"/><circle cx="327.2" cy="198.6" r="9.7"/><circle cx="323.7" cy="189.6" r="9.6"/><circle cx="323.1" cy="179.9" r="9"/><circle cx="321.2" cy="171.2" r="8.9"/><circle cx="314.1" cy="176.6" r="8"/><circle cx="308.1" cy="181.8" r="7.2"/><circle cx="314.6" cy="178.9" r="6.8"/><circle cx="316.2" cy="185.5" r="6.5"/><circle cx="313.4" cy="179.7" r="5.9"/><circle cx="315.2" cy="185.3" r="5.2"/><circle cx="320" cy="183.3" r="5.1"/><circle cx="321.5" cy="178.4" r="4.8"/><circle cx="319.3" cy="174" r="4.7"/><circle cx="323.7" cy="172.4" r="4.4"/><circle cx="328" cy="171.2" r="4.2"/><circle cx="325.8" cy="174.7" r="4.1"/><circle cx="326.5" cy="170.7" r="4"/><circle cx="324.4" cy="174" r="4"/><circle cx="327.4" cy="176.6" r="3.6"/><circle cx="329.4" cy="173.6" r="3.6"/><circle cx="330.3" cy="170.1" r="3.6"/><circle cx="330.5" cy="173.6" r="3.6"/><circle cx="334" cy="174.4" r="3.5"/><circle cx="331.4" cy="176.9" r="3.5"/><circle cx="334.9" cy="177.4" r="3.4"/><circle cx="332.4" cy="175" r="3.4"/><circle cx="335.5" cy="176.2" r="3.3"/><circle cx="334.8" cy="173" r="3.1"/><circle cx="331.7" cy="172.5" r="3"/><circle cx="334" cy="170.5" r="3"/><circle cx="336.1" cy="168.4" r="2.9"/><circle cx="335.9" cy="165.5" r="2.9"/><circle cx="335.2" cy="162.6" r="2.4"/><circle cx="335.5" cy="165" r="2.3"/><circle cx="337.6" cy="163.9" r="2.3"/><circle cx="338.2" cy="166.1" r="2.2"/><circle cx="340.3" cy="166" r="1.9"/><circle cx="339.7" cy="164.1" r="1.9"/><circle cx="341.1" cy="165.5" r="1.9"/><circle cx="339.5" cy="166.6" r="1.9"/><circle cx="341" cy="167.8" r="1.8"/><circle cx="339.3" cy="167.9" r="1.6"/><circle cx="337.7" cy="167.3" r="1.6"/><circle cx="339.3" cy="167.7" r="1.6"/><circle cx="339.9" cy="169.2" r="1.5"/><circle cx="340.7" cy="170.5" r="1.5"/></g><path class="arm" d="M338.5 223.2L434.3 261.7L351.6 266.4L358.1 202.9L410.2 185.6L365.3 161L375.5 132.1L349.7 140.4L341 163.8L348.3 179.3L333.9 187.9L331.1 203.6L316.7 199.9L327.2 198.6L323.7 189.6L323.1 179.9L321.2 171.2L314.1 176.6L308.1 181.8L314.6 178.9L316.2 185.5L313.4 179.7L315.2 185.3L320 183.3L321.5 178.4L319.3 174L323.7 172.4L328 171.2L325.8 174.7L326.5 170.7L324.4 174L327.4 176.6L329.4 173.6L330.3 170.1L330.5 173.6L334 174.4L331.4 176.9L334.9 177.4L332.4 175L335.5 176.2L334.8 173L331.7 172.5L334 170.5L336.1 168.4L335.9 165.5L335.2 162.6L335.5 165L337.6 163.9L338.2 166.1L340.3 166L339.7 164.1L341.1 165.5L339.5 166.6L341 167.8L339.3 167.9L337.7 167.3L339.3 167.7L339.9 169.2L340.7 170.5L340.1 169.1L341.5 168.5L341.3 167.1L339.9 167L341.2 167.5L340.5 168.7L339.2 168.6L339 167.3L340 168L339 167.8L339.8 167.1L340 168.2L339.7 169.1L340.5 168.6L339.9 169.3L339.6 168.5L340.4 168.9L341.1 169.4L340.6 168.7L339.8 168.6L339.2 169.2L338.5 169.7L337.9 170L337.4 170.6L336.6 170.7L337.3 171L337.7 170.4L337.1 170L336.5 170.2L336 169.8L335.4 170.1L336 170.2L335.6 169.8L335.7 169.2L336.3 169.1L336.6 169.6L337.1 169.8L337.1 169.2L336.6 169.1L336.6 169.7L336.2 169.3L336.7 169.1L336.8 168.6L337.2 168.3L336.9 168.7L337.1 168.3L337.2 168.7L337.6 168.9L337.7 169.3L337.6 169.7L337.5 169.3L337.8 169L337.8 169.4L338 169L337.6 168.8L337.3 168.5L337.6 168.8L337.2 168.7L336.8 168.8L337.2 168.9L336.8 169.1L337.1 169.4L336.8 169.2L336.4 169.4L336.7 169.2L336.9 168.9L337.2 169L337.2 169.3L337.5 169.2L337.5 169.5L337.8 169.4L337.7 169.8L338 170L338 170.3L337.6 170.3L337.9 170.1L338.1 170.2L338.2 170.5L338 170.4L338 170.1L338.2 169.8L338.5 169.9L338.2 170L338.4 170.2L338.7 170.1L338.4 170L338.1 170L338 170.3L337.8 170.5L337.6 170.6L337.4 170.7L337.2 170.5L337.4 170.5L337.7 170.4L337.5 170.2L337.4 169.9L337.6 170.1L337.6 169.8L337.4 169.8L337.1 169.9L337 169.8L336.8 169.6L336.6 169.7L336.7 169.5L336.5 169.4L336.4 169.2L336.6 169.3L336.7 169.5L336.5 169.4L336.7 169.5L336.6 169.7L336.5 169.9L336.4 169.7L336.6 169.8L336.5 169.6L336.3 169.6L336.1 169.6L336.1 169.4L336.2 169.2L336.4 169.2L336.5 169.4L336.3 169.3L336.4 169.2L336.4 169.4L336.3 169.2L336.5 169.1L336.4 169L336.6 168.8L336.7 168.7L336.7 168.9L336.5 168.8L336.7 168.9L336.6 169L336.7 169.1L336.8 169L336.6 169.1L336.6 168.9L336.6 168.7L336.7 168.9L336.8 169L336.8 168.8L336.9 168.8L336.8 168.9L336.9 169.1L336.8 169.1L336.7 169L336.7 168.8L336.8 168.7L336.6 168.7L336.6 168.5L336.7 168.4L336.8 168.5L336.7 168.6L336.9 168.6L336.8 168.5L336.6 168.5L336.5 168.5L336.6 168.6L336.7 168.7L336.6 168.8L336.6 168.9L336.7 168.9L336.9 169L337 169.1L337.1 169.2L337 169L336.9 169.1L336.8 169L336.7 169L336.7 168.9L336.8 168.8L336.7 168.9L336.8 169L336.8 169.1L336.7 169.2L336.7 169.1L336.8 169.1L336.8 169.2L336.9 169.1L336.9 169L336.8 169.1L336.7 169L336.7 168.9L336.6 168.9L336.6 169L336.6 169.1L336.5 169.2L336.4 169.1L336.4 169.2L336.3 169.3L336.3 169.2L336.3 169.3L336.4 169.3L336.3 169.3L336.2 169.4L336.2 169.3L336.1 169.3L336.2 169.2L336.3 169.2L336.3 169.1L336.3 169L336.3 169L336.3 169.1L336.4 169.1L336.4 169.2L336.5 169.1L336.6 169.2L336.6 169.2L336.6 169.1L336.5 169L336.4 169.1L336.5 169.1L336.5 169.2L336.5 169.3L336.6 169.2L336.6 169.1L336.6 169.2L336.7 169.1L336.6 169.1L336.5 169L336.6 169L336.6 169.1L336.6 169.2L336.5 169.2L336.6 169.2L336.6 169.1L336.6 169.1L336.6 169.1L336.6 169.1L336.7 169.2L336.6 169.1L336.7 169.2L336.6 169.3L336.7 169.2L336.6 169.2L336.7 169.1L336.7 169.2L336.7 169.1L336.7 169.1L336.7 169.1L336.8 169.1"/><circle class="dot" cx="336.8" cy="169.1" r="4"/></svg>
<figcaption>Figure 1. The eclectus parrot photo, 50% of the way through its drawing. Each circle turns at its own fixed speed about a point on the rim of the circle before it, and the last one carries the pen. Circles smaller than a pixel and a half aren’t drawn.</figcaption>
</figure> -->

## Circles and waves

### Points as complex numbers

A complex number $z = x + iy$ is a point in the complex plane, where $x$ and $y$ are real numbers,
called the real and imaginary parts of $z$ and written $\operatorname{Re} z$ and
$\operatorname{Im} z$, and $i$ is a number s.t. $i^2=-1$. Because $z$ is determined by the
pair $(x, y)$, it can be drawn as the point with those coordinates. The horizontal axis represents
the real numbers and the vertical axis represents the real multiples of $i$ (Figure 1).

<figure class="fig">
<svg viewBox="0 0 320 290" width="320" height="290" role="img" aria-label="A point z in the complex plane, joined to the origin by a line labelled with its length, |z|. The angle from the positive real axis to that line is marked arg z. Dashed lines run from z to its coordinates x and y, and the conjugate z-bar is drawn as the reflection of z in the real axis."><path class="guide" d="M14 150H306M50 278V12"/><path class="guide" d="M50 150L230 260"/><path class="dash" d="M230 40V260M230 40H50"/><path class="ink" d="M50 150L230 40"/><path class="arm" d="M92 150A42 42 0 0 0 85.8 128.1"/><circle class="dot" cx="50" cy="150" r="2.5"/><circle class="dot" cx="230" cy="40" r="4"/><circle class="dot" cx="230" cy="260" r="3"/><text class="label" x="238" y="36">z = x + iy</text><text class="label" x="238" y="272">z̄ = x − iy</text><text class="label" x="133" y="83" text-anchor="end">|z|</text><text class="label" x="98" y="143">arg z</text><text class="label" x="236" y="168">x</text><text class="label" x="42" y="45" text-anchor="end">y</text><text class="label" x="42" y="168" text-anchor="end">0</text><text class="label" x="306" y="168" text-anchor="end">Re</text><text class="label" x="58" y="22">Im</text></svg>
<figcaption>Figure 1. The complex number z = x + iy drawn as a point. Its modulus |z| is its distance from the origin, and its argument arg z is the angle from the positive real axis, measured anticlockwise. The conjugate z̄ = x − iy is its reflection in the real axis.</figcaption>
</figure>

Complex numbers are added and multiplied by the ordinary rules of algebra, with $i^2$ substituted with
$-1$ wherever it appears:

$$
\begin{aligned}
(x_1 + iy_1) + (x_2 + iy_2) &= (x_1 + x_2) + i\,(y_1 + y_2) \\
(x_1 + iy_1)(x_2 + iy_2) &= (x_1 x_2 - y_1 y_2) + i\,(x_1 y_2 + y_1 x_2)
\end{aligned}
$$

Adding complex numbers is therefore the same as adding vectors: real parts add to real parts and
imaginary parts to imaginary parts, and in a plane the sum is found by placing the second arrow at
the tip of the first. Multiplication of complex numbers has no analogy for standard vectors in a plane: there is no standard multiplication that takes two 2D vectors and outputs a new 2D vector. The dot product multiplies 2 standard vectors but yields a single scalar, while the cross product multiplies 2 standard vectors but yields a vector that is orthogonal to both input vectors, and thus only applicable in 3D space. The meaning of complex number multiplication becomes clear only when each number is described by a length and an angle instead of two
coordinates.

The length, or modulus, of $z$ is its distance from the origin. By Pythagoras' theorem,
$|z| = \sqrt{x^2 + y^2}$. The argument of $z$, written $\arg z$, is the angle from the positive real
axis to the line joining the origin to $z$, measured anticlockwise and in radians. For example,
$\arg 1 = 0$, $\arg i = \pi/2$, $\arg(-1) = \pi$ and $\arg(1 - i) = -\pi/4$. Adding a whole turn,
$2\pi$, to an angle gives the same direction, so the argument is defined only up to multiples of
$2\pi$, and it is usual to take the value between $-\pi$ and $\pi$.<span class="margin-note"><b>Computing the argument</b> The formula $\arctan(y/x)$ is correct only when $x > 0$: the points $z$ and $-z$ give the same ratio $y/x$ but point in opposite directions. Programs use the two-argument function $\operatorname{atan2}(y, x)$, which looks at the signs of $x$ and $y$ separately and returns the angle in $(-\pi, \pi]$. The site's code finds the starting angle of each circle with `Math.atan2`.</span>
The number 0 has no argument. Conversely, the modulus $r = |z|$ and the argument $\varphi = \arg z$
determine the coordinates, $x = r\cos\varphi$ and $y = r\sin\varphi$, so that

$$
z = r(\cos\varphi + i\sin\varphi)
$$

This is the polar form of $z$.

The conjugate of $z$ is $\overline{z} = x - iy$, the reflection of $z$ in the real axis. It has the
same modulus as $z$ and the opposite argument. Multiplying a number by its conjugate gives the
square of its modulus,

$$
z\,\overline{z} = (x + iy)(x - iy) = x^2 + y^2 = |z|^2
$$

This identity is used repeatedly below, because it turns a squared length into a product that can
be expanded by algebra.

In polar form, multiplication has a simple description: the moduli multiply and the arguments add.

$$
\begin{aligned}
&r_1(\cos\alpha + i\sin\alpha) \cdot r_2(\cos\beta + i\sin\beta) \\
&\qquad = r_1 r_2\big(\cos(\alpha + \beta) + i\sin(\alpha + \beta)\big)
\end{aligned}
$$

In particular, multiplication by a number of modulus 1 rotates the plane about the origin, and
multiplication by $r(\cos\varphi + i\sin\varphi)$ rotates it through $\varphi$ and scales it by
$r$.<span class="margin-note"><b>Proof</b> Multiplying out, the real part of $(\cos\alpha + i\sin\alpha)(\cos\beta + i\sin\beta)$ is $\cos\alpha\cos\beta - \sin\alpha\sin\beta$ and the imaginary part is $\sin\alpha\cos\beta + \cos\alpha\sin\beta$. By the angle-addition formulas of trigonometry these are $\cos(\alpha + \beta)$ and $\sin(\alpha + \beta)$. The factors $r_1$ and $r_2$ simply multiply.</span>
Multiplication by $i$, which has modulus 1 and argument $\pi/2$, is a rotation by a quarter turn: it
takes 1 to $i$, and $i$ to $i^2 = -1$.

In summary, when you multiply two complex numbers in polar form:
1. Multiply the lengths: The new distance from the origin is the product of the two original lengths, $r_1 \times r_2$.
2. Add the angles: The new arrow is rotated by the sum of the two original angles,$\theta_1 + \theta_2$.

This dual behavior of scaling and rotating is a unique feature of complex multiplication that ordinary 2D vector algebra cannot replicate.

### Euler's formula

Euler's formula writes the polar form in terms of the exponential function:

$$
e^{i\theta} = \cos\theta + i\sin\theta
$$

<aside class="margin-note">

<b>Proof</b> Let $p(\theta) = \cos\theta + i\sin\theta$. Differentiating,

$$
p'(\theta) = -\sin\theta + i\cos\theta = i\,p(\theta)
$$

and $p(0) = 1$. The function $e^{i\theta}$ satisfies the same equation with the same initial value,
provided the rule $(e^{a\theta})' = a\,e^{a\theta}$ holds for $a = i$, as it does when the
exponential is defined by its power series. A linear first-order equation with a given initial value
has only one solution, so $p(\theta) = e^{i\theta}$.

</aside>

So $e^{i\theta}$ is the point of the unit circle at angle $\theta$, and every complex number can be
written as $z = r e^{i\varphi}$ with $r = |z|$ and $\varphi = \arg z$. The rule for multiplication
becomes the familiar law of exponents, $e^{i\alpha} e^{i\beta} = e^{i(\alpha + \beta)}$. Taking
$\theta = \pi$, half a turn, gives Euler's identity $e^{i\pi} = -1$.

The formula also has a geometric reading that explains why the angle is measured in radians.
Differentiating gives $\frac{d}{d\theta} e^{i\theta} = i\,e^{i\theta}$, and multiplication by $i$
is a quarter turn. The velocity of the point $e^{i\theta}$ is therefore always perpendicular to its
position, and of the same length, 1. A velocity perpendicular to the position does not change the
distance from the origin, so the point moves round the unit circle at unit
speed.<span class="margin-note"><b>Why the distance stays fixed</b> With $p = e^{i\theta}$ and $|p|^2 = p\,\overline{p}$, the product rule gives $\frac{d}{d\theta}|p|^2 = 2\operatorname{Re}(p'\,\overline{p})$. Since $p' = ip$, this is $2\operatorname{Re}(i\,|p|^2)$, which is 0 because $i\,|p|^2$ is purely imaginary.</span>
After time $\theta$ it has travelled an arc of length $\theta$, which is what it means for the angle
to be $\theta$ radians. Its horizontal coordinate is $\cos\theta$ and its vertical coordinate is
$\sin\theta$ (Figure 2).

<figure class="fig">
<svg viewBox="0 0 560 180" width="560" height="180" role="img" aria-label="Left: a point on a circle at angle theta, with its horizontal distance from the centre labelled cos theta and its height labelled sin theta. Right: the height plotted against the angle is a sine wave, and a dashed line joins the point to the matching place on the wave."><path class="guide" d="M6 90H552M82 14V166"/><circle class="guide" cx="82" cy="90" r="62"/><path class="faint" d="M176 90L179.1 86.8L182.2 83.5L185.3 80.3L188.4 77.1L191.5 74L194.6 70.8L197.7 67.8L200.8 64.8L203.9 61.9L207 59L210.1 56.2L213.2 53.6L216.3 51L219.4 48.5L222.5 46.2L225.6 43.9L228.7 41.8L231.8 39.8L234.9 38L238 36.3L241.1 34.8L244.2 33.4L247.3 32.1L250.4 31L253.5 30.1L256.6 29.4L259.7 28.8L262.8 28.3L265.9 28.1L269 28L272.1 28.1L275.2 28.3L278.3 28.8L281.4 29.4L284.5 30.1L287.6 31L290.7 32.1L293.8 33.4L296.9 34.8L300 36.3L303.1 38L306.2 39.8L309.3 41.8L312.4 43.9L315.5 46.2L318.6 48.5L321.7 51L324.8 53.6L327.9 56.2L331 59L334.1 61.9L337.2 64.8L340.3 67.8L343.4 70.8L346.5 74L349.6 77.1L352.7 80.3L355.8 83.5L358.9 86.8L362 90L365.1 93.2L368.2 96.5L371.3 99.7L374.4 102.9L377.5 106L380.6 109.2L383.7 112.2L386.8 115.2L389.9 118.1L393 121L396.1 123.8L399.2 126.4L402.3 129L405.4 131.5L408.5 133.8L411.6 136.1L414.7 138.2L417.8 140.2L420.9 142L424 143.7L427.1 145.2L430.2 146.6L433.3 147.9L436.4 149L439.5 149.9L442.6 150.6L445.7 151.2L448.8 151.7L451.9 151.9L455 152L458.1 151.9L461.2 151.7L464.3 151.2L467.4 150.6L470.5 149.9L473.6 149L476.7 147.9L479.8 146.6L482.9 145.2L486 143.7L489.1 142L492.2 140.2L495.3 138.2L498.4 136.1L501.5 133.8L504.6 131.5L507.7 129L510.8 126.4L513.9 123.8L517 121L520.1 118.1L523.2 115.2L526.3 112.2L529.4 109.2L532.5 106L535.6 102.9L538.7 99.7L541.8 96.5L544.9 93.2L548 90"/><path class="ink" d="M176 90L179.1 86.8L182.2 83.5L185.3 80.3L188.4 77.1L191.5 74L194.6 70.8L197.7 67.8L200.8 64.8L203.9 61.9L207 59L210.1 56.2L213.2 53.6L216.3 51L219.4 48.5L222.5 46.2L225.6 43.9L228.7 41.8"/><path class="ink" d="M82 90L120.2 41.1"/><path class="dash" d="M120.2 41.1V90M120.2 41.1H229.7"/><path class="guide" d="M102 90A20 20 0 0 0 94.3 74.2"/><path class="ink" d="M82 90H120.2"/><circle class="dot" cx="120.2" cy="41.1" r="4"/><circle class="dot" cx="229.7" cy="41.1" r="4"/><text class="label" x="108" y="84">θ</text><text class="label" x="101.1" y="110" text-anchor="middle">cos θ</text><text class="label" x="126.2" y="70.6">sin θ</text><text class="label" x="548" y="110" text-anchor="end">θ</text></svg>
<figcaption>Figure 2. A point moving at constant speed round a circle (left). Its height, plotted against the angle turned (right), is the sine of that angle; its horizontal position is the cosine.</figcaption>
</figure>

### Uniform circular motion

Replace $\theta$ by $2\pi k t$, where $k$ is an integer and $t$ is time. As $t$ increases from 0
to 1, the point

$$
e^{2\pi i k t}
$$

goes round the unit circle $|k|$ times, anticlockwise if $k > 0$ and clockwise if $k < 0$; when
$k = 0$ it stays at 1. We call $k$ the frequency. Multiplying by a complex number
$c = r e^{i\varphi}$ adds the angles:

$$
c\, e^{2\pi i k t} = r\, e^{i(2\pi k t + \varphi)}
$$

This is a point moving uniformly round a circle of radius $r = |c|$, starting at the angle
$\varphi = \arg c$ and completing $k$ turns while $t$ goes from 0 to 1. Uniform motion round a
circle is thus described completely by an integer $k$ and a complex number $c$. The question
studied in the rest of this musing is how to choose a coefficient $c_k$ for each frequency $k$ so
that the circles, added together, trace a given curve.

Real oscillations are sums of such motions. Adding a rotation to its mirror image, which turns the
other way, cancels the imaginary parts and doubles the real parts:

$$
\cos\theta = \frac{e^{i\theta} + e^{-i\theta}}{2}, \qquad \sin\theta = \frac{e^{i\theta} - e^{-i\theta}}{2i}
$$

A real-valued wave therefore requires circles of both positive and negative frequency, and
negative frequencies appear throughout what follows.

## Fourier series

### Periodic functions

A function $f$ is periodic with period 1 if $f(t + 1) = f(t)$ for every $t$. Joseph Fourier asserted
that such a function can be expanded in sines and cosines whose frequencies are whole
numbers:<span class="margin-note"><b>History</b> Fourier presented the claim in a memoir on the conduction of heat in 1807. His examiners, Lagrange among them, doubted that arbitrary functions could be expanded in this way, and his book appeared only in 1822. The first rigorous convergence proof was Dirichlet's, in 1829.</span>

$$
f(t) = a_0 + \sum_{k=1}^{\infty} \big(a_k \cos 2\pi k t + b_k \sin 2\pi k t\big)
$$

Replacing each cosine and sine by the exponentials above gives the equivalent complex form

$$
f(t) = \sum_{k=-\infty}^{\infty} c_k\, e^{2\pi i k t}
$$

with $c_0 = a_0$ and, for $k > 0$, $c_k = \tfrac{1}{2}(a_k - i b_k)$ and
$c_{-k} = \tfrac{1}{2}(a_k + i b_k)$.<span class="margin-note"><b>Check</b> Writing $\theta = 2\pi k t$ and expanding $\tfrac{1}{2}(a_k - ib_k)e^{i\theta} + \tfrac{1}{2}(a_k + ib_k)e^{-i\theta}$ with Euler's formula, the imaginary parts cancel and what remains is $a_k\cos\theta + b_k\sin\theta$.</span>
The complex form is shorter and easier to calculate with, and it is the one used from now on. Two
questions arise at once: how are the coefficients determined by $f$, and in what sense does the
series equal $f$? We answer both, using as an example the square wave, which equals $1$ for
$0 \le t < \tfrac{1}{2}$ and $-1$ for $\tfrac{1}{2} \le t < 1$ and repeats with period 1.

### Orthogonality and the coefficients

The calculation of the coefficients rests on a single integral. For an integer $m$,

$$
\int_0^1 e^{2\pi i m t}\, dt = \begin{cases} 1 & \text{if } m = 0 \\ 0 & \text{if } m \ne 0 \end{cases}
$$

Geometrically, the integral is the average position of a point that goes round the unit circle
$|m|$ times at constant speed. The point spends equal time in every direction, so its average
position is the centre.<span class="margin-note"><b>Proof</b> For $m \ne 0$, the function $e^{2\pi i m t}/(2\pi i m)$ is an antiderivative. It takes the same value at $t = 0$ and $t = 1$, so the integral is 0. For $m = 0$ the integrand is 1.</span>

This fact is best expressed in the language of linear algebra. For periodic functions $f$ and $g$,
define

$$
\langle f, g \rangle = \int_0^1 f(t)\, \overline{g(t)}\, dt
$$

This plays the part of the dot product of two vectors. The conjugate ensures that
$\langle f, f \rangle = \int_0^1 |f(t)|^2\, dt$ is real and non-negative, so that it can serve as a
squared length. Write $e_k(t) = e^{2\pi i k t}$. Since $e_j \overline{e_k} = e_{j-k}$, the integral
above says that

$$
\langle e_j, e_k \rangle = \begin{cases} 1 & \text{if } j = k \\ 0 & \text{if } j \ne k \end{cases}
$$

The functions $e_k$ are therefore orthonormal: each has length 1, and any two are perpendicular.

Recall how coordinates are found in an orthonormal basis $u_1, u_2, u_3$ of three-dimensional
space. If $v = \sum_j a_j u_j$, the dot product with $u_k$ removes every term but one, and
$a_k = v \cdot u_k$. The same argument applies here. Suppose that $f = \sum_j c_j e_j$. Taking the
inner product of both sides with $e_k$,

$$
\langle f, e_k \rangle = \sum_j c_j \langle e_j, e_k \rangle = c_k
$$

that is,<span class="margin-note"><b>Exchanging sum and integral</b> The first step integrates the series term by term. This is justified when the series converges uniformly, and more generally whenever it converges in mean square, because the inner product is continuous in that sense.</span>

$$
c_k = \int_0^1 f(t)\, e^{-2\pi i k t}\, dt
$$

The negative sign in the exponent comes from the conjugate, and it has a direct interpretation.
Multiplying $f$ by $e^{-2\pi i k t}$ turns every term of the series backwards by $k$ turns per
period. The term $c_k e_k$ then stands still, while each other term $c_j e_j$ still turns, $j - k$
times per period. Averaging over a period removes every turning term and leaves the stationary one.

For the square wave, the integral splits at $t = \tfrac{1}{2}$. Using $e^{-\pi i k} = (-1)^k$, we
find for $k \ne 0$

$$
\begin{aligned}
c_k &= \int_0^{1/2} e^{-2\pi i k t}\, dt - \int_{1/2}^{1} e^{-2\pi i k t}\, dt \\
&= \frac{1 - (-1)^k}{2\pi i k} - \frac{(-1)^k - 1}{2\pi i k} = \frac{1 - (-1)^k}{\pi i k}
\end{aligned}
$$

So $c_k = 2/(\pi i k)$ when $k$ is odd and $c_k = 0$ when $k$ is even, and $c_0 = 0$ because the
function averages to zero. Combining the terms for $k$ and $-k$,

$$
\begin{aligned}
c_k e^{2\pi i k t} + c_{-k} e^{-2\pi i k t} &= \frac{2}{\pi i k}\big(e^{2\pi i k t} - e^{-2\pi i k t}\big) \\
&= \frac{4}{\pi k} \sin 2\pi k t
\end{aligned}
$$

and the series is

$$
f(t) = \frac{4}{\pi}\left(\sin 2\pi t + \frac{1}{3}\sin 6\pi t + \frac{1}{5}\sin 10\pi t + \cdots\right)
$$

<figure class="fig">
<div class="fig__panels" style="--panel: 9rem">
<div class="fig__panel"><svg viewBox="0 0 300 120" role="img" aria-label="A square wave and the sum of its first term."><path class="guide" d="M12 60H288"/><path class="faint" d="M12 22H81V98H150V22H219V98H288"/><path class="ink" d="M12 60L13.2 57.5L14.3 54.9L15.5 52.4L16.6 49.9L17.8 47.5L18.9 45L20.1 42.7L21.2 40.3L22.4 38L23.5 35.8L24.7 33.6L25.8 31.6L27 29.6L28.1 27.6L29.3 25.8L30.4 24L31.6 22.4L32.7 20.9L33.8 19.4L35 18.1L36.2 16.9L37.3 15.8L38.5 14.8L39.6 14L40.8 13.3L41.9 12.7L43.1 12.2L44.2 11.9L45.4 11.7L46.5 11.6L47.7 11.7L48.8 11.9L50 12.2L51.1 12.7L52.3 13.3L53.4 14L54.6 14.8L55.7 15.8L56.9 16.9L58 18.1L59.2 19.4L60.3 20.9L61.5 22.4L62.6 24L63.8 25.8L64.9 27.6L66.1 29.6L67.2 31.6L68.4 33.6L69.5 35.8L70.7 38L71.8 40.3L72.9 42.7L74.1 45L75.3 47.5L76.4 49.9L77.6 52.4L78.7 54.9L79.9 57.5L81 60L82.1 62.5L83.3 65.1L84.5 67.6L85.6 70.1L86.8 72.5L87.9 75L89.1 77.3L90.2 79.7L91.4 82L92.5 84.2L93.7 86.4L94.8 88.4L95.9 90.4L97.1 92.4L98.3 94.2L99.4 96L100.6 97.6L101.7 99.1L102.9 100.6L104 101.9L105.2 103.1L106.3 104.2L107.5 105.2L108.6 106L109.8 106.7L110.9 107.3L112.1 107.8L113.2 108.1L114.4 108.3L115.5 108.4L116.7 108.3L117.8 108.1L119 107.8L120.1 107.3L121.3 106.7L122.4 106L123.6 105.2L124.7 104.2L125.9 103.1L127 101.9L128.2 100.6L129.3 99.1L130.5 97.6L131.6 96L132.8 94.2L133.9 92.4L135.1 90.4L136.2 88.4L137.4 86.4L138.5 84.2L139.7 82L140.8 79.7L142 77.3L143.1 75L144.3 72.5L145.4 70.1L146.5 67.6L147.7 65.1L148.9 62.5L150 60L151.2 57.5L152.3 54.9L153.5 52.4L154.6 49.9L155.8 47.5L156.9 45L158.1 42.7L159.2 40.3L160.4 38L161.5 35.8L162.6 33.6L163.8 31.6L165 29.6L166.1 27.6L167.3 25.8L168.4 24L169.5 22.4L170.7 20.9L171.9 19.4L173 18.1L174.2 16.9L175.3 15.8L176.5 14.8L177.6 14L178.8 13.3L179.9 12.7L181.1 12.2L182.2 11.9L183.4 11.7L184.5 11.6L185.7 11.7L186.8 11.9L188 12.2L189.1 12.7L190.3 13.3L191.4 14L192.6 14.8L193.7 15.8L194.9 16.9L196 18.1L197.1 19.4L198.3 20.9L199.5 22.4L200.6 24L201.8 25.8L202.9 27.6L204 29.6L205.2 31.6L206.4 33.6L207.5 35.8L208.7 38L209.8 40.3L211 42.7L212.1 45L213.3 47.5L214.4 49.9L215.6 52.4L216.7 54.9L217.9 57.5L219 60L220.2 62.5L221.3 65.1L222.5 67.6L223.6 70.1L224.8 72.5L225.9 75L227.1 77.3L228.2 79.7L229.4 82L230.5 84.2L231.7 86.4L232.8 88.4L234 90.4L235.1 92.4L236.3 94.2L237.4 96L238.6 97.6L239.7 99.1L240.9 100.6L242 101.9L243.2 103.1L244.3 104.2L245.5 105.2L246.6 106L247.8 106.7L248.9 107.3L250.1 107.8L251.2 108.1L252.4 108.3L253.5 108.4L254.7 108.3L255.8 108.1L257 107.8L258.1 107.3L259.3 106.7L260.4 106L261.6 105.2L262.7 104.2L263.9 103.1L265 101.9L266.2 100.6L267.3 99.1L268.5 97.6L269.6 96L270.8 94.2L271.9 92.4L273.1 90.4L274.2 88.4L275.4 86.4L276.5 84.2L277.7 82L278.8 79.7L280 77.3L281.1 75L282.3 72.5L283.4 70.1L284.6 67.6L285.7 65.1L286.9 62.5L288 60"/></svg><span class="fig__label">1 term</span></div>
<div class="fig__panel"><svg viewBox="0 0 300 120" role="img" aria-label="A square wave and the sum of its first 3 terms."><path class="guide" d="M12 60H288"/><path class="faint" d="M12 22H81V98H150V22H219V98H288"/><path class="ink" d="M12 60L13.2 52.4L14.3 45.1L15.5 38.3L16.6 32.1L17.8 26.7L18.9 22.3L20.1 18.9L21.2 16.6L22.4 15.3L23.5 14.8L24.7 15.2L25.8 16.2L27 17.7L28.1 19.4L29.3 21.2L30.4 22.9L31.6 24.4L32.7 25.6L33.8 26.2L35 26.5L36.2 26.3L37.3 25.6L38.5 24.7L39.6 23.5L40.8 22.2L41.9 20.9L43.1 19.7L44.2 18.8L45.4 18.3L46.5 18.1L47.7 18.3L48.8 18.8L50 19.7L51.1 20.9L52.3 22.2L53.4 23.5L54.6 24.7L55.7 25.6L56.9 26.3L58 26.5L59.2 26.2L60.3 25.6L61.5 24.4L62.6 22.9L63.8 21.2L64.9 19.4L66.1 17.7L67.2 16.2L68.4 15.2L69.5 14.8L70.7 15.3L71.8 16.6L72.9 18.9L74.1 22.3L75.3 26.7L76.4 32.1L77.6 38.3L78.7 45.1L79.9 52.4L81 60L82.1 67.6L83.3 74.9L84.5 81.7L85.6 87.9L86.8 93.3L87.9 97.7L89.1 101.1L90.2 103.4L91.4 104.7L92.5 105.2L93.7 104.8L94.8 103.8L95.9 102.3L97.1 100.6L98.3 98.8L99.4 97.1L100.6 95.6L101.7 94.4L102.9 93.8L104 93.5L105.2 93.7L106.3 94.4L107.5 95.3L108.6 96.5L109.8 97.8L110.9 99.1L112.1 100.3L113.2 101.2L114.4 101.7L115.5 101.9L116.7 101.7L117.8 101.2L119 100.3L120.1 99.1L121.3 97.8L122.4 96.5L123.6 95.3L124.7 94.4L125.9 93.7L127 93.5L128.2 93.8L129.3 94.4L130.5 95.6L131.6 97.1L132.8 98.8L133.9 100.6L135.1 102.3L136.2 103.8L137.4 104.8L138.5 105.2L139.7 104.7L140.8 103.4L142 101.1L143.1 97.7L144.3 93.3L145.4 87.9L146.5 81.7L147.7 74.9L148.9 67.6L150 60L151.2 52.4L152.3 45.1L153.5 38.3L154.6 32.1L155.8 26.7L156.9 22.3L158.1 18.9L159.2 16.6L160.4 15.3L161.5 14.8L162.6 15.2L163.8 16.2L165 17.7L166.1 19.4L167.3 21.2L168.4 22.9L169.5 24.4L170.7 25.6L171.9 26.2L173 26.5L174.2 26.3L175.3 25.6L176.5 24.7L177.6 23.5L178.8 22.2L179.9 20.9L181.1 19.7L182.2 18.8L183.4 18.3L184.5 18.1L185.7 18.3L186.8 18.8L188 19.7L189.1 20.9L190.3 22.2L191.4 23.5L192.6 24.7L193.7 25.6L194.9 26.3L196 26.5L197.1 26.2L198.3 25.6L199.5 24.4L200.6 22.9L201.8 21.2L202.9 19.4L204 17.7L205.2 16.2L206.4 15.2L207.5 14.8L208.7 15.3L209.8 16.6L211 18.9L212.1 22.3L213.3 26.7L214.4 32.1L215.6 38.3L216.7 45.1L217.9 52.4L219 60L220.2 67.6L221.3 74.9L222.5 81.7L223.6 87.9L224.8 93.3L225.9 97.7L227.1 101.1L228.2 103.4L229.4 104.7L230.5 105.2L231.7 104.8L232.8 103.8L234 102.3L235.1 100.6L236.3 98.8L237.4 97.1L238.6 95.6L239.7 94.4L240.9 93.8L242 93.5L243.2 93.7L244.3 94.4L245.5 95.3L246.6 96.5L247.8 97.8L248.9 99.1L250.1 100.3L251.2 101.2L252.4 101.7L253.5 101.9L254.7 101.7L255.8 101.2L257 100.3L258.1 99.1L259.3 97.8L260.4 96.5L261.6 95.3L262.7 94.4L263.9 93.7L265 93.5L266.2 93.8L267.3 94.4L268.5 95.6L269.6 97.1L270.8 98.8L271.9 100.6L273.1 102.3L274.2 103.8L275.4 104.8L276.5 105.2L277.7 104.7L278.8 103.4L280 101.1L281.1 97.7L282.3 93.3L283.4 87.9L284.6 81.7L285.7 74.9L286.9 67.6L288 60"/></svg><span class="fig__label">3 terms</span></div>
<div class="fig__panel"><svg viewBox="0 0 300 120" role="img" aria-label="A square wave and the sum of its first 25 terms."><path class="guide" d="M12 60H288"/><path class="faint" d="M12 22H81V98H150V22H219V98H288"/><path class="ink" d="M12 60L13.2 16.4L14.3 23.5L15.5 22.4L16.6 20.7L17.8 23.7L18.9 20.4L20.1 23.1L21.2 21.5L22.4 22L23.5 22.5L24.7 21.2L25.8 22.8L27 21.3L28.1 22.3L29.3 22L30.4 21.7L31.6 22.5L32.7 21.4L33.8 22.5L35 21.7L36.2 22L37.3 22.3L38.5 21.5L39.6 22.5L40.8 21.6L41.9 22.2L43.1 22L44.2 21.8L45.4 22.4L46.5 21.5L47.7 22.4L48.8 21.8L50 22L51.1 22.2L52.3 21.6L53.4 22.5L54.6 21.5L55.7 22.3L56.9 22L58 21.7L59.2 22.5L60.3 21.4L61.5 22.5L62.6 21.7L63.8 22L64.9 22.3L66.1 21.3L67.2 22.8L68.4 21.2L69.5 22.5L70.7 22L71.8 21.5L72.9 23.1L74.1 20.4L75.3 23.7L76.4 20.7L77.6 22.4L78.7 23.5L79.9 16.4L81 60L82.1 103.6L83.3 96.5L84.5 97.6L85.6 99.3L86.8 96.3L87.9 99.6L89.1 96.9L90.2 98.5L91.4 98L92.5 97.5L93.7 98.8L94.8 97.2L95.9 98.7L97.1 97.7L98.3 98L99.4 98.3L100.6 97.5L101.7 98.6L102.9 97.5L104 98.3L105.2 98L106.3 97.7L107.5 98.5L108.6 97.5L109.8 98.4L110.9 97.8L112.1 98L113.2 98.2L114.4 97.6L115.5 98.5L116.7 97.6L117.8 98.2L119 98L120.1 97.8L121.3 98.4L122.4 97.5L123.6 98.5L124.7 97.7L125.9 98L127 98.3L128.2 97.5L129.3 98.6L130.5 97.5L131.6 98.3L132.8 98L133.9 97.7L135.1 98.7L136.2 97.2L137.4 98.8L138.5 97.5L139.7 98L140.8 98.5L142 96.9L143.1 99.6L144.3 96.3L145.4 99.3L146.5 97.6L147.7 96.5L148.9 103.6L150 60L151.2 16.4L152.3 23.5L153.5 22.4L154.6 20.7L155.8 23.7L156.9 20.4L158.1 23.1L159.2 21.5L160.4 22L161.5 22.5L162.6 21.2L163.8 22.8L165 21.3L166.1 22.3L167.3 22L168.4 21.7L169.5 22.5L170.7 21.4L171.9 22.5L173 21.7L174.2 22L175.3 22.3L176.5 21.5L177.6 22.5L178.8 21.6L179.9 22.2L181.1 22L182.2 21.8L183.4 22.4L184.5 21.5L185.7 22.4L186.8 21.8L188 22L189.1 22.2L190.3 21.6L191.4 22.5L192.6 21.5L193.7 22.3L194.9 22L196 21.7L197.1 22.5L198.3 21.4L199.5 22.5L200.6 21.7L201.8 22L202.9 22.3L204 21.3L205.2 22.8L206.4 21.2L207.5 22.5L208.7 22L209.8 21.5L211 23.1L212.1 20.4L213.3 23.7L214.4 20.7L215.6 22.4L216.7 23.5L217.9 16.4L219 60L220.2 103.6L221.3 96.5L222.5 97.6L223.6 99.3L224.8 96.3L225.9 99.6L227.1 96.9L228.2 98.5L229.4 98L230.5 97.5L231.7 98.8L232.8 97.2L234 98.7L235.1 97.7L236.3 98L237.4 98.3L238.6 97.5L239.7 98.6L240.9 97.5L242 98.3L243.2 98L244.3 97.7L245.5 98.5L246.6 97.5L247.8 98.4L248.9 97.8L250.1 98L251.2 98.2L252.4 97.6L253.5 98.5L254.7 97.6L255.8 98.2L257 98L258.1 97.8L259.3 98.4L260.4 97.5L261.6 98.5L262.7 97.7L263.9 98L265 98.3L266.2 97.5L267.3 98.6L268.5 97.5L269.6 98.3L270.8 98L271.9 97.7L273.1 98.7L274.2 97.2L275.4 98.8L276.5 97.5L277.7 98L278.8 98.5L280 96.9L281.1 99.6L282.3 96.3L283.4 99.3L284.6 97.6L285.7 96.5L286.9 103.6L288 60"/></svg><span class="fig__label">25 terms</span></div>
</div>
<figcaption>Figure 3. The square wave (grey) and the sums of the first 1, 3 and 25 terms of its series. As terms are added, the sum approaches the wave on the flat parts, but beside each jump it overshoots by about 9% of the size of the jump, however many terms are taken.</figcaption>
</figure>

### Convergence

The calculation of $c_k$ assumed that $f$ has a series expansion. Whether the series with these
coefficients actually converges to $f$ is a separate question, and the answer depends on the kind
of convergence required.

In the mean-square sense the answer is yes for every $f$ with $\int_0^1 |f|^2\, dt$ finite. The
partial sums $S_n = \sum_{|k| \le n} c_k e_k$ satisfy $\int_0^1 |f - S_n|^2\, dt \to 0$ as
$n \to \infty$, and

$$
\int_0^1 |f(t)|^2\, dt = \sum_{k=-\infty}^{\infty} |c_k|^2
$$

This is Parseval's identity. It is Pythagoras' theorem in infinitely many dimensions: the squared
length of a vector equals the sum of the squares of its coordinates in an orthonormal basis. A
related fact will be needed later. Among all sums $T = \sum_{|k| \le n} a_k e_k$, the partial sum
$S_n$ is the closest to $f$ in mean square.

<aside class="margin-note">

<b>Proof</b> For $|k| \le n$, $\langle f - S_n, e_k \rangle = c_k - c_k = 0$, so $f - S_n$ is
perpendicular to $S_n - T$, which is a combination of those $e_k$. By Pythagoras,

$$
\begin{aligned}
\int_0^1 |f - T|^2\, dt &= \int_0^1 |f - S_n|^2\, dt \\
&\quad + \sum_{|k| \le n} |c_k - a_k|^2
\end{aligned}
$$

which is smallest when $a_k = c_k$ for every $k$.

</aside>

Convergence at each point asks more of $f$. Dirichlet's theorem states that if $f$ is piecewise
continuously differentiable, then at every $t$

$$
\lim_{n \to \infty} S_n(t) = \tfrac{1}{2}\big(f(t^-) + f(t^+)\big)
$$

the average of the limits of $f$ from the left and from the right. Where $f$ is continuous this is
$f(t)$; at a jump it is the midpoint of the jump. If $f$ is moreover continuous everywhere, the
convergence is uniform: the largest error over the whole period tends to zero.

When $f$ has a jump, the convergence is not uniform, and Figure 3 shows how it fails. Next to the
jump, $S_n$ overshoots by an amount that does not tend to zero; only the width of the overshoot
decreases, in proportion to $1/n$. In the limit the overshoot is about 9% of the size of the jump,
so for the square wave, whose jumps are of size 2, the peaks of the partial sums approach 1.179
rather than 1. This is the Gibbs phenomenon.<span class="margin-note"><b>The constant</b> For a jump of size $J$ the limiting overshoot is $\big(\frac{1}{\pi}\int_0^{\pi} \frac{\sin x}{x}\, dx - \frac{1}{2}\big) J \approx 0.0895\, J$. Henry Wilbraham found it in 1848; it is named after J. Willard Gibbs, who described it in 1899.</span>

### Smoothness and the decay of coefficients

The size of $|c_k|$ for large $|k|$ determines how many terms are needed for a given accuracy, and
it is governed by the smoothness of $f$. Suppose that $f$ is continuous and periodic, and that its
derivative $f'$ is piecewise continuous. Integrating by parts, for $k \ne 0$,

$$
\begin{aligned}
c_k &= \int_0^1 f(t)\, e^{-2\pi i k t}\, dt \\
&= \left[\frac{f(t)\, e^{-2\pi i k t}}{-2\pi i k}\right]_0^1 + \frac{1}{2\pi i k} \int_0^1 f'(t)\, e^{-2\pi i k t}\, dt
\end{aligned}
$$

The boundary term is zero because $f(1) = f(0)$ and $e^{-2\pi i k} = 1$. So the coefficients of
$f$ are those of $f'$ divided by $2\pi i k$, and every derivative that is itself well behaved
contributes a further factor of $1/k$. Three cases matter here.

- If $f$ has a jump, the boundary terms at the jump do not cancel, and $|c_k|$ decreases only like
  $1/k$. The square wave, with $|c_k| = 2/(\pi k)$ for odd $k$, is an example.
- If $f$ is continuous but $f'$ jumps, so that the graph of $f$ has corners, the coefficients of
  $f'$ decrease like $1/k$ and those of $f$ like $1/k^2$.
- If $f$ is infinitely differentiable, they decrease faster than any power of $1/k$.

Combined with Parseval's identity, this determines how fast the error falls. The mean-square error
of $S_n$ is the sum of the squares of the omitted coefficients,
$\int_0^1 |f - S_n|^2\, dt = \sum_{|k| > n} |c_k|^2$. If $|c_k| \approx C/k$, this sum is
approximately $2C^2/n$, so the root-mean-square error decreases like $n^{-1/2}$. If
$|c_k| \approx C/k^2$, it is approximately $2C^2/(3n^3)$, and the error decreases like
$n^{-3/2}$.<span class="margin-note"><b>The tail sums</b> Compare each sum with an integral: $\sum_{k > n} k^{-2} \approx \int_n^\infty x^{-2}\, dx = 1/n$ and $\sum_{k > n} k^{-4} \approx \int_n^\infty x^{-4}\, dx = 1/(3n^3)$. The factor 2 counts the negative frequencies.</span>
To halve the error, the first case needs four times as many terms and the second about 1.6 times as
many. Removing the jumps from a function therefore greatly reduces the number of terms needed, and
this observation will determine how the curve is extracted from the photo.

## Closed curves as sums of circles

Nothing in the preceding arguments used the fact that $f$ takes real values. A closed curve in the
plane can be described by a periodic complex-valued function $z(t) = x(t) + i\,y(t)$, with
$z(t + 1) = z(t)$, which traces the curve once as $t$ goes from 0 to 1. The same results apply:

$$
z(t) = \sum_{k=-\infty}^{\infty} c_k\, e^{2\pi i k t}, \quad c_k = \int_0^1 z(t)\, e^{-2\pi i k t}\, dt
$$

Each term $c_k e^{2\pi i k t}$ is a point moving round a circle of radius $|c_k|$, $k$ times per
period. Since complex addition is vector addition, a sum of such terms can be drawn as a chain of
vectors placed end to end, each rotating about the end of the one before; the end of the last
vector traces the curve (Figure 4). A circle whose centre moves round another circle is called an
epicycle.<span class="margin-note"><b>Epicycles in astronomy</b> The term comes from ancient astronomy. Ptolemy's model of the planets, in the second century, carried each planet on a small circle whose centre moved round a larger one.</span>
Fourier's theory shows that any continuous, piecewise smooth closed curve can be traced to any
accuracy by a finite chain of epicycles.

<figure class="fig">
<svg viewBox="0 0 260 260" width="260" height="260" role="img" aria-label="Eight circles chained together, each centred on the rim of the one before, drawing a rounded five-pointed star. A third of the star is drawn so far."><path class="faint" d="M130 25L153.6 97.6L229.9 97.6L168.1 142.4L191.7 214.9L130 170.1L68.3 214.9L91.9 142.4L30.1 97.6L106.4 97.6Z"/><g class="guide"><circle cx="130" cy="130" r="70.2"/><circle cx="191.5" cy="163.8" r="18.6"/><circle cx="174.7" cy="171.7" r="8.3"/><circle cx="173.7" cy="163.5" r="1.5"/><circle cx="174.7" cy="164.6" r="1.2"/><circle cx="175.8" cy="164.9" r="0.9"/><circle cx="176" cy="164" r="0.6"/><circle cx="175.6" cy="164.4" r="0.5"/></g><path class="arm" d="M130 130L191.5 163.8L174.7 171.7L173.7 163.5L174.7 164.6L175.8 164.9L176 164L175.6 164.4L175.8 164"/><path class="ink" d="M130 28.3L130.8 28.9L131.6 30.5L132.7 33L133.8 36.2L135 39.5L136.2 43L137.3 46.3L138.2 49.5L138.9 52.5L139.6 55.5L140.4 58.4L141.3 61.4L142.4 64.4L143.7 67.3L145 70.3L146.3 73.2L147.3 76.2L148.1 79.2L148.7 82.4L149.3 85.6L149.9 88.7L150.9 91.7L152.4 94.3L154.4 96.4L157 97.7L159.9 98.3L163.1 98.3L166.3 97.9L169.5 97.5L172.7 97.1L175.8 96.9L179 97L182.2 97.3L185.4 97.7L188.6 97.9L191.8 98.1L194.9 98L197.9 97.8L201 97.6L204.1 97.3L207.3 97.2L210.8 97.2L214.5 97.3L218.1 97.4L221.4 97.5L224.1 97.7L225.9 98L226.7 98.6L226.4 99.5L225.1 100.8L223 102.6L220.4 104.6L217.6 106.8L214.7 109L211.9 111.1L209.1 112.9L206.5 114.5L203.9 116.1L201.3 117.7L198.8 119.5L196.3 121.5L193.8 123.6L191.4 125.8L189 127.9L186.5 129.8L183.9 131.6L181.1 133.1L178.2 134.6L175.4 136.2L172.9 138.1L170.8 140.3L169.6 142.9L169.1 145.7L169.4 148.6L170.4 151.7L171.7 154.6L173.2 157.5L174.5 160.4L175.6 163.4"/><circle class="dot" cx="175.8" cy="164" r="4"/></svg>
<figcaption>Figure 4. Eight circles tracing a five-pointed star (grey), one third of the way through. The largest circle turns once per period about the centre of the star; each of the others is carried on the rim of the one before and turns at its own frequency.</figcaption>
</figure>

The terms of lowest frequency have simple interpretations.

- The constant term $c_0 = \int_0^1 z(t)\, dt$ is the average position over a period. When the
  curve is traced at constant speed, it is the centre of mass of the curve regarded as a uniform
  wire. It is the fixed point at which the chain is anchored.
- The term $c_1 e^{2\pi i t}$ alone traces a circle once anticlockwise, and $c_{-1} e^{-2\pi i t}$
  alone traces one once clockwise.
- Together, the terms of frequency $1$ and $-1$ trace an ellipse with semi-axes
  $|c_1| + |c_{-1}|$ and $\big||c_1| - |c_{-1}|\big|$. By the closest-approximation property of
  partial sums, $c_0 + c_1 e^{2\pi i t} + c_{-1} e^{-2\pi i t}$ is the curve of that form closest
  to $z$ in mean square.
- Terms with larger $|k|$ add detail that repeats $|k|$ times around the curve. For a reasonably
  smooth curve their radii are small.

<aside class="margin-note">

<b>Why an ellipse</b> Write $c_1 = a e^{i\alpha}$ and $c_{-1} = b e^{i\beta}$ with $a, b \ge 0$, and
put $\psi = 2\pi t + \tfrac{1}{2}(\alpha - \beta)$ and $\gamma = \tfrac{1}{2}(\alpha + \beta)$. Then

$$
\begin{aligned}
&c_1 e^{2\pi i t} + c_{-1} e^{-2\pi i t} \\
&\quad = e^{i\gamma}\big(a e^{i\psi} + b e^{-i\psi}\big) \\
&\quad = e^{i\gamma}\big((a + b)\cos\psi + i\,(a - b)\sin\psi\big)
\end{aligned}
$$

The bracket traces an ellipse with semi-axes $a + b$ and $|a - b|$, and the factor $e^{i\gamma}$
rotates it through $\gamma$. It is a circle when $a$ or $b$ is 0, and a segment when $a = b$.

</aside>

For a real-valued function, taking conjugates in the formula for $c_k$ gives
$c_{-k} = \overline{c_k}$, so the coefficients of negative frequency carry no information beyond
those of positive frequency. For a curve in the plane there is no such relation. The coefficients
$c_k$ and $c_{-k}$ are independent, and both must be computed.

Symmetries of a curve are reflected in its coefficients. Measure the star of Figure 4 from its
centre, and suppose that it is traced at constant speed. A rotation through a fifth of a turn
leaves the star unchanged, and advancing the time by $\tfrac{1}{5}$ carries each point to the
corresponding point one fifth of a turn further round:

$$
z\big(t + \tfrac{1}{5}\big) = \rho\, z(t), \qquad \rho = e^{2\pi i / 5}
$$

Substituting the Fourier series into both sides and comparing the coefficients of
$e^{2\pi i k t}$ gives $c_k e^{2\pi i k/5} = \rho\, c_k$, that is,
$c_k\big(e^{2\pi i k/5} - e^{2\pi i/5}\big) = 0$. Hence $c_k = 0$ unless $k - 1$ is a multiple of 5.
The frequencies of the largest circles, listed in the caption of Figure 5, all have this
form.<span class="margin-note"><b>Comparing coefficients</b> This step uses the uniqueness of Fourier coefficients: two series that agree for every $t$ have the same coefficients, since each $c_k$ is given by the integral formula.</span>

<figure class="fig">
<div class="fig__panels" style="--panel: 9.5rem">
<div class="fig__panel"><svg viewBox="0 0 200 200" role="img" aria-label="The star drawn by the largest circle."><path class="faint" d="M100 20L118 75.3L176.1 75.3L129.1 109.4L147 164.7L100 130.6L53 164.7L70.9 109.4L23.9 75.3L82 75.3Z"/><path class="ink" d="M100 46.5L102.8 46.6L105.6 46.8L108.4 47.2L111.1 47.7L113.8 48.3L116.5 49.1L119.2 50.1L121.8 51.1L124.3 52.3L126.7 53.7L129.1 55.1L131.4 56.7L133.7 58.4L135.8 60.3L137.8 62.2L139.7 64.2L141.6 66.3L143.3 68.6L144.9 70.9L146.3 73.3L147.7 75.7L148.9 78.2L149.9 80.8L150.9 83.5L151.7 86.2L152.3 88.9L152.8 91.6L153.2 94.4L153.4 97.2L153.5 100L153.4 102.8L153.2 105.6L152.8 108.4L152.3 111.1L151.7 113.8L150.9 116.5L149.9 119.2L148.9 121.8L147.7 124.3L146.3 126.7L144.9 129.1L143.3 131.4L141.6 133.7L139.7 135.8L137.8 137.8L135.8 139.7L133.7 141.6L131.4 143.3L129.1 144.9L126.7 146.3L124.3 147.7L121.8 148.9L119.2 149.9L116.5 150.9L113.8 151.7L111.1 152.3L108.4 152.8L105.6 153.2L102.8 153.4L100 153.5L97.2 153.4L94.4 153.2L91.6 152.8L88.9 152.3L86.2 151.7L83.5 150.9L80.8 149.9L78.2 148.9L75.7 147.7L73.3 146.3L70.9 144.9L68.6 143.3L66.3 141.6L64.2 139.7L62.2 137.8L60.3 135.8L58.4 133.7L56.7 131.4L55.1 129.1L53.7 126.7L52.3 124.3L51.1 121.8L50.1 119.2L49.1 116.5L48.3 113.8L47.7 111.1L47.2 108.4L46.8 105.6L46.6 102.8L46.5 100L46.6 97.2L46.8 94.4L47.2 91.6L47.7 88.9L48.3 86.2L49.1 83.5L50.1 80.8L51.1 78.2L52.3 75.7L53.7 73.3L55.1 70.9L56.7 68.6L58.4 66.3L60.3 64.2L62.2 62.2L64.2 60.3L66.3 58.4L68.6 56.7L70.9 55.1L73.3 53.7L75.7 52.3L78.2 51.1L80.8 50.1L83.5 49.1L86.2 48.3L88.9 47.7L91.6 47.2L94.4 46.8L97.2 46.6Z"/></svg><span class="fig__label">1 circle</span></div>
<div class="fig__panel"><svg viewBox="0 0 200 200" role="img" aria-label="The star drawn by the 2 largest circles."><path class="faint" d="M100 20L118 75.3L176.1 75.3L129.1 109.4L147 164.7L100 130.6L53 164.7L70.9 109.4L23.9 75.3L82 75.3Z"/><path class="ink" d="M100 32.4L99.9 32.7L99.8 33.9L100 35.7L100.6 38.2L101.6 41.3L103.1 44.8L105.1 48.6L107.7 52.6L110.8 56.7L114.5 60.8L118.6 64.6L123.1 68.2L127.9 71.4L132.8 74.1L137.8 76.3L142.7 78.1L147.3 79.3L151.6 80L155.4 80.3L158.6 80.3L161.1 80.1L162.9 79.7L164 79.4L164.3 79.1L163.9 79.1L162.8 79.4L161.2 80.2L159 81.5L156.4 83.3L153.5 85.8L150.5 88.9L147.4 92.7L144.5 96.9L141.8 101.6L139.4 106.8L137.4 112.2L135.8 117.7L134.8 123.2L134.2 128.7L134.1 133.8L134.3 138.6L134.9 142.9L135.8 146.6L136.8 149.6L137.8 152L138.7 153.6L139.4 154.5L139.8 154.7L139.7 154.3L139 153.4L137.8 152L135.8 150.3L133.3 148.5L130 146.5L126.1 144.6L121.6 142.8L116.7 141.4L111.4 140.3L105.7 139.6L100 139.3L94.3 139.6L88.6 140.3L83.3 141.4L78.4 142.8L73.9 144.6L70 146.5L66.7 148.5L64.2 150.3L62.2 152L61 153.4L60.3 154.3L60.2 154.7L60.6 154.5L61.3 153.6L62.2 152L63.2 149.6L64.2 146.6L65.1 142.9L65.7 138.6L65.9 133.8L65.8 128.7L65.2 123.2L64.2 117.7L62.6 112.2L60.6 106.8L58.2 101.6L55.5 96.9L52.6 92.7L49.5 88.9L46.5 85.8L43.6 83.3L41 81.5L38.8 80.2L37.2 79.4L36.1 79.1L35.7 79.1L36 79.4L37.1 79.7L38.9 80.1L41.4 80.3L44.6 80.3L48.4 80L52.7 79.3L57.3 78.1L62.2 76.3L67.2 74.1L72.1 71.4L76.9 68.2L81.4 64.6L85.5 60.8L89.2 56.7L92.3 52.6L94.9 48.6L96.9 44.8L98.4 41.3L99.4 38.2L100 35.7L100.2 33.9L100.1 32.7Z"/></svg><span class="fig__label">2 circles</span></div>
<div class="fig__panel"><svg viewBox="0 0 200 200" role="img" aria-label="The star drawn by the 3 largest circles."><path class="faint" d="M100 20L118 75.3L176.1 75.3L129.1 109.4L147 164.7L100 130.6L53 164.7L70.9 109.4L23.9 75.3L82 75.3Z"/><path class="ink" d="M100 26.1L101.8 26.7L103.5 28.8L105.1 32L106.6 36.3L107.9 41.3L109 46.7L110.2 52.3L111.4 57.7L112.8 62.7L114.5 67.1L116.7 70.6L119.4 73.3L122.8 75.1L126.9 76.1L131.5 76.3L136.7 76.1L142.2 75.6L147.9 74.9L153.4 74.4L158.6 74L163.1 74.1L166.6 74.6L169.1 75.7L170.3 77.2L170.2 79.1L168.8 81.3L166.2 83.9L162.7 86.6L158.3 89.3L153.5 92.1L148.5 94.9L143.7 97.7L139.4 100.6L135.8 103.6L133.1 106.8L131.4 110.2L130.8 114L131.1 118.1L132.2 122.7L134.1 127.5L136.3 132.6L138.6 137.8L140.9 142.9L142.8 147.7L144.1 152L144.7 155.5L144.5 158.2L143.5 159.8L141.6 160.3L139 159.7L135.8 158L132.1 155.4L128.2 152.2L124 148.4L119.8 144.6L115.7 140.9L111.6 137.7L107.7 135.2L103.8 133.6L100 133L96.2 133.6L92.3 135.2L88.4 137.7L84.3 140.9L80.2 144.6L76 148.4L71.8 152.2L67.9 155.4L64.2 158L61 159.7L58.4 160.3L56.5 159.8L55.5 158.2L55.3 155.5L55.9 152L57.2 147.7L59.1 142.9L61.4 137.8L63.7 132.6L65.9 127.5L67.8 122.7L68.9 118.1L69.2 114L68.6 110.2L66.9 106.8L64.2 103.6L60.6 100.6L56.3 97.7L51.5 94.9L46.5 92.1L41.7 89.3L37.3 86.6L33.8 83.9L31.2 81.3L29.8 79.1L29.7 77.2L30.9 75.7L33.4 74.6L36.9 74.1L41.4 74L46.6 74.4L52.1 74.9L57.8 75.6L63.3 76.1L68.5 76.3L73.1 76.1L77.2 75.1L80.6 73.3L83.3 70.6L85.5 67.1L87.2 62.7L88.6 57.7L89.8 52.3L91 46.7L92.1 41.3L93.4 36.3L94.9 32L96.5 28.8L98.2 26.7Z"/></svg><span class="fig__label">3 circles</span></div>
<div class="fig__panel"><svg viewBox="0 0 200 200" role="img" aria-label="The star drawn by the 5 largest circles."><path class="faint" d="M100 20L118 75.3L176.1 75.3L129.1 109.4L147 164.7L100 130.6L53 164.7L70.9 109.4L23.9 75.3L82 75.3Z"/><path class="ink" d="M100 24L101.7 25.3L103.3 28.7L104.7 33.4L106.2 38.3L107.7 42.7L109.3 46.8L110.9 51L112.2 55.8L113.2 61.3L114.2 66.9L115.7 71.7L118.2 74.9L122 76.3L127.1 76.2L132.7 75.5L138.2 74.7L143.2 74.5L147.7 74.7L152.1 75L156.8 75.1L161.9 74.9L166.8 74.9L170.5 75.3L172.3 76.5L171.6 78.5L168.8 81.1L164.8 83.9L160.6 86.8L156.9 89.6L153.5 92.4L150 95.2L145.8 98L140.9 100.6L135.9 103.3L131.8 106.2L129.5 109.6L129.3 113.6L131 118.4L133.4 123.5L135.8 128.6L137.6 133.2L138.8 137.6L139.9 141.8L141.3 146.3L143 151.1L144.5 155.7L145.3 159.5L144.7 161.5L142.5 161.4L139.2 159.6L135.3 156.6L131.3 153.6L127.5 150.9L123.8 148.5L120 146L116.1 142.9L112 139.1L107.9 135.1L103.9 132.1L100 131L96.1 132.1L92.1 135.1L88 139.1L83.9 142.9L80 146L76.2 148.5L72.5 150.9L68.7 153.6L64.7 156.6L60.8 159.6L57.5 161.4L55.3 161.5L54.7 159.5L55.5 155.7L57 151.1L58.7 146.3L60.1 141.8L61.2 137.6L62.4 133.2L64.2 128.6L66.6 123.5L69 118.4L70.7 113.6L70.5 109.6L68.2 106.2L64.1 103.3L59.1 100.6L54.2 98L50 95.2L46.5 92.4L43.1 89.6L39.4 86.8L35.2 83.9L31.2 81.1L28.4 78.5L27.7 76.5L29.5 75.3L33.2 74.9L38.1 74.9L43.2 75.1L47.9 75L52.3 74.7L56.8 74.5L61.8 74.7L67.3 75.5L72.9 76.2L78 76.3L81.8 74.9L84.3 71.7L85.8 66.9L86.8 61.3L87.8 55.8L89.1 51L90.7 46.8L92.3 42.7L93.8 38.3L95.3 33.4L96.7 28.7L98.3 25.3Z"/></svg><span class="fig__label">5 circles</span></div>
<div class="fig__panel"><svg viewBox="0 0 200 200" role="img" aria-label="The star drawn by the 10 largest circles."><path class="faint" d="M100 20L118 75.3L176.1 75.3L129.1 109.4L147 164.7L100 130.6L53 164.7L70.9 109.4L23.9 75.3L82 75.3Z"/><path class="ink" d="M100 22L100.6 22.5L101.3 24L102.1 26.2L103 28.6L103.8 31L104.5 33.2L105.1 35.4L105.6 37.5L106.3 39.8L107.1 42.1L107.9 44.4L108.7 46.8L109.4 49L110 51.1L110.6 53.3L111.3 55.4L112.1 57.5L113.1 59.6L114 61.7L114.7 63.9L115.2 66.3L115.6 68.7L116.1 71.1L116.9 73.3L118.3 74.8L120.2 75.6L122.5 75.8L124.9 75.5L127.4 75.1L129.8 74.9L132.1 74.9L134.4 75.1L136.7 75.3L138.9 75.5L141.1 75.4L143.4 75.3L145.6 75.3L147.9 75.3L150.4 75.3L152.9 75.4L155.3 75.4L157.7 75.3L159.9 75.2L162.1 75.1L164.5 75.1L167 75.1L169.6 75.2L171.9 75.3L173.5 75.5L174.2 75.9L173.9 76.6L172.7 77.8L170.9 79.2L168.8 80.8L166.8 82.3L164.9 83.6L163 84.8L161.1 86.1L159.2 87.4L157.2 88.8L155.3 90.3L153.3 91.8L151.4 93.2L149.6 94.5L147.7 95.7L145.9 97L144.2 98.4L142.5 100L140.7 101.5L138.9 102.8L136.8 104.1L134.6 105.2L132.4 106.4L130.7 107.8L129.6 109.6L129.4 111.7L130 113.9L131 116.1L132.1 118.3L133.1 120.5L133.8 122.8L134.3 125L134.8 127.2L135.4 129.4L136.1 131.5L136.8 133.6L137.6 135.7L138.4 138L139 140.3L139.7 142.7L140.5 145L141.3 147.2L142.1 149.3L142.9 151.4L143.6 153.6L144.4 156L145.1 158.5L145.7 160.7L146 162.3L145.9 163.1L145 163.1L143.6 162.2L141.7 161L139.6 159.5L137.5 158.1L135.6 156.6L133.9 155.2L132.2 153.8L130.3 152.4L128.3 151L126.3 149.6L124.2 148.2L122.3 146.8L120.6 145.4L118.9 144L117.1 142.7L115.2 141.5L113.2 140.4L111.2 139.2L109.3 137.8L107.5 136.2L105.8 134.5L103.9 132.8L102 131.6L100 131.2L98 131.6L96.1 132.8L94.2 134.5L92.5 136.2L90.7 137.8L88.8 139.2L86.8 140.4L84.8 141.5L82.9 142.7L81.1 144L79.4 145.4L77.7 146.8L75.8 148.2L73.7 149.6L71.7 151L69.7 152.4L67.8 153.8L66.1 155.2L64.4 156.6L62.5 158.1L60.4 159.5L58.3 161L56.4 162.2L55 163.1L54.1 163.1L54 162.3L54.3 160.7L54.9 158.5L55.6 156L56.4 153.6L57.1 151.4L57.9 149.3L58.7 147.2L59.5 145L60.3 142.7L61 140.3L61.6 138L62.4 135.7L63.2 133.6L63.9 131.5L64.6 129.4L65.2 127.2L65.7 125L66.2 122.8L66.9 120.5L67.9 118.3L69 116.1L70 113.9L70.6 111.7L70.4 109.6L69.3 107.8L67.6 106.4L65.4 105.2L63.2 104.1L61.1 102.8L59.3 101.5L57.5 100L55.8 98.4L54.1 97L52.3 95.7L50.4 94.5L48.6 93.2L46.7 91.8L44.7 90.3L42.8 88.8L40.8 87.4L38.9 86.1L37 84.8L35.1 83.6L33.2 82.3L31.2 80.8L29.1 79.2L27.3 77.8L26.1 76.6L25.8 75.9L26.5 75.5L28.1 75.3L30.4 75.2L33 75.1L35.5 75.1L37.9 75.1L40.1 75.2L42.3 75.3L44.7 75.4L47.1 75.4L49.6 75.3L52.1 75.3L54.4 75.3L56.6 75.3L58.9 75.4L61.1 75.5L63.3 75.3L65.6 75.1L67.9 74.9L70.2 74.9L72.6 75.1L75.1 75.5L77.5 75.8L79.8 75.6L81.7 74.8L83.1 73.3L83.9 71.1L84.4 68.7L84.8 66.3L85.3 63.9L86 61.7L86.9 59.6L87.9 57.5L88.7 55.4L89.4 53.3L90 51.1L90.6 49L91.3 46.8L92.1 44.4L92.9 42.1L93.7 39.8L94.4 37.5L94.9 35.4L95.5 33.2L96.2 31L97 28.6L97.9 26.2L98.7 24L99.4 22.5Z"/></svg><span class="fig__label">10 circles</span></div>
<div class="fig__panel"><svg viewBox="0 0 200 200" role="img" aria-label="The star drawn by the 50 largest circles."><path class="faint" d="M100 20L118 75.3L176.1 75.3L129.1 109.4L147 164.7L100 130.6L53 164.7L70.9 109.4L23.9 75.3L82 75.3Z"/><path class="ink" d="M100 20.3L100.7 22.2L101.4 24.4L102.1 26.6L102.9 28.8L103.6 31.1L104.3 33.3L105 35.5L105.8 37.7L106.5 39.9L107.2 42.1L107.9 44.3L108.6 46.5L109.3 48.7L110.1 50.9L110.8 53.2L111.5 55.4L112.2 57.6L112.9 59.8L113.6 62L114.4 64.2L115.1 66.4L115.8 68.7L116.5 70.9L117.3 73L118 75.3L120.4 75.2L122.6 75.3L124.9 75.3L127.3 75.2L129.6 75.3L131.9 75.3L134.2 75.3L136.6 75.3L138.9 75.3L141.2 75.3L143.5 75.3L145.9 75.3L148.2 75.3L150.5 75.3L152.8 75.3L155.2 75.3L157.5 75.3L159.8 75.3L162.1 75.3L164.5 75.3L166.8 75.3L169.1 75.3L171.5 75.3L173.7 75.3L175.8 75.4L174.2 76.7L172.3 78L170.4 79.4L168.6 80.8L166.7 82.1L164.8 83.5L162.9 84.9L161 86.2L159.2 87.6L157.3 88.9L155.4 90.3L153.5 91.7L151.6 93L149.8 94.4L147.9 95.8L146 97.1L144.1 98.5L142.2 99.9L140.3 101.2L138.5 102.6L136.6 104L134.7 105.3L132.8 106.7L131.1 108.1L129.1 109.4L129.9 111.7L130.5 113.9L131.2 116.1L132 118.3L132.7 120.5L133.3 122.7L134.1 124.9L134.8 127.1L135.5 129.3L136.2 131.6L137 133.8L137.7 136L138.4 138.2L139.1 140.4L139.8 142.6L140.5 144.8L141.3 147L142 149.2L142.7 151.5L143.4 153.7L144.2 155.9L144.9 158.1L145.6 160.3L146.3 162.5L146.9 164.5L145.1 163.3L143.3 162L141.4 160.6L139.5 159.3L137.6 157.9L135.7 156.5L133.9 155.2L132 153.8L130.1 152.4L128.2 151.1L126.3 149.7L124.5 148.3L122.6 146.9L120.7 145.6L118.8 144.2L116.9 142.8L115 141.5L113.2 140.1L111.3 138.7L109.4 137.4L107.5 136.1L105.6 134.6L103.8 133.3L101.9 132.1L100 130.6L98.1 132.1L96.2 133.3L94.4 134.6L92.5 136.1L90.6 137.4L88.7 138.7L86.8 140.1L85 141.5L83.1 142.8L81.2 144.2L79.3 145.6L77.4 146.9L75.5 148.3L73.7 149.7L71.8 151.1L69.9 152.4L68 153.8L66.1 155.2L64.3 156.5L62.4 157.9L60.5 159.3L58.6 160.6L56.7 162L54.9 163.3L53.1 164.5L53.7 162.5L54.4 160.3L55.1 158.1L55.8 155.9L56.6 153.7L57.3 151.5L58 149.2L58.7 147L59.5 144.8L60.2 142.6L60.9 140.4L61.6 138.2L62.3 136L63 133.8L63.8 131.6L64.5 129.3L65.2 127.1L65.9 124.9L66.7 122.7L67.3 120.5L68 118.3L68.8 116.1L69.5 113.9L70.1 111.7L70.9 109.4L68.9 108.1L67.2 106.7L65.3 105.3L63.4 104L61.5 102.6L59.7 101.2L57.8 99.9L55.9 98.5L54 97.1L52.1 95.8L50.2 94.4L48.4 93L46.5 91.7L44.6 90.3L42.7 88.9L40.8 87.6L39 86.2L37.1 84.9L35.2 83.5L33.3 82.1L31.4 80.8L29.6 79.4L27.7 78L25.8 76.7L24.2 75.4L26.3 75.3L28.5 75.3L30.9 75.3L33.2 75.3L35.5 75.3L37.9 75.3L40.2 75.3L42.5 75.3L44.8 75.3L47.2 75.3L49.5 75.3L51.8 75.3L54.1 75.3L56.5 75.3L58.8 75.3L61.1 75.3L63.4 75.3L65.8 75.3L68.1 75.3L70.4 75.3L72.7 75.2L75.1 75.3L77.4 75.3L79.6 75.2L82 75.3L82.7 73L83.5 70.9L84.2 68.7L84.9 66.4L85.6 64.2L86.4 62L87.1 59.8L87.8 57.6L88.5 55.4L89.2 53.2L89.9 50.9L90.7 48.7L91.4 46.5L92.1 44.3L92.8 42.1L93.5 39.9L94.2 37.7L95 35.5L95.7 33.3L96.4 31.1L97.1 28.8L97.9 26.6L98.6 24.4L99.3 22.2Z"/></svg><span class="fig__label">50 circles</span></div>
</div>
<figcaption>Figure 5. The star traced by its largest 1, 2, 3, 5, 10 and 50 circles. One circle traces a circle; two already give five lobes. In decreasing order of radius the frequencies are 1, −4, 6, −14, 16, −9, …, each one more than a multiple of 5.</figcaption>
</figure>

Addition is commutative, so the order of the circles in the chain does not affect the position of
the pen. The site orders them by decreasing radius, so that each circle is smaller than the one
that carries it. The following function, from `src/lib/photo-trace.ts`, computes the joints of the
chain at time $t$:

```ts
/** The pen's position at time t ∈ [0, 1), and the joints of the chain of circles that put it there. */
export function chainAt(circles: Coefficient[], t: number): Point[] {
  const joints: Point[] = [];
  let x = 0;
  let y = 0;
  for (const c of circles) {
    const angle = 2 * Math.PI * c.frequency * t + c.phase;
    x += c.amplitude * Math.cos(angle);
    y += c.amplitude * Math.sin(angle);
    joints.push({ x, y });
  }
  return joints;
}
```

Each iteration adds one term $r\, e^{i(2\pi k t + \varphi)}$ to a running total, using Euler's
formula to compute its real part $r\cos(2\pi k t + \varphi)$ and its imaginary part
$r\sin(2\pi k t + \varphi)$.

## The discrete Fourier transform

### From an integral to a sum

The formula for $c_k$ requires $z(t)$ at every $t$, but the site stores only $N = 800$ points of
the curve, $z_n = z(n/N)$ for $n = 0, 1, \dots, N - 1$, equally spaced in time. Replacing the
integral by the average of the integrand over the sample times (the rectangle rule) gives

$$
c_k = \int_0^1 z(t)\, e^{-2\pi i k t}\, dt \;\approx\; X_k = \frac{1}{N} \sum_{n=0}^{N-1} z_n\, e^{-2\pi i k n / N}
$$

The numbers $X_0, \dots, X_{N-1}$ are the discrete Fourier transform (DFT) of the samples. With the
factor $\frac{1}{N}$ included, each $X_k$ gives directly the radius and starting angle of a
circle.<span class="margin-note"><b>Conventions</b> Where the factor $\frac{1}{N}$ goes is a matter of convention. Many texts and libraries omit it here and put it in the inverse transform instead, and some split it as $1/\sqrt{N}$ in each.</span>

### Discrete orthogonality and the inverse transform

The DFT is more than an approximation. It has an exact theory of its own, parallel to that of
Fourier series, in which the integral over a period is replaced by the average over $N$ equally
spaced times. Write $\omega = e^{2\pi i/N}$, a rotation by one $N$-th of a turn. The discrete
counterpart of the orthogonality integral is

$$
\frac{1}{N}\sum_{n=0}^{N-1} \omega^{m n} = \begin{cases} 1 & \text{if } m \text{ is a multiple of } N \\ 0 & \text{otherwise} \end{cases}
$$

Figure 6 shows why. The terms $\omega^{mn}$ are unit vectors, each turned $m$ $N$-ths of a turn
from the one before. Placed end to end, they return to the starting point, so their sum is
zero.<span class="margin-note"><b>Proof</b> If $m$ is a multiple of $N$, every term is 1. Otherwise $\omega^m \ne 1$, and the geometric series gives $\sum_n \omega^{mn} = (1 - \omega^{mN})/(1 - \omega^m) = 0$, because $\omega^{mN} = (\omega^N)^m = 1$.</span>

<figure class="fig">
<div class="fig__panels" style="--panel: 8rem">
<div class="fig__panel"><svg viewBox="0 0 200 200" role="img" aria-label="Eight arrows of equal length, each turned an eighth of a turn from the one before, laid tip to tail. They end where they started."><path class="ink" d="M71.9 175L128.1 175M120.1 179L128.1 175L120.1 171M133.2 172.9L172.9 133.2M170.1 141.7L172.9 133.2L164.4 136M175 128.1L175 71.9M179 79.9L175 71.9L171 79.9M172.9 66.8L133.2 27.1M141.7 29.9L133.2 27.1L136 35.6M128.1 25L71.9 25M79.9 21L71.9 25L79.9 29M66.8 27.1L27.1 66.8M29.9 58.3L27.1 66.8L35.6 64M25 71.9L25 128.1M21 120.1L25 128.1L29 120.1M27.1 133.2L66.8 172.9M58.3 170.1L66.8 172.9L64 164.4"/><circle class="dot" cx="68.9" cy="175" r="4"/></svg><span class="fig__label">m = 1</span></div>
<div class="fig__panel"><svg viewBox="0 0 200 200" role="img" aria-label="Eight arrows of equal length, each turned a quarter of a turn from the one before, laid tip to tail. They end where they started."><path class="ink" d="M28 175L172 175M164 179L172 175L164 171M175 172L175 28M179 36L175 28L171 36M172 25L28 25M36 21L28 25L36 29M25 28L25 172M21 164L25 172L29 164M28 175L172 175M164 179L172 175L164 171M175 172L175 28M179 36L175 28L171 36M172 25L28 25M36 21L28 25L36 29M25 28L25 172M21 164L25 172L29 164"/><circle class="dot" cx="25" cy="175" r="4"/></svg><span class="fig__label">m = 2</span></div>
<div class="fig__panel"><svg viewBox="0 0 200 200" role="img" aria-label="Eight arrows of equal length, each turned three eighths of a turn from the one before, laid tip to tail. They end where they started."><path class="ink" d="M28 131.1L172 131.1M164 135.1L172 131.1L164 127.1M172.9 128.9L71.1 27.1M79.5 29.9L71.1 27.1L73.9 35.6M68.9 28L68.9 172M64.9 164L68.9 172L72.9 164M71.1 172.9L172.9 71.1M170.1 79.5L172.9 71.1L164.4 73.9M172 68.9L28 68.9M36 64.9L28 68.9L36 72.9M27.1 71.1L128.9 172.9M120.5 170.1L128.9 172.9L126.1 164.4M131.1 172L131.1 28M135.1 36L131.1 28L127.1 36M128.9 27.1L27.1 128.9M29.9 120.5L27.1 128.9L35.6 126.1"/><circle class="dot" cx="25" cy="131.1" r="4"/></svg><span class="fig__label">m = 3</span></div>
</div>
<figcaption>Figure 6. The eight numbers e<sup>2πimn/8</sup> for n = 0, …, 7, drawn as arrows placed end to end from the dot. Each is the previous one turned through m eighths of a turn, so after eight steps the path returns to the dot and the sum is 0 (for m = 2 the path goes round the square twice). Only when m is a multiple of 8 do all the arrows point the same way, giving a sum of 8.</figcaption>
</figure>

Discrete orthogonality gives an exact inverse for the DFT:

$$
z_n = \sum_{k=0}^{N-1} X_k\, \omega^{k n}
$$

<aside class="margin-note">

<b>Proof</b> Substitute the definition of $X_k$ and exchange the two finite sums:

$$
\sum_{k} X_k\, \omega^{k n} = \sum_{j} z_j \cdot \frac{1}{N}\sum_{k} \omega^{k (n - j)}
$$

Since $n - j$ lies strictly between $-N$ and $N$, the inner average is 1 when $j = n$ and 0
otherwise, leaving $z_n$.

In the language of linear algebra, the vectors $(\omega^{kn})_{n=0}^{N-1}$ for
$k = 0, \dots, N - 1$ form an orthogonal basis of $\mathbb{C}^N$, and the DFT computes the
coordinates of the samples in that basis.

</aside>

So $N$ samples determine exactly $N$ circles, and the sum of these circles passes through every
sample.

A small example shows what this does and does not mean. The corners of a square, taken
anticlockwise, are $z_n = i^n$ for $n = 0, 1, 2, 3$. Here $N = 4$ and $\omega = i$, so

$$
X_k = \frac{1}{4}\sum_{n=0}^{3} i^{n}\, i^{-k n} = \frac{1}{4}\sum_{n=0}^{3} i^{(1 - k) n}
$$

which is 1 for $k = 1$ and 0 for $k = 0, 2, 3$. The four corners are reproduced by a single circle
of radius 1 passing through them. The DFT has no information about the straight sides of the square
between the samples; it reproduces the samples, not the curve from which they were taken.

### Aliasing and the choice of frequencies

The functions $e^{2\pi i k t}$ and $e^{2\pi i (k - N) t}$ are different, but at the sample times
$t = n/N$ they take the same values:

$$
e^{2\pi i (k - N) n / N} = e^{2\pi i k n / N} \cdot e^{-2\pi i n} = e^{2\pi i k n / N}
$$

since $e^{-2\pi i n} = 1$ for every integer $n$. More generally, the frequencies $k + mN$, for all
integers $m$, cannot be distinguished from one another by the samples. This is
aliasing.<span class="margin-note"><b>Aliasing in film</b> The same effect makes the spoked wheels of a wagon appear to turn slowly backwards in a film: the camera samples the wheel at a fixed rate, and a fast forward rotation is indistinguishable from a slow backward one.</span>
It also gives the exact relation between the DFT and the Fourier coefficients:

$$
X_k = \sum_{m=-\infty}^{\infty} c_{k + mN}
$$

<aside class="margin-note">

<b>Proof</b> Substitute $z(n/N) = \sum_j c_j\, \omega^{jn}$ into the definition of $X_k$:

$$
X_k = \sum_j c_j \cdot \frac{1}{N}\sum_n \omega^{(j - k) n}
$$

The inner average keeps exactly the $j$ that differ from $k$ by a multiple of $N$. The exchange of
sums is valid when $\sum_j |c_j|$ is finite.

</aside>

Each $X_k$ is the true coefficient $c_k$ plus the coefficients of all the frequencies that coincide
with $k$ at the samples. If $|k| \le N/2$, each of those other frequencies has magnitude at least
$N/2$, so when the coefficients decrease like $1/k^2$, the error $X_k - c_k$ is of order $1/N^2$.

<figure class="fig">
<svg viewBox="0 0 560 160" role="img" aria-label="Two waves on the same axes: a slow one that rises and falls once, and a fast one that rises and falls seven times. Both pass through the same nine evenly spaced dots."><path class="guide" d="M16 80H544"/><path class="faint" d="M16 24L17.9 24.7L19.8 26.7L21.7 30.1L23.5 34.7L25.4 40.4L27.3 47.1L29.2 54.6L31.1 62.7L33 71.2L34.9 80L36.7 88.8L38.6 97.3L40.5 105.4L42.4 112.9L44.3 119.6L46.2 125.3L48.1 129.9L49.9 133.3L51.8 135.3L53.7 136L55.6 135.3L57.5 133.3L59.4 129.9L61.3 125.3L63.1 119.6L65 112.9L66.9 105.4L68.8 97.3L70.7 88.8L72.6 80L74.5 71.2L76.3 62.7L78.2 54.6L80.1 47.1L82 40.4L83.9 34.7L85.8 30.1L87.7 26.7L89.5 24.7L91.4 24L93.3 24.7L95.2 26.7L97.1 30.1L99 34.7L100.9 40.4L102.7 47.1L104.6 54.6L106.5 62.7L108.4 71.2L110.3 80L112.2 88.8L114.1 97.3L115.9 105.4L117.8 112.9L119.7 119.6L121.6 125.3L123.5 129.9L125.4 133.3L127.3 135.3L129.1 136L131 135.3L132.9 133.3L134.8 129.9L136.7 125.3L138.6 119.6L140.5 112.9L142.3 105.4L144.2 97.3L146.1 88.8L148 80L149.9 71.2L151.8 62.7L153.7 54.6L155.5 47.1L157.4 40.4L159.3 34.7L161.2 30.1L163.1 26.7L165 24.7L166.9 24L168.7 24.7L170.6 26.7L172.5 30.1L174.4 34.7L176.3 40.4L178.2 47.1L180.1 54.6L181.9 62.7L183.8 71.2L185.7 80L187.6 88.8L189.5 97.3L191.4 105.4L193.3 112.9L195.1 119.6L197 125.3L198.9 129.9L200.8 133.3L202.7 135.3L204.6 136L206.5 135.3L208.3 133.3L210.2 129.9L212.1 125.3L214 119.6L215.9 112.9L217.8 105.4L219.7 97.3L221.5 88.8L223.4 80L225.3 71.2L227.2 62.7L229.1 54.6L231 47.1L232.9 40.4L234.7 34.7L236.6 30.1L238.5 26.7L240.4 24.7L242.3 24L244.2 24.7L246.1 26.7L247.9 30.1L249.8 34.7L251.7 40.4L253.6 47.1L255.5 54.6L257.4 62.7L259.3 71.2L261.1 80L263 88.8L264.9 97.3L266.8 105.4L268.7 112.9L270.6 119.6L272.5 125.3L274.3 129.9L276.2 133.3L278.1 135.3L280 136L281.9 135.3L283.8 133.3L285.7 129.9L287.5 125.3L289.4 119.6L291.3 112.9L293.2 105.4L295.1 97.3L297 88.8L298.9 80L300.7 71.2L302.6 62.7L304.5 54.6L306.4 47.1L308.3 40.4L310.2 34.7L312.1 30.1L313.9 26.7L315.8 24.7L317.7 24L319.6 24.7L321.5 26.7L323.4 30.1L325.3 34.7L327.1 40.4L329 47.1L330.9 54.6L332.8 62.7L334.7 71.2L336.6 80L338.5 88.8L340.3 97.3L342.2 105.4L344.1 112.9L346 119.6L347.9 125.3L349.8 129.9L351.7 133.3L353.5 135.3L355.4 136L357.3 135.3L359.2 133.3L361.1 129.9L363 125.3L364.9 119.6L366.7 112.9L368.6 105.4L370.5 97.3L372.4 88.8L374.3 80L376.2 71.2L378.1 62.7L379.9 54.6L381.8 47.1L383.7 40.4L385.6 34.7L387.5 30.1L389.4 26.7L391.3 24.7L393.1 24L395 24.7L396.9 26.7L398.8 30.1L400.7 34.7L402.6 40.4L404.5 47.1L406.3 54.6L408.2 62.7L410.1 71.2L412 80L413.9 88.8L415.8 97.3L417.7 105.4L419.5 112.9L421.4 119.6L423.3 125.3L425.2 129.9L427.1 133.3L429 135.3L430.9 136L432.7 135.3L434.6 133.3L436.5 129.9L438.4 125.3L440.3 119.6L442.2 112.9L444.1 105.4L445.9 97.3L447.8 88.8L449.7 80L451.6 71.2L453.5 62.7L455.4 54.6L457.3 47.1L459.1 40.4L461 34.7L462.9 30.1L464.8 26.7L466.7 24.7L468.6 24L470.5 24.7L472.3 26.7L474.2 30.1L476.1 34.7L478 40.4L479.9 47.1L481.8 54.6L483.7 62.7L485.5 71.2L487.4 80L489.3 88.8L491.2 97.3L493.1 105.4L495 112.9L496.9 119.6L498.7 125.3L500.6 129.9L502.5 133.3L504.4 135.3L506.3 136L508.2 135.3L510.1 133.3L511.9 129.9L513.8 125.3L515.7 119.6L517.6 112.9L519.5 105.4L521.4 97.3L523.3 88.8L525.1 80L527 71.2L528.9 62.7L530.8 54.6L532.7 47.1L534.6 40.4L536.5 34.7L538.3 30.1L540.2 26.7L542.1 24.7L544 24"/><path class="ink" d="M16 24L17.9 24L19.8 24.1L21.7 24.1L23.5 24.2L25.4 24.4L27.3 24.5L29.2 24.7L31.1 24.9L33 25.1L34.9 25.4L36.7 25.7L38.6 26L40.5 26.4L42.4 26.7L44.3 27.1L46.2 27.6L48.1 28L49.9 28.5L51.8 29L53.7 29.5L55.6 30.1L57.5 30.7L59.4 31.3L61.3 31.9L63.1 32.6L65 33.3L66.9 34L68.8 34.7L70.7 35.4L72.6 36.2L74.5 37L76.3 37.8L78.2 38.7L80.1 39.5L82 40.4L83.9 41.3L85.8 42.2L87.7 43.2L89.5 44.1L91.4 45.1L93.3 46.1L95.2 47.1L97.1 48.1L99 49.1L100.9 50.2L102.7 51.3L104.6 52.4L106.5 53.5L108.4 54.6L110.3 55.7L112.2 56.8L114.1 58L115.9 59.2L117.8 60.3L119.7 61.5L121.6 62.7L123.5 63.9L125.4 65.1L127.3 66.3L129.1 67.5L131 68.8L132.9 70L134.8 71.2L136.7 72.5L138.6 73.7L140.5 75L142.3 76.2L144.2 77.5L146.1 78.7L148 80L149.9 81.3L151.8 82.5L153.7 83.8L155.5 85L157.4 86.3L159.3 87.5L161.2 88.8L163.1 90L165 91.2L166.9 92.5L168.7 93.7L170.6 94.9L172.5 96.1L174.4 97.3L176.3 98.5L178.2 99.7L180.1 100.8L181.9 102L183.8 103.2L185.7 104.3L187.6 105.4L189.5 106.5L191.4 107.6L193.3 108.7L195.1 109.8L197 110.9L198.9 111.9L200.8 112.9L202.7 113.9L204.6 114.9L206.5 115.9L208.3 116.8L210.2 117.8L212.1 118.7L214 119.6L215.9 120.5L217.8 121.3L219.7 122.2L221.5 123L223.4 123.8L225.3 124.6L227.2 125.3L229.1 126L231 126.7L232.9 127.4L234.7 128.1L236.6 128.7L238.5 129.3L240.4 129.9L242.3 130.5L244.2 131L246.1 131.5L247.9 132L249.8 132.4L251.7 132.9L253.6 133.3L255.5 133.6L257.4 134L259.3 134.3L261.1 134.6L263 134.9L264.9 135.1L266.8 135.3L268.7 135.5L270.6 135.6L272.5 135.8L274.3 135.9L276.2 135.9L278.1 136L280 136L281.9 136L283.8 135.9L285.7 135.9L287.5 135.8L289.4 135.6L291.3 135.5L293.2 135.3L295.1 135.1L297 134.9L298.9 134.6L300.7 134.3L302.6 134L304.5 133.6L306.4 133.3L308.3 132.9L310.2 132.4L312.1 132L313.9 131.5L315.8 131L317.7 130.5L319.6 129.9L321.5 129.3L323.4 128.7L325.3 128.1L327.1 127.4L329 126.7L330.9 126L332.8 125.3L334.7 124.6L336.6 123.8L338.5 123L340.3 122.2L342.2 121.3L344.1 120.5L346 119.6L347.9 118.7L349.8 117.8L351.7 116.8L353.5 115.9L355.4 114.9L357.3 113.9L359.2 112.9L361.1 111.9L363 110.9L364.9 109.8L366.7 108.7L368.6 107.6L370.5 106.5L372.4 105.4L374.3 104.3L376.2 103.2L378.1 102L379.9 100.8L381.8 99.7L383.7 98.5L385.6 97.3L387.5 96.1L389.4 94.9L391.3 93.7L393.1 92.5L395 91.2L396.9 90L398.8 88.8L400.7 87.5L402.6 86.3L404.5 85L406.3 83.8L408.2 82.5L410.1 81.3L412 80L413.9 78.7L415.8 77.5L417.7 76.2L419.5 75L421.4 73.7L423.3 72.5L425.2 71.2L427.1 70L429 68.8L430.9 67.5L432.7 66.3L434.6 65.1L436.5 63.9L438.4 62.7L440.3 61.5L442.2 60.3L444.1 59.2L445.9 58L447.8 56.8L449.7 55.7L451.6 54.6L453.5 53.5L455.4 52.4L457.3 51.3L459.1 50.2L461 49.1L462.9 48.1L464.8 47.1L466.7 46.1L468.6 45.1L470.5 44.1L472.3 43.2L474.2 42.2L476.1 41.3L478 40.4L479.9 39.5L481.8 38.7L483.7 37.8L485.5 37L487.4 36.2L489.3 35.4L491.2 34.7L493.1 34L495 33.3L496.9 32.6L498.7 31.9L500.6 31.3L502.5 30.7L504.4 30.1L506.3 29.5L508.2 29L510.1 28.5L511.9 28L513.8 27.6L515.7 27.1L517.6 26.7L519.5 26.4L521.4 26L523.3 25.7L525.1 25.4L527 25.1L528.9 24.9L530.8 24.7L532.7 24.5L534.6 24.4L536.5 24.2L538.3 24.1L540.2 24.1L542.1 24L544 24"/><circle class="dot" cx="16" cy="24" r="4.5"/><circle class="dot" cx="82" cy="40.4" r="4.5"/><circle class="dot" cx="148" cy="80" r="4.5"/><circle class="dot" cx="214" cy="119.6" r="4.5"/><circle class="dot" cx="280" cy="136" r="4.5"/><circle class="dot" cx="346" cy="119.6" r="4.5"/><circle class="dot" cx="412" cy="80" r="4.5"/><circle class="dot" cx="478" cy="40.4" r="4.5"/><circle class="dot" cx="544" cy="24" r="4.5"/></svg>
<figcaption>Figure 7. Sampled 8 times per cycle (dots; the ninth repeats the first), a wave turning 7 times per cycle (grey) and one turning once backwards (green) take identical values. The samples cannot distinguish them, and the site uses the lower frequency.</figcaption>
</figure>

The samples therefore determine each coefficient $X_k$, but not which of the frequencies $k + mN$
it belongs to. Every choice gives a curve through all $N$ samples, and the choices differ only in
how the curve behaves between samples. The site chooses for each $k$ the frequency of smallest
magnitude, so that the frequencies run from $-399$ to $400$ rather than from 0 to 799. This choice
can be justified precisely: of all curves of this form through the samples, it is the one along
which the pen moves with the least mean squared speed.

<aside class="margin-note">

<b>Proof</b> Differentiating term by term and applying Parseval's identity to $z'$,

$$
\int_0^1 |z'(t)|^2\, dt = 4\pi^2 \sum_k k^2\, |X_k|^2
$$

where each $k$ stands for the chosen frequency. Each term depends on one choice only, so the sum is
smallest when every frequency is as small in magnitude as possible.

</aside>

Any other choice adds circling between the samples. The ink is unaffected, because the site draws
straight segments between the pen's positions at the 800 sample times, but the circles are animated
continuously, and with faster frequencies they would visibly spin. For $k = N/2 = 400$ the
candidates $400$ and $-400$ are equally slow, and the code takes $400$. A circle of frequency 400
makes one turn for every two samples, the fastest motion that equally spaced samples can represent.
This is the Nyquist limit.<span class="margin-note"><b>The sampling theorem</b> The same limit governs all sampling: a signal that contains no frequency of half the sampling rate or more is determined by its equally spaced samples. It is associated with Harry Nyquist (1928) and Claude Shannon (1949).</span>

### Parametrisation by arc length

The DFT treats the samples as equally spaced in time, so the time parameter of the curve has to be
chosen before the curve is sampled. A curve does not come with a parametrisation. The same set of
points can be traced quickly in some places and slowly in others, and each way of tracing it gives
a different function $z(t)$ with different Fourier coefficients. The preparation script places the
800 samples at equal distances along the curve, which amounts to tracing it at constant speed. This
is called parametrisation by arc length.

The choice is optimal in a sense that again follows from Parseval's identity. The sum
$\sum_k k^2 |c_k|^2$ weights each squared radius by the square of its frequency, so it measures how
much of the curve is carried by fast circles. Among all ways of tracing a given curve, constant
speed makes this sum as small as possible. Equal spacing has a second advantage: it allocates the
samples in proportion to length, so that no part of the curve is represented more coarsely than
another.

<aside class="margin-note">

<b>Proof</b> Let the curve have length $L$. For any parametrisation on $0 \le t \le 1$, the
Cauchy–Schwarz inequality gives

$$
\begin{aligned}
L^2 = \Big(\int_0^1 |z'|\, dt\Big)^2 &\le \int_0^1 |z'|^2\, dt \\
&= 4\pi^2 \sum_k k^2 |c_k|^2
\end{aligned}
$$

with equality exactly when the speed $|z'(t)|$ is constant.

</aside>

### Implementation

<!-- The transform in `src/lib/fourier.ts`, which the Fourier Sketch on the Fun page also uses, follows
the definition directly: -->
The transform in `src/lib/fourier.ts` follows
the definition directly:

```ts
/** X_k = (1/N) Σ z_n e^(−2πikn/N), reported with signed frequencies in (−N/2, N/2]. */
export function dft(points: Point[]): Coefficient[] {
  const n = points.length;
  const coefficients: Coefficient[] = [];
  for (let k = 0; k < n; k++) {
    let re = 0;
    let im = 0;
    for (let j = 0; j < n; j++) {
      const angle = (-2 * Math.PI * k * j) / n;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      re += points[j].x * cos - points[j].y * sin;
      im += points[j].x * sin + points[j].y * cos;
    }
    re /= n;
    im /= n;
    coefficients.push({
      frequency: k <= n / 2 ? k : k - n,
      re,
      im,
      amplitude: Math.hypot(re, im),
      phase: Math.atan2(im, re),
    });
  }
  return coefficients;
}
```

The two lines in the inner loop compute the complex product of $z_j = x + iy$ and
$e^{-2\pi i k j/N} = \cos a + i\sin a$ in real arithmetic. The `frequency` field implements the
choice of smallest magnitude described above, and `amplitude` and `phase` are the radius $|X_k|$
and starting angle $\arg X_k$ used by `chainAt`. The two nested loops perform $N^2 = 640{,}000$
complex multiplications, which take about 40 milliseconds. This happens once per photo, when its
curve is loaded.<span class="margin-note"><b>The product</b> $(x + iy)(\cos a + i\sin a)$ has real part $x\cos a - y\sin a$ and imaginary part $x\sin a + y\cos a$, the two expressions accumulated in `re` and `im`.</span>

## The fast Fourier transform

Computed directly from its definition, the DFT requires $N^2$ complex multiplications. For 800
samples this is acceptable, but for a second of audio (44,100 samples) or an image with millions
of pixels it is not. The fast Fourier transform (FFT) computes exactly the same numbers with a
number of operations proportional to $N \log_2 N$.<span class="margin-note"><b>History</b> The algorithm is usually attributed to James Cooley and John Tukey, who published it in 1965. Gauss had used the same idea around 1805 to interpolate the orbits of asteroids, in work published only after his death.</span>

### The radix-2 algorithm

Omit the factor $\frac{1}{N}$, which can be applied at the end, write $w_N = e^{-2\pi i/N}$, and
suppose that $N$ is even. The transform is

$$
F_k = \sum_{n=0}^{N-1} z_n\, w_N^{k n}
$$

Separate the even-numbered samples, $n = 2m$, from the odd-numbered ones, $n = 2m + 1$:

$$
F_k = \sum_{m=0}^{N/2-1} z_{2m}\, w_N^{2mk} \;+\; w_N^{k} \sum_{m=0}^{N/2-1} z_{2m+1}\, w_N^{2mk}
$$

Since $w_N^2 = w_{N/2}$ (two $N$-ths of a turn make one $\frac{N}{2}$-th), each of the two sums is
itself a DFT of length $N/2$:

$$
F_k = E_k + w_N^{k}\, O_k
$$

where $E$ is the DFT of the even-numbered samples and $O$ that of the odd-numbered ones. Two
further observations halve the remaining work. $E_k$ and $O_k$ are periodic in $k$ with period
$N/2$, and $w_N^{k + N/2} = -w_N^{k}$, because a further half turn reverses direction. Each pair of
outputs therefore needs only one multiplication:

$$
\begin{aligned}
F_k &= E_k + w_N^{k} O_k \\
F_{k + N/2} &= E_k - w_N^{k} O_k
\end{aligned}
\qquad k = 0, \dots, \tfrac{N}{2} - 1
$$

This pair of formulas is called a butterfly. When $N$ is a power of 2, the same splitting can be
applied to $E$ and $O$, and repeated until each piece contains a single sample, whose DFT is the
sample itself. There are $\log_2 N$ levels of splitting, and the butterflies at each level cost a
fixed multiple of $N$ operations, so the total is proportional to
$N \log_2 N$.<span class="margin-note"><b>The count</b> Let $T(N)$ be the cost of a transform of length $N$. Then $T(N) = 2T(N/2) + cN$ and $T(1) = 0$. At depth $\ell$ there are $2^\ell$ transforms of length $N/2^\ell$, whose butterflies cost $cN$ in all, and there are $\log_2 N$ levels, so $T(N) = cN \log_2 N$.</span>

| Samples $N$ | Direct DFT, $N^2$ | FFT, $N \log_2 N$ |
| --- | --- | --- |
| 800 | 640,000 | about 7,700 |
| 1,024 | 1,048,576 | 10,240 |
| 1,048,576 | about $1.1 \times 10^{12}$ | about $2.1 \times 10^{7}$ |

### Implementation

A direct transcription into TypeScript, for $N$ a power of two:

```ts
type Complex = { re: number; im: number };

/** F_k = Σ z_n e^(−2πikn/N) for every k, in N log₂ N steps. N must be a power of 2. */
function fft(z: Complex[]): Complex[] {
  const n = z.length;
  if (n === 1) return [z[0]];
  const even = fft(z.filter((_, j) => j % 2 === 0));
  const odd = fft(z.filter((_, j) => j % 2 === 1));
  const out = new Array<Complex>(n);
  for (let k = 0; k < n / 2; k++) {
    const angle = (-2 * Math.PI * k) / n;
    const w = { re: Math.cos(angle), im: Math.sin(angle) }; // w_N^k
    const t = {
      re: w.re * odd[k].re - w.im * odd[k].im, // w_N^k × O_k
      im: w.re * odd[k].im + w.im * odd[k].re,
    };
    out[k] = { re: even[k].re + t.re, im: even[k].im + t.im };
    out[k + n / 2] = { re: even[k].re - t.re, im: even[k].im - t.im };
  }
  return out;
}
```

To use it in place of `dft`, divide each output by $N$ and convert indices above $N/2$ to negative
frequencies. On the parrot's curve resampled to 1,024 points, the direct DFT took 74 ms and this
FFT 2.3 ms, and the two agreed to within $5 \times 10^{-14}$, which is consistent with rounding
error in double-precision arithmetic.

The site nevertheless uses the direct method. The radix-2 algorithm requires $N$ to be a power of
two, and $800 = 2^5 \times 5^2$ is not. But the direct transform takes about 40 ms once per photo,
which is imperceptible, and its code is short enough to verify by inspection. The FFT becomes
necessary when $N$ is large or when the transform must be repeated for every
frame.<span class="margin-note"><b>Other lengths</b> The splitting is not limited to halves. If $N = N_1 N_2$, a transform of length $N$ can be computed from transforms of lengths $N_1$ and $N_2$, so 800 points could be handled by splitting into twos and fives. Sampling 1,024 points instead would also work.</span>

## Keeping 300 of the 800 circles

The 800 circles given by the DFT pass exactly through the 800 samples. The site keeps only 300 of
them: the centre, and the 299 largest of the rest.

```ts
/** The circles that draw `path`: the centre (frequency 0) first, then the `terms − 1` largest. */
export function traceCircles(path: Point[], terms: number): Coefficient[] {
  const all = dft(path);
  const centre = all.find((c) => c.frequency === 0)!;
  const rest = all.filter((c) => c.frequency !== 0).sort((a, b) => b.amplitude - a.amplitude);
  return [centre, ...rest.slice(0, Math.max(0, terms - 1))];
}
```

### Parseval's identity and optimal truncation

The discrete form of Parseval's identity follows from discrete orthogonality just as the continuous
form does:

$$
\frac{1}{N} \sum_{n=0}^{N-1} |z_n|^2 = \sum_{k} |X_k|^2
$$

<aside class="margin-note">

<b>Proof</b> Write $|z_n|^2 = z_n \overline{z_n}$, expand both factors by the inverse DFT and
exchange the order of summation:

$$
\frac{1}{N} \sum_{n} |z_n|^2 = \sum_{j, k} X_j \overline{X_k}\; \frac{1}{N} \sum_{n} \omega^{(j - k) n}
$$

The inner average is 1 when $j = k$ and 0 otherwise, leaving $\sum_k |X_k|^2$.

</aside>

Now let $\hat z_n$ be the points drawn by a subset of the circles, and let $D$ be the set of
circles omitted. The error $z_n - \hat z_n = \sum_{k \in D} X_k\, \omega^{kn}$ is itself the inverse
DFT of the omitted coefficients, so Parseval's identity applies to it:

$$
\frac{1}{N} \sum_{n=0}^{N-1} \big|z_n - \hat z_n\big|^2 = \sum_{k \in D} |X_k|^2
$$

The mean squared error equals the sum of the squared radii of the omitted circles. To make it as
small as possible with a fixed number of circles, one must omit the smallest. The centre $X_0$ is
always kept, since omitting it would translate the whole drawing, and among the remaining 799
circles the choice of the 299 largest is therefore optimal. The error is measured at the sample
times, which are exactly the points through which the site draws the curve.

Across the eleven photos on the site, 300 circles leave a root-mean-square error between 0.06% and
0.42% of the photo's height. On the largest plate the strip shows, 480 pixels tall, this is between
0.3 and 2 pixels. Reconstructing the parrot directly and measuring the error gave the same value as
the formula.

### How many circles are needed

The number of circles needed depends on how quickly the radii decrease, which was discussed in the
section on smoothness. The curve produced by the preparation script is continuous, because its
strokes are joined by straight segments (step 7 below), but it has corners at the joins and along
the pixel staircase of each stroke. The integration-by-parts argument therefore predicts radii
decreasing like $1/k^2$, and this is approximately what is observed. On the parrot, each doubling
of the frequency divides the typical radius by about 3.5, compared with 4 for exact $1/k^2$ decay.
The 300 largest circles have frequencies up to about 250, and the omitted circles move the pen by
less than a pixel.

<figure class="fig">
<div class="fig__panels" style="--panel: 14rem">
<div class="fig__panel"><svg viewBox="0 0 450 300" role="img" aria-label="The parrot drawing made by the 10 largest circles."><path class="ink" d="M130 98L132 101L134 104L136 107L138 109L140 112L142 115L144 118L145 120L147 123L149 126L151 128L152 130L154 133L156 135L158 137L159 139L161 141L163 143L164 145L166 147L168 149L170 151L171 152L173 154L175 156L176 157L178 158L180 160L182 161L183 162L185 164L187 165L189 166L190 167L192 169L194 170L195 171L197 172L198 173L200 174L201 175L203 176L204 177L205 178L206 179L208 181L209 182L210 183L210 184L211 185L212 186L213 187L213 188L213 189L214 191L214 192L214 193M213 198L212 199L211 200L210 202L209 203L208 203L207 204L206 205L204 206L203 207L201 208L199 209L198 209M190 212L188 212L185 213L183 213L181 213L179 214L177 214L174 214L172 214L170 214L168 214L166 214L164 214L162 214M158 214L156 214L154 214L152 213L151 213L149 213L148 213L147 213L145 213L144 213L143 212L143 212L142 212L141 212L141 213L140 213L140 213L140 213L140 213L140 214L141 214M144 218L145 219L146 220L147 221L148 222L149 223L151 225L152 226L153 228L155 229M158 233L160 235L162 237L163 238L165 240L167 242L169 245L170 247L172 249L174 251L176 253L177 255L179 257L181 259L182 261L184 263L186 265L187 267L189 269L190 271L192 273M226 279L227 278L229 277L231 275L233 273L234 272L236 270L238 268L240 266L242 264L244 262L247 261L249 259L251 257L253 255L256 253L258 251L261 249L263 247L266 245L268 243M273 240L276 238L278 237L281 235L283 234L286 233L288 232L291 231L293 230L295 229L298 229L300 228M304 227L306 227L308 227L309 227L311 227L312 227L314 228L315 228L316 228L317 229L318 230L319 230L319 231L320 232M319 237L319 238L318 239L318 240L317 241L316 242L315 243L313 244L312 245L310 246L309 247L307 248L305 248L304 249L302 249L300 250L298 250M291 250L289 250L287 250L285 250L283 249L280 249L278 248L276 247L274 246L272 245L270 244L269 243M257 228L256 226L255 224L255 221L254 219L254 217L253 214L253 212L253 209L253 206L253 204L253 201L254 198L254 196L255 193L255 190L256 187L257 185L258 182L259 179L260 177L261 174L262 171L263 169L265 166L266 164L267 161L268 159L270 156L271 154L272 151L274 149L275 146L276 144M286 124L287 122L287 120L288 118L288 116L289 114L289 112L290 110L290 108M290 105L290 103L290 101L290 99L290 97L290 95L290 93L290 91L289 89L289 86L289 84M287 76L286 74L285 72L285 70L284 68L283 66L283 64L282 62L282 61L281 59L280 57M276 47L275 46L275 45L274 45L274 44L273 44L273 43L272 43L272 43L272 44L271 44L271 44M262 87L261 90L260 93L260 96L259 99L258 102L258 105L257 108L256 111L256 114L255 117L254 120L254 123L253 126L253 128L252 131L252 134L251 136L251 139L250 141L250 143L250 145L250 147L250 149L250 151L250 153L251 155L251 156L251 158L252 159L253 161L254 162L255 163L256 164L257 165L259 166L261 166L262 167L264 168L266 168L269 169L271 169M288 172L292 172L295 173L299 173L302 174L306 174L310 175L314 175L318 176L322 177L326 177L330 178L335 179L339 180L343 181L347 182L351 183L356 184L360 186L364 187L368 189L372 190L376 192L380 194L384 195L388 197L391 199M398 203L401 205L404 208L407 210L410 212L413 215L415 217L418 219L420 222L422 224L424 226L425 229M431 241L432 243L432 245L433 247L433 249L433 251L433 253L432 255L432 257L432 258L431 260L430 262L430 263L429 264L428 265L427 266L426 267L425 268L424 269L423 270L421 270L420 271M419 271L418 271L417 272L416 272L414 272L413 272L412 272L411 271L410 271L410 271L409 270L408 270L407 269L407 269L406 268L406 267L406 267L405 266L405 265L405 265L405 264L405 263L406 263L406 262L406 261L407 261L407 260L408 259L408 259L409 258L410 258L411 257L412 257L412 256L413 256L414 255L415 255L416 255L417 254L418 254L419 254L420 253L421 253L422 253L423 252L424 252L425 252L425 251L426 251L427 251L427 250L428 250L428 249L429 249L429 248M430 246L430 245L430 244L430 243L430 242L430 241L429 240L429 238L429 237L428 235L427 234L427 232L426 230L425 228L425 226L424 223L423 221L422 218L421 216L420 213L419 210L418 207L417 204M390 130L389 126L388 123L386 119L385 116L383 113L382 110L380 107L379 104L377 101L376 98M207 78L204 79L201 79L199 80L196 80L194 81L192 82L190 82L188 83L186 84L184 85L182 86L181 86L179 87L178 88L176 89L175 91M149 131L147 132L146 134L144 136L142 137L140 138L138 140L136 141L133 142L131 143L128 144L126 145L123 145L120 146L118 146L115 147L112 147M34 87L33 84L32 81L32 78L31 75L31 72L31 69L31 66L31 64L31 61L32 58L33 56L34 54L35 52L36 50L37 48L38 46L40 44L42 43L43 42M128 95L130 98"/></svg><span class="fig__label">10 circles</span></div>
<div class="fig__panel"><svg viewBox="0 0 450 300" role="img" aria-label="The parrot drawing made by the 30 largest circles."><path class="ink" d="M170 128L171 132L173 135L174 139L174 142L175 145L174 148L174 151L173 153L172 155L171 157L170 159L168 160L167 161L166 161L164 162L163 162L162 162L161 161L160 161L160 160L160 159L160 158L160 156L161 155L162 153L164 152L165 150L167 149L170 147L172 146L175 144L177 143L180 142L183 141L185 140L188 139L190 139L192 139L194 139L196 139L197 139L198 140L199 141L199 142L199 143L199 145L198 146L197 148L196 150L194 153L193 155L191 158L189 160L187 163L184 166L182 168L180 171M173 185L172 188L171 190L170 193L170 196L170 198L170 201L171 203L171 206L172 208L172 211L173 213L174 216M176 227L176 230L177 232L177 235L177 238L176 241L176 244L175 247L175 249L174 252L173 254L172 256L171 258L170 259M168 261L167 261L166 261L165 260L164 259L163 258L163 255L162 253L162 250L162 246L162 242L161 238L161 234L161 229L161 224L161 220L161 215L162 210L161 206L161 201L161 197M159 185L158 184L157 184L156 185L155 186L154 188L153 190L152 193L151 197L151 201M149 210L148 215L148 220L147 226L147 231L147 237L147 242L147 247L148 252L148 256L149 260L150 264L151 268L153 271L154 274L156 276L158 278L160 279L162 280L164 281L167 282M261 269L264 266L266 264L269 261L270 258L272 255L273 251L274 248L275 244L275 240L275 236L275 232L274 228L273 224L273 220L272 217L271 214L270 211L269 208L268 205L268 203M267 200L267 199L268 199L268 199L270 199L271 199L273 200L275 202L277 203L280 205L283 207L286 209M293 213L297 216L300 218L304 221L307 223L310 226L313 228L316 231L319 234L321 236L323 239L324 241L325 243L326 246M324 258L323 261L321 263L320 266L318 268L316 271L314 273L311 275L309 277L307 279L305 281L303 283L301 284L300 285L298 286L297 287L295 287M292 286L291 286L291 284L290 283L289 281L288 279L288 277L287 274L286 271L286 268L285 265L284 262M274 237L273 234L272 231L271 228L269 225L268 222L267 219L266 217L265 214L264 211L263 208L263 205L262 202L262 198L261 195L261 191L261 188L261 184L260 180L260 176L260 171L260 167L260 163L260 158L260 154L260 149L260 145L260 141L260 137L259 133L259 129L259 126L259 123L260 120M264 110L265 110L266 111L267 112L269 113L270 113L271 114L273 115L274 116M276 117L277 117L279 118L280 118L281 118L283 118L284 117L285 116L286 115L287 114L288 112M291 103L291 100L292 96L292 93L293 90L293 86L294 83L294 79L294 75L295 72L295 68M298 45L298 43L297 41L297 39L296 38L295 37L294 36L293 35L291 35L289 35L287 35L285 35M219 67L219 69L218 71L218 73L218 76L219 78L220 81L221 84L222 87L224 90L225 94L227 97L229 101L231 105L233 109L235 113L237 117L239 122L241 126L243 131L245 135L247 140L249 144L251 149L253 153L254 157L256 161L258 165L259 169L261 172L263 175L264 178L266 180L267 183L269 185L270 186L272 187L274 188L275 189L277 190L279 190L281 190M295 187L297 186L300 186L303 185L306 185L310 184L313 184L317 183L320 183L324 183L328 183L332 183L336 183L340 184L345 184L349 184L353 184L358 185L362 185L367 185L371 185L375 186L380 186L384 186L388 186L392 186L395 186M402 187L405 187L408 187L411 188L414 188L416 189L419 190L421 192L423 193L425 195L426 197L428 199M435 215L436 218L437 222L438 226L440 231L441 235L442 239L443 243L444 247L445 251L446 255L446 258L447 262L448 265L448 267L449 270L449 272L449 274L449 276L448 277L448 278L447 279M446 279L445 279L444 279L443 279L441 279L440 279L438 278L437 278L435 277L433 277L432 276L430 276L429 275L428 275L427 274L426 274L425 274L424 273L424 273L423 272L423 272L423 272L423 271L423 270L423 270L423 269L423 268L424 267L424 266L424 265L423 263L423 262L423 261L422 259L422 258L421 257L420 255L419 254L417 253L416 252L414 251L412 251L411 251L409 250L407 251L405 251L403 252L402 252L400 253L399 255L397 256L396 258L395 259L394 261L394 262M393 267L392 268L393 268L393 269L393 269L393 269L393 268L394 267L394 265L394 263L394 261L394 258L394 254L394 250L393 246L393 242L392 237L392 232L391 227L391 221L390 216L390 210L389 204M423 123L425 121L426 119L427 117L428 115L428 113L427 112L426 110L424 109L422 107L419 106M181 51L179 51L177 51L175 51L174 51L173 51L172 51L172 51L172 52L172 52L172 53L172 54L172 55L172 56L172 58L171 60L171 62M135 148L135 149L135 151L135 152L136 152L136 153L137 153L137 153L137 153L138 153L138 152L139 152L139 151L139 151L138 150L138 149L137 149M34 69L32 64L29 61L27 57L25 54L23 50L21 48L20 45L19 43L18 41L18 40L18 39L18 38L19 38L19 37L20 38L21 38L23 39L24 39L26 40M168 124L170 128"/></svg><span class="fig__label">30 circles</span></div>
<div class="fig__panel"><svg viewBox="0 0 450 300" role="img" aria-label="The parrot drawing made by the 100 largest circles."><path class="ink" d="M167 117L169 121L171 124L173 128L175 132L176 137L177 141L177 145L176 150L174 154L172 159L170 163L167 168L164 172L162 176L160 179L158 181L158 181L158 181L159 179L161 177L164 174L167 170L170 167L174 165L177 162L179 160L181 158L182 154L183 150L182 145L182 140L181 134L181 128L181 122L183 118L185 116L188 115L192 116L196 118L200 121L204 124L206 128L207 132L207 136L206 141L204 145L201 150L199 154L197 158L195 161L193 163L192 164L191 164L189 164L187 163L185 163L182 164M171 182L172 186L173 189L174 192L175 194L175 197L175 200L174 204L173 209L172 213L170 217L170 221L169 223M174 220L175 219L176 219L176 220L175 223L175 227L174 232L173 238L171 244L170 250L169 256L168 260L166 264L164 267M160 269L158 268L156 266L155 263L154 260L153 255L154 251L154 246L155 242L156 237L158 233L159 229L160 225L162 221L163 216L165 212L167 208L168 204L170 200L170 197L170 194M160 189L157 189L155 191L153 193L152 197L151 200L151 204L151 207L151 210L151 212M151 215L150 215L150 217L150 218L149 221L149 224L149 228L148 233L148 238L147 243L146 248L146 253L146 258L146 263L146 268L147 273L148 278L150 283L151 286L153 289L155 292M264 274L267 271L271 268L274 264L276 260L278 256L279 252L279 248L279 244L280 239L280 235L280 230L281 226L282 222L283 217L284 213L284 209L284 204L282 199L280 195L277 191M271 186L269 186L268 188L268 191L269 195L271 199L272 204L274 209L276 214L277 218L279 221L281 224M286 228L289 229L294 231L298 232L303 233L308 234L312 235L317 236L321 237L324 239L327 242L330 244L332 247L333 251M332 265L330 267L328 268L325 270L323 271L319 271L316 271L312 270L307 268L303 267L298 265L294 263L290 262L287 262L285 263L284 264L284 265M288 272L290 275L292 277L294 279L296 281L298 283L300 284L302 284L303 283L303 281L303 278L302 274M275 244L273 240L273 236L272 231L272 226L272 222L272 217L271 213L269 209L268 206L266 202L265 198L263 194L262 189L262 184L262 178L262 172L262 167L262 162L262 158L261 155L259 153L257 150L254 148L251 144L248 141L245 137L242 133L240 129L238 126L237 123L236 122L236 121L237 120M268 119L271 120L273 122L276 123L278 125L281 126L284 127L288 127L292 127M295 126L297 125L298 123L297 121L295 119L292 116L289 113L286 110L283 106L282 102L281 99M280 87L279 85L278 84L276 83L275 83L275 82L276 82L278 81L281 80L284 78L287 76M295 49L298 47L302 46L306 44L309 43L311 41L311 39L309 37L305 34L301 33L296 32L292 32M198 74L198 76L199 79L201 81L205 84L209 86L214 88L218 90L223 92L227 94L231 96L234 98L238 101L241 104L244 107L246 111L248 115L250 119L251 123L253 127L254 131L256 135L258 138L260 142L262 146L264 150L266 154L268 158L269 162L271 166L272 171L274 175L276 179L279 183L282 187L285 190L287 193L289 196L291 199L291 200L291 202L290 202M285 185L287 182L289 179L292 178L296 177L300 177L305 179L310 180L315 181L320 182L325 183L329 183L333 182L337 181L341 180L346 180L351 180L356 181L361 183L366 185L371 187L375 188L380 190L383 191L387 191L390 191L393 190M399 189L402 188L405 188L408 187L412 186L416 185L421 184L425 184L431 184L436 184L440 186L444 188M447 207L446 211L445 216L444 220L444 225L444 230L444 234L445 238L445 243L445 247L445 251L444 255L443 258L442 262L442 267L442 271L443 276L443 281L444 286L444 290L443 293L441 295M439 295L437 294L436 291L434 287L433 282L433 277L433 271L433 266L432 262L431 258L429 254L428 251L426 249L424 248L423 248L423 249L424 251L424 255L425 260L426 267L426 273L425 280L424 286L422 291L421 294L419 295L418 295L417 293L416 290L416 286L415 282L414 277L413 272L412 267L411 261L410 256L410 250L410 244L410 239L410 235L409 232L408 231L406 231L404 232L402 235L400 238L399 242L399 246L400 250L401 254L402 259L404 264L404 269L404 274L403 278M398 288L397 288L396 287L396 285L396 281L396 277L396 272L396 268L395 264L394 259L393 255L392 251L392 247L393 242L393 237L394 231L394 226L393 221L392 217L390 213L388 210L385 207L384 205M418 117L419 116L419 117L420 118L421 120L423 121L424 121L425 121L425 120L425 117L423 115M178 45L176 47L176 51L176 54L176 58L176 62L176 66L175 69L174 71L172 71L170 69L168 67L167 63L167 58L167 54L167 51L167 49M132 149L132 150L133 150L135 148L137 147L141 145L144 144L147 144L150 146L152 149L153 152L152 156L151 160L149 163L147 164L144 163L141 162M25 81L24 78L23 75L23 71L24 67L26 62L28 58L29 54L31 49L32 45L33 41L33 36L32 33L31 29L30 27L28 26L26 26L25 28L24 30L24 34M165 114L167 117"/></svg><span class="fig__label">100 circles</span></div>
<div class="fig__panel"><svg viewBox="0 0 450 300" role="img" aria-label="The parrot drawing made by the 300 largest circles."><path class="ink" d="M172 115L173 119L173 124L173 129L173 133L173 137L173 142L174 146L176 150L175 154L173 158L171 162L167 165L164 168L161 172L158 176L156 181L156 184L158 185L161 183L163 179L165 175L167 171L170 168L173 166L177 163L181 160L183 156L183 152L182 148L181 143L181 138L181 134L181 130L181 125L182 120L185 116L189 115L193 116L197 118L201 120L204 123L206 127L206 132L206 136L205 141L204 145L202 149L199 152L196 156L196 161L195 166L194 170L191 169L188 165L186 161L183 160L180 162M171 184L171 186L173 187L176 188L177 192L177 197L176 201L175 205L173 209L171 213L169 217L168 222L168 226M175 215L177 214L176 217L175 222L174 227L173 230L172 235L172 240L171 244L169 248L168 252L167 257L166 261L165 265M161 272L159 272L158 269L157 264L156 259L155 255L155 250L156 246L156 241L157 237L156 232L156 227L156 223L158 220L162 217L165 213L166 210L168 205L169 201L171 196L173 192M156 190L155 189L154 189L153 192L152 196L152 201L153 205L154 210L154 215L153 217M151 211L149 208L148 210L148 215L147 221L148 225L148 230L147 234L147 240L147 245L148 249L148 253L147 257L147 262L147 267L148 272L148 276L150 280L150 284L151 289L152 294M266 275L268 272L270 268L272 264L274 261L277 257L278 253L279 248L280 244L281 240L282 236L281 231L280 226L281 222L282 218L283 213L284 208L283 204L282 199L280 196L277 192M270 185L269 184L269 186L271 190L272 195L272 200L273 204L275 208L275 212L276 217L276 221L278 225M285 230L290 231L294 231L299 232L303 233L307 234L312 235L315 236L319 237L323 238L327 240L332 243L335 245L338 248M330 269L330 272L329 271L326 269L322 268L318 270L313 271L309 271L306 269L304 266L301 263L297 261L292 260L287 260L283 261L280 265L281 268M292 272L295 273L295 275L293 279L293 282L296 286L301 287L304 286L307 282L306 278L303 274L299 272M275 244L273 240L273 236L273 231L272 226L272 222L271 218L270 214L269 209L267 205L266 201L265 197L264 192L264 187L264 183L263 178L261 174L261 170L261 165L261 161L260 157L258 153L256 149L253 146L251 143L249 140L247 136L247 132L245 128L243 125L239 123L234 123L231 122L230 121M271 117L272 119L272 123L273 127L277 128L281 127L285 126L289 126L292 126M293 128L295 128L297 125L298 122L297 117L293 114L290 111L287 107L284 104L280 101L277 99M286 85L286 84L283 85L279 87L274 87L272 85L271 82L273 79L277 77L282 76L286 76M297 44L298 42L300 43L304 46L309 47L312 45L311 40L309 36L305 35L301 34L296 32L292 31M197 74L197 76L199 78L203 82L206 86L209 89L213 89L217 90L222 91L227 92L231 93L234 96L237 100L241 104L244 107L246 110L248 114L250 119L252 123L253 127L253 131L255 135L258 139L260 143L261 147L262 151L264 155L267 159L270 163L272 166L275 170L277 174L279 177L281 181L281 185L283 190L285 193L289 196L292 198L293 202L292 205L289 206M283 181L285 178L289 178L294 179L298 180L302 181L306 181L311 181L315 181L319 182L324 183L329 182L333 182L338 181L342 181L347 182L351 183L356 184L360 184L365 185L369 185L374 185L379 185L383 186L387 189L391 192L395 194M399 189L401 187L404 186L408 187L413 187L417 186L422 185L426 185L431 185L436 186L440 187L443 187M446 207L445 211L444 215L444 220L444 224L445 229L446 233L447 238L447 242L446 247L446 252L446 256L444 260L442 264L440 268L440 272L442 275L443 278L445 283L445 287L444 292L441 295M438 297L435 295L433 291L432 287L432 282L433 278L433 273L432 268L432 263L432 259L432 254L431 249L430 245L427 243L424 246L422 250L422 255L422 260L423 264L423 269L424 274L424 278L424 283L424 288L425 293L424 296L421 295L418 292L415 289L413 285L412 280L411 276L411 271L412 266L411 262L410 257L410 252L410 248L410 243L411 238L410 233L409 229L405 227L402 229L401 233L401 237L402 242L402 246L401 251L401 256L402 261L402 265L402 270L403 275L403 277M397 286L395 289L395 289L396 286L397 281L398 276L397 272L395 268L394 264L394 260L393 255L393 250L393 245L393 240L393 236L393 232L393 227L392 223L392 218L392 215L389 212L385 210L382 207M419 115L420 112L419 113L417 116L417 122L420 126L424 126L427 123L427 119L426 114L424 111M178 42L176 44L175 48L176 53L177 57L177 62L178 66L177 71L174 74L170 75L168 71L166 67L166 62L167 58L167 53L167 49L168 46M131 153L129 153L129 150L132 147L136 145L140 144L144 143L148 143L152 143L154 146L154 151L153 156L153 161L151 165L148 165L144 164L140 161M23 81L22 79L24 77L26 72L26 67L27 63L28 59L29 54L29 50L30 45L30 40L32 36L33 32L33 27L32 23L28 22L26 24L25 29L24 34L23 39M169 113L172 115"/></svg><span class="fig__label">300 circles</span></div>
</div>
<figcaption>Figure 8. The parrot’s 800-point curve traced by its 10, 30, 100 and 300 largest circles, with the pen lifted between strokes. Ten circles reproduce the overall extent of the curve but none of its detail.</figcaption>
</figure>

Figure 8 also shows that mean squared error and visual quality are different measures. The 10
largest circles, not counting the centre, account for 95% of the total squared radius, yet the curve
they trace is unrecognisable. Most of that total comes from the large movements between distant
parts of the picture, while the features by which the picture is recognised are carried by many
small circles.

## From a photo to one closed line

All of the above assumes that a closed curve is given. A photo is a rectangular array of colour
values, and the preparation script must decide which curve to extract from it. The preceding
sections impose four requirements.

1. The curve must be closed, since a Fourier series is periodic.
2. It must be continuous. A gap would make the coefficients decrease like $1/k$ instead of $1/k^2$,
   with a Gibbs overshoot at every gap.
3. It should be short. The 800 samples are distributed in proportion to length, so length spent on
   unimportant detail is taken from the important parts.
4. It should follow the lines a person would draw: outlines and strong edges rather than texture or
   noise.

The script has eight steps. Steps 1 to 4 are John Canny's edge detector (1986), adapted to colour
images; steps 5 to 8 convert the edges into a single closed curve. All of its parameters are
collected in one object:

```js
const TRACE = { size: 320, sigma: 1.6, hiPct: 0.82, minHi: 40, loRatio: 0.45, minLen: 24, budget: 2.2, cutoff: 0.35, keepLong: 0.35, samples: 800 };
```

### 1. Reduction and smoothing

```js
sharp(input).rotate().resize(320, 320, { fit: 'inside' }).removeAlpha().blur(1.6).raw();
```

The photo is reduced so that its longer side is 320 pixels. With 800 samples on the final curve,
finer detail could not be represented in any case, and the cost of every later step is proportional
to the number of pixels.

The image is then convolved with a Gaussian kernel of standard deviation $\sigma = 1.6$ pixels,

$$
G_\sigma(x, y) = \frac{1}{2\pi\sigma^2}\, e^{-(x^2 + y^2)/(2\sigma^2)}
$$

The reason is that the next step estimates derivatives, and differentiation amplifies noise. This
is clearest in Fourier terms. In one dimension, differentiating $e^{2\pi i \xi x}$ multiplies it by
$2\pi i \xi$, so a component of spatial frequency $\xi$ (in cycles per pixel) is amplified in
proportion to $\xi$, and the finest grain in the image, such as sensor noise, foliage and
compression artefacts, is amplified most. Convolution with the Gaussian multiplies the same
component by $e^{-2\pi^2 \sigma^2 \xi^2}$, which is close to 1 for small $\xi$ and very small for
large $\xi$.<span class="margin-note"><b>A Gaussian's transform</b> The Fourier transform of a Gaussian is again a Gaussian, and a narrow one in space is wide in frequency: $\sigma$ pixels becomes $1/(2\pi\sigma)$ cycles per pixel. Convolution in space is multiplication in frequency, which is why blurring acts as a factor on each frequency.</span>
Smoothing followed by differentiation therefore multiplies the component of frequency $\xi$ by a
factor of size

$$
2\pi |\xi|\, e^{-2\pi^2 \sigma^2 \xi^2}
$$

which is zero at $\xi = 0$, largest at $\xi = 1/(2\pi\sigma)$, and rapidly decreasing beyond it.
With $\sigma = 1.6$, the strongest response is to variations with a wavelength of
$2\pi\sigma \approx 10$ pixels. A larger $\sigma$ suppresses more noise, but also merges or erases
fine edges.<span class="margin-note"><b>Optimality</b> Canny asked for a detector that finds real edges reliably, marks them close to their true position and responds once to each. For a step edge in white noise, he showed that the derivative of a Gaussian comes close to the best possible operator by these criteria.</span>

### 2. The colour gradient

For a grey image $g$, the gradient $\nabla g = (\partial g/\partial x, \partial g/\partial y)$
points in the direction in which the brightness increases fastest, and its length is the rate of
increase in that direction. At an edge the gradient is large and points across the
edge.<span class="margin-note"><b>Why the gradient</b> The rate of change in the direction of a unit vector $u$ is $\nabla g \cdot u$. By the Cauchy–Schwarz inequality this is at most $|\nabla g|$, with equality when $u$ points along $\nabla g$.</span>

The derivatives are estimated by the Sobel operator, a pair of 3 × 3 kernels:

$$
G_x:\ \begin{bmatrix} -1 & 0 & 1 \\ -2 & 0 & 2 \\ -1 & 0 & 1 \end{bmatrix}
\qquad
G_y:\ \begin{bmatrix} -1 & -2 & -1 \\ 0 & 0 & 0 \\ 1 & 2 & 1 \end{bmatrix}
$$

Each kernel combines a difference in one direction, $g(x + 1) - g(x - 1)$, which approximates
$2\,\partial g/\partial x$, with an average over three rows or columns with weights 1, 2, 1. For an
image that increases linearly, $g = ax$, the response is $8a$, so the operator measures eight times
the gradient. A sharp step from black (0) to white (255) gives $4 \times 255 = 1{,}020$.

<aside class="margin-note">

<b>Separability</b> Each Sobel kernel is a column times a row, a smoothing times a difference:

$$
\begin{bmatrix} -1 & 0 & 1 \\ -2 & 0 & 2 \\ -1 & 0 & 1 \end{bmatrix} = \begin{bmatrix} 1 \\ 2 \\ 1 \end{bmatrix} \begin{bmatrix} -1 & 0 & 1 \end{bmatrix}
$$

So it can be applied as two one-dimensional passes.

</aside>

A colour image has three channels, and therefore three gradients at each pixel, which must be
combined into a single strength and direction. The simplest combinations are unsatisfactory.

- Converting the image to grey before differentiating loses edges between colours of similar
  brightness. On the parrot, about one kept edge pixel in eleven has less than half of its contrast
  in brightness alone.
- Adding the three gradient vectors can make them cancel. At an edge between red and green, the
  red channel decreases where the green channel increases.
- Adding the lengths of the three gradients keeps the strength but discards the direction, which
  step 3 requires.

Silvano Di Zenzo (1986) treated the image as a map from the plane to colour space,
$(x, y) \mapsto (R, G, B)$. Its derivative at a pixel is the $3 \times 2$ Jacobian matrix $J$,
whose rows are the gradients of the three channels. A small step in the direction of a unit vector
$u$ changes the colour by approximately $Ju$, so the squared rate of change of colour in that
direction is

$$
|Ju|^2 = u^\top J^\top J\, u = u^\top \begin{bmatrix} g_{xx} & g_{xy} \\ g_{xy} & g_{yy} \end{bmatrix} u
$$

where $g_{xx} = \sum_c (G^c_x)^2$, $g_{yy} = \sum_c (G^c_y)^2$ and $g_{xy} = \sum_c G^c_x G^c_y$,
the sums running over the three channels $c$. The symmetric matrix $J^\top J$ is called the
structure tensor. The direction in which the colour changes fastest is the eigenvector of its
larger eigenvalue, and the squared rate of change in that direction is the eigenvalue
itself:<span class="margin-note"><b>Eigenvalues as maxima</b> For a symmetric matrix $A$, the largest value of $u^\top A u$ over unit vectors $u$ is the largest eigenvalue of $A$, attained at its eigenvector. Here $A$ is $2 \times 2$, so both can be found in closed form.</span>

$$
\begin{aligned}
\theta^* &= \tfrac{1}{2}\operatorname{atan2}\big(2g_{xy},\ g_{xx} - g_{yy}\big) \\
S(\theta^*) &= \tfrac{1}{2}\Big[g_{xx} + g_{yy} + \sqrt{(g_{xx} - g_{yy})^2 + 4g_{xy}^2}\Big]
\end{aligned}
$$

<aside class="margin-note">

<b>Derivation</b> Put $u = (\cos\theta, \sin\theta)$. The double-angle formulas give

$$
\begin{aligned}
S(\theta) &= u^\top J^\top J\, u \\
&= \tfrac{1}{2}\big[g_{xx} + g_{yy} \\
&\quad + (g_{xx} - g_{yy})\cos 2\theta \\
&\quad + 2g_{xy}\sin 2\theta\big]
\end{aligned}
$$

a constant plus one sinusoid in $2\theta$. It is largest when $2\theta$ points along
$(g_{xx} - g_{yy},\ 2g_{xy})$, where the sinusoid equals the length of that vector.

</aside>

The script takes $\sqrt{S(\theta^*)/3}$ as the edge strength, the root mean square over the three
channels. Since $u$ and $-u$ give the same value, the direction across a colour edge is defined only
up to sign, which is all that step 3 requires. For a grey image, $J$ has the single row
$\nabla g$ and the largest eigenvalue of $J^\top J$ is $|\nabla g|^2$, so a grey image stored as
three equal channels receives exactly its ordinary gradient magnitude.

```js
for (let c = 0; c < ch; c++) {
  const gx = -at(x - 1, y - 1, c) - 2 * at(x - 1, y, c) - at(x - 1, y + 1, c) + at(x + 1, y - 1, c) + 2 * at(x + 1, y, c) + at(x + 1, y + 1, c);
  const gy = -at(x - 1, y - 1, c) - 2 * at(x, y - 1, c) - at(x + 1, y - 1, c) + at(x - 1, y + 1, c) + 2 * at(x, y + 1, c) + at(x + 1, y + 1, c);
  gxx += gx * gx;
  gyy += gy * gy;
  gxy += gx * gy;
}
const theta = 0.5 * Math.atan2(2 * gxy, gxx - gyy);
const along = 0.5 * (gxx + gyy + (gxx - gyy) * Math.cos(2 * theta) + 2 * gxy * Math.sin(2 * theta));
mag[y * w + x] = Math.sqrt(Math.max(0, along) / ch);
```

### 3. Non-maximum suppression

After smoothing, a step edge is no longer a step. Across the edge, the brightness profile is the
step convolved with a Gaussian, and its derivative is a Gaussian bump of width about $\sigma$
centred on the edge. The gradient magnitude is therefore large over a band several pixels wide,
with its maximum at the edge itself. Non-maximum suppression locates that maximum: a pixel is kept
only if its strength is at least that of both its neighbours in the direction $\theta^*$, across the
edge. On the pixel grid the direction is rounded to the nearest of 0°, 45°, 90° and 135°, each of
which corresponds to a pair of opposite neighbours:

```js
const across = [[1, 0], [1, 1], [0, 1], [-1, 1]];
const [dx, dy] = across[dir[i]];
if (mag[i] >= mag[(y + dy) * w + x + dx] && mag[i] >= mag[(y - dy) * w + x - dx]) nms[i] = mag[i];
```

### 4. Hysteresis thresholding

A single threshold on edge strength works poorly. The strength along a real edge fluctuates, and
wherever it dips below a high threshold the edge breaks into fragments, while a low threshold
admits many responses to noise. Canny's method of hysteresis uses two thresholds,
$T_{\text{high}}$ and $T_{\text{low}}$. Consider the set of ridge pixels with strength at least
$T_{\text{low}}$, and divide it into connected components, two pixels being adjacent when each is
one of the other's eight neighbours. A component is kept if it contains at least one pixel with
strength at least $T_{\text{high}}$, and discarded otherwise. The script finds the kept components
by a flood fill from every strong pixel.

The rule reflects the different structure of edges and noise. A real edge is a long connected
ridge, and it is enough for its strength to exceed the high threshold somewhere along it. Noise
produces short, isolated ridges, few of which reach the high threshold
anywhere.<span class="margin-note"><b>The ratio</b> Canny recommended a high threshold two to three times the low one. The script's $T_{\text{low}} = 0.45\, T_{\text{high}}$ is a ratio of about 2.2.</span>

The high threshold is set separately for each photo, at the 82nd percentile of ridge strength, so
that a low-contrast landscape and a high-contrast portrait each keep their own strongest edges. It
is not allowed below 40, so that in a nearly uniform image, such as a clear sky, faint colour
banding is not treated as a strong edge. For the parrot the thresholds are 87 and 39, on the scale
on which a sharp black-to-white step gives 1,020.

### 5. Linking pixels into strokes

The kept pixels form a graph in which each pixel is joined to those of its eight neighbours that
are also kept. After thinning, most pixels have exactly two neighbours. Pixels with one neighbour
are the ends of strokes, and pixels with three or more are junctions. A stroke is a path in this
graph. The script starts at each end pixel and follows the path to its other end. At a junction it
continues as nearly straight ahead as possible: if the last step was the vector $p$ and the
possible next steps are $q_1, q_2, \dots$, it takes the $q_j$ with the largest dot product
$p \cdot q_j$, which favours the step making the smallest angle with $p$. Closed loops have no end
pixels, and are traced afterwards from any pixel not yet visited.

```js
let pick = next[0];
if (prev >= 0 && next.length > 1) {
  const px = (cur % w) - (prev % w);
  const py = Math.floor(cur / w) - Math.floor(prev / w);
  let best = -Infinity;
  for (const j of next) {
    const straight = ((j % w) - (cur % w)) * px + (Math.floor(j / w) - Math.floor(cur / w)) * py;
    if (straight > best) [best, pick] = [straight, j];
  }
}
```

<figure class="fig">
<div class="fig__panels" style="--panel: 14rem">
<div class="fig__panel"><img src="/musings/drawing-photos-with-circles/eclectus-parrot-464.webp" srcset="/musings/drawing-photos-with-circles/eclectus-parrot-320.webp 320w, /musings/drawing-photos-with-circles/eclectus-parrot-464.webp 464w, /musings/drawing-photos-with-circles/eclectus-parrot.webp 640w" sizes="(max-width: 31.5rem) calc(100vw - 2.5rem), 20rem" width="464" height="309" alt="A bright green eclectus parrot with an orange beak, perched in front of blurred trees and a hut." loading="lazy" decoding="async"><span class="fig__label">The photo</span></div>
<div class="fig__panel"><svg viewBox="0 0 320 213" role="img" aria-label="Every edge found in the photo after thinning and hysteresis: 609 short curves covering the parrot, the trees behind it and the hut."><path class="ink thin" d="M22.5 2.5L21.5 3.5L21.5 5.5L23.5 7.5L25.5 7.5L29.5 3.5L29.5 4.5L27.5 6.5M113.5 2.5L113.5 13.5L112.5 14.5L112.5 22.5L114.5 24.5L115.5 26.5L115.5 28.5L117.5 30.5L115.5 31.5M129.5 2.5L129.5 4.5L130.5 5.5L130.5 12.5L138.5 20.5L140.5 18.5L142.5 18.5L144.5 14.5L141.5 11.5L139.5 11.5L137.5 12.5L134.5 17.5L137.5 20.5M213.5 2.5L213.5 5.5L211.5 7.5L206.5 7.5L205.5 6.5L205.5 3.5L204.5 2.5L205.5 2.5M265.5 2.5L270.5 2.5L273.5 5.5L273.5 8.5L270.5 10.5L268.5 10.5L265.5 6.5L265.5 4.5L266.5 4.5M280.5 2.5L284.5 4.5L286.5 4.5L287.5 5.5L287.5 10.5L283.5 14.5L281.5 15.5L277.5 13.5L277.5 8.5L279.5 7.5L281.5 7.5M46.5 3.5L46.5 5.5L52.5 11.5L52.5 13.5L54.5 17.5L54.5 18.5L52.5 19.5L50.5 21.5L50.5 22.5L53.5 25.5L56.5 25.5L56.5 26.5M275.5 3.5L272.5 3.5L271.5 4.5L272.5 5.5M277.5 6.5L278.5 6.5M36.5 12.5L38.5 12.5L40.5 15.5L43.5 15.5L49.5 21.5L50.5 20.5L49.5 20.5L45.5 16.5M30.5 13.5L30.5 10.5L34.5 6.5L35.5 4.5L35.5 3.5L34.5 2.5L34.5 3.5M30.5 15.5L32.5 15.5L35.5 18.5L36.5 21.5L42.5 27.5L44.5 27.5L47.5 30.5L49.5 30.5L51.5 34.5L53.5 35.5L52.5 36.5L51.5 35.5M15.5 17.5L12.5 18.5L9.5 21.5L9.5 23.5L11.5 25.5M37.5 17.5L37.5 16.5L39.5 15.5M207.5 21.5L208.5 22.5L211.5 22.5L213.5 24.5L216.5 24.5L220.5 26.5L221.5 28.5L221.5 32.5L220.5 33.5L215.5 33.5L212.5 30.5L211.5 28.5M275.5 25.5L275.5 28.5L281.5 34.5L282.5 33.5L287.5 33.5L287.5 32.5M257.5 27.5L258.5 28.5L260.5 28.5L260.5 26.5L261.5 25.5L261.5 19.5L260.5 18.5L260.5 13.5L257.5 10.5L258.5 10.5L260.5 12.5M15.5 29.5L16.5 28.5L16.5 25.5L17.5 24.5L17.5 17.5L19.5 15.5L22.5 15.5L23.5 16.5L23.5 22.5L22.5 23.5L22.5 27.5L21.5 28.5L21.5 32.5L20.5 33.5L20.5 39.5L19.5 40.5L19.5 43.5L18.5 44.5L18.5 53.5L15.5 56.5L14.5 55.5M34.5 29.5L31.5 32.5L28.5 33.5L26.5 35.5L26.5 36.5L28.5 38.5L30.5 38.5L33.5 41.5L34.5 43.5M124.5 29.5L124.5 35.5L125.5 36.5L125.5 41.5L126.5 42.5L126.5 47.5L123.5 53.5L121.5 53.5L118.5 49.5L118.5 41.5L117.5 39.5L118.5 38.5L118.5 35.5L119.5 34.5L119.5 32.5L120.5 31.5L121.5 32.5L120.5 32.5M2.5 33.5L3.5 35.5L3.5 37.5M305.5 38.5L306.5 40.5L308.5 39.5L310.5 39.5L310.5 41.5L312.5 44.5L317.5 43.5M29.5 43.5L26.5 44.5L24.5 46.5L24.5 49.5L23.5 50.5L23.5 57.5L22.5 58.5L19.5 58.5L17.5 56.5L16.5 56.5L17.5 57.5M31.5 43.5L31.5 41.5M248.5 44.5L247.5 46.5L247.5 49.5L244.5 52.5L242.5 53.5L239.5 52.5L237.5 54.5L235.5 54.5L234.5 55.5L231.5 52.5L231.5 48.5L234.5 45.5L236.5 45.5L237.5 44.5L240.5 44.5L241.5 45.5L244.5 45.5L246.5 46.5M313.5 47.5L311.5 46.5L312.5 45.5M317.5 49.5L315.5 49.5L313.5 51.5L313.5 53.5L316.5 56.5L317.5 58.5L317.5 59.5L316.5 58.5M203.5 51.5L203.5 50.5L201.5 48.5L199.5 47.5L196.5 48.5L194.5 46.5L188.5 46.5L186.5 48.5L185.5 48.5L183.5 50.5L183.5 51.5L184.5 50.5M29.5 53.5L29.5 51.5L30.5 50.5L35.5 49.5L35.5 48.5L37.5 46.5L37.5 44.5L39.5 42.5L39.5 36.5L34.5 31.5L33.5 31.5M138.5 53.5L140.5 53.5L141.5 55.5L148.5 63.5L156.5 63.5L157.5 64.5L160.5 64.5L162.5 66.5L164.5 66.5L173.5 75.5L178.5 85.5L178.5 87.5L180.5 91.5L180.5 94.5L182.5 98.5L186.5 103.5L186.5 107.5L187.5 108.5L187.5 110.5L188.5 112.5L194.5 118.5L194.5 119.5L198.5 124.5L197.5 125.5L199.5 128.5L199.5 130.5L201.5 133.5L201.5 135.5L202.5 137.5L204.5 139.5L206.5 139.5L209.5 142.5L208.5 144.5L205.5 147.5L204.5 146.5L205.5 146.5M260.5 54.5L262.5 58.5L267.5 63.5L272.5 63.5L275.5 60.5L274.5 62.5M204.5 55.5L203.5 53.5L200.5 53.5L197.5 55.5L194.5 55.5L191.5 58.5L191.5 59.5L194.5 62.5L197.5 62.5L202.5 59.5L204.5 59.5L204.5 58.5M251.5 55.5L246.5 53.5L245.5 52.5L246.5 51.5M170.5 56.5L175.5 61.5L175.5 63.5L174.5 64.5L174.5 67.5L176.5 69.5L180.5 69.5L181.5 68.5L181.5 60.5L180.5 59.5L180.5 56.5L178.5 54.5L176.5 54.5L175.5 53.5L172.5 56.5L172.5 57.5L174.5 59.5M206.5 56.5L206.5 59.5L207.5 60.5L207.5 65.5L208.5 66.5L208.5 74.5M143.5 63.5L138.5 64.5L130.5 68.5L126.5 71.5L125.5 74.5M317.5 63.5L316.5 64.5L316.5 68.5M40.5 68.5L38.5 70.5L38.5 71.5L41.5 74.5L43.5 75.5L46.5 75.5L57.5 86.5L57.5 88.5L62.5 93.5L61.5 95.5L61.5 97.5L60.5 98.5L60.5 100.5L58.5 102.5L59.5 104.5L59.5 106.5L61.5 109.5L60.5 109.5M67.5 68.5L65.5 68.5L63.5 66.5L63.5 64.5L60.5 60.5L62.5 61.5M126.5 68.5L126.5 63.5L127.5 62.5L127.5 56.5L126.5 54.5L127.5 55.5L128.5 54.5L131.5 48.5L131.5 38.5L130.5 37.5L130.5 34.5L129.5 33.5L129.5 27.5L134.5 22.5L135.5 19.5M195.5 69.5L196.5 70.5L198.5 70.5L212.5 85.5L212.5 88.5L209.5 89.5L208.5 90.5L208.5 91.5L209.5 91.5M230.5 69.5L229.5 68.5L224.5 68.5L223.5 67.5L220.5 69.5L220.5 66.5L217.5 63.5L214.5 66.5L214.5 69.5L216.5 71.5L218.5 69.5L218.5 70.5M36.5 70.5L37.5 70.5M26.5 71.5L26.5 74.5L33.5 81.5L36.5 81.5L36.5 79.5L37.5 78.5L37.5 75.5L31.5 69.5L29.5 65.5L23.5 59.5M127.5 74.5L131.5 78.5L130.5 76.5M44.5 80.5L46.5 85.5L52.5 92.5L53.5 94.5L53.5 96.5L56.5 99.5L57.5 99.5M122.5 81.5L122.5 84.5L123.5 85.5L123.5 95.5L122.5 96.5L122.5 101.5L125.5 104.5L124.5 106.5L124.5 111.5L113.5 122.5L113.5 124.5L111.5 126.5L111.5 128.5L110.5 129.5L110.5 131.5L111.5 132.5L112.5 132.5L114.5 130.5L114.5 128.5L116.5 126.5L116.5 124.5L118.5 122.5L118.5 120.5L124.5 117.5L130.5 111.5L129.5 109.5L129.5 105.5L128.5 104.5L128.5 88.5L129.5 87.5L129.5 84.5L132.5 81.5L137.5 81.5L140.5 84.5L142.5 84.5L146.5 89.5L146.5 97.5L145.5 98.5L145.5 102.5L143.5 104.5L143.5 106.5L139.5 110.5L139.5 113.5L138.5 114.5L138.5 120.5L137.5 121.5L133.5 117.5L132.5 114.5L130.5 112.5L126.5 116.5M60.5 84.5L60.5 80.5L59.5 79.5L59.5 67.5L60.5 67.5M126.5 85.5L126.5 77.5L127.5 76.5M82.5 86.5L81.5 87.5L81.5 88.5L82.5 88.5M206.5 93.5L206.5 95.5L204.5 96.5L197.5 96.5L196.5 95.5L192.5 95.5L189.5 98.5L189.5 102.5L190.5 104.5M206.5 97.5L205.5 97.5M108.5 98.5L109.5 97.5L109.5 87.5L110.5 86.5L110.5 81.5L109.5 80.5L109.5 77.5L110.5 76.5L110.5 69.5L108.5 67.5L108.5 64.5L107.5 63.5L109.5 62.5L109.5 56.5L111.5 52.5L111.5 41.5L113.5 39.5L114.5 40.5L113.5 40.5M258.5 98.5L259.5 100.5L261.5 100.5L263.5 99.5L265.5 101.5L267.5 101.5L268.5 100.5L273.5 100.5L275.5 102.5L277.5 102.5L279.5 104.5L282.5 104.5L286.5 108.5L288.5 108.5L291.5 111.5L294.5 111.5L295.5 112.5L300.5 113.5L303.5 115.5L305.5 115.5L306.5 116.5L305.5 116.5M65.5 101.5L63.5 103.5L67.5 107.5L69.5 107.5L71.5 105.5L71.5 101.5L68.5 98.5L66.5 98.5L64.5 96.5L64.5 95.5L66.5 97.5M8.5 103.5L10.5 104.5L10.5 102.5L12.5 100.5L15.5 103.5L15.5 112.5L14.5 113.5L14.5 125.5L15.5 126.5L15.5 128.5L16.5 130.5L20.5 135.5L18.5 134.5M181.5 107.5L181.5 103.5L180.5 102.5L178.5 102.5L178.5 101.5L176.5 99.5L175.5 97.5L176.5 95.5L176.5 93.5L173.5 90.5L173.5 89.5L170.5 86.5L168.5 87.5L163.5 87.5L162.5 85.5L163.5 85.5M183.5 108.5L183.5 110.5L185.5 113.5L185.5 115.5L184.5 116.5L184.5 119.5L186.5 121.5L186.5 128.5L187.5 129.5L187.5 136.5L189.5 140.5L189.5 143.5L190.5 144.5L190.5 148.5L191.5 149.5L191.5 152.5L192.5 153.5L192.5 157.5L193.5 158.5L193.5 163.5L194.5 164.5L194.5 167.5L193.5 168.5L193.5 170.5M201.5 108.5L203.5 107.5L207.5 110.5L209.5 109.5L211.5 109.5M179.5 109.5L179.5 115.5L181.5 117.5L182.5 117.5M99.5 111.5L94.5 111.5L93.5 112.5L90.5 112.5L90.5 111.5M99.5 113.5L99.5 114.5L102.5 117.5L107.5 117.5L108.5 116.5L108.5 108.5L109.5 107.5L109.5 102.5L107.5 100.5L103.5 100.5L100.5 103.5L97.5 103.5L95.5 102.5L90.5 107.5L93.5 110.5L93.5 109.5M196.5 114.5L198.5 114.5L200.5 113.5L201.5 114.5L203.5 114.5L206.5 117.5L210.5 117.5L216.5 120.5L222.5 120.5L223.5 121.5L226.5 121.5L229.5 118.5L229.5 116.5L227.5 115.5M44.5 115.5L41.5 112.5L41.5 110.5L40.5 109.5L40.5 102.5L35.5 97.5L35.5 94.5L36.5 93.5L37.5 93.5L36.5 94.5M317.5 118.5L314.5 116.5L310.5 116.5L308.5 114.5L310.5 115.5M40.5 121.5L39.5 120.5L37.5 120.5L35.5 122.5L35.5 127.5L37.5 129.5L38.5 129.5L40.5 127.5L40.5 125.5L41.5 124.5M189.5 121.5L191.5 121.5L192.5 122.5L194.5 126.5L194.5 128.5L196.5 130.5L196.5 132.5M200.5 126.5L209.5 126.5L210.5 127.5L213.5 127.5L214.5 128.5L217.5 128.5L218.5 129.5L220.5 129.5L221.5 128.5L225.5 128.5L226.5 129.5L236.5 129.5L237.5 128.5L244.5 128.5L245.5 129.5L251.5 129.5L252.5 130.5L258.5 130.5L259.5 131.5L272.5 131.5L278.5 137.5L283.5 137.5M56.5 128.5L57.5 130.5L57.5 132.5L54.5 135.5L52.5 135.5L50.5 133.5L50.5 129.5L47.5 126.5L45.5 126.5L44.5 124.5L44.5 120.5L42.5 118.5L43.5 117.5L43.5 118.5M190.5 129.5L192.5 131.5L191.5 133.5L192.5 134.5L192.5 138.5L194.5 142.5L194.5 147.5L195.5 148.5L195.5 151.5L196.5 152.5L196.5 158.5L197.5 159.5L197.5 161.5M283.5 131.5L285.5 131.5L287.5 133.5L289.5 132.5L296.5 132.5L297.5 131.5L306.5 131.5L307.5 132.5L309.5 132.5L311.5 131.5L312.5 132.5L317.5 132.5M120.5 133.5L122.5 131.5L124.5 131.5L124.5 133.5L126.5 136.5L125.5 138.5L125.5 143.5L124.5 144.5L124.5 146.5L122.5 148.5L122.5 150.5L120.5 152.5L120.5 154.5L119.5 155.5L119.5 158.5L118.5 159.5L120.5 161.5L120.5 162.5M236.5 133.5L236.5 135.5L242.5 141.5L245.5 141.5L245.5 143.5L249.5 147.5L250.5 146.5L252.5 146.5L254.5 144.5L254.5 139.5L251.5 135.5L247.5 135.5L246.5 134.5L244.5 134.5L242.5 133.5M36.5 134.5L34.5 132.5L33.5 132.5L30.5 135.5L30.5 137.5M195.5 134.5L198.5 137.5L201.5 143.5L201.5 152.5L199.5 154.5L199.5 161.5L200.5 162.5L200.5 168.5L199.5 169.5L199.5 173.5L198.5 174.5L198.5 176.5L197.5 177.5L196.5 182.5L193.5 186.5L193.5 188.5L190.5 192.5L190.5 195.5M204.5 134.5L204.5 132.5L205.5 131.5L210.5 131.5L212.5 133.5L212.5 136.5L210.5 138.5L211.5 136.5M48.5 141.5L48.5 144.5L46.5 146.5L46.5 156.5L48.5 160.5L56.5 167.5L59.5 167.5L60.5 168.5L62.5 168.5L65.5 171.5L65.5 173.5L66.5 174.5L65.5 175.5M211.5 141.5L218.5 141.5L219.5 140.5L221.5 140.5L222.5 141.5L224.5 141.5L227.5 143.5L229.5 143.5L231.5 144.5M105.5 146.5L105.5 153.5L104.5 154.5L104.5 180.5L105.5 181.5L105.5 184.5L104.5 185.5L104.5 192.5L105.5 193.5L105.5 197.5L106.5 198.5L106.5 202.5L107.5 203.5L108.5 210.5M125.5 150.5L125.5 156.5L124.5 157.5L124.5 160.5L122.5 162.5L122.5 169.5L121.5 170.5L120.5 177.5L118.5 180.5L118.5 185.5L117.5 186.5L117.5 188.5L116.5 188.5M109.5 155.5L109.5 145.5L107.5 143.5L107.5 138.5L108.5 137.5L108.5 135.5L110.5 133.5L110.5 132.5L109.5 133.5L110.5 134.5L109.5 135.5M187.5 156.5L188.5 158.5L188.5 161.5L189.5 162.5L191.5 162.5M43.5 158.5L40.5 158.5L29.5 147.5L25.5 149.5L26.5 150.5L26.5 152.5L38.5 164.5L40.5 164.5L43.5 166.5L45.5 166.5L47.5 167.5L51.5 171.5L54.5 177.5L51.5 180.5L51.5 182.5L53.5 184.5M101.5 159.5L98.5 158.5L96.5 160.5L96.5 162.5L94.5 164.5L91.5 165.5L88.5 168.5L88.5 171.5L87.5 172.5L85.5 173.5L83.5 173.5L80.5 175.5L77.5 175.5L75.5 177.5L75.5 180.5L76.5 181.5L75.5 183.5M271.5 160.5L272.5 162.5L272.5 185.5L273.5 186.5L273.5 194.5L274.5 195.5L274.5 198.5L275.5 199.5L274.5 200.5L274.5 202.5L278.5 209.5L278.5 210.5L277.5 209.5M117.5 162.5L116.5 163.5L116.5 166.5L115.5 167.5L115.5 170.5L114.5 171.5L114.5 177.5L113.5 178.5L113.5 181.5M256.5 163.5L256.5 160.5L257.5 159.5L257.5 157.5L253.5 153.5L247.5 153.5L246.5 152.5L244.5 152.5L240.5 150.5L237.5 150.5L235.5 148.5L233.5 148.5L231.5 146.5L233.5 147.5M20.5 165.5L21.5 166.5L23.5 165.5L24.5 166.5L26.5 166.5L30.5 168.5L33.5 171.5L33.5 172.5L36.5 175.5L38.5 175.5L43.5 181.5L45.5 181.5L48.5 184.5L49.5 183.5L51.5 183.5M183.5 167.5L183.5 177.5L184.5 178.5L184.5 183.5L186.5 187.5L186.5 192.5L185.5 193.5L185.5 196.5M22.5 174.5L22.5 175.5L26.5 179.5L26.5 182.5L27.5 183.5L27.5 187.5L28.5 188.5L28.5 189.5L27.5 190.5L27.5 189.5M17.5 175.5L16.5 176.5L11.5 176.5L8.5 173.5L7.5 173.5L9.5 175.5M193.5 177.5L192.5 176.5L192.5 174.5L190.5 172.5L190.5 169.5L189.5 168.5L189.5 163.5M247.5 177.5L241.5 177.5L237.5 181.5L238.5 183.5L238.5 185.5L239.5 186.5L243.5 186.5M61.5 179.5L61.5 182.5L65.5 186.5L67.5 187.5L71.5 187.5L72.5 186.5L74.5 186.5L75.5 185.5L74.5 185.5M255.5 180.5L258.5 180.5L260.5 178.5L262.5 179.5L264.5 179.5L265.5 180.5L266.5 180.5L268.5 178.5L266.5 179.5M187.5 183.5L188.5 182.5L188.5 179.5L190.5 177.5L191.5 177.5L190.5 178.5M214.5 183.5L214.5 181.5L217.5 178.5L219.5 179.5L222.5 179.5L222.5 180.5M252.5 183.5L251.5 182.5L251.5 178.5L252.5 177.5L252.5 175.5L256.5 171.5L260.5 171.5L262.5 169.5L264.5 169.5L267.5 166.5L268.5 167.5L266.5 166.5M57.5 185.5L63.5 185.5L61.5 183.5M194.5 191.5L194.5 193.5L191.5 199.5L191.5 208.5L190.5 206.5M198.5 191.5L199.5 190.5L199.5 186.5L200.5 185.5L203.5 185.5L204.5 184.5L207.5 184.5L208.5 185.5L211.5 185.5L212.5 186.5L214.5 186.5L216.5 188.5L216.5 190.5L218.5 192.5L220.5 192.5L221.5 193.5L223.5 191.5L227.5 191.5L228.5 190.5L231.5 190.5L235.5 194.5L235.5 193.5L233.5 191.5M214.5 191.5L215.5 191.5M15.5 194.5L20.5 199.5L21.5 201.5L21.5 208.5L20.5 209.5L17.5 209.5L16.5 208.5L15.5 206.5L15.5 200.5L13.5 198.5L8.5 198.5L7.5 199.5L6.5 199.5L7.5 198.5M93.5 195.5L94.5 196.5L95.5 196.5L96.5 194.5L100.5 194.5L101.5 195.5L104.5 195.5M42.5 201.5L42.5 204.5L44.5 208.5L46.5 210.5L44.5 209.5M75.5 204.5L75.5 200.5L77.5 198.5L84.5 198.5L86.5 199.5L89.5 202.5L89.5 203.5L93.5 207.5L95.5 208.5L96.5 210.5M88.5 205.5L89.5 204.5L91.5 206.5M267.5 206.5L271.5 204.5L273.5 204.5L274.5 203.5M71.5 210.5L77.5 210.5L78.5 209.5L84.5 209.5L85.5 210.5L84.5 210.5M188.5 210.5L187.5 209.5L187.5 207.5L185.5 205.5L184.5 205.5L181.5 208.5L181.5 209.5L182.5 210.5L182.5 209.5M308.5 210.5L308.5 204.5L307.5 203.5L307.5 186.5L306.5 185.5L306.5 174.5L304.5 172.5L302.5 172.5L300.5 174.5L300.5 191.5L301.5 192.5L301.5 205.5L302.5 206.5L302.5 210.5L300.5 209.5L298.5 209.5L297.5 207.5L293.5 203.5L293.5 201.5L292.5 200.5L292.5 185.5L291.5 184.5L291.5 163.5L288.5 160.5L287.5 160.5L284.5 164.5L284.5 166.5L285.5 167.5L285.5 190.5L286.5 191.5L286.5 197.5L285.5 198.5L285.5 196.5M314.5 210.5L315.5 208.5L315.5 201.5L316.5 199.5L315.5 197.5L312.5 194.5L313.5 193.5L313.5 190.5L312.5 189.5L315.5 187.5L315.5 184.5L316.5 183.5L316.5 179.5L317.5 178.5L317.5 164.5L315.5 161.5L315.5 155.5L316.5 154.5L316.5 148.5L317.5 148.5M270.5 3.5M36.5 5.5L38.5 5.5L41.5 7.5L42.5 7.5L44.5 5.5L46.5 6.5L44.5 6.5M212.5 5.5L211.5 6.5M239.5 5.5L241.5 5.5L245.5 8.5L245.5 11.5L243.5 13.5L241.5 13.5L237.5 9.5L237.5 6.5L239.5 6.5M286.5 5.5M21.5 6.5L22.5 7.5L21.5 7.5M206.5 6.5M243.5 6.5M34.5 7.5L31.5 10.5M49.5 7.5L51.5 9.5M40.5 8.5L40.5 10.5L39.5 11.5L38.5 11.5L39.5 10.5M272.5 8.5M24.5 9.5L25.5 9.5L26.5 12.5L28.5 14.5L28.5 20.5L27.5 21.5L27.5 26.5L29.5 27.5L31.5 25.5L31.5 23.5L32.5 22.5L32.5 23.5M266.5 9.5M268.5 9.5M237.5 10.5L239.5 12.5M25.5 11.5M51.5 11.5M142.5 11.5L144.5 13.5M244.5 11.5M285.5 11.5L283.5 13.5M26.5 13.5L27.5 14.5M130.5 13.5L133.5 16.5M244.5 13.5M52.5 14.5M19.5 16.5L18.5 17.5M22.5 16.5M32.5 16.5L35.5 20.5M142.5 17.5M11.5 18.5L9.5 20.5M53.5 18.5M261.5 18.5M141.5 19.5M27.5 20.5M36.5 22.5L37.5 23.5M51.5 22.5L52.5 23.5M8.5 23.5L9.5 24.5L8.5 24.5L6.5 26.5L2.5 28.5L2.5 27.5M39.5 23.5L42.5 26.5M114.5 23.5M132.5 23.5M134.5 23.5M205.5 23.5L207.5 23.5M7.5 24.5L6.5 25.5M205.5 24.5L205.5 25.5L209.5 29.5L208.5 29.5L205.5 26.5M30.5 25.5M132.5 25.5L130.5 27.5M213.5 25.5L213.5 28.5M310.5 25.5L312.5 26.5L312.5 28.5L314.5 32.5L313.5 34.5L317.5 38.5L317.5 37.5L314.5 34.5L313.5 35.5M4.5 26.5M114.5 26.5M219.5 26.5M261.5 26.5M311.5 26.5M27.5 27.5M44.5 28.5L45.5 29.5M47.5 29.5M115.5 29.5M275.5 29.5L279.5 33.5M213.5 30.5L215.5 32.5M31.5 31.5M123.5 31.5L123.5 32.5M20.5 32.5M29.5 32.5M36.5 32.5L39.5 35.5M49.5 32.5L50.5 33.5M220.5 32.5M27.5 33.5L26.5 34.5M281.5 33.5M2.5 35.5M119.5 35.5M26.5 37.5L27.5 38.5M313.5 37.5L314.5 42.5M312.5 38.5M30.5 39.5M32.5 39.5L33.5 40.5M189.5 39.5L191.5 39.5L192.5 40.5L198.5 40.5L199.5 41.5L202.5 41.5L204.5 43.5L206.5 43.5L210.5 47.5L209.5 48.5L210.5 49.5L209.5 50.5L210.5 52.5L209.5 53.5L209.5 55.5L208.5 55.5M307.5 39.5M187.5 40.5L188.5 40.5L186.5 42.5L185.5 42.5L186.5 41.5M190.5 40.5L191.5 40.5M313.5 40.5M195.5 41.5L196.5 41.5M306.5 41.5L306.5 44.5L309.5 48.5L310.5 50.5L309.5 50.5M38.5 42.5M202.5 42.5M204.5 42.5M310.5 42.5M25.5 44.5M38.5 44.5M206.5 44.5L209.5 47.5M25.5 46.5M234.5 46.5L232.5 48.5M244.5 46.5M186.5 47.5M194.5 47.5M196.5 47.5M307.5 47.5L308.5 48.5M184.5 48.5M202.5 48.5L203.5 49.5M32.5 49.5M314.5 49.5M124.5 50.5M30.5 51.5M120.5 51.5L121.5 52.5M129.5 51.5M209.5 52.5M238.5 52.5L237.5 53.5M241.5 52.5L242.5 52.5M199.5 53.5M231.5 53.5L232.5 54.5M140.5 54.5M197.5 54.5M17.5 55.5M174.5 55.5M178.5 55.5M193.5 55.5L192.5 56.5M281.5 55.5L284.5 58.5L284.5 62.5L282.5 64.5L280.5 63.5L277.5 60.5L277.5 58.5L279.5 56.5L280.5 56.5L278.5 58.5M314.5 55.5L315.5 56.5M141.5 56.5L144.5 59.5M241.5 56.5L241.5 59.5L235.5 64.5L235.5 66.5L236.5 67.5L239.5 67.5L240.5 68.5L244.5 68.5L245.5 67.5L249.5 67.5L250.5 68.5L252.5 68.5L256.5 72.5L256.5 75.5L255.5 75.5M260.5 56.5L261.5 57.5M283.5 56.5L284.5 57.5M19.5 57.5M22.5 57.5M240.5 57.5M240.5 59.5L238.5 61.5M262.5 59.5M25.5 60.5L29.5 64.5M145.5 61.5L147.5 63.5L148.5 62.5M192.5 61.5M194.5 61.5M197.5 61.5M279.5 61.5M236.5 62.5L235.5 63.5M272.5 62.5M283.5 62.5L282.5 63.5M63.5 63.5M140.5 63.5M218.5 63.5L219.5 63.5L220.5 65.5M137.5 64.5M271.5 64.5M135.5 65.5M162.5 65.5M214.5 65.5M30.5 66.5L31.5 67.5M64.5 66.5M69.5 66.5L72.5 72.5L74.5 74.5L74.5 76.5L76.5 78.5L80.5 86.5L80.5 87.5L79.5 86.5M133.5 66.5M69.5 67.5M131.5 67.5M164.5 67.5L166.5 69.5M221.5 67.5M235.5 67.5L235.5 68.5M243.5 67.5L244.5 67.5M129.5 68.5L128.5 69.5M180.5 68.5M193.5 68.5L193.5 69.5L191.5 71.5L191.5 74.5L192.5 76.5L196.5 80.5L198.5 80.5L200.5 82.5L200.5 83.5L198.5 81.5M32.5 69.5M70.5 69.5M168.5 69.5L170.5 71.5M175.5 69.5M192.5 69.5L191.5 70.5M254.5 69.5L255.5 70.5M39.5 70.5L40.5 72.5M214.5 70.5L215.5 71.5L216.5 70.5M32.5 71.5M34.5 71.5L35.5 72.5L34.5 73.5M71.5 71.5M198.5 71.5L204.5 77.5M72.5 73.5L73.5 74.5M170.5 73.5L172.5 75.5M40.5 74.5M26.5 75.5M28.5 75.5L31.5 78.5M48.5 76.5L50.5 78.5M74.5 77.5L75.5 79.5M173.5 77.5M192.5 77.5L193.5 78.5M299.5 77.5L301.5 77.5L303.5 79.5L303.5 88.5L302.5 89.5L298.5 89.5L298.5 88.5L296.5 86.5L297.5 79.5L298.5 78.5L299.5 78.5L298.5 79.5M86.5 78.5L93.5 78.5L94.5 79.5L97.5 79.5L98.5 80.5L98.5 81.5L97.5 80.5M195.5 78.5L196.5 79.5M37.5 79.5M85.5 79.5L86.5 79.5L85.5 80.5L86.5 82.5L86.5 84.5L84.5 86.5L84.5 85.5M158.5 79.5L161.5 79.5L162.5 80.5L162.5 83.5L159.5 83.5L158.5 82.5L158.5 80.5M174.5 79.5L175.5 80.5M302.5 79.5M31.5 80.5L32.5 81.5M50.5 80.5L56.5 86.5M161.5 80.5M131.5 81.5L130.5 82.5M207.5 81.5L208.5 82.5M77.5 82.5M137.5 82.5M139.5 82.5L140.5 83.5M159.5 82.5M194.5 82.5L194.5 83.5L192.5 85.5L192.5 88.5L194.5 90.5L196.5 90.5L198.5 91.5L200.5 89.5L202.5 89.5L203.5 88.5L204.5 88.5L206.5 90.5L207.5 90.5L207.5 89.5L206.5 89.5M210.5 82.5L212.5 84.5M193.5 83.5M45.5 84.5M78.5 84.5M130.5 84.5M142.5 85.5L143.5 86.5M193.5 85.5M46.5 86.5L49.5 89.5M128.5 86.5M171.5 86.5L173.5 88.5M297.5 86.5L298.5 87.5M144.5 88.5L145.5 89.5M210.5 88.5M302.5 88.5M57.5 89.5L61.5 93.5L61.5 94.5M192.5 89.5M194.5 89.5M174.5 90.5L176.5 92.5M200.5 90.5M50.5 91.5L51.5 92.5M191.5 95.5L189.5 97.5M197.5 95.5L198.5 95.5M204.5 95.5M55.5 97.5M176.5 97.5M35.5 98.5L37.5 100.5M55.5 99.5M70.5 99.5L71.5 100.5M177.5 99.5L178.5 100.5M182.5 99.5L183.5 100.5M59.5 100.5L58.5 101.5M102.5 100.5L100.5 102.5M255.5 100.5L258.5 100.5L259.5 101.5M12.5 101.5L11.5 102.5M42.5 101.5L45.5 101.5L46.5 102.5L46.5 104.5L47.5 105.5L47.5 110.5L48.5 111.5L50.5 111.5L52.5 113.5L52.5 114.5L50.5 112.5M107.5 101.5M254.5 101.5L255.5 101.5L249.5 107.5L249.5 108.5L253.5 104.5M275.5 101.5M15.5 102.5M41.5 102.5L42.5 102.5M45.5 102.5M63.5 102.5L65.5 104.5M144.5 102.5M184.5 102.5L185.5 103.5M191.5 102.5L195.5 102.5L200.5 105.5L202.5 105.5L202.5 106.5M253.5 102.5M93.5 103.5L90.5 106.5L91.5 107.5M277.5 103.5M279.5 103.5M124.5 104.5L124.5 105.5M144.5 104.5M9.5 105.5M70.5 105.5L69.5 106.5M282.5 105.5L284.5 107.5M65.5 106.5M142.5 106.5L141.5 107.5M59.5 107.5M286.5 107.5M203.5 108.5L204.5 109.5M41.5 109.5M141.5 109.5L140.5 110.5M288.5 109.5L289.5 110.5M45.5 110.5L46.5 110.5L43.5 113.5L42.5 112.5M291.5 110.5M187.5 111.5M244.5 111.5L245.5 111.5L244.5 112.5L240.5 112.5L239.5 113.5L236.5 113.5L230.5 116.5L229.5 115.5L230.5 115.5M294.5 112.5M123.5 113.5L122.5 114.5M132.5 113.5M188.5 113.5L193.5 118.5M235.5 113.5M297.5 113.5M120.5 114.5L114.5 120.5M232.5 114.5L233.5 114.5M99.5 115.5L101.5 117.5M133.5 115.5M203.5 115.5L204.5 116.5M107.5 116.5M179.5 116.5L180.5 117.5M134.5 117.5M37.5 119.5L35.5 121.5M134.5 119.5L135.5 120.5M229.5 119.5L228.5 120.5M13.5 120.5L13.5 121.5M184.5 120.5L185.5 121.5M194.5 120.5M226.5 120.5M114.5 122.5M117.5 122.5M191.5 122.5M45.5 124.5M112.5 124.5M117.5 124.5M192.5 124.5M197.5 124.5M112.5 126.5M115.5 126.5M193.5 126.5M47.5 127.5M49.5 127.5L50.5 128.5M35.5 128.5L36.5 129.5L34.5 131.5L35.5 129.5M38.5 128.5M15.5 129.5M193.5 129.5L192.5 130.5M56.5 130.5M113.5 130.5L112.5 131.5M195.5 130.5M16.5 131.5L17.5 132.5M121.5 131.5M31.5 132.5L32.5 132.5L30.5 134.5M56.5 132.5M205.5 132.5M210.5 132.5M212.5 132.5M244.5 132.5L244.5 133.5M272.5 132.5L277.5 137.5M51.5 133.5M200.5 133.5M294.5 133.5M56.5 134.5L55.5 135.5M124.5 134.5L121.5 137.5L121.5 140.5L119.5 142.5L119.5 145.5L118.5 146.5L117.5 151.5L111.5 156.5L111.5 158.5L110.5 159.5L110.5 161.5L111.5 162.5L111.5 171.5L110.5 172.5L110.5 184.5L111.5 185.5L111.5 189.5L112.5 190.5L112.5 192.5L114.5 194.5L113.5 194.5M247.5 134.5M122.5 135.5L121.5 136.5M191.5 136.5M196.5 136.5L197.5 137.5M201.5 136.5M236.5 136.5L238.5 138.5M251.5 136.5M253.5 136.5M240.5 138.5L242.5 140.5M254.5 138.5M192.5 139.5M206.5 140.5L207.5 141.5M245.5 140.5M119.5 141.5L118.5 142.5M209.5 141.5M224.5 142.5M244.5 142.5M124.5 143.5M47.5 144.5M245.5 144.5L247.5 146.5M253.5 144.5L252.5 145.5M29.5 146.5L40.5 157.5M47.5 146.5M123.5 146.5M207.5 146.5M249.5 146.5M270.5 146.5L272.5 147.5L276.5 151.5L278.5 151.5L279.5 152.5L278.5 154.5L278.5 160.5L279.5 161.5L279.5 165.5L280.5 166.5L279.5 167.5L279.5 183.5L280.5 184.5L280.5 191.5L282.5 195.5L282.5 201.5L281.5 202.5L282.5 203.5L279.5 206.5L281.5 205.5M27.5 147.5M269.5 147.5L270.5 147.5L268.5 149.5L268.5 153.5L269.5 155.5L264.5 160.5L263.5 160.5L261.5 162.5L260.5 161.5L262.5 160.5M123.5 148.5M274.5 148.5L276.5 150.5M235.5 149.5M237.5 149.5M121.5 150.5M116.5 151.5M204.5 151.5L205.5 151.5L209.5 154.5L212.5 154.5L213.5 153.5L216.5 153.5L217.5 152.5L221.5 152.5L222.5 153.5L224.5 153.5L226.5 154.5L230.5 158.5L231.5 161.5L227.5 163.5L225.5 162.5L222.5 162.5L221.5 161.5L219.5 162.5L219.5 161.5M121.5 152.5M205.5 152.5M207.5 152.5M278.5 152.5M26.5 153.5L28.5 155.5M116.5 153.5L115.5 154.5M45.5 154.5L45.5 155.5M112.5 154.5M255.5 154.5L257.5 156.5M30.5 155.5L32.5 157.5M228.5 155.5L230.5 157.5M112.5 156.5M46.5 157.5M99.5 157.5M268.5 157.5L267.5 158.5M97.5 158.5M265.5 158.5M32.5 159.5L36.5 163.5M47.5 159.5M97.5 160.5M289.5 160.5L291.5 162.5M48.5 161.5L49.5 162.5M229.5 161.5L230.5 161.5M285.5 161.5M316.5 161.5M95.5 162.5L94.5 163.5M38.5 163.5M205.5 163.5L206.5 164.5L214.5 164.5L216.5 166.5L222.5 166.5L225.5 169.5L226.5 168.5L227.5 169.5L230.5 169.5L233.5 171.5L235.5 171.5L240.5 176.5L241.5 176.5L240.5 177.5M317.5 163.5M54.5 164.5L55.5 165.5M92.5 164.5M204.5 164.5L205.5 164.5M90.5 165.5L88.5 167.5M214.5 165.5M216.5 165.5L217.5 165.5M279.5 166.5M190.5 167.5M222.5 167.5M224.5 167.5L225.5 168.5M49.5 168.5L51.5 170.5M9.5 169.5L16.5 170.5L17.5 172.5L16.5 173.5L15.5 171.5M32.5 169.5L31.5 170.5L32.5 171.5M62.5 169.5M64.5 169.5M8.5 170.5L9.5 170.5L8.5 172.5M260.5 170.5M64.5 171.5M87.5 171.5M85.5 172.5M237.5 172.5L240.5 175.5M254.5 172.5L253.5 173.5M256.5 172.5M305.5 172.5L306.5 173.5M33.5 173.5L34.5 174.5L35.5 173.5L36.5 174.5M51.5 173.5M300.5 173.5M52.5 175.5M24.5 176.5L25.5 177.5M38.5 176.5L40.5 178.5M75.5 176.5M258.5 176.5L259.5 176.5L260.5 177.5L259.5 177.5M17.5 177.5L18.5 178.5L17.5 178.5M23.5 177.5L20.5 180.5L20.5 183.5L21.5 184.5L21.5 186.5L24.5 191.5L24.5 192.5L23.5 191.5M53.5 177.5M119.5 177.5M299.5 177.5L299.5 178.5M20.5 178.5L21.5 178.5L20.5 179.5M271.5 178.5L271.5 179.5L270.5 179.5M25.5 179.5M217.5 179.5L216.5 180.5M238.5 179.5L237.5 180.5M261.5 179.5M41.5 180.5M43.5 180.5M74.5 180.5L75.5 181.5M265.5 181.5M45.5 182.5L46.5 183.5M48.5 183.5M250.5 183.5L249.5 188.5L252.5 191.5L254.5 191.5L257.5 194.5L259.5 194.5L261.5 196.5L261.5 198.5L259.5 202.5L260.5 204.5L260.5 206.5L256.5 210.5L255.5 210.5L256.5 209.5M117.5 185.5M237.5 185.5L238.5 186.5M307.5 185.5M99.5 186.5L102.5 186.5L103.5 187.5L103.5 188.5L102.5 187.5M194.5 186.5M200.5 186.5M211.5 186.5M272.5 186.5M21.5 187.5M98.5 187.5L99.5 187.5M214.5 187.5L215.5 188.5M192.5 188.5L191.5 189.5M22.5 189.5M251.5 189.5L252.5 190.5M313.5 189.5M200.5 191.5L201.5 192.5L200.5 192.5M231.5 191.5M211.5 192.5L214.5 193.5L216.5 195.5L216.5 196.5L218.5 198.5L218.5 200.5L214.5 204.5L212.5 204.5L208.5 200.5L209.5 199.5L207.5 197.5L208.5 196.5L208.5 194.5L209.5 193.5L210.5 193.5L209.5 194.5M254.5 192.5L255.5 193.5M220.5 193.5M313.5 194.5L314.5 195.5M207.5 195.5M227.5 195.5L230.5 195.5L232.5 196.5L236.5 200.5L238.5 200.5L238.5 201.5L241.5 204.5L244.5 204.5L248.5 201.5L247.5 196.5L246.5 195.5L244.5 195.5L245.5 196.5M259.5 195.5M261.5 195.5M281.5 195.5M226.5 196.5L227.5 196.5L225.5 197.5L221.5 202.5L221.5 204.5L219.5 205.5L219.5 206.5L222.5 210.5L221.5 210.5M19.5 197.5L20.5 198.5M216.5 197.5M224.5 197.5M252.5 197.5L253.5 197.5L253.5 201.5L248.5 202.5M233.5 198.5M235.5 198.5L236.5 199.5M281.5 198.5M13.5 199.5M77.5 199.5L76.5 200.5M225.5 200.5L226.5 200.5L236.5 210.5L235.5 210.5L232.5 207.5M252.5 200.5M87.5 201.5M89.5 201.5M208.5 201.5L210.5 203.5M226.5 201.5M228.5 201.5L232.5 205.5M217.5 202.5L216.5 203.5M222.5 202.5M238.5 202.5L239.5 203.5M212.5 203.5M241.5 203.5M260.5 203.5M294.5 203.5M183.5 205.5L182.5 206.5M186.5 205.5L187.5 206.5M275.5 205.5M294.5 205.5L295.5 206.5M16.5 206.5M93.5 206.5M297.5 206.5M43.5 207.5M276.5 207.5M17.5 208.5M20.5 208.5M83.5 208.5M220.5 208.5M259.5 208.5L258.5 209.5M298.5 208.5M299.5 210.5"/></svg><span class="fig__label">Edges: 609 strokes</span></div>
</div>
<figcaption>Figure 9. The parrot photo, and the edges found in it after steps 1 to 5: 4,878 edge pixels linked into 609 strokes, at 320 × 213 pixels.</figcaption>
</figure>

### 6. Scoring and selecting strokes

The parrot yields 609 strokes, far more than 800 samples can draw legibly, and most of them come
from foliage in the out-of-focus background. Each stroke is given a score:

$$
\text{score} = \text{length} \times \text{strength} \times \text{sharpness}
$$

Strength and sharpness are averages over the pixels of the stroke. The strength is the edge
strength of step 2. The sharpness measures whether the stroke lies in a part of the image that is
in focus. It uses the discrete Laplacian,

$$
L = \big|\,4g_{x,y} - g_{x-1,y} - g_{x+1,y} - g_{x,y-1} - g_{x,y+1}\big|
$$

computed on the grey image before smoothing and averaged over a 7 × 7 neighbourhood.

The justification is again in terms of frequencies. A defocused lens acts on the image
approximately as a low-pass filter: it attenuates high spatial frequencies and leaves low ones
nearly unchanged. The Laplacian, a second derivative, multiplies a component of frequency
$\xi = (\xi_x, \xi_y)$ by $-4\pi^2|\xi|^2$. It therefore responds weakly to gradual shading and
strongly to fine detail, and its average magnitude estimates how much high-frequency content
survived the lens. Edge strength alone cannot separate a soft, high-contrast branch in the
background from a crisp outline on the subject; sharpness
can.<span class="margin-note"><b>The discrete version</b> Applied to $e^{2\pi i(\xi_x x + \xi_y y)}$, the five-point stencil multiplies it by $2\cos 2\pi\xi_x + 2\cos 2\pi\xi_y - 4$, which is close to $-4\pi^2|\xi|^2$ when $\xi$ is small. Measures of this kind are standard in camera autofocus.</span>

The score is a heuristic rather than a result derived from a model. Each factor rewards a property
that a person drawing the scene would favour: long lines, strong contrast and a subject in focus.
The strokes are then selected by three rules.

- Strokes shorter than 24 pixels are discarded.
- A stroke whose strength × sharpness is less than 35% of that of the stroke at the 90th
  percentile is discarded, unless it is longer than 35% of the frame's width. Horizons and
  coastlines are often soft, but they hold a landscape together.
- The remaining strokes are taken in decreasing order of score until their total length exceeds
  2.2 times the perimeter of the frame. On the parrot only 27 strokes pass the first two rules,
  about 1,700 pixels of line, well within that budget.

### 7. Ordering the strokes into a tour

The strokes must now be joined into one closed curve. Each connection runs in a straight line
from the end of one stroke to the start of the next, and is traced with the pen lifted. Choosing
the order and direction of the strokes so that the total length of the connections is as small as
possible is a variant of the travelling salesman problem, for which no efficient exact algorithm is
known. The script uses the nearest-neighbour heuristic. It begins with the highest-scoring stroke,
then repeatedly moves to the unused stroke with an end nearest to the current position of the pen,
reversing that stroke if its far end is the nearer one. A final connection returns to the
start.<span class="margin-note"><b>How good is it?</b> The travelling salesman problem is NP-hard. For the ordinary problem, the nearest-neighbour tour can be longer than the best one by a factor that grows like the logarithm of the number of points (Rosenkrantz, Stearns and Lewis, 1977), though on typical inputs it does much better.</span>

```js
left.forEach((stroke, k) => {
  const d0 = Math.hypot(stroke[0][0] - end[0], stroke[0][1] - end[1]);
  const d1 = Math.hypot(stroke[stroke.length - 1][0] - end[0], stroke[stroke.length - 1][1] - end[1]);
  if (d0 < bestD) [best, bestD, flip] = [k, d0, false];
  if (d1 < bestD) [best, bestD, flip] = [k, d1, true];
});
```

Joining the strokes by straight segments, rather than leaving gaps, is what the smoothness argument
requires. If the pen jumped instantaneously from one stroke to the next, $z(t)$ would be
discontinuous at each jump, the coefficients would decrease like $1/k$, and the partial sums would
overshoot at every jump. With straight connections $z$ is continuous, and each join is only a
corner, whose contribution to the coefficients decreases like $1/k^2$. Because the pen is lifted on
the connections, they do not appear in the drawing.

<figure class="fig">
<div class="fig__panels" style="--panel: 14rem">
<div class="fig__panel"><svg viewBox="0 0 320 213" role="img" aria-label="The 27 strokes kept, mostly the parrot's outline and wing, drawn dark over the many pale strokes that were dropped from the blurred background."><path class="faint" d="M22.5 2.5L21.5 3.5L21.5 5.5L23.5 7.5L25.5 7.5L29.5 3.5L29.5 4.5L27.5 6.5M113.5 2.5L113.5 13.5L112.5 14.5L112.5 22.5L114.5 24.5L115.5 26.5L115.5 28.5L117.5 30.5L115.5 31.5M129.5 2.5L129.5 4.5L130.5 5.5L130.5 12.5L138.5 20.5L140.5 18.5L142.5 18.5L144.5 14.5L141.5 11.5L139.5 11.5L137.5 12.5L134.5 17.5L137.5 20.5M213.5 2.5L213.5 5.5L211.5 7.5L206.5 7.5L205.5 6.5L205.5 3.5L204.5 2.5L205.5 2.5M265.5 2.5L270.5 2.5L273.5 5.5L273.5 8.5L270.5 10.5L268.5 10.5L265.5 6.5L265.5 4.5L266.5 4.5M280.5 2.5L284.5 4.5L286.5 4.5L287.5 5.5L287.5 10.5L283.5 14.5L281.5 15.5L277.5 13.5L277.5 8.5L279.5 7.5L281.5 7.5M46.5 3.5L46.5 5.5L52.5 11.5L52.5 13.5L54.5 17.5L54.5 18.5L52.5 19.5L50.5 21.5L50.5 22.5L53.5 25.5L56.5 25.5L56.5 26.5M275.5 3.5L272.5 3.5L271.5 4.5L272.5 5.5M277.5 6.5L278.5 6.5M36.5 12.5L38.5 12.5L40.5 15.5L43.5 15.5L49.5 21.5L50.5 20.5L49.5 20.5L45.5 16.5M30.5 13.5L30.5 10.5L34.5 6.5L35.5 4.5L35.5 3.5L34.5 2.5L34.5 3.5M30.5 15.5L32.5 15.5L35.5 18.5L36.5 21.5L42.5 27.5L44.5 27.5L47.5 30.5L49.5 30.5L51.5 34.5L53.5 35.5L52.5 36.5L51.5 35.5M15.5 17.5L12.5 18.5L9.5 21.5L9.5 23.5L11.5 25.5M37.5 17.5L37.5 16.5L39.5 15.5M275.5 25.5L275.5 28.5L281.5 34.5L282.5 33.5L287.5 33.5L287.5 32.5M257.5 27.5L258.5 28.5L260.5 28.5L260.5 26.5L261.5 25.5L261.5 19.5L260.5 18.5L260.5 13.5L257.5 10.5L258.5 10.5L260.5 12.5M34.5 29.5L31.5 32.5L28.5 33.5L26.5 35.5L26.5 36.5L28.5 38.5L30.5 38.5L33.5 41.5L34.5 43.5M2.5 33.5L3.5 35.5L3.5 37.5M305.5 38.5L306.5 40.5L308.5 39.5L310.5 39.5L310.5 41.5L312.5 44.5L317.5 43.5M29.5 43.5L26.5 44.5L24.5 46.5L24.5 49.5L23.5 50.5L23.5 57.5L22.5 58.5L19.5 58.5L17.5 56.5L16.5 56.5L17.5 57.5M31.5 43.5L31.5 41.5M248.5 44.5L247.5 46.5L247.5 49.5L244.5 52.5L242.5 53.5L239.5 52.5L237.5 54.5L235.5 54.5L234.5 55.5L231.5 52.5L231.5 48.5L234.5 45.5L236.5 45.5L237.5 44.5L240.5 44.5L241.5 45.5L244.5 45.5L246.5 46.5M313.5 47.5L311.5 46.5L312.5 45.5M317.5 49.5L315.5 49.5L313.5 51.5L313.5 53.5L316.5 56.5L317.5 58.5L317.5 59.5L316.5 58.5M203.5 51.5L203.5 50.5L201.5 48.5L199.5 47.5L196.5 48.5L194.5 46.5L188.5 46.5L186.5 48.5L185.5 48.5L183.5 50.5L183.5 51.5L184.5 50.5M29.5 53.5L29.5 51.5L30.5 50.5L35.5 49.5L35.5 48.5L37.5 46.5L37.5 44.5L39.5 42.5L39.5 36.5L34.5 31.5L33.5 31.5M260.5 54.5L262.5 58.5L267.5 63.5L272.5 63.5L275.5 60.5L274.5 62.5M251.5 55.5L246.5 53.5L245.5 52.5L246.5 51.5M170.5 56.5L175.5 61.5L175.5 63.5L174.5 64.5L174.5 67.5L176.5 69.5L180.5 69.5L181.5 68.5L181.5 60.5L180.5 59.5L180.5 56.5L178.5 54.5L176.5 54.5L175.5 53.5L172.5 56.5L172.5 57.5L174.5 59.5M206.5 56.5L206.5 59.5L207.5 60.5L207.5 65.5L208.5 66.5L208.5 74.5M143.5 63.5L138.5 64.5L130.5 68.5L126.5 71.5L125.5 74.5M317.5 63.5L316.5 64.5L316.5 68.5M40.5 68.5L38.5 70.5L38.5 71.5L41.5 74.5L43.5 75.5L46.5 75.5L57.5 86.5L57.5 88.5L62.5 93.5L61.5 95.5L61.5 97.5L60.5 98.5L60.5 100.5L58.5 102.5L59.5 104.5L59.5 106.5L61.5 109.5L60.5 109.5M67.5 68.5L65.5 68.5L63.5 66.5L63.5 64.5L60.5 60.5L62.5 61.5M126.5 68.5L126.5 63.5L127.5 62.5L127.5 56.5L126.5 54.5L127.5 55.5L128.5 54.5L131.5 48.5L131.5 38.5L130.5 37.5L130.5 34.5L129.5 33.5L129.5 27.5L134.5 22.5L135.5 19.5M230.5 69.5L229.5 68.5L224.5 68.5L223.5 67.5L220.5 69.5L220.5 66.5L217.5 63.5L214.5 66.5L214.5 69.5L216.5 71.5L218.5 69.5L218.5 70.5M36.5 70.5L37.5 70.5M26.5 71.5L26.5 74.5L33.5 81.5L36.5 81.5L36.5 79.5L37.5 78.5L37.5 75.5L31.5 69.5L29.5 65.5L23.5 59.5M127.5 74.5L131.5 78.5L130.5 76.5M44.5 80.5L46.5 85.5L52.5 92.5L53.5 94.5L53.5 96.5L56.5 99.5L57.5 99.5M60.5 84.5L60.5 80.5L59.5 79.5L59.5 67.5L60.5 67.5M126.5 85.5L126.5 77.5L127.5 76.5M82.5 86.5L81.5 87.5L81.5 88.5L82.5 88.5M206.5 93.5L206.5 95.5L204.5 96.5L197.5 96.5L196.5 95.5L192.5 95.5L189.5 98.5L189.5 102.5L190.5 104.5M206.5 97.5L205.5 97.5M108.5 98.5L109.5 97.5L109.5 87.5L110.5 86.5L110.5 81.5L109.5 80.5L109.5 77.5L110.5 76.5L110.5 69.5L108.5 67.5L108.5 64.5L107.5 63.5L109.5 62.5L109.5 56.5L111.5 52.5L111.5 41.5L113.5 39.5L114.5 40.5L113.5 40.5M258.5 98.5L259.5 100.5L261.5 100.5L263.5 99.5L265.5 101.5L267.5 101.5L268.5 100.5L273.5 100.5L275.5 102.5L277.5 102.5L279.5 104.5L282.5 104.5L286.5 108.5L288.5 108.5L291.5 111.5L294.5 111.5L295.5 112.5L300.5 113.5L303.5 115.5L305.5 115.5L306.5 116.5L305.5 116.5M65.5 101.5L63.5 103.5L67.5 107.5L69.5 107.5L71.5 105.5L71.5 101.5L68.5 98.5L66.5 98.5L64.5 96.5L64.5 95.5L66.5 97.5M8.5 103.5L10.5 104.5L10.5 102.5L12.5 100.5L15.5 103.5L15.5 112.5L14.5 113.5L14.5 125.5L15.5 126.5L15.5 128.5L16.5 130.5L20.5 135.5L18.5 134.5M201.5 108.5L203.5 107.5L207.5 110.5L209.5 109.5L211.5 109.5M179.5 109.5L179.5 115.5L181.5 117.5L182.5 117.5M99.5 111.5L94.5 111.5L93.5 112.5L90.5 112.5L90.5 111.5M196.5 114.5L198.5 114.5L200.5 113.5L201.5 114.5L203.5 114.5L206.5 117.5L210.5 117.5L216.5 120.5L222.5 120.5L223.5 121.5L226.5 121.5L229.5 118.5L229.5 116.5L227.5 115.5M44.5 115.5L41.5 112.5L41.5 110.5L40.5 109.5L40.5 102.5L35.5 97.5L35.5 94.5L36.5 93.5L37.5 93.5L36.5 94.5M317.5 118.5L314.5 116.5L310.5 116.5L308.5 114.5L310.5 115.5M40.5 121.5L39.5 120.5L37.5 120.5L35.5 122.5L35.5 127.5L37.5 129.5L38.5 129.5L40.5 127.5L40.5 125.5L41.5 124.5M189.5 121.5L191.5 121.5L192.5 122.5L194.5 126.5L194.5 128.5L196.5 130.5L196.5 132.5M56.5 128.5L57.5 130.5L57.5 132.5L54.5 135.5L52.5 135.5L50.5 133.5L50.5 129.5L47.5 126.5L45.5 126.5L44.5 124.5L44.5 120.5L42.5 118.5L43.5 117.5L43.5 118.5M236.5 133.5L236.5 135.5L242.5 141.5L245.5 141.5L245.5 143.5L249.5 147.5L250.5 146.5L252.5 146.5L254.5 144.5L254.5 139.5L251.5 135.5L247.5 135.5L246.5 134.5L244.5 134.5L242.5 133.5M36.5 134.5L34.5 132.5L33.5 132.5L30.5 135.5L30.5 137.5M204.5 134.5L204.5 132.5L205.5 131.5L210.5 131.5L212.5 133.5L212.5 136.5L210.5 138.5L211.5 136.5M48.5 141.5L48.5 144.5L46.5 146.5L46.5 156.5L48.5 160.5L56.5 167.5L59.5 167.5L60.5 168.5L62.5 168.5L65.5 171.5L65.5 173.5L66.5 174.5L65.5 175.5M211.5 141.5L218.5 141.5L219.5 140.5L221.5 140.5L222.5 141.5L224.5 141.5L227.5 143.5L229.5 143.5L231.5 144.5M187.5 156.5L188.5 158.5L188.5 161.5L189.5 162.5L191.5 162.5M43.5 158.5L40.5 158.5L29.5 147.5L25.5 149.5L26.5 150.5L26.5 152.5L38.5 164.5L40.5 164.5L43.5 166.5L45.5 166.5L47.5 167.5L51.5 171.5L54.5 177.5L51.5 180.5L51.5 182.5L53.5 184.5M101.5 159.5L98.5 158.5L96.5 160.5L96.5 162.5L94.5 164.5L91.5 165.5L88.5 168.5L88.5 171.5L87.5 172.5L85.5 173.5L83.5 173.5L80.5 175.5L77.5 175.5L75.5 177.5L75.5 180.5L76.5 181.5L75.5 183.5M271.5 160.5L272.5 162.5L272.5 185.5L273.5 186.5L273.5 194.5L274.5 195.5L274.5 198.5L275.5 199.5L274.5 200.5L274.5 202.5L278.5 209.5L278.5 210.5L277.5 209.5M117.5 162.5L116.5 163.5L116.5 166.5L115.5 167.5L115.5 170.5L114.5 171.5L114.5 177.5L113.5 178.5L113.5 181.5M256.5 163.5L256.5 160.5L257.5 159.5L257.5 157.5L253.5 153.5L247.5 153.5L246.5 152.5L244.5 152.5L240.5 150.5L237.5 150.5L235.5 148.5L233.5 148.5L231.5 146.5L233.5 147.5M20.5 165.5L21.5 166.5L23.5 165.5L24.5 166.5L26.5 166.5L30.5 168.5L33.5 171.5L33.5 172.5L36.5 175.5L38.5 175.5L43.5 181.5L45.5 181.5L48.5 184.5L49.5 183.5L51.5 183.5M183.5 167.5L183.5 177.5L184.5 178.5L184.5 183.5L186.5 187.5L186.5 192.5L185.5 193.5L185.5 196.5M22.5 174.5L22.5 175.5L26.5 179.5L26.5 182.5L27.5 183.5L27.5 187.5L28.5 188.5L28.5 189.5L27.5 190.5L27.5 189.5M17.5 175.5L16.5 176.5L11.5 176.5L8.5 173.5L7.5 173.5L9.5 175.5M193.5 177.5L192.5 176.5L192.5 174.5L190.5 172.5L190.5 169.5L189.5 168.5L189.5 163.5M247.5 177.5L241.5 177.5L237.5 181.5L238.5 183.5L238.5 185.5L239.5 186.5L243.5 186.5M61.5 179.5L61.5 182.5L65.5 186.5L67.5 187.5L71.5 187.5L72.5 186.5L74.5 186.5L75.5 185.5L74.5 185.5M255.5 180.5L258.5 180.5L260.5 178.5L262.5 179.5L264.5 179.5L265.5 180.5L266.5 180.5L268.5 178.5L266.5 179.5M187.5 183.5L188.5 182.5L188.5 179.5L190.5 177.5L191.5 177.5L190.5 178.5M214.5 183.5L214.5 181.5L217.5 178.5L219.5 179.5L222.5 179.5L222.5 180.5M252.5 183.5L251.5 182.5L251.5 178.5L252.5 177.5L252.5 175.5L256.5 171.5L260.5 171.5L262.5 169.5L264.5 169.5L267.5 166.5L268.5 167.5L266.5 166.5M57.5 185.5L63.5 185.5L61.5 183.5M194.5 191.5L194.5 193.5L191.5 199.5L191.5 208.5L190.5 206.5M214.5 191.5L215.5 191.5M15.5 194.5L20.5 199.5L21.5 201.5L21.5 208.5L20.5 209.5L17.5 209.5L16.5 208.5L15.5 206.5L15.5 200.5L13.5 198.5L8.5 198.5L7.5 199.5L6.5 199.5L7.5 198.5M93.5 195.5L94.5 196.5L95.5 196.5L96.5 194.5L100.5 194.5L101.5 195.5L104.5 195.5M42.5 201.5L42.5 204.5L44.5 208.5L46.5 210.5L44.5 209.5M75.5 204.5L75.5 200.5L77.5 198.5L84.5 198.5L86.5 199.5L89.5 202.5L89.5 203.5L93.5 207.5L95.5 208.5L96.5 210.5M88.5 205.5L89.5 204.5L91.5 206.5M267.5 206.5L271.5 204.5L273.5 204.5L274.5 203.5M71.5 210.5L77.5 210.5L78.5 209.5L84.5 209.5L85.5 210.5L84.5 210.5M188.5 210.5L187.5 209.5L187.5 207.5L185.5 205.5L184.5 205.5L181.5 208.5L181.5 209.5L182.5 210.5L182.5 209.5M270.5 3.5M36.5 5.5L38.5 5.5L41.5 7.5L42.5 7.5L44.5 5.5L46.5 6.5L44.5 6.5M212.5 5.5L211.5 6.5M239.5 5.5L241.5 5.5L245.5 8.5L245.5 11.5L243.5 13.5L241.5 13.5L237.5 9.5L237.5 6.5L239.5 6.5M286.5 5.5M21.5 6.5L22.5 7.5L21.5 7.5M206.5 6.5M243.5 6.5M34.5 7.5L31.5 10.5M49.5 7.5L51.5 9.5M40.5 8.5L40.5 10.5L39.5 11.5L38.5 11.5L39.5 10.5M272.5 8.5M24.5 9.5L25.5 9.5L26.5 12.5L28.5 14.5L28.5 20.5L27.5 21.5L27.5 26.5L29.5 27.5L31.5 25.5L31.5 23.5L32.5 22.5L32.5 23.5M266.5 9.5M268.5 9.5M237.5 10.5L239.5 12.5M25.5 11.5M51.5 11.5M142.5 11.5L144.5 13.5M244.5 11.5M285.5 11.5L283.5 13.5M26.5 13.5L27.5 14.5M130.5 13.5L133.5 16.5M244.5 13.5M52.5 14.5M19.5 16.5L18.5 17.5M22.5 16.5M32.5 16.5L35.5 20.5M142.5 17.5M11.5 18.5L9.5 20.5M53.5 18.5M261.5 18.5M141.5 19.5M27.5 20.5M36.5 22.5L37.5 23.5M51.5 22.5L52.5 23.5M8.5 23.5L9.5 24.5L8.5 24.5L6.5 26.5L2.5 28.5L2.5 27.5M39.5 23.5L42.5 26.5M114.5 23.5M132.5 23.5M134.5 23.5M205.5 23.5L207.5 23.5M7.5 24.5L6.5 25.5M205.5 24.5L205.5 25.5L209.5 29.5L208.5 29.5L205.5 26.5M30.5 25.5M132.5 25.5L130.5 27.5M213.5 25.5L213.5 28.5M310.5 25.5L312.5 26.5L312.5 28.5L314.5 32.5L313.5 34.5L317.5 38.5L317.5 37.5L314.5 34.5L313.5 35.5M4.5 26.5M114.5 26.5M219.5 26.5M261.5 26.5M311.5 26.5M27.5 27.5M44.5 28.5L45.5 29.5M47.5 29.5M115.5 29.5M275.5 29.5L279.5 33.5M213.5 30.5L215.5 32.5M31.5 31.5M123.5 31.5L123.5 32.5M20.5 32.5M29.5 32.5M36.5 32.5L39.5 35.5M49.5 32.5L50.5 33.5M220.5 32.5M27.5 33.5L26.5 34.5M281.5 33.5M2.5 35.5M119.5 35.5M26.5 37.5L27.5 38.5M313.5 37.5L314.5 42.5M312.5 38.5M30.5 39.5M32.5 39.5L33.5 40.5M189.5 39.5L191.5 39.5L192.5 40.5L198.5 40.5L199.5 41.5L202.5 41.5L204.5 43.5L206.5 43.5L210.5 47.5L209.5 48.5L210.5 49.5L209.5 50.5L210.5 52.5L209.5 53.5L209.5 55.5L208.5 55.5M307.5 39.5M187.5 40.5L188.5 40.5L186.5 42.5L185.5 42.5L186.5 41.5M190.5 40.5L191.5 40.5M313.5 40.5M195.5 41.5L196.5 41.5M306.5 41.5L306.5 44.5L309.5 48.5L310.5 50.5L309.5 50.5M38.5 42.5M202.5 42.5M204.5 42.5M310.5 42.5M25.5 44.5M38.5 44.5M206.5 44.5L209.5 47.5M25.5 46.5M234.5 46.5L232.5 48.5M244.5 46.5M186.5 47.5M194.5 47.5M196.5 47.5M307.5 47.5L308.5 48.5M184.5 48.5M202.5 48.5L203.5 49.5M32.5 49.5M314.5 49.5M124.5 50.5M30.5 51.5M120.5 51.5L121.5 52.5M129.5 51.5M209.5 52.5M238.5 52.5L237.5 53.5M241.5 52.5L242.5 52.5M199.5 53.5M231.5 53.5L232.5 54.5M140.5 54.5M197.5 54.5M17.5 55.5M174.5 55.5M178.5 55.5M193.5 55.5L192.5 56.5M281.5 55.5L284.5 58.5L284.5 62.5L282.5 64.5L280.5 63.5L277.5 60.5L277.5 58.5L279.5 56.5L280.5 56.5L278.5 58.5M314.5 55.5L315.5 56.5M141.5 56.5L144.5 59.5M241.5 56.5L241.5 59.5L235.5 64.5L235.5 66.5L236.5 67.5L239.5 67.5L240.5 68.5L244.5 68.5L245.5 67.5L249.5 67.5L250.5 68.5L252.5 68.5L256.5 72.5L256.5 75.5L255.5 75.5M260.5 56.5L261.5 57.5M283.5 56.5L284.5 57.5M19.5 57.5M22.5 57.5M240.5 57.5M240.5 59.5L238.5 61.5M262.5 59.5M25.5 60.5L29.5 64.5M145.5 61.5L147.5 63.5L148.5 62.5M192.5 61.5M194.5 61.5M197.5 61.5M279.5 61.5M236.5 62.5L235.5 63.5M272.5 62.5M283.5 62.5L282.5 63.5M63.5 63.5M140.5 63.5M218.5 63.5L219.5 63.5L220.5 65.5M137.5 64.5M271.5 64.5M135.5 65.5M162.5 65.5M214.5 65.5M30.5 66.5L31.5 67.5M64.5 66.5M69.5 66.5L72.5 72.5L74.5 74.5L74.5 76.5L76.5 78.5L80.5 86.5L80.5 87.5L79.5 86.5M133.5 66.5M69.5 67.5M131.5 67.5M164.5 67.5L166.5 69.5M221.5 67.5M235.5 67.5L235.5 68.5M243.5 67.5L244.5 67.5M129.5 68.5L128.5 69.5M180.5 68.5M193.5 68.5L193.5 69.5L191.5 71.5L191.5 74.5L192.5 76.5L196.5 80.5L198.5 80.5L200.5 82.5L200.5 83.5L198.5 81.5M32.5 69.5M70.5 69.5M168.5 69.5L170.5 71.5M175.5 69.5M192.5 69.5L191.5 70.5M254.5 69.5L255.5 70.5M39.5 70.5L40.5 72.5M214.5 70.5L215.5 71.5L216.5 70.5M32.5 71.5M34.5 71.5L35.5 72.5L34.5 73.5M71.5 71.5M198.5 71.5L204.5 77.5M72.5 73.5L73.5 74.5M170.5 73.5L172.5 75.5M40.5 74.5M26.5 75.5M28.5 75.5L31.5 78.5M48.5 76.5L50.5 78.5M74.5 77.5L75.5 79.5M173.5 77.5M192.5 77.5L193.5 78.5M86.5 78.5L93.5 78.5L94.5 79.5L97.5 79.5L98.5 80.5L98.5 81.5L97.5 80.5M195.5 78.5L196.5 79.5M37.5 79.5M85.5 79.5L86.5 79.5L85.5 80.5L86.5 82.5L86.5 84.5L84.5 86.5L84.5 85.5M158.5 79.5L161.5 79.5L162.5 80.5L162.5 83.5L159.5 83.5L158.5 82.5L158.5 80.5M174.5 79.5L175.5 80.5M302.5 79.5M31.5 80.5L32.5 81.5M50.5 80.5L56.5 86.5M161.5 80.5M131.5 81.5L130.5 82.5M207.5 81.5L208.5 82.5M77.5 82.5M137.5 82.5M139.5 82.5L140.5 83.5M159.5 82.5M210.5 82.5L212.5 84.5M193.5 83.5M45.5 84.5M78.5 84.5M130.5 84.5M142.5 85.5L143.5 86.5M193.5 85.5M46.5 86.5L49.5 89.5M128.5 86.5M171.5 86.5L173.5 88.5M297.5 86.5L298.5 87.5M144.5 88.5L145.5 89.5M210.5 88.5M302.5 88.5M57.5 89.5L61.5 93.5L61.5 94.5M192.5 89.5M194.5 89.5M174.5 90.5L176.5 92.5M200.5 90.5M50.5 91.5L51.5 92.5M191.5 95.5L189.5 97.5M197.5 95.5L198.5 95.5M204.5 95.5M55.5 97.5M176.5 97.5M35.5 98.5L37.5 100.5M55.5 99.5M70.5 99.5L71.5 100.5M177.5 99.5L178.5 100.5M182.5 99.5L183.5 100.5M59.5 100.5L58.5 101.5M102.5 100.5L100.5 102.5M255.5 100.5L258.5 100.5L259.5 101.5M12.5 101.5L11.5 102.5M42.5 101.5L45.5 101.5L46.5 102.5L46.5 104.5L47.5 105.5L47.5 110.5L48.5 111.5L50.5 111.5L52.5 113.5L52.5 114.5L50.5 112.5M107.5 101.5M254.5 101.5L255.5 101.5L249.5 107.5L249.5 108.5L253.5 104.5M275.5 101.5M15.5 102.5M41.5 102.5L42.5 102.5M45.5 102.5M63.5 102.5L65.5 104.5M144.5 102.5M184.5 102.5L185.5 103.5M191.5 102.5L195.5 102.5L200.5 105.5L202.5 105.5L202.5 106.5M253.5 102.5M93.5 103.5L90.5 106.5L91.5 107.5M277.5 103.5M279.5 103.5M124.5 104.5L124.5 105.5M144.5 104.5M9.5 105.5M70.5 105.5L69.5 106.5M282.5 105.5L284.5 107.5M65.5 106.5M142.5 106.5L141.5 107.5M59.5 107.5M286.5 107.5M203.5 108.5L204.5 109.5M41.5 109.5M141.5 109.5L140.5 110.5M288.5 109.5L289.5 110.5M45.5 110.5L46.5 110.5L43.5 113.5L42.5 112.5M291.5 110.5M187.5 111.5M244.5 111.5L245.5 111.5L244.5 112.5L240.5 112.5L239.5 113.5L236.5 113.5L230.5 116.5L229.5 115.5L230.5 115.5M294.5 112.5M123.5 113.5L122.5 114.5M132.5 113.5M188.5 113.5L193.5 118.5M235.5 113.5M297.5 113.5M120.5 114.5L114.5 120.5M232.5 114.5L233.5 114.5M99.5 115.5L101.5 117.5M133.5 115.5M203.5 115.5L204.5 116.5M107.5 116.5M179.5 116.5L180.5 117.5M134.5 117.5M37.5 119.5L35.5 121.5M134.5 119.5L135.5 120.5M229.5 119.5L228.5 120.5M13.5 120.5L13.5 121.5M184.5 120.5L185.5 121.5M194.5 120.5M226.5 120.5M114.5 122.5M117.5 122.5M191.5 122.5M45.5 124.5M112.5 124.5M117.5 124.5M192.5 124.5M197.5 124.5M112.5 126.5M115.5 126.5M193.5 126.5M47.5 127.5M49.5 127.5L50.5 128.5M35.5 128.5L36.5 129.5L34.5 131.5L35.5 129.5M38.5 128.5M15.5 129.5M193.5 129.5L192.5 130.5M56.5 130.5M113.5 130.5L112.5 131.5M195.5 130.5M16.5 131.5L17.5 132.5M121.5 131.5M31.5 132.5L32.5 132.5L30.5 134.5M56.5 132.5M205.5 132.5M210.5 132.5M212.5 132.5M244.5 132.5L244.5 133.5M272.5 132.5L277.5 137.5M51.5 133.5M200.5 133.5M294.5 133.5M56.5 134.5L55.5 135.5M247.5 134.5M122.5 135.5L121.5 136.5M191.5 136.5M196.5 136.5L197.5 137.5M201.5 136.5M236.5 136.5L238.5 138.5M251.5 136.5M253.5 136.5M240.5 138.5L242.5 140.5M254.5 138.5M192.5 139.5M206.5 140.5L207.5 141.5M245.5 140.5M119.5 141.5L118.5 142.5M209.5 141.5M224.5 142.5M244.5 142.5M124.5 143.5M47.5 144.5M245.5 144.5L247.5 146.5M253.5 144.5L252.5 145.5M29.5 146.5L40.5 157.5M47.5 146.5M123.5 146.5M207.5 146.5M249.5 146.5M27.5 147.5M269.5 147.5L270.5 147.5L268.5 149.5L268.5 153.5L269.5 155.5L264.5 160.5L263.5 160.5L261.5 162.5L260.5 161.5L262.5 160.5M123.5 148.5M274.5 148.5L276.5 150.5M235.5 149.5M237.5 149.5M121.5 150.5M116.5 151.5M204.5 151.5L205.5 151.5L209.5 154.5L212.5 154.5L213.5 153.5L216.5 153.5L217.5 152.5L221.5 152.5L222.5 153.5L224.5 153.5L226.5 154.5L230.5 158.5L231.5 161.5L227.5 163.5L225.5 162.5L222.5 162.5L221.5 161.5L219.5 162.5L219.5 161.5M121.5 152.5M205.5 152.5M207.5 152.5M278.5 152.5M26.5 153.5L28.5 155.5M116.5 153.5L115.5 154.5M45.5 154.5L45.5 155.5M112.5 154.5M255.5 154.5L257.5 156.5M30.5 155.5L32.5 157.5M228.5 155.5L230.5 157.5M112.5 156.5M46.5 157.5M99.5 157.5M268.5 157.5L267.5 158.5M97.5 158.5M265.5 158.5M32.5 159.5L36.5 163.5M47.5 159.5M97.5 160.5M289.5 160.5L291.5 162.5M48.5 161.5L49.5 162.5M229.5 161.5L230.5 161.5M285.5 161.5M316.5 161.5M95.5 162.5L94.5 163.5M38.5 163.5M317.5 163.5M54.5 164.5L55.5 165.5M92.5 164.5M204.5 164.5L205.5 164.5M90.5 165.5L88.5 167.5M214.5 165.5M216.5 165.5L217.5 165.5M279.5 166.5M190.5 167.5M222.5 167.5M224.5 167.5L225.5 168.5M49.5 168.5L51.5 170.5M9.5 169.5L16.5 170.5L17.5 172.5L16.5 173.5L15.5 171.5M32.5 169.5L31.5 170.5L32.5 171.5M62.5 169.5M64.5 169.5M8.5 170.5L9.5 170.5L8.5 172.5M260.5 170.5M64.5 171.5M87.5 171.5M85.5 172.5M237.5 172.5L240.5 175.5M254.5 172.5L253.5 173.5M256.5 172.5M305.5 172.5L306.5 173.5M33.5 173.5L34.5 174.5L35.5 173.5L36.5 174.5M51.5 173.5M300.5 173.5M52.5 175.5M24.5 176.5L25.5 177.5M38.5 176.5L40.5 178.5M75.5 176.5M258.5 176.5L259.5 176.5L260.5 177.5L259.5 177.5M17.5 177.5L18.5 178.5L17.5 178.5M23.5 177.5L20.5 180.5L20.5 183.5L21.5 184.5L21.5 186.5L24.5 191.5L24.5 192.5L23.5 191.5M53.5 177.5M119.5 177.5M299.5 177.5L299.5 178.5M20.5 178.5L21.5 178.5L20.5 179.5M271.5 178.5L271.5 179.5L270.5 179.5M25.5 179.5M217.5 179.5L216.5 180.5M238.5 179.5L237.5 180.5M261.5 179.5M41.5 180.5M43.5 180.5M74.5 180.5L75.5 181.5M265.5 181.5M45.5 182.5L46.5 183.5M48.5 183.5M250.5 183.5L249.5 188.5L252.5 191.5L254.5 191.5L257.5 194.5L259.5 194.5L261.5 196.5L261.5 198.5L259.5 202.5L260.5 204.5L260.5 206.5L256.5 210.5L255.5 210.5L256.5 209.5M117.5 185.5M237.5 185.5L238.5 186.5M307.5 185.5M99.5 186.5L102.5 186.5L103.5 187.5L103.5 188.5L102.5 187.5M194.5 186.5M200.5 186.5M211.5 186.5M272.5 186.5M21.5 187.5M98.5 187.5L99.5 187.5M214.5 187.5L215.5 188.5M192.5 188.5L191.5 189.5M22.5 189.5M251.5 189.5L252.5 190.5M313.5 189.5M200.5 191.5L201.5 192.5L200.5 192.5M231.5 191.5M254.5 192.5L255.5 193.5M220.5 193.5M313.5 194.5L314.5 195.5M207.5 195.5M227.5 195.5L230.5 195.5L232.5 196.5L236.5 200.5L238.5 200.5L238.5 201.5L241.5 204.5L244.5 204.5L248.5 201.5L247.5 196.5L246.5 195.5L244.5 195.5L245.5 196.5M259.5 195.5M261.5 195.5M281.5 195.5M226.5 196.5L227.5 196.5L225.5 197.5L221.5 202.5L221.5 204.5L219.5 205.5L219.5 206.5L222.5 210.5L221.5 210.5M19.5 197.5L20.5 198.5M216.5 197.5M224.5 197.5M252.5 197.5L253.5 197.5L253.5 201.5L248.5 202.5M233.5 198.5M235.5 198.5L236.5 199.5M281.5 198.5M13.5 199.5M77.5 199.5L76.5 200.5M225.5 200.5L226.5 200.5L236.5 210.5L235.5 210.5L232.5 207.5M252.5 200.5M87.5 201.5M89.5 201.5M208.5 201.5L210.5 203.5M226.5 201.5M228.5 201.5L232.5 205.5M217.5 202.5L216.5 203.5M222.5 202.5M238.5 202.5L239.5 203.5M212.5 203.5M241.5 203.5M260.5 203.5M294.5 203.5M183.5 205.5L182.5 206.5M186.5 205.5L187.5 206.5M275.5 205.5M294.5 205.5L295.5 206.5M16.5 206.5M93.5 206.5M297.5 206.5M43.5 207.5M276.5 207.5M17.5 208.5M20.5 208.5M83.5 208.5M220.5 208.5M259.5 208.5L258.5 209.5M298.5 208.5M299.5 210.5"/><path class="ink" d="M122.5 81.5L122.5 84.5L123.5 85.5L123.5 95.5L122.5 96.5L122.5 101.5L125.5 104.5L124.5 106.5L124.5 111.5L113.5 122.5L113.5 124.5L111.5 126.5L111.5 128.5L110.5 129.5L110.5 131.5L111.5 132.5L112.5 132.5L114.5 130.5L114.5 128.5L116.5 126.5L116.5 124.5L118.5 122.5L118.5 120.5L124.5 117.5L130.5 111.5L129.5 109.5L129.5 105.5L128.5 104.5L128.5 88.5L129.5 87.5L129.5 84.5L132.5 81.5L137.5 81.5L140.5 84.5L142.5 84.5L146.5 89.5L146.5 97.5L145.5 98.5L145.5 102.5L143.5 104.5L143.5 106.5L139.5 110.5L139.5 113.5L138.5 114.5L138.5 120.5L137.5 121.5L133.5 117.5L132.5 114.5L130.5 112.5L126.5 116.5M195.5 134.5L198.5 137.5L201.5 143.5L201.5 152.5L199.5 154.5L199.5 161.5L200.5 162.5L200.5 168.5L199.5 169.5L199.5 173.5L198.5 174.5L198.5 176.5L197.5 177.5L196.5 182.5L193.5 186.5L193.5 188.5L190.5 192.5L190.5 195.5M138.5 53.5L140.5 53.5L141.5 55.5L148.5 63.5L156.5 63.5L157.5 64.5L160.5 64.5L162.5 66.5L164.5 66.5L173.5 75.5L178.5 85.5L178.5 87.5L180.5 91.5L180.5 94.5L182.5 98.5L186.5 103.5L186.5 107.5L187.5 108.5L187.5 110.5L188.5 112.5L194.5 118.5L194.5 119.5L198.5 124.5L197.5 125.5L199.5 128.5L199.5 130.5L201.5 133.5L201.5 135.5L202.5 137.5L204.5 139.5L206.5 139.5L209.5 142.5L208.5 144.5L205.5 147.5L204.5 146.5L205.5 146.5M183.5 108.5L183.5 110.5L185.5 113.5L185.5 115.5L184.5 116.5L184.5 119.5L186.5 121.5L186.5 128.5L187.5 129.5L187.5 136.5L189.5 140.5L189.5 143.5L190.5 144.5L190.5 148.5L191.5 149.5L191.5 152.5L192.5 153.5L192.5 157.5L193.5 158.5L193.5 163.5L194.5 164.5L194.5 167.5L193.5 168.5L193.5 170.5M308.5 210.5L308.5 204.5L307.5 203.5L307.5 186.5L306.5 185.5L306.5 174.5L304.5 172.5L302.5 172.5L300.5 174.5L300.5 191.5L301.5 192.5L301.5 205.5L302.5 206.5L302.5 210.5L300.5 209.5L298.5 209.5L297.5 207.5L293.5 203.5L293.5 201.5L292.5 200.5L292.5 185.5L291.5 184.5L291.5 163.5L288.5 160.5L287.5 160.5L284.5 164.5L284.5 166.5L285.5 167.5L285.5 190.5L286.5 191.5L286.5 197.5L285.5 198.5L285.5 196.5M190.5 129.5L192.5 131.5L191.5 133.5L192.5 134.5L192.5 138.5L194.5 142.5L194.5 147.5L195.5 148.5L195.5 151.5L196.5 152.5L196.5 158.5L197.5 159.5L197.5 161.5M124.5 134.5L121.5 137.5L121.5 140.5L119.5 142.5L119.5 145.5L118.5 146.5L117.5 151.5L111.5 156.5L111.5 158.5L110.5 159.5L110.5 161.5L111.5 162.5L111.5 171.5L110.5 172.5L110.5 184.5L111.5 185.5L111.5 189.5L112.5 190.5L112.5 192.5L114.5 194.5L113.5 194.5M200.5 126.5L209.5 126.5L210.5 127.5L213.5 127.5L214.5 128.5L217.5 128.5L218.5 129.5L220.5 129.5L221.5 128.5L225.5 128.5L226.5 129.5L236.5 129.5L237.5 128.5L244.5 128.5L245.5 129.5L251.5 129.5L252.5 130.5L258.5 130.5L259.5 131.5L272.5 131.5L278.5 137.5L283.5 137.5M270.5 146.5L272.5 147.5L276.5 151.5L278.5 151.5L279.5 152.5L278.5 154.5L278.5 160.5L279.5 161.5L279.5 165.5L280.5 166.5L279.5 167.5L279.5 183.5L280.5 184.5L280.5 191.5L282.5 195.5L282.5 201.5L281.5 202.5L282.5 203.5L279.5 206.5L281.5 205.5M120.5 133.5L122.5 131.5L124.5 131.5L124.5 133.5L126.5 136.5L125.5 138.5L125.5 143.5L124.5 144.5L124.5 146.5L122.5 148.5L122.5 150.5L120.5 152.5L120.5 154.5L119.5 155.5L119.5 158.5L118.5 159.5L120.5 161.5L120.5 162.5M105.5 146.5L105.5 153.5L104.5 154.5L104.5 180.5L105.5 181.5L105.5 184.5L104.5 185.5L104.5 192.5L105.5 193.5L105.5 197.5L106.5 198.5L106.5 202.5L107.5 203.5L108.5 210.5M314.5 210.5L315.5 208.5L315.5 201.5L316.5 199.5L315.5 197.5L312.5 194.5L313.5 193.5L313.5 190.5L312.5 189.5L315.5 187.5L315.5 184.5L316.5 183.5L316.5 179.5L317.5 178.5L317.5 164.5L315.5 161.5L315.5 155.5L316.5 154.5L316.5 148.5L317.5 148.5M125.5 150.5L125.5 156.5L124.5 157.5L124.5 160.5L122.5 162.5L122.5 169.5L121.5 170.5L120.5 177.5L118.5 180.5L118.5 185.5L117.5 186.5L117.5 188.5L116.5 188.5M15.5 29.5L16.5 28.5L16.5 25.5L17.5 24.5L17.5 17.5L19.5 15.5L22.5 15.5L23.5 16.5L23.5 22.5L22.5 23.5L22.5 27.5L21.5 28.5L21.5 32.5L20.5 33.5L20.5 39.5L19.5 40.5L19.5 43.5L18.5 44.5L18.5 53.5L15.5 56.5L14.5 55.5M299.5 77.5L301.5 77.5L303.5 79.5L303.5 88.5L302.5 89.5L298.5 89.5L298.5 88.5L296.5 86.5L297.5 79.5L298.5 78.5L299.5 78.5L298.5 79.5M198.5 191.5L199.5 190.5L199.5 186.5L200.5 185.5L203.5 185.5L204.5 184.5L207.5 184.5L208.5 185.5L211.5 185.5L212.5 186.5L214.5 186.5L216.5 188.5L216.5 190.5L218.5 192.5L220.5 192.5L221.5 193.5L223.5 191.5L227.5 191.5L228.5 190.5L231.5 190.5L235.5 194.5L235.5 193.5L233.5 191.5M205.5 163.5L206.5 164.5L214.5 164.5L216.5 166.5L222.5 166.5L225.5 169.5L226.5 168.5L227.5 169.5L230.5 169.5L233.5 171.5L235.5 171.5L240.5 176.5L241.5 176.5L240.5 177.5M211.5 192.5L214.5 193.5L216.5 195.5L216.5 196.5L218.5 198.5L218.5 200.5L214.5 204.5L212.5 204.5L208.5 200.5L209.5 199.5L207.5 197.5L208.5 196.5L208.5 194.5L209.5 193.5L210.5 193.5L209.5 194.5M181.5 107.5L181.5 103.5L180.5 102.5L178.5 102.5L178.5 101.5L176.5 99.5L175.5 97.5L176.5 95.5L176.5 93.5L173.5 90.5L173.5 89.5L170.5 86.5L168.5 87.5L163.5 87.5L162.5 85.5L163.5 85.5M109.5 155.5L109.5 145.5L107.5 143.5L107.5 138.5L108.5 137.5L108.5 135.5L110.5 133.5L110.5 132.5L109.5 133.5L110.5 134.5L109.5 135.5M124.5 29.5L124.5 35.5L125.5 36.5L125.5 41.5L126.5 42.5L126.5 47.5L123.5 53.5L121.5 53.5L118.5 49.5L118.5 41.5L117.5 39.5L118.5 38.5L118.5 35.5L119.5 34.5L119.5 32.5L120.5 31.5L121.5 32.5L120.5 32.5M207.5 21.5L208.5 22.5L211.5 22.5L213.5 24.5L216.5 24.5L220.5 26.5L221.5 28.5L221.5 32.5L220.5 33.5L215.5 33.5L212.5 30.5L211.5 28.5M99.5 113.5L99.5 114.5L102.5 117.5L107.5 117.5L108.5 116.5L108.5 108.5L109.5 107.5L109.5 102.5L107.5 100.5L103.5 100.5L100.5 103.5L97.5 103.5L95.5 102.5L90.5 107.5L93.5 110.5L93.5 109.5M283.5 131.5L285.5 131.5L287.5 133.5L289.5 132.5L296.5 132.5L297.5 131.5L306.5 131.5L307.5 132.5L309.5 132.5L311.5 131.5L312.5 132.5L317.5 132.5M195.5 69.5L196.5 70.5L198.5 70.5L212.5 85.5L212.5 88.5L209.5 89.5L208.5 90.5L208.5 91.5L209.5 91.5M204.5 55.5L203.5 53.5L200.5 53.5L197.5 55.5L194.5 55.5L191.5 58.5L191.5 59.5L194.5 62.5L197.5 62.5L202.5 59.5L204.5 59.5L204.5 58.5M194.5 82.5L194.5 83.5L192.5 85.5L192.5 88.5L194.5 90.5L196.5 90.5L198.5 91.5L200.5 89.5L202.5 89.5L203.5 88.5L204.5 88.5L206.5 90.5L207.5 90.5L207.5 89.5L206.5 89.5"/></svg><span class="fig__label">Kept: 27 strokes</span></div>
<div class="fig__panel"><svg viewBox="0 0 320 213" role="img" aria-label="The kept strokes joined into one closed loop. Dashed straight lines join the end of each stroke to the start of the next."><path class="ink" d="M122.5 81.5L122.5 84.5L123.5 85.5L123.5 95.5L122.5 96.5L122.5 101.5L125.5 104.5L124.5 106.5L124.5 111.5L113.5 122.5L113.5 124.5L111.5 126.5L111.5 128.5L110.5 129.5L110.5 131.5L111.5 132.5L112.5 132.5L114.5 130.5L114.5 128.5L116.5 126.5L116.5 124.5L118.5 122.5L118.5 120.5L124.5 117.5L130.5 111.5L129.5 109.5L129.5 105.5L128.5 104.5L128.5 88.5L129.5 87.5L129.5 84.5L132.5 81.5L137.5 81.5L140.5 84.5L142.5 84.5L146.5 89.5L146.5 97.5L145.5 98.5L145.5 102.5L143.5 104.5L143.5 106.5L139.5 110.5L139.5 113.5L138.5 114.5L138.5 120.5L137.5 121.5L133.5 117.5L132.5 114.5L130.5 112.5L126.5 116.5M120.5 133.5L122.5 131.5L124.5 131.5L124.5 133.5L126.5 136.5L125.5 138.5L125.5 143.5L124.5 144.5L124.5 146.5L122.5 148.5L122.5 150.5L120.5 152.5L120.5 154.5L119.5 155.5L119.5 158.5L118.5 159.5L120.5 161.5L120.5 162.5M125.5 150.5L125.5 156.5L124.5 157.5L124.5 160.5L122.5 162.5L122.5 169.5L121.5 170.5L120.5 177.5L118.5 180.5L118.5 185.5L117.5 186.5L117.5 188.5L116.5 188.5M113.5 194.5L114.5 194.5L112.5 192.5L112.5 190.5L111.5 189.5L111.5 185.5L110.5 184.5L110.5 172.5L111.5 171.5L111.5 162.5L110.5 161.5L110.5 159.5L111.5 158.5L111.5 156.5L117.5 151.5L117.5 149.5L119.5 145.5L119.5 142.5L121.5 140.5L121.5 137.5L124.5 134.5M109.5 135.5L110.5 134.5L109.5 133.5L110.5 132.5L110.5 133.5L108.5 135.5L108.5 137.5L107.5 138.5L107.5 143.5L109.5 145.5L109.5 155.5M105.5 146.5L105.5 153.5L104.5 154.5L104.5 180.5L105.5 181.5L105.5 184.5L104.5 185.5L104.5 192.5L105.5 193.5L105.5 197.5L106.5 198.5L106.5 202.5L107.5 203.5L108.5 210.5M190.5 195.5L190.5 192.5L193.5 188.5L193.5 186.5L196.5 182.5L196.5 180.5L197.5 179.5L197.5 177.5L199.5 173.5L199.5 169.5L200.5 168.5L200.5 162.5L199.5 161.5L199.5 154.5L201.5 152.5L201.5 143.5L200.5 142.5L200.5 140.5L195.5 134.5M190.5 129.5L192.5 131.5L191.5 133.5L192.5 134.5L192.5 138.5L194.5 142.5L194.5 147.5L195.5 148.5L195.5 151.5L196.5 152.5L196.5 158.5L197.5 159.5L197.5 161.5M205.5 163.5L206.5 164.5L214.5 164.5L216.5 166.5L222.5 166.5L225.5 169.5L226.5 168.5L227.5 169.5L230.5 169.5L233.5 171.5L235.5 171.5L240.5 176.5L241.5 176.5L240.5 177.5M233.5 191.5L235.5 193.5L235.5 194.5L231.5 190.5L228.5 190.5L227.5 191.5L223.5 191.5L221.5 193.5L220.5 192.5L218.5 192.5L216.5 190.5L216.5 188.5L214.5 186.5L212.5 186.5L211.5 185.5L208.5 185.5L207.5 184.5L200.5 185.5L199.5 186.5L199.5 190.5L198.5 191.5M209.5 194.5L210.5 193.5L208.5 194.5L208.5 196.5L207.5 197.5L209.5 199.5L208.5 200.5L212.5 204.5L214.5 204.5L218.5 200.5L218.5 198.5L214.5 193.5L211.5 192.5M193.5 170.5L193.5 168.5L194.5 167.5L194.5 164.5L193.5 163.5L193.5 158.5L192.5 157.5L192.5 153.5L191.5 152.5L191.5 149.5L190.5 148.5L190.5 144.5L189.5 143.5L189.5 140.5L187.5 136.5L187.5 129.5L186.5 128.5L186.5 121.5L184.5 119.5L184.5 116.5L185.5 115.5L185.5 113.5L183.5 110.5L183.5 108.5M181.5 107.5L181.5 103.5L180.5 102.5L178.5 102.5L178.5 101.5L176.5 99.5L175.5 97.5L176.5 95.5L176.5 93.5L173.5 90.5L173.5 89.5L170.5 86.5L168.5 87.5L163.5 87.5L162.5 85.5L163.5 85.5M194.5 82.5L194.5 83.5L192.5 85.5L192.5 88.5L194.5 90.5L196.5 90.5L198.5 91.5L200.5 89.5L202.5 89.5L203.5 88.5L204.5 88.5L206.5 90.5L207.5 90.5L207.5 89.5L206.5 89.5M209.5 91.5L208.5 91.5L208.5 90.5L212.5 88.5L212.5 85.5L198.5 70.5L196.5 70.5L195.5 69.5M204.5 58.5L204.5 59.5L202.5 59.5L197.5 62.5L194.5 62.5L191.5 59.5L191.5 58.5L194.5 55.5L197.5 55.5L200.5 53.5L203.5 53.5L204.5 55.5M211.5 28.5L212.5 30.5L215.5 33.5L220.5 33.5L221.5 32.5L221.5 28.5L220.5 26.5L216.5 24.5L213.5 24.5L211.5 22.5L208.5 22.5L207.5 21.5M138.5 53.5L140.5 53.5L141.5 55.5L148.5 63.5L156.5 63.5L157.5 64.5L160.5 64.5L162.5 66.5L164.5 66.5L173.5 75.5L178.5 85.5L178.5 87.5L180.5 91.5L180.5 94.5L182.5 98.5L186.5 103.5L186.5 107.5L187.5 108.5L187.5 110.5L188.5 112.5L194.5 118.5L194.5 119.5L198.5 124.5L197.5 125.5L199.5 128.5L199.5 130.5L201.5 133.5L201.5 135.5L202.5 137.5L204.5 139.5L206.5 139.5L209.5 142.5L208.5 144.5L205.5 147.5L204.5 146.5L205.5 146.5M200.5 126.5L209.5 126.5L210.5 127.5L213.5 127.5L214.5 128.5L217.5 128.5L218.5 129.5L220.5 129.5L221.5 128.5L225.5 128.5L226.5 129.5L236.5 129.5L237.5 128.5L244.5 128.5L245.5 129.5L251.5 129.5L252.5 130.5L258.5 130.5L259.5 131.5L272.5 131.5L278.5 137.5L283.5 137.5M283.5 131.5L285.5 131.5L287.5 133.5L289.5 132.5L296.5 132.5L297.5 131.5L306.5 131.5L307.5 132.5L309.5 132.5L311.5 131.5L312.5 132.5L317.5 132.5M317.5 148.5L316.5 148.5L316.5 154.5L315.5 155.5L315.5 161.5L317.5 164.5L317.5 178.5L316.5 179.5L316.5 183.5L315.5 184.5L315.5 187.5L312.5 189.5L313.5 190.5L313.5 193.5L312.5 194.5L315.5 197.5L316.5 199.5L315.5 201.5L315.5 208.5L314.5 210.5M308.5 210.5L308.5 204.5L307.5 203.5L307.5 186.5L306.5 185.5L306.5 174.5L304.5 172.5L302.5 172.5L300.5 174.5L300.5 191.5L301.5 192.5L301.5 205.5L302.5 206.5L302.5 210.5L300.5 209.5L298.5 209.5L297.5 207.5L293.5 203.5L293.5 201.5L292.5 200.5L292.5 185.5L291.5 184.5L291.5 163.5L288.5 160.5L287.5 160.5L284.5 164.5L284.5 166.5L285.5 167.5L285.5 190.5L286.5 191.5L286.5 197.5L285.5 198.5L285.5 196.5M281.5 205.5L279.5 206.5L282.5 203.5L281.5 202.5L282.5 201.5L282.5 195.5L280.5 191.5L280.5 184.5L279.5 183.5L279.5 167.5L280.5 166.5L279.5 165.5L279.5 161.5L278.5 160.5L278.5 154.5L279.5 152.5L278.5 151.5L276.5 151.5L272.5 147.5L270.5 146.5M298.5 79.5L299.5 78.5L297.5 79.5L296.5 86.5L298.5 88.5L298.5 89.5L302.5 89.5L303.5 88.5L303.5 79.5L301.5 77.5L299.5 77.5M124.5 29.5L124.5 35.5L125.5 36.5L125.5 41.5L126.5 42.5L126.5 47.5L123.5 53.5L121.5 53.5L118.5 49.5L118.5 41.5L117.5 39.5L118.5 38.5L118.5 35.5L119.5 34.5L119.5 32.5L120.5 31.5L121.5 32.5L120.5 32.5M93.5 109.5L93.5 110.5L90.5 107.5L95.5 102.5L97.5 103.5L100.5 103.5L103.5 100.5L107.5 100.5L109.5 102.5L109.5 107.5L108.5 108.5L108.5 116.5L107.5 117.5L102.5 117.5L99.5 114.5L99.5 113.5M14.5 55.5L15.5 56.5L18.5 53.5L18.5 44.5L19.5 43.5L19.5 40.5L20.5 39.5L20.5 33.5L21.5 32.5L21.5 28.5L22.5 27.5L22.5 23.5L23.5 22.5L23.5 16.5L22.5 15.5L19.5 15.5L17.5 17.5L17.5 24.5L16.5 25.5L16.5 28.5L15.5 29.5"/><path class="dash" d="M126.5 116.5L120.5 133.5M120.5 162.5L125.5 150.5M116.5 188.5L113.5 194.5M124.5 134.5L109.5 135.5M109.5 155.5L105.5 146.5M108.5 210.5L190.5 195.5M195.5 134.5L190.5 129.5M197.5 161.5L205.5 163.5M240.5 177.5L233.5 191.5M198.5 191.5L209.5 194.5M211.5 192.5L193.5 170.5M183.5 108.5L181.5 107.5M163.5 85.5L194.5 82.5M206.5 89.5L209.5 91.5M195.5 69.5L204.5 58.5M204.5 55.5L211.5 28.5M207.5 21.5L138.5 53.5M205.5 146.5L200.5 126.5M283.5 137.5L283.5 131.5M317.5 132.5L317.5 148.5M314.5 210.5L308.5 210.5M285.5 196.5L281.5 205.5M270.5 146.5L298.5 79.5M299.5 77.5L124.5 29.5M120.5 32.5L93.5 109.5M99.5 113.5L14.5 55.5M15.5 29.5L122.5 81.5"/><circle class="dot" cx="122.5" cy="81.5" r="3"/></svg><span class="fig__label">One loop, pen-up jumps dashed</span></div>
</div>
<figcaption>Figure 10. Left: the 27 strokes kept (green) out of 609 (grey); sharp strokes on the bird are preferred to soft ones in the background. Right: the kept strokes joined into one loop, starting at the dot and always moving to the nearest unused stroke end. The dashed connections are traced with the pen lifted.</figcaption>
</figure>

The connections are not free. They are part of the curve and receive samples in proportion to
their length. On the parrot, the connections total 990 pixels of a 2,710-pixel loop, and 289 of
the 800 samples fall on them. A shorter tour would leave more samples for the drawing, and this is
the most promising improvement to the method.<span class="margin-note"><b>A possible improvement</b> The 2-opt method improves a tour by reversing any section of it whenever doing so shortens the total. Applied to the strokes, with each stroke's direction free to flip, it would shorten the connections at modest cost.</span>

### 8. Resampling by arc length

Finally, the closed curve, a polygon through the stroke pixels and the connections, is resampled.
Let its vertices be $p_0, p_1, \dots, p_M = p_0$, let $s_j$ be the distance along the polygon from
$p_0$ to $p_j$, and let $L = s_M$ be its total length. Sample $n$ is placed at distance $nL/N$ along
the polygon: if $s_j \le nL/N < s_{j+1}$, then

$$
z_n = p_j + \frac{nL/N - s_j}{s_{j+1} - s_j}\,\big(p_{j+1} - p_j\big)
$$

This is the parametrisation by arc length discussed earlier, sampled at $N$ equally spaced times.
For the parrot, $L/N$ is about 3.4 pixels. Each point is stored in thousandths of the frame's
width and height, together with the ranges of samples that lie on connections, which the browser
draws with the pen lifted:

```json
{
  "points": [411, 383, 421, 383, 430, 383, …],
  "lifts": [[33, 34], [58, 59], [75, 76], …]
}
```

The site serves this file for each photo at `/photos/<id>.json`. For the parrot it is about
6.6 kilobytes.

## In the browser

When a frame of the film strip is about to be drawn, the page does the following.

1. It fetches the photo's curve and converts it to units of the photo's height, multiplying $x$ by
   the ratio of width to height so that circles remain circular.
2. `traceCircles` computes the DFT and keeps the centre and the 299 largest circles.
3. `penPath` computes the pen's position at each of the 800 sample times. These positions form the
   drawing, and they are computed once.
4. For 5.5 seconds, each animation frame draws the curve up to the current time, omitting the
   segments marked as pen lifts, and over it the circles at that instant (omitting any with a
   radius below 1.5 pixels), the arms joining their centres, and the pen.

## Summary

The method rests on four results.

1. A continuous, piecewise smooth closed curve is the sum of its Fourier series, that is, of
   uniformly rotating circles. The coefficient of each circle is found by orthogonality: turning the
   curve backwards at that circle's frequency and averaging leaves only that circle.
2. The DFT of $N$ equally spaced samples gives $N$ circles whose sum passes exactly through the
   samples. Choosing for each coefficient the frequency of smallest magnitude gives the curve
   through the samples with the least mean squared speed.
3. By Parseval's identity, the mean squared error of a truncated sum equals the total squared
   radius of the omitted circles, so keeping the largest circles is optimal. Few circles suffice
   because the curve is continuous and parametrised by arc length, which makes the radii decrease
   quickly.
4. The curve comes from edges found by a colour version of Canny's detector, ranked by length,
   contrast and focus, and joined into one continuous loop by connections traced with the pen
   lifted.

<!-- The [Fourier Sketch](/fun/#fourier-sketch) on the Fun page applies the same `dft` to any closed
curve drawn by hand, with a control for the number of circles kept. -->

## Further reading

<!-- - Joseph Fourier, *Théorie analytique de la chaleur* (1822). -->
- Elias M. Stein and Rami Shakarchi, *Fourier Analysis: An Introduction* (2003).
- James W. Cooley and John W. Tukey, "An algorithm for the machine calculation of complex Fourier
  series", *Mathematics of Computation* (1965).
- John Canny, "A computational approach to edge detection", *IEEE Transactions on Pattern Analysis
  and Machine Intelligence* (1986).
- Silvano Di Zenzo, "A note on the gradient of a multi-image", *Computer Vision, Graphics, and
  Image Processing* (1986).
- Daniel J. Rosenkrantz, Richard E. Stearns and Philip M. Lewis, "An analysis of several heuristics
  for the traveling salesman problem", *SIAM Journal on Computing* (1977).

