// ===== Timer Module =====
// Training timer + rest countdown + audio beep

export function createTimerManager(state) {
  let restTimerId = null;
  let trainingTimerId = null;

  // Rest countdown timer
  function startRestTimer(seconds, onComplete, onTick) {
    stopRestTimer();
    let remaining = seconds;
    onTick && onTick(remaining, seconds);
    restTimerId = setInterval(() => {
      remaining--;
      onTick && onTick(remaining, seconds);
      if (remaining <= 0) {
        stopRestTimer();
        playBeep();
        onComplete && onComplete();
      }
    }, 1000);
  }

  function stopRestTimer() {
    if (restTimerId) { clearInterval(restTimerId); restTimerId = null; }
  }

  // Training elapsed timer
  function startTrainingTimer(onTick) {
    stopTrainingTimer();
    const start = Date.now();
    trainingTimerId = setInterval(() => {
      const elapsed = Math.floor((Date.now() - start) / 1000) + (state.trainingTimerElapsed || 0);
      onTick && onTick(elapsed);
    }, 1000);
    return start;
  }

  function stopTrainingTimer() {
    if (trainingTimerId) { clearInterval(trainingTimerId); trainingTimerId = null; }
  }

  function getElapsed(startTime) {
    return Math.floor((Date.now() - startTime) / 1000) + (state.trainingTimerElapsed || 0);
  }

  // Audio
  function playBeep() {
    try {
      let ctx;
      if (!window._audioCtx) window._audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      ctx = window._audioCtx;
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = 880; g.gain.value = 0.3;
      o.start(); o.stop(ctx.currentTime + 0.15);
      setTimeout(() => {
        const o2 = ctx.createOscillator(), g2 = ctx.createGain();
        o2.connect(g2); g2.connect(ctx.destination);
        o2.frequency.value = 1100; g2.gain.value = 0.3;
        o2.start(); o2.stop(ctx.currentTime + 0.3);
      }, 200);
    } catch (e) {}
  }

  function cleanup() {
    stopRestTimer();
    stopTrainingTimer();
  }

  return { startRestTimer, stopRestTimer, startTrainingTimer, stopTrainingTimer, getElapsed, playBeep, cleanup };
}
