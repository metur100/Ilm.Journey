/**
 * Generates the app's calm UI sounds (prayer-bead taps, a water drop, a soft bell – no music) as 16-bit mono WAV files.
 * Sounds are synthesized (soft sine tones and filtered noise) so the app ships
 * without third-party audio assets and without music.
 *
 * Usage: node scripts/generate-sounds.js
 */
const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 22050;
const OUT_DIR = path.join(__dirname, '..', 'assets', 'sounds');

/** Normalises to a fixed peak so every sound plays at a clearly audible, consistent level. */
function normalize(samples, peak) {
  let max = 0;
  for (const v of samples) max = Math.max(max, Math.abs(v));
  if (max > 0) for (let i = 0; i < samples.length; i++) samples[i] *= peak / max;
  return samples;
}

/**
 * Peak level of each sound. Calm and clearly audible, never startling: the feedback sounds stay well below the learning
 * audio (recitation, pronunciation), which the learner asked for.
 */
const PEAK = { 'click.wav': 0.5, 'success.wav': 0.42, 'failure.wav': 0.36, 'reward.wav': 0.42, 'ambient.wav': 0.7 };

function writeWav(name, samples) {
  normalize(samples, PEAK[name] ?? 0.5);
  const dataSize = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  samples.forEach((s, i) => {
    const v = Math.max(-1, Math.min(1, s));
    buffer.writeInt16LE(Math.round(v * 32767), 44 + i * 2);
  });
  fs.writeFileSync(path.join(OUT_DIR, name), buffer);
  console.log(`wrote ${name} (${(buffer.length / 1024).toFixed(1)} KB)`);
}

function mix(length, parts) {
  const out = new Float32Array(Math.floor(SAMPLE_RATE * length));
  for (const { offset, samples } of parts) {
    const start = Math.floor(SAMPLE_RATE * offset);
    for (let i = 0; i < samples.length && start + i < out.length; i++) {
      out[start + i] += samples[i];
    }
  }
  return out;
}

function fadeEdges(samples, seconds) {
  const n = Math.floor(SAMPLE_RATE * seconds);
  for (let i = 0; i < n; i++) {
    const g = i / n;
    samples[i] *= g;
    samples[samples.length - 1 - i] *= g;
  }
  return samples;
}

fs.mkdirSync(OUT_DIR, { recursive: true });

/**
 * A soft wooden "tok" like a prayer bead (tasbih) touching the next one: a short burst of band-limited noise over a
 * low, quickly damped body tone.
 */
function bead(freq, duration, seed = 3) {
  const n = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(n);
  let r = seed;
  let lp = 0;
  let bp = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    r = (r * 16807) % 2147483647;
    const noise = (r / 2147483647) * 2 - 1;
    lp += 0.35 * (noise - lp);
    bp = lp - bp * 0.2;
    const env = Math.min(1, t / 0.0015) * Math.exp(-90 * t);
    out[i] = env * (0.5 * bp + Math.sin(2 * Math.PI * freq * t) * 0.8);
  }
  return out;
}

/** A water drop: a sine whose pitch glides up quickly, with a soft round decay. */
function drop(freq, duration, { glide = 1.6, decay = 18 } = {}) {
  const n = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(n);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const f = freq * (1 + (glide - 1) * (1 - Math.exp(-t * 40)));
    phase += (2 * Math.PI * f) / SAMPLE_RATE;
    const env = Math.min(1, t / 0.004) * Math.exp(-decay * t);
    out[i] = env * Math.sin(phase);
  }
  return out;
}

/** A small, warm bell (fundamental with a quiet inharmonic partial), soft attack, long gentle fade. */
function bell(freq, duration, { decay = 3.2, attack = 0.012 } = {}) {
  const n = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.min(1, t / attack) * Math.exp(-decay * t);
    out[i] = env * (Math.sin(2 * Math.PI * freq * t) + 0.18 * Math.sin(2 * Math.PI * freq * 2.76 * t) * Math.exp(-6 * t) + 0.08 * Math.sin(2 * Math.PI * freq * 2 * t));
  }
  return out;
}

// UI click: one prayer bead.
writeWav('click.wav', bead(520, 0.07));

// Right answer: a single soft water drop.
writeWav('success.wav', fadeEdges(drop(620, 0.32), 0.004));

// Not yet: a low, muted bead – never a buzzer.
writeWav('failure.wav', bead(260, 0.12, 11));

// Level complete: a calm two-tone bell (no melody, no fanfare) that fades out gently.
writeWav(
  'reward.wav',
  fadeEdges(
    mix(1.6, [
      { offset: 0, samples: bell(587, 1.5) },
      { offset: 0.28, samples: bell(880, 1.3, { decay: 3.6 }) },
    ]),
    0.01,
  ),
);

// Ambient: slowly swelling, low-passed noise like a soft desert wind (no melody).
(function ambient() {
  const seconds = 12;
  const n = SAMPLE_RATE * seconds;
  const out = new Float32Array(n);
  let lp1 = 0;
  let lp2 = 0;
  let seed = 7;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed / 2147483647) * 2 - 1;
  };
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    lp1 += 0.02 * (rand() - lp1);
    lp2 += 0.05 * (lp1 - lp2);
    // Swell period divides the loop length exactly so the loop is seamless.
    const swell = 0.55 + 0.45 * Math.sin((2 * Math.PI * t) / (seconds / 2));
    out[i] = lp2 * 6 * swell;
  }
  writeWav('ambient.wav', fadeEdges(out, 0.4));
})();
