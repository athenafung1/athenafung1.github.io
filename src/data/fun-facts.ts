// "Did you know?" facts for /fun/. Keep each one short and checkable.
export type FunFact = { topic: string; text: string };

export const FUN_FACTS: FunFact[] = [
  { topic: 'Combinatorics', text: 'A deck of 52 cards can be ordered in 52! ≈ 8 × 10⁶⁷ ways, so a well-shuffled deck is almost certainly in an order no deck has ever been in before.' },
  { topic: 'Probability', text: 'In a room of just 23 people, the chance that two share a birthday is about 50.7%.' },
  { topic: 'Analysis', text: 'Euler’s identity, e^(iπ) + 1 = 0, links five fundamental constants: e, i, π, 1 and 0.' },
  { topic: 'Chaos', text: 'Edward Lorenz stumbled on chaos in 1961 when he restarted a weather simulation from a printout rounded to three decimals (0.506 instead of 0.506127) and got a completely different forecast.' },
  { topic: 'Fractals', text: 'The Koch snowflake has an infinitely long perimeter but encloses only 8/5 of the area of the triangle it starts from.' },
  { topic: 'Engineering', text: 'GPS satellite clocks gain about 38 microseconds a day relative to the ground because of relativity. Left uncorrected, position fixes would drift by roughly 10 km a day.' },
  { topic: 'Number theory', text: '0.999…, with the nines repeating forever, is exactly equal to 1.' },
  { topic: 'Statistics', text: 'Benford’s law: in many real-world datasets about 30% of numbers start with the digit 1, and fewer than 5% start with 9.' },
  { topic: 'Computation', text: 'Rule 30’s centre column is so irregular that Mathematica used it to generate random integers.' },
  { topic: 'Celestial mechanics', text: 'The figure-eight three-body orbit was found numerically by Cris Moore in 1993 and proved to exist by Alain Chenciner and Richard Montgomery in 2000.' },
  { topic: 'Probability', text: 'In the Monty Hall problem, switching doors wins two times out of three.' },
  { topic: 'Exponential growth', text: 'Folding a 0.1 mm sheet of paper in half 42 times would, in theory, make a stack about 440,000 km thick: farther than the Moon.' },
  { topic: 'Computation', text: 'Rule 110, a cellular automaton defined by a table of just eight entries, is Turing-complete (Matthew Cook, 2004).' },
  { topic: 'Engineering', text: 'The Tacoma Narrows Bridge collapsed in 1940 from aeroelastic flutter, not the simple resonance often described in textbooks.' },
  { topic: 'Fractals', text: 'The Mandelbrot set is connected (Douady and Hubbard, 1982), and its boundary has Hausdorff dimension exactly 2 (Shishikura, 1998).' },
  { topic: 'π', text: 'π has been computed to more than 100 trillion digits, yet about 40 digits are enough to get the circumference of the observable universe to within the width of a hydrogen atom.' },
];
