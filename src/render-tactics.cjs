/**
 * Portable excerpt of the projective tactical graphics in More Ways to Play.
 * The routes are authored illustrations, not a learned model or match replay.
 * No stock footage, narration, model weights or production credentials needed.
 */
const fs = require('node:fs');
const path = require('node:path');
const { createCanvas } = require('@napi-rs/canvas');

const WIDTH = 1920;
const HEIGHT = 1080;
const C = {
  bg: '#041721', ink: '#082530', white: '#f4f3e9',
  muted: '#c2d4d8', blue: '#a8e7ef', gold: '#ffc884', rose: '#ef84ab',
};
const A = [-30, 10];
const B = [-13, -18];
const D = [9, 19];
const R = [31, -7];
const WIDE = [9, 29];
const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const lerp = (a, b, p) => a + (b - a) * p;
const ease = (p) => { p = clamp(p); return p * p * (3 - 2 * p); };

function renderFrame(time) {
  if (!Number.isFinite(time) || time < 30 || time > 59.5) {
    throw new RangeError('Component time must be between 30 and 59.5 seconds.');
  }
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');
  const camera = { yaw: 0.28, tilt: 0.72, focal: 1420, distance: 155, x: 960, y: 622 };

  // All pitch lines, tokens and routes use the same camera projection.
  function project([a, z, h = 0]) {
    const xx = a * Math.cos(camera.yaw) - z * Math.sin(camera.yaw);
    const zz = a * Math.sin(camera.yaw) + z * Math.cos(camera.yaw);
    const yy = h * Math.cos(camera.tilt) - zz * Math.sin(camera.tilt);
    const depth = h * Math.sin(camera.tilt) + zz * Math.cos(camera.tilt);
    const scale = camera.focal / (camera.distance - depth);
    return [camera.x + xx * scale, camera.y - yy * scale, scale, depth];
  }
  const corners = [[-52.5, -34], [52.5, -34], [52.5, 34], [-52.5, 34]];
  let ys = corners.map((p) => project(p)[1]);
  camera.focal *= Math.min(1, 606 / (Math.max(...ys) - Math.min(...ys)));
  ys = corners.map((p) => project(p)[1]);
  camera.y += 622 - (Math.max(...ys) + Math.min(...ys)) / 2;

  function text(s, x, y, size = 36, color = C.white, bold = false, align = 'left') {
    ctx.font = `${bold ? 700 : 400} ${size}px Arial, Helvetica, sans-serif`;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.fillText(s, x, y);
    ctx.textAlign = 'left';
  }
  function circle(x, y, radius, fill, stroke, width = 2) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = width; ctx.stroke(); }
  }
  function line(a, b, color, width = 2) {
    ctx.beginPath();
    ctx.moveTo(...a); ctx.lineTo(...b);
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.stroke();
  }
  function route(points, color, width = 2, progress = 1, dashed = false) {
    const stop = clamp(progress) * (points.length - 1);
    if (stop <= 0) return;
    const draw = points.slice(0, Math.floor(stop) + 1).map(project);
    if (stop < points.length - 1) {
      const k = Math.floor(stop);
      draw.push(project(points[k].map((v, i) => lerp(v, points[k + 1][i], stop - k))));
    }
    ctx.save();
    if (dashed) ctx.setLineDash([8, 10]);
    ctx.beginPath();
    draw.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
    ctx.strokeStyle = color; ctx.lineWidth = width;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke();
    ctx.restore();
  }
  function rectangle(a, z, w, h, color) {
    route([[a, z], [a + w, z], [a + w, z + h], [a, z + h], [a, z]], color, 1.8);
  }
  function curve(a, b, bend = 0) {
    return Array.from({ length: 65 }, (_, i) => {
      const p = i / 64;
      return [lerp(a[0], b[0], p), lerp(a[1], b[1], p) + Math.sin(Math.PI * p) * bend, Math.sin(Math.PI * p) * 1.2];
    });
  }
  function pointAt(points, progress) {
    const z = clamp(progress) * (points.length - 1);
    const k = Math.min(points.length - 2, Math.floor(z));
    return points[k].map((v, i) => lerp(v, points[k + 1][i], z - k));
  }
  function glow(points, color, progress = 1) {
    route(points, `${color}17`, 18, progress);
    route(points, `${color}30`, 8, progress);
    route(points, color, 2.7, progress);
  }
  function ball(p) {
    const q = project(p);
    circle(q[0], q[1], 7, C.white, C.ink);
    circle(q[0] - 1, q[1] - 1, 2, C.ink);
  }
  function token(p, label, color = C.blue, opacity = 1) {
    ctx.save(); ctx.globalAlpha = opacity;
    const ground = project(p), top = project([p[0], p[1], 3.1]);
    const radius = ground[2] * 0.94;
    line(ground.slice(0, 2), top.slice(0, 2), `${color}70`, 3);
    circle(top[0], top[1], radius + 2, '#082630', color, 2.5);
    circle(top[0], top[1], radius * 0.53, color);
    if (label) text(label, top[0], top[1] - radius - 13, 23, C.white, true, 'center');
    ctx.restore();
  }
  function callout(label, p) {
    const q = project(p);
    ctx.font = '700 25px Arial, Helvetica, sans-serif';
    const width = ctx.measureText(label).width + 34;
    const left = clamp(q[0] + 30, 80, WIDTH - width - 80);
    const top = q[1] - 95;
    line([q[0], q[1] - 12], [left + 5, top + 36], C.gold, 1.5);
    ctx.beginPath(); ctx.roundRect(left, top, width, 45, 10);
    ctx.fillStyle = '#041721ee'; ctx.fill();
    ctx.strokeStyle = C.gold; ctx.lineWidth = 1.5; ctx.stroke();
    text(label, left + 17, top + 32, 25, C.gold, true);
  }

  const background = ctx.createRadialGradient(1020, 655, 0, 1020, 650, 1000);
  background.addColorStop(0, '#123f4b'); background.addColorStop(1, C.bg);
  ctx.fillStyle = background; ctx.fillRect(0, 0, WIDTH, HEIGHT);
  for (let i = 0; i < 76; i++) {
    ctx.fillStyle = '#95dce814';
    ctx.fillRect((i * 193.13 + Math.sin(i + time * 0.11) * 13) % WIDTH,
      (i * 149.3 - time * 3 + HEIGHT * 4) % HEIGHT, 1.5, 1.5);
  }
  ctx.beginPath();
  corners.map(project).forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
  ctx.closePath(); ctx.fillStyle = '#14454cb0'; ctx.fill();
  ctx.strokeStyle = '#89eef4b3'; ctx.lineWidth = 2; ctx.stroke();
  for (let j = 0; j <= 14; j++) route([[-52.5 + j * 7.5, -34], [-52.5 + j * 7.5, 34]], '#69e5ff15', 1);
  for (let j = 0; j <= 10; j++) route([[-52.5, -34 + j * 6.8], [52.5, -34 + j * 6.8]], '#69e5ff15', 1);
  rectangle(-50, -31.5, 100, 63, '#93e0e399');
  route([[0, -31.5], [0, 31.5]], '#93e0e36b', 1.5);
  route(Array.from({ length: 65 }, (_, i) => [9.15 * Math.cos(i * Math.PI / 32), 9.15 * Math.sin(i * Math.PI / 32)]), '#93e0e36b', 1.5);
  for (const side of [-1, 1]) {
    rectangle(side < 0 ? -50 : 33.5, -20, 16.5, 40, '#93e0e36b');
    route([[side * 50, -3.7, 0], [side * 50, -3.7, 3], [side * 50, 3.7, 3], [side * 50, 3.7, 0]], '#b8f1f7cc', 2);
  }

  const phase = time < 40.8 ? 'observe' : time < 45 ? 'run' : time < 50.2 ? 'pass' : 'choice';
  const title = {
    observe: 'Where could we create more space?',
    run: 'What if the run began earlier?',
    pass: 'What if this pass went wider?',
    choice: 'The coach chooses.',
  }[phase];
  text('MORE WAYS TO PLAY', 85, 90, 25, C.blue, true);
  text('Illustrative tactics', 1835, 90, 26, C.muted, false, 'right');
  text(title, 85, 216, 61, C.white, true);
  line([88, 267], [128, 267], C.blue, 3); text('Reference', 142, 277, 28, C.muted);
  line([330, 267], [370, 267], C.gold, 3); text('What if', 384, 277, 28, C.gold);
  if (phase === 'choice') text('Try receiving wider.', 88, 343, 34, C.gold);

  [[-37, -22], [-21, 27], [5, -26], [34, 16]].forEach((p) => token(p, '', C.blue, 0.55));
  [[2, -4], [21, 8], [35, -14]].forEach((p) => token(p, '', C.rose, 0.73));
  let runner = A, passTarget = D;
  if (phase === 'observe') {
    const p = ease((time - 31.6) / 5.4);
    runner = pointAt(curve(A, R, 6), p);
    glow(curve(A, B, -3), C.blue, clamp((time - 31.1) / 1.3));
    glow(curve(B, D, 3), C.blue, clamp((time - 33.2) / 1.2));
    glow(curve(D, R, -3), C.blue, clamp((time - 35.2) / 1.3));
  } else if (phase === 'run') {
    const run = curve(A, R, 6);
    runner = pointAt(run, ease((time - 41.05) / 2.8));
    token(pointAt(run, ease((time - 41.95) / 2.8)), '', C.blue, 0.55);
    route(run, `${C.blue}55`, 2, 1, true);
    glow(run, C.gold, ease((time - 41.05) / 2.8));
    const pass = curve(D, R, -3), p = clamp((time - 42.2) / 2);
    glow(pass, C.blue, p); ball(pointAt(pass, p));
    if (time > 43.9) callout('EARLIER ARRIVAL', runner);
  } else if (phase === 'pass') {
    const p = ease((time - 45.3) / 1.8);
    runner = R; passTarget = [lerp(D[0], WIDE[0], p), lerp(D[1], WIDE[1], p)];
    token(D, '', C.blue, 0.23);
    route(curve(B, D, 3), `${C.blue}55`, 2, 1, true);
    const pass = curve(B, WIDE, 4), progress = clamp((time - 47.4) / 2);
    glow(pass, C.gold, progress); ball(pointAt(pass, progress));
    route(curve(D, WIDE, -2), `${C.gold}70`, 2, p, true);
    if (time > 47.1) callout('WIDER OPTION', passTarget);
  } else {
    runner = R; passTarget = WIDE;
    glow(curve(B, WIDE, 4), C.gold);
    const finish = curve(WIDE, R, 2), p = clamp((time - 51.3) / 1.6);
    glow(finish, C.gold, p); ball(pointAt(finish, p));
    route(curve(B, D, 3), `${C.blue}40`, 2, 1, true);
  }
  [{ p: runner, label: 'A', color: phase === 'run' ? C.gold : C.blue },
    { p: B, label: 'B', color: C.blue },
    { p: passTarget, label: 'C', color: phase === 'pass' || phase === 'choice' ? C.gold : C.blue }]
    .sort((a, b) => project(a.p)[3] - project(b.p)[3])
    .forEach((item) => token(item.p, item.label, item.color));
  text('Coaches and players decide what to try.', 88, 990, 34, C.muted);
  return canvas;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const option = (name, fallback) => {
    const index = args.indexOf(name);
    return index >= 0 ? args[index + 1] : fallback;
  };
  const out = path.resolve(option('--out', 'renders'));
  fs.mkdirSync(out, { recursive: true });
  if (args.includes('--sequence')) {
    const fps = Number(option('--fps', '24'));
    const start = Number(option('--start', '40.8'));
    const duration = Number(option('--duration', '12'));
    if (!Number.isInteger(fps) || fps < 1 || fps > 60 || !Number.isFinite(start) ||
        !Number.isFinite(duration) || duration <= 0 || start < 30 || start + duration > 59.5) {
      throw new RangeError('Use fps 1–60 and a positive duration within component times 30–59.5.');
    }
    for (let i = 0; i < Math.ceil(duration * fps); i++) {
      fs.writeFileSync(path.join(out, `frame-${String(i).padStart(4, '0')}.png`),
        renderFrame(start + i / fps).toBuffer('image/png'));
    }
    console.log(`Rendered ${Math.ceil(duration * fps)} frames to ${out}`);
  } else {
    for (const [name, time] of [['earlier-run', 44.4], ['wider-pass', 49.4], ['human-choice', 56.5]]) {
      fs.writeFileSync(path.join(out, `${name}.png`), renderFrame(time).toBuffer('image/png'));
    }
    console.log(`Rendered three original tactical illustrations to ${out}`);
  }
}

module.exports = { renderFrame, WIDTH, HEIGHT };
