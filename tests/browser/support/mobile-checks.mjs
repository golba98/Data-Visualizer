// Layout and canvas checks shared by the mobile specs. Each check returns a
// list of problems (empty when healthy) so a failure names every issue at
// once instead of stopping at the first. Every function takes a Page or a
// Frame, so the same checks run inside the comparison view's iframes.

export const MIN_TAP_TARGET = 44;

// Waits until the chart `id` is selected, its data has loaded and any
// entrance animation has finished, so a probe sees the settled layout.
export async function waitForChart(target, id) {
  await target.waitForFunction((chartId) => {
    const vis = window.gallery && window.gallery.selectedVisual;
    return !!vis && vis.id === chartId && vis.isReady === true
      && !!window.p5 && !!window.p5.instance && window.p5.instance._loop === false;
  }, id, { timeout: 20_000 });

  // p5 redraws synchronously when data arrives, so the chart can report ready
  // before the page's first rendering frame, where the canvas is fitted to
  // its container (WebKit can hold that frame back ~250ms on a cold load).
  // Nothing is painted before then, so wait two frames and probe what a
  // person would actually see.
  await target.evaluate(() => new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  }));
}

// Page-level layout problems: sideways scrolling, tap targets under 44px,
// text cut off by an overflow:hidden ancestor, and controls that cannot be
// reached because the page itself does not scroll (story mode).
export function findLayoutProblems(target) {
  return target.evaluate((minTarget) => {
    const problems = [];
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const describe = (el) => {
      const id = el.id ? '#' + el.id : '';
      const cls = el.classList.length ? '.' + [...el.classList].join('.') : '';
      const label = (el.getAttribute('aria-label') || el.textContent || '').trim().replace(/\s+/g, ' ');
      return `${el.tagName.toLowerCase()}${id}${cls} "${label.slice(0, 40)}"`;
    };

    const isShown = (el) => {
      if (!el.getClientRects().length) return false;
      const style = getComputedStyle(el);
      if (style.visibility === 'hidden' || style.display === 'none') return false;
      if (el.closest('[hidden], .visually-hidden')) return false;
      const rect = el.getBoundingClientRect();
      // Off-canvas panels (the closed navigation drawer) sit fully outside
      // the viewport on purpose.
      return rect.width > 1 && rect.height > 1 && rect.right > 0 && rect.left < vw;
    };

    const overflowX = document.documentElement.scrollWidth - vw;
    if (overflowX > 1) {
      problems.push(`page scrolls sideways by ${overflowX}px`);
    }

    const controls = [...document.querySelectorAll('button, select, input:not([type="hidden"]), summary, a[href]')]
      .filter((el) => isShown(el) && !(el.tagName === 'A' && el.closest('p, li, dd')));

    for (const el of controls) {
      const rect = el.getBoundingClientRect();
      if (Math.round(rect.height) < minTarget || Math.round(rect.width) < minTarget) {
        problems.push(`tap target ${Math.round(rect.width)}x${Math.round(rect.height)}px: ${describe(el)}`);
      }
      if (rect.left < -1 || rect.right > vw + 1) {
        problems.push(`control sticks out of the viewport: ${describe(el)}`);
      }
    }

    // A page that cannot scroll leaves anything below the fold unreachable.
    const rootStyle = getComputedStyle(document.documentElement);
    const bodyStyle = getComputedStyle(document.body);
    const pageScrolls = !(rootStyle.overflowY === 'hidden' || bodyStyle.overflowY === 'hidden');
    if (!pageScrolls) {
      for (const el of controls) {
        const rect = el.getBoundingClientRect();
        let scroller = el.parentElement;
        while (scroller && !/(auto|scroll)/.test(getComputedStyle(scroller).overflowY)) {
          scroller = scroller.parentElement;
        }
        if (!scroller && (rect.bottom > vh + 1 || rect.top < -1)) {
          problems.push(`control unreachable (page does not scroll): ${describe(el)}`);
        }
      }
    }

    // Text cut off by an ancestor that clips rather than scrolls.
    const texts = [...document.querySelectorAll('h1, h2, h3, h4, p, button, label, summary, th, td, dt, dd')]
      .filter(isShown);
    for (const el of texts) {
      if (el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).overflowX !== 'visible'
          && !/(auto|scroll)/.test(getComputedStyle(el).overflowX)) {
        problems.push(`text overflows its own box: ${describe(el)}`);
      }
      const rect = el.getBoundingClientRect();
      for (let parent = el.parentElement; parent && parent !== document.body; parent = parent.parentElement) {
        const style = getComputedStyle(parent);
        const clipsX = /(hidden|clip)/.test(style.overflowX);
        const clipsY = /(hidden|clip)/.test(style.overflowY);
        if (/(auto|scroll)/.test(style.overflowX + style.overflowY)) break;
        if (!clipsX && !clipsY) continue;
        const box = parent.getBoundingClientRect();
        const cutX = clipsX && (rect.left < box.left - 1 || rect.right > box.right + 1);
        const cutY = clipsY && (rect.top < box.top - 1 || rect.bottom > box.bottom + 1);
        if (cutX || cutY) {
          problems.push(`text clipped by ${describe(parent).split(' ')[0]}: ${describe(el)}`);
        }
        break;
      }
    }

    return problems;
  }, MIN_TAP_TARGET);
}

// The chart canvas must be shown at the size it was drawn at (a CSS-squashed
// canvas is unreadable), sit inside its container, and be a usable height.
export function findCanvasProblems(target) {
  return target.evaluate(() => {
    const problems = [];
    const container = document.getElementById('chart-container');
    const canvas = container && container.querySelector('canvas');
    if (!canvas) return ['no chart canvas'];

    const shown = canvas.getBoundingClientRect();
    const drawnWidth = parseFloat(canvas.style.width);
    const drawnHeight = parseFloat(canvas.style.height);
    const box = container.getBoundingClientRect();

    if (Math.abs(shown.width - drawnWidth) > 1.5 || Math.abs(shown.height - drawnHeight) > 1.5) {
      problems.push(`canvas drawn at ${drawnWidth}x${drawnHeight} but shown at `
        + `${Math.round(shown.width)}x${Math.round(shown.height)} (scaled by CSS)`);
    }
    if (shown.height < 200) {
      problems.push(`canvas only ${Math.round(shown.height)}px tall`);
    }
    if (shown.left < box.left - 1 || shown.right > box.right + 1
        || shown.top < box.top - 1 || shown.bottom > box.bottom + 1) {
      problems.push(`canvas ${Math.round(shown.width)}x${Math.round(shown.height)} overflows its `
        + `${Math.round(box.width)}x${Math.round(box.height)} container`);
    }
    return problems;
  });
}

// Redraws the chart once with p5's per-line text renderer wrapped, and
// reports canvas text that overlaps other text, is drawn off the canvas, or
// is silently dropped because it does not fit its text box (p5 0.10 skips
// those lines without a warning).
export function probeCanvasText(target) {
  return target.evaluate(() => {
    const inst = window.p5 && window.p5.instance;
    if (!inst || !inst._renderer) return { lines: [], problems: ['no p5 instance'] };

    const renderer = inst._renderer;
    const density = inst.pixelDensity();
    const lines = [];
    let call = 0;
    const originalText = window.text;
    const originalRender = renderer._renderText;

    window.text = function() {
      call += 1;
      return originalText.apply(this, arguments);
    };
    renderer._renderText = function(p, line, x, y, maxY) {
      const str = String(line);
      if (str.trim()) {
        const ctx = this.drawingContext;
        const m = ctx.measureText(str);
        const t = ctx.getTransform();
        const corners = [
          [x - m.actualBoundingBoxLeft, y - m.actualBoundingBoxAscent],
          [x + m.actualBoundingBoxRight, y - m.actualBoundingBoxAscent],
          [x - m.actualBoundingBoxLeft, y + m.actualBoundingBoxDescent],
          [x + m.actualBoundingBoxRight, y + m.actualBoundingBoxDescent]
        ].map(([px, py]) => [(t.a * px + t.c * py + t.e) / density, (t.b * px + t.d * py + t.f) / density]);
        const xs = corners.map((c) => c[0]);
        const ys = corners.map((c) => c[1]);
        lines.push({
          call,
          text: str.trim(),
          dropped: maxY <= y,
          // Corner order: top-left, top-right, bottom-right, bottom-left.
          quad: [corners[0], corners[1], corners[3], corners[2]],
          box: { left: Math.min(...xs), right: Math.max(...xs), top: Math.min(...ys), bottom: Math.max(...ys) }
        });
      }
      return originalRender.apply(this, arguments);
    };

    try {
      window.redraw();
    } finally {
      window.text = originalText;
      renderer._renderText = originalRender;
    }

    const problems = [];
    const w = inst.width;
    const h = inst.height;
    const shown = lines.filter((line) => !line.dropped);
    const quote = (s) => `"${s.length > 48 ? s.slice(0, 45) + '...' : s}"`;

    for (const line of lines.filter((l) => l.dropped)) {
      problems.push(`text dropped (does not fit its box): ${quote(line.text)}`);
    }
    for (const line of shown) {
      const b = line.box;
      if (b.left < -1 || b.top < -1 || b.right > w + 1 || b.bottom > h + 1) {
        problems.push(`text drawn off the ${w}x${h} canvas: ${quote(line.text)}`);
      }
    }
    // Depth by which two text outlines overlap, via the separating axis
    // test, so rotated labels are compared by their real outlines rather
    // than their much larger axis-aligned boxes.
    const overlapDepth = (p, q) => {
      let depth = Infinity;
      for (const quad of [p, q]) {
        for (let k = 0; k < 4; k++) {
          const [x1, y1] = quad[k];
          const [x2, y2] = quad[(k + 1) % 4];
          const length = Math.hypot(x2 - x1, y2 - y1) || 1;
          const nx = -(y2 - y1) / length;
          const ny = (x2 - x1) / length;
          const project = (points) => points.map(([x, y]) => (x * nx) + (y * ny));
          const pp = project(p);
          const qq = project(q);
          depth = Math.min(depth, Math.min(Math.max(...pp), Math.max(...qq)) - Math.max(Math.min(...pp), Math.min(...qq)));
          if (depth <= 0) return 0;
        }
      }
      return depth;
    };

    for (let i = 0; i < shown.length; i++) {
      for (let j = i + 1; j < shown.length; j++) {
        const a = shown[i];
        const b = shown[j];
        if (a.call === b.call) continue;
        const ix = Math.min(a.box.right, b.box.right) - Math.max(a.box.left, b.box.left);
        const iy = Math.min(a.box.bottom, b.box.bottom) - Math.max(a.box.top, b.box.top);
        if (ix < 2 || iy < 2) continue;
        const depth = overlapDepth(a.quad, b.quad);
        if (depth >= 2) {
          problems.push(`text overlaps: ${quote(a.text)} and ${quote(b.text)} (${Math.round(depth)}px deep)`);
        }
      }
    }

    return { lines: lines.length, problems };
  });
}

// Records, for every frame, whether a tooltip was drawn and where its text
// landed. Installed once per document.
export function installTooltipRecorder(target) {
  return target.evaluate(() => {
    if (window.__tooltipLog) return;
    window.__tooltipLog = [];
    const original = window.drawPendingChartTooltip;
    window.drawPendingChartTooltip = function() {
      const renderer = window.p5.instance._renderer;
      const density = window.p5.instance.pixelDensity();
      const entry = { shown: !!window.pendingChartTooltip, boxes: [] };
      const originalRender = renderer._renderText;
      renderer._renderText = function(p, line, x, y) {
        const m = this.drawingContext.measureText(String(line));
        const t = this.drawingContext.getTransform();
        entry.boxes.push({
          left: (t.a * (x - m.actualBoundingBoxLeft) + t.e) / density,
          right: (t.a * (x + m.actualBoundingBoxRight) + t.e) / density,
          top: (t.d * (y - m.actualBoundingBoxAscent) + t.f) / density,
          bottom: (t.d * (y + m.actualBoundingBoxDescent) + t.f) / density
        });
        return originalRender.apply(this, arguments);
      };
      try {
        return original.apply(this, arguments);
      } finally {
        renderer._renderText = originalRender;
        window.__tooltipLog.push(entry);
      }
    };
  });
}

export function lastTooltipFrame(target) {
  return target.evaluate(() => {
    const log = window.__tooltipLog || [];
    return log.length ? log[log.length - 1] : null;
  });
}
