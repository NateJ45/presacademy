// =============================================================================
// timing — the preview's own stopwatch, off unless you ask for it (2026-08-28)
// =============================================================================
// "It feels slow" is not a number, and the preview refresh loop crosses four
// processes (Studio, Sanity, the Worker, this frame), so the only honest way to
// tune it is to measure it in a real Presentation window.
//
// HOW TO TURN IT ON. In the preview frame's console:
//
//     localStorage.previewTiming = '1'
//
// and reload. Every refresh then logs one `console.debug` line. Set it to '0' or
// remove it to go quiet again. It is read on every call rather than cached, so
// the flag takes effect without a reload once the page is already open.
//
// WHAT THE LINES MEAN:
//   instant-text   an edit arrived over the comlink and N text nodes on the page
//                  were swapped. This is the number an editor feels.
//   soft-refresh   a /preview/live change event arrived and the server-rendered
//                  <main> was swapped in. This is the slower, complete one; the
//                  instant-text swap has usually already happened.
//
// Left in deliberately: it costs one localStorage read per refresh when off,
// and it is the difference between tuning this loop again and guessing at it.
// =============================================================================

/** Whether the timing flag is set. Never throws — storage can be blocked. */
export function timingEnabled(): boolean {
  try {
    return window.localStorage.getItem('previewTiming') === '1';
  } catch {
    return false;
  }
}

/** Start a stopwatch. Returns a function that logs the elapsed time. */
export function startTiming(label: string): (detail?: string) => void {
  const began = performance.now();
  return (detail = '') => {
    if (!timingEnabled()) return;
    const ms = Math.round(performance.now() - began);
    console.debug(`[preview] ${label} ${ms}ms${detail ? ` ${detail}` : ''}`);
  };
}
