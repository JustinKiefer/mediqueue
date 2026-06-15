/* ════════════════════════════════════════════════════════
   api.js
   Asynchronous request simulation.
   Since this is a static (Track B) deployment with no real
   backend, all "API calls" are wrapped in artificial network
   delay so the UI must handle genuine async/await flows,
   loading states, and potential failure paths.
   ════════════════════════════════════════════════════════ */

/**
 * Resolve after `ms` milliseconds. Used to simulate
 * network/API latency for any operation.
 */
function simulateNetworkDelay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Simulated GET request for the current queue state.
 * Adds a small randomized delay (350–550ms) and throws
 * if no data is available, so callers must handle errors.
 */
async function fetchQueueData() {
  await simulateNetworkDelay(350 + Math.random() * 200);
  const data = loadData();
  if (!data) throw new Error('Queue data unavailable');
  return data;
}
