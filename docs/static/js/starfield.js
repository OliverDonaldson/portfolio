/* ============================================================
   Transit Starfield — calm, astronomical canvas background
   - tiny multi-colour stars (white + faint blue/orange, plus
     purple / blue / green "accent" twinkles)
   - a subset "sparkle": a brief, sharp glint flash
   - ~2.5% are "transit targets": a slow, U-shaped periodic dip
     in brightness (a nod to TESS transit detection)
   - rare, small, fast shooting stars (meteors)
   - cursor casts a faint gravitational "lens" that pushes the
     nearest stars gently outward, then they ease back
   - clicking the Exoplanet Hunter project dives/zooms into a
     background star as the transition into the page
   - theme-aware (smooth dark/light crossfade); respects
     prefers-reduced-motion (single static frame)
   ============================================================ */
(function () {
  "use strict";

  var canvas = document.getElementById("starfield-canvas");
  if (!canvas) return;
  var ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) return;

  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = !window.matchMedia ||
    window.matchMedia("(pointer: fine)").matches;

  // ── Palettes ────────────────────────────────────────────────
  // Each colour carries a dark-mode and light-mode RGB; themeMix
  // (0 = dark, 1 = light) blends them so a theme toggle animates.
  var VOID = { dark: [10, 14, 23], light: [238, 241, 246] }; // #0a0e17 / #eef1f6
  var COLORS = {
    white:  { dark: [255, 255, 255], light: [38, 44, 60] },
    blueT:  { dark: [200, 220, 255], light: [44, 78, 150] },
    orange: { dark: [255, 222, 186], light: [150, 96, 40] },
    purple: { dark: [186, 138, 255], light: [126, 60, 196] },
    blue:   { dark: [120, 176, 255], light: [40, 96, 200] },
    green:  { dark: [128, 230, 184], light: [28, 150, 110] }
  };
  var WEIGHTED = [
    "white", "white", "white", "white", "white", "white",
    "blueT", "blueT", "orange",
    "purple", "blue", "green"
  ];
  var ACCENTS = { purple: 1, blue: 1, green: 1 };

  function pickType() { return WEIGHTED[(Math.random() * WEIGHTED.length) | 0]; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function mixRGB(c, mix) {
    return [
      lerp(c.dark[0], c.light[0], mix),
      lerp(c.dark[1], c.light[1], mix),
      lerp(c.dark[2], c.light[2], mix)
    ];
  }

  function targetMixForTheme() {
    return document.documentElement.getAttribute("data-theme") === "light" ? 1 : 0;
  }
  var themeMix = targetMixForTheme();
  var themeTarget = themeMix;

  // ── Canvas sizing ───────────────────────────────────────────
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0, H = 0;
  var stars = [];
  var builtW = -1;   // viewport width the current star field was built for

  function buildStars() {
    var count = Math.round((W * H) / 9000);
    count = Math.max(120, Math.min(360, count));
    stars = [];
    for (var i = 0; i < count; i++) {
      var depth = Math.random();
      var type = pickType();
      var isAccent = !!ACCENTS[type];
      var isTarget = !isAccent && Math.random() < 0.026;            // ~2.5%
      var sparkle = !isAccent && !isTarget && Math.random() < 0.16; // ~16% glint
      stars.push({
        baseX: Math.random() * W,
        baseY: Math.random() * H,
        offX: 0, offY: 0, stretch: 0,
        r: 0.35 + depth * 1.25,
        depth: depth,
        baseAlpha: 0.32 + depth * 0.55,
        type: type,
        accent: isAccent,
        twPhase: Math.random() * Math.PI * 2,
        twSpeed: 0.0006 + Math.random() * 0.0014,
        twAmp: 0.10 + Math.random() * 0.10,
        sparkle: sparkle,
        flashPeriod: 2600 + Math.random() * 4200,   // 2.6–6.8s between glints
        flashPhase: Math.random() * 8000,
        isTarget: isTarget,
        period: 10000 + Math.random() * 10000,      // 10–20s transit cycle
        phase: Math.random() * 100000,
        transitFrac: 0.16 + Math.random() * 0.10,
        depthDip: 0.40 + Math.random() * 0.10
      });
    }
  }

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // Only re-seed stars when the WIDTH changes. Mobile browsers fire
    // resize on every address-bar show/hide (height only) during scroll;
    // rebuilding there would re-randomise the field and look glitchy.
    if (W !== builtW || !stars.length) { buildStars(); builtW = W; }
  }

  // ── Pointer (gravitational lens) ────────────────────────────
  var mouseX = -9999, mouseY = -9999, lensOn = false;
  var lastMX = -9999, lastMY = -9999, mvAmt = 0;   // cursor speed → drives the stretch
  var LENS_R = 150, LENS_PUSH = 16, LENS_STRETCH = 38;
  var LENS_TINT = { dark: [130, 188, 255], light: [30, 80, 205] }; // lensed-arc blue
  if (finePointer && !reduceMotion) {
    window.addEventListener("mousemove", function (e) {
      if (lastMX > -9000) {
        var dx = e.clientX - lastMX, dy = e.clientY - lastMY;
        mvAmt = Math.min(1, mvAmt + Math.sqrt(dx * dx + dy * dy) / 42);
      }
      lastMX = e.clientX; lastMY = e.clientY;
      mouseX = e.clientX; mouseY = e.clientY; lensOn = true;
    }, { passive: true });
    window.addEventListener("mouseout", function (e) {
      if (!e.relatedTarget) lensOn = false;   // keep last pos so the stretch eases out
    });
    window.addEventListener("blur", function () { lensOn = false; });
  }

  var scrollY = window.scrollY || 0;
  window.addEventListener("scroll", function () {
    scrollY = window.scrollY || 0;
  }, { passive: true });

  // ── Shooting stars (meteors) ────────────────────────────────
  var meteors = [];
  var nextMeteorAt = (typeof performance !== "undefined" ? performance.now() : 0) +
    4000 + Math.random() * 6000;

  function spawnMeteor() {
    var fromLeft = Math.random() < 0.5;
    var speed = 0.55 + Math.random() * 0.45;          // px per ms
    var ang = (18 + Math.random() * 22) * Math.PI / 180; // shallow downward
    var vx = (fromLeft ? 1 : -1) * Math.cos(ang) * speed;
    var vy = Math.sin(ang) * speed;
    meteors.push({
      x: fromLeft ? -40 + Math.random() * W * 0.5 : W * 0.5 + Math.random() * W * 0.5 + 40,
      y: Math.random() * H * 0.45,
      vx: vx, vy: vy,
      len: 55 + Math.random() * 75,
      life: 0, ttl: 900 + Math.random() * 500
    });
  }

  function updateMeteors(now, dt) {
    if (now >= nextMeteorAt && meteors.length < 2) {
      spawnMeteor();
      nextMeteorAt = now + 6000 + Math.random() * 9000; // rare: every ~6–15s
    }
    for (var i = meteors.length - 1; i >= 0; i--) {
      var m = meteors[i];
      m.x += m.vx * dt; m.y += m.vy * dt; m.life += dt;
      if (m.life > m.ttl || m.x < -80 || m.x > W + 80 || m.y > H + 80) {
        meteors.splice(i, 1);
      }
    }
  }

  function drawMeteors(now) {
    if (!meteors.length) return;
    var col = mixRGB(COLORS.white, themeMix);
    var head = "rgba(" + (col[0] | 0) + "," + (col[1] | 0) + "," + (col[2] | 0) + ",";
    for (var i = 0; i < meteors.length; i++) {
      var m = meteors[i];
      var sp = Math.sqrt(m.vx * m.vx + m.vy * m.vy) || 1;
      var ux = m.vx / sp, uy = m.vy / sp;
      var tx = m.x - ux * m.len, ty = m.y - uy * m.len;
      // fade in then out over its life
      var k = m.life / m.ttl;
      var a = Math.sin(Math.PI * Math.min(1, k)) * 0.9;
      var g = ctx.createLinearGradient(m.x, m.y, tx, ty);
      g.addColorStop(0, head + a.toFixed(3) + ")");
      g.addColorStop(1, head + "0)");
      ctx.strokeStyle = g;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(tx, ty);
      ctx.stroke();
      ctx.beginPath();
      ctx.fillStyle = head + a.toFixed(3) + ")";
      ctx.arc(m.x, m.y, 1.3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ── "Dive into a star" zoom (Exoplanet project click) ───────
  // 1) the view eases sideways to line up a background star, then
  // 2) accelerates into it — the rest of the field streaks past and
  //    the target grows into a glowing disc that hands off to the page.
  var zoom = { active: false, start: 0, dur: 2000, done: false, cb: null,
               fx0: 0, fy0: 0, ti: -1, maxZ: 95, move: 0.3, pan: 0.7 };

  function starScreenY(s) {
    return wrap(s.baseY - scrollY * (0.02 + s.depth * 0.06) -
                performance.now() * (0.003 + s.depth * 0.0035), H);
  }
  function pickZoomTarget() {
    // prefer a coloured "host" star a little off-centre, so the
    // line-up move is visible before the dive
    var cx = W / 2, cy = H / 2, want = 0.2 * Math.min(W, H);
    var best = -1, bestS = Infinity, bestA = -1, bestAS = Infinity;
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var dx = s.baseX - cx, dy = starScreenY(s) - cy;
      var sc = Math.abs(Math.sqrt(dx * dx + dy * dy) - want);
      if (sc < bestS) { bestS = sc; best = i; }
      if ((s.accent || s.isTarget) && sc < bestAS) { bestAS = sc; bestA = i; }
    }
    return bestA >= 0 ? bestA : best;
  }

  function startZoom(cb) {
    if (zoom.active || glide.active) return;
    zoom.ti = pickZoomTarget();
    if (zoom.ti < 0) { if (cb) cb(); return; }
    var s = stars[zoom.ti];
    zoom.fx0 = s.baseX;
    zoom.fy0 = starScreenY(s);
    zoom.active = true; zoom.done = false;
    zoom.start = performance.now(); zoom.cb = cb;
    canvas.style.zIndex = "9999";         // bring the field in front of everything
    if (!running) start();
  }

  function drawZoom(now) {
    var p = (now - zoom.start) / zoom.dur;
    if (p > 1) p = 1;
    var v = mixRGB(VOID, themeMix);
    var vRGB = (v[0] | 0) + "," + (v[1] | 0) + "," + (v[2] | 0);
    ctx.fillStyle = "rgb(" + vRGB + ")";
    ctx.fillRect(0, 0, W, H);

    var cx = W / 2, cy = H / 2;

    // phase 1 — ease the view so the target lines up toward the centre
    var mv = Math.min(1, p / zoom.move);
    var mvEase = 1 - Math.pow(1 - mv, 3);                     // easeOutCubic
    var panX = (cx - zoom.fx0) * zoom.pan * mvEase;
    var panY = (cy - zoom.fy0) * zoom.pan * mvEase;
    var fx = zoom.fx0 + panX, fy = zoom.fy0 + panY;           // focal = lined-up target

    // phase 2 — accelerate into the focal
    var zp = Math.max(0, (p - zoom.move) / (1 - zoom.move));
    var Z = Math.pow(zoom.maxZ, zp * zp);                     // accelerating zoom about target
    var Z2 = Math.pow(zoom.maxZ, Math.max(0, zp - 0.05) * Math.max(0, zp - 0.05)); // trail
    var tgt = stars[zoom.ti];
    var tc = mixRGB(tgt.accent ? COLORS[tgt.type] : COLORS.blue, themeMix);
    var tcRGB = (tc[0] | 0) + "," + (tc[1] | 0) + "," + (tc[2] | 0);

    // the rest of the field streaks radially past as we fly in
    ctx.lineCap = "round";
    for (var i = 0; i < stars.length; i++) {
      if (i === zoom.ti) continue;
      var s = stars[i];
      var dx = (s.baseX + panX) - fx, dy = (s.baseY + panY) - fy;
      var hx = fx + dx * Z, hy = fy + dy * Z;
      if (hx < -60 || hx > W + 60 || hy < -60 || hy > H + 60) continue;
      var tx = fx + dx * Z2, ty = fy + dy * Z2;
      var c = mixRGB(COLORS[s.type], themeMix);
      ctx.strokeStyle = "rgba(" + (c[0] | 0) + "," + (c[1] | 0) + "," + (c[2] | 0) + "," +
                        (0.85 * (1 - zp * 0.35)).toFixed(3) + ")";
      ctx.lineWidth = s.r * (1 + zp * 1.6);
      ctx.beginPath();
      ctx.moveTo(tx, ty); ctx.lineTo(hx, hy);
      ctx.stroke();
    }

    // the target grows into a glowing disc as we approach
    var diag = Math.sqrt(W * W + H * H);
    var glowR = Math.max(2, tgt.r) + Math.pow(zp, 2.4) * diag * 1.0;
    var grd = ctx.createRadialGradient(fx, fy, 0, fx, fy, glowR);
    grd.addColorStop(0, "rgba(255,255,255," + Math.min(0.85, 0.28 + zp * 0.55).toFixed(3) + ")");
    grd.addColorStop(0.25, "rgba(" + tcRGB + "," + Math.min(0.78, 0.2 + zp * 0.5).toFixed(3) + ")");
    grd.addColorStop(1, "rgba(" + tcRGB + ",0)");
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(fx, fy, glowR, 0, Math.PI * 2);
    ctx.fill();

    // settle to the page's void in the final stretch for a clean hand-off
    if (p > 0.8) {
      ctx.fillStyle = "rgba(" + vRGB + "," + ((p - 0.8) / 0.2).toFixed(3) + ")";
      ctx.fillRect(0, 0, W, H);
    }

    if (p >= 1 && !zoom.done) { zoom.done = true; if (zoom.cb) zoom.cb(); }
  }

  // ── Camera glide (OD logo → home): a fluid pan, no zoom ──────
  var glide = { active: false, start: 0, dur: 1200, done: false, cb: null, dx: 0, dy: 0 };

  function startGlide(cb) {
    if (glide.active || zoom.active) return;
    // straight downward sweep (opposite of the logo at the top)
    glide.dx = 0;
    glide.dy = 0.28 * H;
    glide.active = true; glide.done = false;
    glide.start = performance.now(); glide.cb = cb;
    canvas.style.zIndex = "9999";
    if (!running) start();
  }

  function drawGlide(now) {
    var p = (now - glide.start) / glide.dur;
    if (p > 1) p = 1;
    var v = mixRGB(VOID, themeMix);
    var vRGB = (v[0] | 0) + "," + (v[1] | 0) + "," + (v[2] | 0);
    ctx.fillStyle = "rgb(" + vRGB + ")";
    ctx.fillRect(0, 0, W, H);

    var e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; // easeInOutCubic
    var spd = 6 * p * (1 - p);                                         // motion-blur, peaks mid-pan
    var mag = Math.sqrt(glide.dx * glide.dx + glide.dy * glide.dy) || 1;
    var nux = glide.dx / mag, nuy = glide.dy / mag;

    ctx.lineCap = "round";
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var k = 0.5 + s.depth;                       // nearer stars move more (parallax)
      var x = wrap(s.baseX + glide.dx * e * k, W);
      var y = wrap(s.baseY + glide.dy * e * k, H);
      var c = mixRGB(COLORS[s.type], themeMix);
      var rgb = (c[0] | 0) + "," + (c[1] | 0) + "," + (c[2] | 0);
      var blur = spd * 12 * k;
      if (blur > 1.2) {                            // motion-blur streak while moving fast
        ctx.strokeStyle = "rgba(" + rgb + "," + (s.baseAlpha * 0.9).toFixed(3) + ")";
        ctx.lineWidth = s.r;
        ctx.beginPath();
        ctx.moveTo(x - nux * blur, y - nuy * blur);
        ctx.lineTo(x, y);
        ctx.stroke();
      } else {
        ctx.fillStyle = "rgba(" + rgb + "," + s.baseAlpha.toFixed(3) + ")";
        ctx.beginPath();
        ctx.arc(x, y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (p > 0.75) {                                // settle to void for a clean hand-off
      ctx.fillStyle = "rgba(" + vRGB + "," + ((p - 0.75) / 0.25).toFixed(3) + ")";
      ctx.fillRect(0, 0, W, H);
    }

    if (p >= 1 && !glide.done) { glide.done = true; if (glide.cb) glide.cb(); }
  }

  // ── Render ──────────────────────────────────────────────────
  var lastTime = 0;
  function wrap(v, max) { v = v % max; return v < 0 ? v + max : v; }

  function draw(now) {
    var dt = now - (lastTime || now);
    if (dt > 50) dt = 50;               // clamp after tab refocus
    lastTime = now;
    mvAmt *= 0.9;                       // cursor-speed memory fades when it stops

    if (themeMix !== themeTarget) {
      var step = dt / 300;
      if (themeTarget > themeMix) themeMix = Math.min(themeTarget, themeMix + step);
      else themeMix = Math.max(themeTarget, themeMix - step);
    }

    if (zoom.active) { drawZoom(now); return; }
    if (glide.active) { drawGlide(now); return; }

    var v = mixRGB(VOID, themeMix);
    ctx.fillStyle = "rgb(" + (v[0] | 0) + "," + (v[1] | 0) + "," + (v[2] | 0) + ")";
    ctx.fillRect(0, 0, W, H);

    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];

      // very slow upward drift (nearer stars drift a touch faster) +
      // a gentle scroll parallax — mimics watching the sky in space
      var sx = s.baseX;
      var sy = wrap(s.baseY - scrollY * (0.02 + s.depth * 0.06) - now * (0.003 + s.depth * 0.0035), H);

      // gravitational lens: push nearby stars outward + stretch them
      // tangentially into a curved arc around the cursor (light bending)
      var ptx = 0, pty = 0, targetStretch = 0;
      if (lensOn) {
        var ddx = sx - mouseX, ddy = sy - mouseY;
        var dist = Math.sqrt(ddx * ddx + ddy * ddy);
        if (dist < LENS_R && dist > 0.01) {
          var f = 1 - dist / LENS_R;
          var push = LENS_PUSH * f * f;
          ptx = (ddx / dist) * push;
          pty = (ddy / dist) * push;
          targetStretch = f * mvAmt;     // only stretch while the cursor moves
        }
      }
      s.offX += (ptx - s.offX) * 0.12;
      s.offY += (pty - s.offY) * 0.12;
      s.stretch += (targetStretch - s.stretch) * 0.12;

      var alpha = s.baseAlpha;
      var flash = 0;
      if (!reduceMotion) {
        alpha *= 1 + s.twAmp * Math.sin(now * s.twSpeed + s.twPhase);
        if (s.sparkle) {
          var fp = ((now + s.flashPhase) % s.flashPeriod) / s.flashPeriod;
          if (fp < 0.10) { flash = Math.sin(Math.PI * (fp / 0.10)); } // sharp glint
          alpha *= 1 + flash * 0.9;
        }
        if (s.isTarget) {
          var cp = ((now + s.phase) % s.period) / s.period;
          if (cp < s.transitFrac) {
            var t = cp / s.transitFrac;
            var dip = s.depthDip * (0.5 - 0.5 * Math.cos(2 * Math.PI * t)); // U-shape
            alpha *= 1 - dip;
          }
        }
      }
      if (alpha < 0) alpha = 0; else if (alpha > 1) alpha = 1;

      var c = mixRGB(COLORS[s.type], themeMix);
      var rgb = (c[0] | 0) + "," + (c[1] | 0) + "," + (c[2] | 0);
      var x = sx + s.offX, y = sy + s.offY;

      if (s.accent || s.isTarget) {
        ctx.beginPath();
        ctx.fillStyle = "rgba(" + rgb + "," + (alpha * 0.18).toFixed(3) + ")";
        ctx.arc(x, y, s.r * 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
      if (s.stretch > 0.04) {
        // bend the star into a tapered tangential arc (fat middle, super-thin
        // pointed ends) curving around the cursor, tinted lensed-galaxy blue
        var rdx = x - mouseX, rdy = y - mouseY;
        var rad = Math.sqrt(rdx * rdx + rdy * rdy) || 1;
        var ang = Math.atan2(rdy, rdx);
        var halfA = Math.min(0.7, (s.stretch * LENS_STRETCH * 0.5) / rad);
        var maxW = Math.max(0.45, s.r * 0.55);           // thin half-thickness at the middle
        var tint = mixRGB(LENS_TINT, themeMix), bt = 0.68 * s.stretch;
        var aA = Math.min(1, alpha + s.stretch * 0.35);  // lensed arcs read a touch brighter
        var br = (lerp(c[0], tint[0], bt)) | 0,
            bg = (lerp(c[1], tint[1], bt)) | 0,
            bb = (lerp(c[2], tint[2], bt)) | 0;
        ctx.fillStyle = "rgba(" + br + "," + bg + "," + bb + "," + aA.toFixed(3) + ")";
        ctx.beginPath();
        var N = 12, i2, t2, a2, w2;
        for (i2 = 0; i2 <= N; i2++) {                    // outer edge
          t2 = i2 / N; a2 = ang - halfA + t2 * 2 * halfA; w2 = maxW * Math.sin(Math.PI * t2);
          ctx.lineTo(mouseX + Math.cos(a2) * (rad + w2), mouseY + Math.sin(a2) * (rad + w2));
        }
        for (i2 = N; i2 >= 0; i2--) {                    // inner edge, back to start
          t2 = i2 / N; a2 = ang - halfA + t2 * 2 * halfA; w2 = maxW * Math.sin(Math.PI * t2);
          ctx.lineTo(mouseX + Math.cos(a2) * (rad - w2), mouseY + Math.sin(a2) * (rad - w2));
        }
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.fillStyle = "rgba(" + rgb + "," + alpha.toFixed(3) + ")";
        ctx.arc(x, y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // sparkle glint: a small 4-point cross at peak brightness
      if (flash > 0.45) {
        var gl = s.r * (3 + flash * 4);
        ctx.strokeStyle = "rgba(" + rgb + "," + (flash * 0.5).toFixed(3) + ")";
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.moveTo(x - gl, y); ctx.lineTo(x + gl, y);
        ctx.moveTo(x, y - gl); ctx.lineTo(x, y + gl);
        ctx.stroke();
      }
    }

    if (!reduceMotion) { updateMeteors(now, dt); drawMeteors(now); }
  }

  // ── Loop ────────────────────────────────────────────────────
  var rafId = null, running = false;
  function frame(now) { draw(now); rafId = requestAnimationFrame(frame); }
  function start() { if (running) return; running = true; rafId = requestAnimationFrame(frame); }
  function stop() { running = false; if (rafId) cancelAnimationFrame(rafId); rafId = null; }

  // ── Wiring ──────────────────────────────────────────────────
  var resizeTimer = null;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  });

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stop();
    else if (!reduceMotion || zoom.active || glide.active) start();
  });

  new MutationObserver(function () {
    themeTarget = targetMixForTheme();
    if (reduceMotion && !zoom.active && !glide.active) draw(performance.now());
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  // Dive-into-a-star transition when entering the primary (Exoplanet) project
  document.addEventListener("click", function (e) {
    var a = e.target.closest ? e.target.closest("a[href]") : null;
    if (!a) return;
    var href = a.getAttribute("href") || "";
    if (href.indexOf("project/exoplanet-hunter") === -1) return;     // only the project page links
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    if (a.target === "_blank") return;
    if (reduceMotion) return;                                        // navigate normally
    e.preventDefault();
    var dest = a.href;
    var navigated = false;
    function go() { if (navigated) return; navigated = true; window.location.href = dest; }
    startZoom(go);
    setTimeout(go, zoom.dur + 500); // safety net if rAF is throttled
  }, true);

  // Camera-glide transition when clicking the OD logo (→ home)
  document.addEventListener("click", function (e) {
    var a = e.target.closest ? e.target.closest("a.nav-logo") : null;
    if (!a) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    if (reduceMotion) return;                                        // navigate normally
    e.preventDefault();
    var dest = a.href;
    var navigated = false;
    function go() { if (navigated) return; navigated = true; window.location.href = dest; }
    startGlide(go);
    setTimeout(go, glide.dur + 500); // safety net if rAF is throttled
  }, true);

  resize();
  if (reduceMotion) { draw(performance.now()); } else { start(); }
})();
