#!/usr/bin/env node
/**
 * Renders a teaser video for a post: `pnpm teaser <slug>` reads teasers/<slug>.yaml and writes
 * .media/<slug>/teaser/teaser.mp4 (and its frames). Portrait 1080 x 1350, 30 fps, no sound.
 *
 * Each scene opens a page (the post by default), highlights one element in yellow, shows a caption
 * in a dark box, and holds for a few seconds; scenes cross-fade. An end card closes the video.
 * The scene file holds the editorial choices (what to show, what to say); this script only renders
 * them, so the same file always gives the same video. See .claude/skills/make-teaser.
 *
 * Needs Google Chrome (driven through playwright-core) and ffmpeg.
 */
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from 'playwright-core';
import { parse as parseYaml } from 'yaml';

const ROOT = resolve(import.meta.dirname, '..');
const WIDTH = 1080, HEIGHT = 1350, FPS = 30;
const slug = process.argv[2];
if (!slug) throw new Error('Usage: pnpm teaser <slug> [--base http://localhost:4321]');
const baseArg = process.argv.indexOf('--base');
const base = baseArg > 0 ? process.argv[baseArg + 1] : 'https://almilo.com';
const spec = parseYaml(await readFile(`${ROOT}/teasers/${slug}.yaml`, 'utf8'));
const out = `${ROOT}/.media/${slug}/teaser`;
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });

const STYLE = `
  .tz-hl { background: #fdf1a8 !important; box-shadow: 0 0 0 4px #fdf1a8, 0 0 0 5.5px #e6c200 !important; border-radius: 3px; }
  .tz-cap { position: fixed; z-index: 99999; left: 50%; transform: translateX(-50%); width: max-content; max-width: 86%;
    background: rgba(31, 35, 40, .93); color: #fff; text-align: center; border-radius: 9px;
    font: 700 var(--tz-size, 22px)/1.3 ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    padding: .6em 1em; box-shadow: 0 6px 18px rgba(0, 0, 0, .18); }
  .tz-cap.left { left: 2.5%; transform: none; max-width: 44%; width: auto; }`;

// In the page: highlight the target, scroll it to `at` (a fraction of the viewport height), and
// place the caption at `caption.at` or, by default, in the half of the screen the target leaves free.
function stage({ target, caption, at, captionAt, captionSide, size, actions }) {
  const find = () => {
    if (!target) return null;
    if (target.figure) return [...document.images].find((i) => i.src.includes(target.figure));
    if (target.selector) return document.querySelector(target.selector);
    const kinds = target.kind ? [target.kind] : ['p', 'li', 'table', 'ul', 'blockquote', 'h2', 'h3'];
    const els = [...document.querySelectorAll(kinds.join(','))].filter((e) => e.textContent.includes(target.text));
    return els.find((e) => !els.some((o) => o !== e && e.contains(o))) ?? null; // the innermost match
  };
  const el = find();
  if (target && !el) throw new Error(`Not found: ${JSON.stringify(target)}`);
  if (el) {
    el.classList.add('tz-hl');
    const r = el.getBoundingClientRect();
    if (at !== 'top') window.scrollBy(0, r.top + r.height / 2 - innerHeight * at);
  }
  const c = document.createElement('div');
  c.className = 'tz-cap' + (captionSide === 'left' ? ' left' : '');
  c.style.setProperty('--tz-size', size + 'px');
  c.innerHTML = caption.replace(/\n/g, '<br>');
  document.body.appendChild(c);
  const r = el ? el.getBoundingClientRect() : { top: 0, bottom: 0 };
  const top = captionAt ?? ((r.top + r.bottom) / 2 > innerHeight / 2 ? 0.08 : 0.76);
  c.style.top = top * innerHeight + 'px';
}

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const frames = [];
try {
  for (const [i, scene] of spec.scenes.entries()) {
    const width = scene.width ?? spec.width ?? 720;
    const page = await browser.newPage({ viewport: { width, height: Math.round((width * HEIGHT) / WIDTH) }, deviceScaleFactor: WIDTH / width, colorScheme: 'light' });
    const url = scene.url ?? `${base}/blog/${slug}/`;
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.addStyleTag({ content: STYLE });
    for (const step of scene.steps ?? []) {
      if (step.click) await page.locator(step.click).nth(step.nth ?? 0).click();
      if (step.clickText) await page.getByRole('button', { name: step.clickText, exact: true }).click();
      if (step.wait) await page.waitForTimeout(step.wait);
    }
    await page.waitForTimeout(300);
    await page.evaluate(stage, {
      target: scene.highlight ?? null,
      caption: scene.caption,
      at: scene.at ?? 0.42,
      captionAt: scene.captionAt ?? null,
      captionSide: scene.captionSide ?? 'center',
      size: Math.round(22 * (width / 720)),
    });
    const file = `${out}/scene-${String(i + 1).padStart(2, '0')}.png`;
    await page.screenshot({ path: file });
    frames.push({ file, seconds: scene.seconds ?? spec.seconds ?? 4.2 });
    await page.close();
  }
  const end = spec.end;
  const page = await browser.newPage({ viewport: { width: 540, height: 675 }, deviceScaleFactor: 2, colorScheme: 'light' });
  await page.setContent(`<!doctype html><meta charset="utf-8"><style>
    html,body{margin:0;height:100%;background:#fffdf9;color:#1f2328;font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
    main{padding:150px 40px 0} .k{font-size:15px;letter-spacing:.12em;color:#5c6470;text-transform:uppercase}
    h1{font-size:39px;line-height:1.08;margin:15px 0 18px;font-weight:800} .r{width:57px;height:4px;background:#0b5cd5;border-radius:2px;margin-bottom:40px}
    p{font-size:19px;margin:0 0 4px} .l{font-size:20px;font-weight:700;color:#0b5cd5;margin-bottom:24px} .n{font-size:15px;color:#5c6470;margin-top:20px}
  </style><main><div class="k">${end.kicker}</div><h1>${end.title}</h1><div class="r"></div>
  ${end.links.map((l) => `<p>${l.label}</p><div class="l">${l.text}</div>`).join('')}
  <div class="n">${end.note}</div></main>`);
  const file = `${out}/scene-end.png`;
  await page.screenshot({ path: file });
  frames.push({ file, seconds: end.seconds ?? 5 });
} finally {
  await browser.close();
}

// Cross-fade the frames into one video.
const fade = spec.fade ?? 0.5;
const inputs = frames.flatMap((f) => ['-loop', '1', '-t', String(f.seconds), '-i', f.file]);
const filters = frames.map((_, i) => `[${i}:v]scale=${WIDTH}:${HEIGHT},format=yuv420p,fps=${FPS},setsar=1[v${i}]`);
let previous = 'v0', t = frames[0].seconds;
for (let i = 1; i < frames.length; i++) {
  const offset = t - fade;
  filters.push(`[${previous}][v${i}]xfade=transition=fade:duration=${fade}:offset=${offset.toFixed(2)}[x${i}]`);
  previous = `x${i}`;
  t = offset + frames[i].seconds;
}
const video = `${out}/teaser.mp4`;
execFileSync('ffmpeg', ['-v', 'error', '-y', ...inputs, '-filter_complex', filters.join(';'), '-map', `[${previous}]`, '-c:v', 'libx264', '-crf', '20', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', video]);
execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', video, '-vf', `fps=1/${(t / 14).toFixed(2)},scale=216:-1,tile=7x2`, '-frames:v', '1', `${out}/contact-sheet.png`]);
await writeFile(`${out}/scenes.json`, JSON.stringify(frames, null, 2));
console.log(`Wrote ${video}: ${frames.length} scenes, ${t.toFixed(1)} s. Check ${out}/contact-sheet.png`);
