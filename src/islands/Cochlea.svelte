<script lang="ts">
  // The cochlea as a frequency analyser (maths and concept in src/lib/cochlea.ts): each tone peaks
  // at its own place along the basilar membrane, so a chord lights up several places at once.
  //
  // How it works: two views of the same response. The spiral is SVG (it doubles as the no-JS
  // fallback): a log spiral sampled by arc length, drawn as short segments whose opacity follows
  // the excitation there, with a marker at each tone's peak. The canvas shows the membrane
  // unrolled, base (high pitch) on the left, with the envelope shaded and the travelling wave,
  // envelope × cos(ωt − phase), animated about 1000× slower than real time. Sound uses Web Audio
  // sine oscillators and only plays on click.
  import { onMount, tick } from 'svelte';
  import { COCHLEA_LENGTH_MM, TONE_PRESETS, envelope, frequencyAt, phaseAt, placeOf, response, type Tone } from '../lib/cochlea.ts';
  import { createLoop, fitCanvas, prefersReducedMotion, watchTheme, withAlpha, type Loop, type ThemeColors } from './canvas-kit.ts';

  // --- Spiral geometry (static): log spiral, 2¾ turns, base outside → apex inside. ---
  const TURNS = 2.75;
  const THETA_MAX = TURNS * 2 * Math.PI;
  const R0 = 92;
  const R_APEX = 16;
  const B = Math.log(R0 / R_APEX) / THETA_MAX;
  const SAMPLES = 480;
  const spiral = Array.from({ length: SAMPLES + 1 }, (_, i) => {
    const t = (i / SAMPLES) * THETA_MAX;
    const r = R0 * Math.exp(-B * t);
    return { x: 100 + r * Math.cos(t - Math.PI / 2), y: 100 + r * Math.sin(t - Math.PI / 2) };
  });
  const cumulative = spiral.reduce<number[]>((acc, p, i) => {
    acc.push(i === 0 ? 0 : acc[i - 1] + Math.hypot(p.x - spiral[i - 1].x, p.y - spiral[i - 1].y));
    return acc;
  }, []);
  const total = cumulative[cumulative.length - 1];
  const ductPath = `M${spiral.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' L')}`;
  /** Point on the spiral at fraction `s` of the duct length measured from the base. */
  const spiralAt = (s: number) => {
    const target = Math.max(0, Math.min(1, s)) * total;
    let i = cumulative.findIndex((c) => c >= target);
    if (i <= 0) i = 1;
    const f = (target - cumulative[i - 1]) / (cumulative[i] - cumulative[i - 1] || 1);
    return { x: spiral[i - 1].x + (spiral[i].x - spiral[i - 1].x) * f, y: spiral[i - 1].y + (spiral[i].y - spiral[i - 1].y) * f };
  };

  let mounted = $state(false);
  let root: HTMLDivElement | undefined = $state();
  let canvas: HTMLCanvasElement | undefined = $state();
  let presetId = $state('a4');
  let tones = $state.raw<Tone[]>(TONE_PRESETS[0].tones);
  let slider = $state(Math.round((Math.log(440 / 20) / Math.log(1000)) * 1000));
  let playing = $state(false);

  const formatHz = (f: number) => {
    if (f < 1000) return `${Math.round(f)} Hz`;
    const k = f / 1000;
    return `${Number.isInteger(Math.round(k * 10) / 10) || k >= 10 ? Math.round(k) : k.toFixed(1)} kHz`;
  };
  const mmFromBase = (f: number) => ((1 - placeOf(f)) * COCHLEA_LENGTH_MM).toFixed(1);
  const note = $derived(
    presetId === 'custom'
      ? `A ${formatHz(tones[0].frequency)} tone peaks about ${mmFromBase(tones[0].frequency)} mm from the base of a 35 mm cochlea.`
      : (TONE_PRESETS.find((p) => p.id === presetId)?.note ?? ''),
  );

  // Excitation drawn along the spiral: short segments whose opacity follows the response.
  const glow = $derived.by(() => {
    const segments: Array<{ d: string; o: number }> = [];
    const steps = 160;
    const peak = Math.max(...tones.map((t) => t.amplitude));
    for (let k = 0; k < steps; k++) {
      const s0 = k / steps;
      const s1 = (k + 1) / steps;
      const o = response(1 - (s0 + s1) / 2, tones) / peak;
      if (o < 0.04) continue;
      const a = spiralAt(s0);
      const b = spiralAt(s1);
      segments.push({ d: `M${a.x.toFixed(1)} ${a.y.toFixed(1)} L${b.x.toFixed(1)} ${b.y.toFixed(1)}`, o: Math.min(1, o) });
    }
    return segments;
  });
  const markers = $derived(tones.map((t) => ({ ...spiralAt(1 - placeOf(t.frequency)), label: formatHz(t.frequency) })));

  function choose(id: string) {
    presetId = id;
    tones = TONE_PRESETS.find((p) => p.id === id)?.tones ?? tones;
    draw();
  }

  function onSlider() {
    presetId = 'custom';
    tones = [{ frequency: 20 * 1000 ** (slider / 1000), amplitude: 1 }];
    draw();
  }

  // --- Sound (only ever on click) ---
  async function play() {
    if (playing) return;
    const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    playing = true;
    const audio = new AudioCtx();
    const gain = audio.createGain();
    const level = 0.12 / tones.length;
    gain.gain.setValueAtTime(0, audio.currentTime);
    gain.gain.linearRampToValueAtTime(level, audio.currentTime + 0.05);
    gain.gain.setValueAtTime(level, audio.currentTime + 1.4);
    gain.gain.linearRampToValueAtTime(0, audio.currentTime + 1.5);
    gain.connect(audio.destination);
    for (const t of tones) {
      const osc = audio.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = t.frequency;
      osc.connect(gain);
      osc.start();
      osc.stop(audio.currentTime + 1.55);
    }
    setTimeout(() => {
      void audio.close();
      playing = false;
    }, 1700);
  }

  // --- Unrolled membrane (canvas) ---
  let ctx: CanvasRenderingContext2D | null = null;
  let cssWidth = 640;
  let cssHeight = 320;
  let dpr = 1;
  let colors: ThemeColors | null = null;
  let loop: Loop | null = null;
  let time = 0;
  let fontFamily = 'system-ui, sans-serif';
  const TICKS = [20000, 10000, 5000, 2000, 1000, 500, 200, 100, 50, 20];

  function draw() {
    if (!ctx || !colors) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, cssWidth, cssHeight);
    const left = 16;
    const right = cssWidth - 16;
    const mid = cssHeight * 0.48;
    const amp = cssHeight * 0.3;
    const peak = Math.max(...tones.map((t) => t.amplitude));
    const xOf = (fromBase: number) => left + fromBase * (right - left);

    // Axis + frequency ticks (left = base/high, right = apex/low).
    ctx.strokeStyle = colors.rule;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(left, mid);
    ctx.lineTo(right, mid);
    ctx.stroke();
    ctx.fillStyle = colors.muted;
    ctx.font = `11px ${fontFamily}`;
    ctx.textAlign = 'center';
    // Labels skip any tick that would collide with the previous one (low frequencies bunch up).
    let lastLabel = -Infinity;
    for (const f of TICKS) {
      const x = xOf(1 - placeOf(f));
      ctx.fillRect(x, cssHeight - 30, 1, 5);
      if (x - lastLabel >= 48) {
        ctx.fillText(formatHz(f), x, cssHeight - 12);
        lastLabel = x;
      }
    }
    const narrow = cssWidth < 420;
    ctx.textAlign = 'left';
    ctx.fillText(narrow ? 'Base · high' : 'Base (stiff, high pitch)', left, 16);
    ctx.textAlign = 'right';
    ctx.fillText(narrow ? 'Apex · low' : 'Apex (floppy, low pitch)', right, 16);

    // Envelope and the travelling wave.
    const steps = Math.max(200, Math.round(cssWidth));
    ctx.fillStyle = withAlpha(colors.accent, 0.12);
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const fb = i / steps;
      const e = (response(1 - fb, tones) / peak) * amp;
      if (i === 0) ctx.moveTo(xOf(fb), mid - e);
      else ctx.lineTo(xOf(fb), mid - e);
    }
    for (let i = steps; i >= 0; i--) {
      const fb = i / steps;
      ctx.lineTo(xOf(fb), mid + (response(1 - fb, tones) / peak) * amp);
    }
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    const omega = 2 * Math.PI * 0.7; // slowed down ~1000×, so the eye can follow it
    for (let i = 0; i <= steps; i++) {
      const fb = i / steps;
      const x = 1 - fb;
      let y = 0;
      for (const t of tones) y += envelope(x, t) * Math.cos(omega * time - phaseAt(x, t));
      const py = mid - (y / peak) * amp;
      if (i === 0) ctx.moveTo(xOf(fb), py);
      else ctx.lineTo(xOf(fb), py);
    }
    ctx.stroke();

    // Peak markers.
    ctx.setLineDash([3, 4]);
    ctx.strokeStyle = colors.muted;
    ctx.lineWidth = 1;
    ctx.fillStyle = colors.text;
    ctx.textAlign = 'center';
    for (const t of tones) {
      const x = xOf(1 - placeOf(t.frequency));
      ctx.beginPath();
      ctx.moveTo(x, mid - amp - 6);
      ctx.lineTo(x, mid + amp + 6);
      ctx.stroke();
    }
    ctx.setLineDash([]);
  }

  onMount(() => {
    mounted = true;
    const cleanups: Array<() => void> = [];
    tick().then(() => {
      if (!canvas || !root) return;
      ctx = canvas.getContext('2d');
      fontFamily = getComputedStyle(root).fontFamily || fontFamily;
      cleanups.push(watchTheme(root, (c) => ((colors = c), draw())));
      cleanups.push(fitCanvas(canvas, (w, h, ratio) => ((cssWidth = w), (cssHeight = h), (dpr = ratio), draw())));
      loop = createLoop(root, (ms) => {
        time += ms / 1000;
        draw();
      });
      cleanups.push(() => loop?.destroy());
      loop.setPlaying(!prefersReducedMotion());
    });
    return () => cleanups.forEach((fn) => fn());
  });
</script>

<div class="cochlea" bind:this={root}>
  <svg class="cochlea__spiral" viewBox="0 0 200 200" role="img" aria-label="The cochlea, a spiral of 2¾ turns, lit where the current sound excites it.">
    <path class="cochlea__duct" d={ductPath}></path>
    {#each glow as seg, i (i)}
      <path class="cochlea__glow" d={seg.d} style:opacity={seg.o}></path>
    {/each}
    {#each markers as m, i (i)}
      <circle class="cochlea__marker" cx={m.x} cy={m.y} r="4"></circle>
    {/each}
    <text x="100" y="196" text-anchor="middle" class="cochlea__caption">base: high · apex: low</text>
  </svg>

  <div class="piece-body cochlea__panel">
    {#if mounted}
      <canvas bind:this={canvas} class="piece-canvas cochlea__canvas" role="img" aria-label="The basilar membrane unrolled from base to apex, with the travelling wave peaking at each tone's place."></canvas>
      <p class="piece-status" aria-live="polite">{note}</p>
      <div class="controls">
        <div class="controls__group" role="group" aria-label="Sound">
          {#each TONE_PRESETS as p (p.id)}
            <button type="button" class="chip" aria-pressed={presetId === p.id} onclick={() => choose(p.id)}>{p.label}</button>
          {/each}
        </div>
        <label class="range">
          <span class="label">Tone</span>
          <input type="range" min="0" max="1000" bind:value={slider} oninput={onSlider} aria-valuetext={formatHz(20 * 1000 ** (slider / 1000))} />
          <output>{formatHz(20 * 1000 ** (slider / 1000))}</output>
        </label>
        <button type="button" class="button button--secondary" onclick={play} disabled={playing}>{playing ? 'Playing…' : 'Play it (1.5 s)'}</button>
      </div>
    {:else}
      <p class="piece-status">
        Sound enters at the stiff base of the cochlea and travels toward the floppy apex. Each frequency peaks at its own
        place, so the ear splits sound into frequencies mechanically, a bit like a Fourier transform done by physics.
      </p>
    {/if}
  </div>
</div>

<style>
  .cochlea {
    display: grid;
    gap: var(--space-l);
    align-items: center;
  }

  .cochlea__spiral {
    display: block;
    width: 100%;
    max-width: 16rem;
    margin-inline: auto;
  }

  .cochlea__duct {
    fill: none;
    stroke: var(--color-rule);
    stroke-width: 9;
    stroke-linecap: round;
  }

  .cochlea__glow {
    fill: none;
    stroke: var(--color-accent);
    stroke-width: 9;
    stroke-linecap: round;
  }

  .cochlea__marker {
    fill: var(--color-text);
  }

  .cochlea__caption {
    font-size: 9px;
    fill: var(--color-muted);
  }

  .cochlea__panel {
    min-width: 0;
  }

  .cochlea__canvas {
    aspect-ratio: 2 / 1;
  }

  @media (min-width: 52rem) {
    .cochlea {
      grid-template-columns: 15rem minmax(0, 1fr);
    }
  }
</style>
