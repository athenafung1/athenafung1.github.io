<script lang="ts">
  // "Did you know?" card. Server-renders the first fact (no-JS friendly); once hydrated, a button
  // shows another one, never repeating until all have been seen.
  import { onMount } from 'svelte';
  import { FUN_FACTS } from '../data/fun-facts.ts';

  let mounted = $state(false);
  let order = $state(FUN_FACTS.map((_, i) => i));
  let position = $state(0);
  const fact = $derived(FUN_FACTS[order[position]]);

  function shuffle() {
    const next = FUN_FACTS.map((_, i) => i);
    for (let i = next.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [next[i], next[j]] = [next[j], next[i]];
    }
    return next;
  }

  function another() {
    if (position + 1 < order.length) {
      position++;
      return;
    }
    const current = order[position];
    const next = shuffle();
    if (next[0] === current) next.push(next.shift()!);
    order = next;
    position = 0;
  }

  onMount(() => {
    mounted = true;
    // Keep the server-rendered first fact on screen; shuffle the rest behind it.
    order = [0, ...shuffle().filter((i) => i !== 0)];
  });
</script>

<aside class="facts" aria-labelledby="facts-title">
  <p class="label" id="facts-title">Did you know? · {fact.topic}</p>
  <p class="facts__text" aria-live="polite">{fact.text}</p>
  {#if mounted}
    <button type="button" class="button button--secondary" onclick={another}>
      Another fact <span class="button__arrow" aria-hidden="true">→</span>
    </button>
  {/if}
</aside>

<style>
  .facts {
    display: grid;
    gap: var(--space-s);
    justify-items: start;
    padding: var(--space-l);
    border-inline-start: 3px solid var(--color-accent);
    background: var(--color-surface);
    border-radius: 0 var(--radius-l) var(--radius-l) 0;
  }

  .facts__text {
    max-width: 52ch;
    min-height: 3lh;
    margin: 0;
    font-family: var(--font-display);
    font-size: var(--step-2);
    line-height: var(--leading-snug);
  }
</style>
