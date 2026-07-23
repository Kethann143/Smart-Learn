/**
 * run_load_test.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Smart Learn — Baseline / Load Test Runner
 * Generates continuous requests to Express Backend Server (port 8080)
 *
 * Parameters:
 *   • Concurrency (VUs) : 100
 *   • Duration          : 60 seconds
 *   • Target Route      : GET http://localhost:8080/api/auth/user
 *   • Headers           : x-user-email: student@smartlearn.edu (triggers DB query)
 * ─────────────────────────────────────────────────────────────────────────────
 */

const fs = require('fs');
const path = require('path');

const TARGET_URL = 'http://localhost:8080/api/auth/user';
const EMAIL_HEADER = 'student@smartlearn.edu';
const CONCURRENCY = 100;
const TEST_DURATION_MS = 60 * 1000; // 1 minute

console.log('🚀 Starting Baseline Load Test...');
console.log(`   Target URL : ${TARGET_URL}`);
console.log(`   VUs        : ${CONCURRENCY}`);
console.log(`   Duration   : ${TEST_DURATION_MS / 1000}s`);

const samples = [];
let testStartTime = 0;
let stopSignal = false;

// Keep track of active requests
let activeRequestsCount = 0;

async function sendRequest() {
  const startTime = Date.now();
  activeRequestsCount++;

  try {
    const res = await fetch(TARGET_URL, {
      method: 'GET',
      headers: {
        'x-user-email': EMAIL_HEADER,
        'Accept': 'application/json'
      }
    });

    // Consume the body to release the connection completely
    await res.text();
    const endTime = Date.now();
    const latency = endTime - startTime;

    samples.push({
      timestamp: startTime,
      latency: latency,
      status: res.status,
      success: res.status === 200
    });
  } catch (err) {
    const endTime = Date.now();
    samples.push({
      timestamp: startTime,
      latency: endTime - startTime,
      status: 0,
      success: false,
      error: err.message
    });
  } finally {
    activeRequestsCount--;
  }
}

async function worker() {
  while (!stopSignal) {
    await sendRequest();
  }
}

async function run() {
  testStartTime = Date.now();
  
  // Start the VUs (concurrency workers)
  const workers = [];
  for (let i = 0; i < CONCURRENCY; i++) {
    workers.push(worker());
  }

  // Run for the specified duration
  await new Promise((resolve) => setTimeout(resolve, TEST_DURATION_MS));
  
  console.log('🛑 Stopping load generator, waiting for active requests to finish...');
  stopSignal = true;

  // Wait for workers to wind down
  await Promise.all(workers);
  
  const testEndTime = Date.now();
  const actualDurationMs = testEndTime - testStartTime;
  
  console.log('📊 Aggregating metrics...');
  
  const totalRequests = samples.length;
  const passedRequests = samples.filter(s => s.success).length;
  const failedRequests = totalRequests - passedRequests;
  const successRate = totalRequests > 0 ? (passedRequests / totalRequests) * 100 : 0;
  
  const latencies = samples.map(s => s.latency).sort((a, b) => a - b);
  const minLatency = latencies.length > 0 ? latencies[0] : 0;
  const maxLatency = latencies.length > 0 ? latencies[latencies.length - 1] : 0;
  const sumLatency = latencies.reduce((a, b) => a + b, 0);
  const avgLatency = latencies.length > 0 ? sumLatency / latencies.length : 0;
  
  // Percentiles
  const getPercentile = (p) => {
    if (latencies.length === 0) return 0;
    const idx = Math.floor((p / 100) * latencies.length);
    return latencies[Math.min(idx, latencies.length - 1)];
  };

  const p50 = getPercentile(50);
  const p90 = getPercentile(90);
  const p95 = getPercentile(95);
  const p99 = getPercentile(99);

  const averageRps = totalRequests / (actualDurationMs / 1000);

  // Group samples by second to create a timeline of RPS and Latency
  const timeline = {};
  // Initialize timeline slots
  const durationSeconds = Math.ceil(actualDurationMs / 1000);
  for (let i = 0; i < durationSeconds; i++) {
    timeline[i] = {
      second: i + 1,
      requests: 0,
      passed: 0,
      failed: 0,
      latencies: []
    };
  }

  samples.forEach(s => {
    const relativeSec = Math.floor((s.timestamp - testStartTime) / 1000);
    if (timeline[relativeSec]) {
      timeline[relativeSec].requests++;
      if (s.success) {
        timeline[relativeSec].passed++;
      } else {
        timeline[relativeSec].failed++;
      }
      timeline[relativeSec].latencies.push(s.latency);
    }
  });

  const timelineData = Object.keys(timeline).map(k => {
    const slot = timeline[k];
    const avgSecLatency = slot.latencies.length > 0 
      ? slot.latencies.reduce((a, b) => a + b, 0) / slot.latencies.length 
      : 0;
    return {
      second: slot.second,
      rps: slot.requests,
      passed: slot.passed,
      failed: slot.failed,
      avgLatency: avgSecLatency
    };
  });

  const results = {
    metadata: {
      targetUrl: TARGET_URL,
      concurrency: CONCURRENCY,
      plannedDurationSeconds: TEST_DURATION_MS / 1000,
      actualDurationMs: actualDurationMs,
      testStartTimeStr: new Date(testStartTime).toLocaleString(),
      testEndTimeStr: new Date(testEndTime).toLocaleString()
    },
    summary: {
      totalRequests,
      passedRequests,
      failedRequests,
      successRate: parseFloat(successRate.toFixed(2)),
      averageRps: parseFloat(averageRps.toFixed(2)),
      minLatency,
      maxLatency,
      avgLatency: parseFloat(avgLatency.toFixed(2)),
      p50,
      p90,
      p95,
      p99
    },
    timeline: timelineData
  };

  const resultsFile = path.join(__dirname, 'load_test_results.json');
  fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));

  console.log(`✅ Load Test Complete! Results written to ${resultsFile}`);
  console.log('----------------------------------------------------');
  console.log(`   Total Requests: ${totalRequests}`);
  console.log(`   Success Rate  : ${successRate.toFixed(2)}%`);
  console.log(`   Average RPS   : ${averageRps.toFixed(2)} req/sec`);
  console.log(`   Latency Avg   : ${avgLatency.toFixed(1)}ms (Min: ${minLatency}ms, Max: ${maxLatency}ms)`);
  console.log(`   Percentiles   : p50: ${p50}ms, p90: ${p90}ms, p99: ${p99}ms`);
  console.log('----------------------------------------------------');
}

run().catch(console.error);
