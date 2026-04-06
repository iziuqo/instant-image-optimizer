export function createComparisonSlider({
  container,
  overlayEl,
  handleEl,
  getRectTarget,
  onChange,
}) {
  let dragging = false;
  let ratio = 0.5;
  let enabled = true;

  function clamp01(v) {
    return Math.max(0, Math.min(1, v));
  }

  function apply() {
    const rect = getRectTarget();
    const px = ratio * rect.width;

    overlayEl.style.width = `${rect.width}px`;
    overlayEl.style.height = `${rect.height}px`;
    // Show optimized on the RIGHT side; keep original on the LEFT.
    overlayEl.style.clipPath = `inset(0 0 0 ${Math.max(0, px)}px)`;
    handleEl.style.left = `${px}px`;
    onChange?.(ratio);
  }

  function setFromClientX(clientX) {
    const rect = getRectTarget();
    const x = clientX - rect.left;
    ratio = clamp01(rect.width ? x / rect.width : 0.5);
    apply();
  }

  function onPointerDown(e) {
    if (!enabled) return;
    // Dragging should start only when the handle is grabbed.
    if (e.target !== handleEl && !handleEl.contains(e.target)) return;
    dragging = true;
    container.setPointerCapture?.(e.pointerId);
    setFromClientX(e.clientX);
  }

  function onPointerMove(e) {
    if (!enabled) return;
    if (!dragging) return;
    setFromClientX(e.clientX);
  }

  function onPointerUp(e) {
    if (!dragging) return;
    dragging = false;
    container.releasePointerCapture?.(e.pointerId);
  }

  function onResize() {
    apply();
  }

  // Prefer Pointer Events (covers mouse + touch)
  container.addEventListener("pointerdown", onPointerDown, { passive: true });
  container.addEventListener("pointermove", onPointerMove, { passive: true });
  container.addEventListener("pointerup", onPointerUp, { passive: true });
  container.addEventListener("pointercancel", onPointerUp, { passive: true });

  const ro = new ResizeObserver(onResize);
  ro.observe(container);

  // Initialize
  queueMicrotask(apply);

  return {
    setRatio(nextRatio) {
      ratio = clamp01(nextRatio);
      apply();
    },
    setEnabled(nextEnabled) {
      enabled = Boolean(nextEnabled);
      if (!enabled) dragging = false;
    },
    destroy() {
      container.removeEventListener("pointerdown", onPointerDown);
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerup", onPointerUp);
      container.removeEventListener("pointercancel", onPointerUp);
      ro.disconnect();
    },
  };
}
