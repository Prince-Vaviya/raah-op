export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000/ws';

// ---------------------------------------------------------------------------
// Simple TTL-based fetch cache
// ---------------------------------------------------------------------------

type CacheEntry = { data: unknown; ts: number; ttl: number };

const cache = new Map<string, CacheEntry>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > entry.ttl) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache(key: string, data: unknown, ttl: number) {
  cache.set(key, { data, ts: Date.now(), ttl });
}

/** Remove a single cache key (use after mutations that invalidate specific data). */
export function clearCache(key: string) {
  cache.delete(key);
}

/** Flush the entire cache (e.g. on logout). */
export function clearAllCache() {
  cache.clear();
}

// ---------------------------------------------------------------------------
// API helpers
// ---------------------------------------------------------------------------

const TTL = {
  telemetry: 10_000,   // 10 s – changes frequently
  alerts:    30_000,   // 30 s
  analytics: 60_000,   // 60 s – daily data is stable
  routes:    120_000,  // 2 min – rarely changes
  geojson:   120_000,  // 2 min
  maintenance: 10_000, // 10 s
  conductors:  30_000, // 30 s
} as const;

export async function fetchTelemetry() {
  const cached = getCached<any[]>('telemetry');
  if (cached) return cached;

  try {
    const res = await fetch(`${API_URL}/telemetry`);
    if (!res.ok) return [];
    const data = await res.json();
    setCache('telemetry', data, TTL.telemetry);
    return data;
  } catch (err) {
    console.warn('Backend telemetry unreachable:', err);
    return [];
  }
}

export async function fetchAlerts() {
  const cached = getCached<any[]>('alerts');
  if (cached) return cached;

  try {
    const res = await fetch(`${API_URL}/alerts`);
    if (!res.ok) return [];
    const data = await res.json();
    setCache('alerts', data, TTL.alerts);
    return data;
  } catch (err) {
    console.warn('Backend alerts unreachable:', err);
    return [];
  }
}

export async function fetchAnalytics() {
  const cached = getCached<any[]>('analytics');
  if (cached) return cached;

  try {
    const res = await fetch(`${API_URL}/analytics/daily`);
    if (!res.ok) return [];
    const data = await res.json();
    setCache('analytics', data, TTL.analytics);
    return data;
  } catch (err) {
    console.warn('Backend analytics unreachable:', err);
    return [];
  }
}

export async function fetchRoutes() {
  const cached = getCached<any[]>('routes');
  if (cached) return cached;

  const res = await fetch(`${API_URL}/routes`);
  if (!res.ok) throw new Error('Failed to fetch routes');
  const data = await res.json();
  setCache('routes', data, TTL.routes);
  return data;
}

export async function fetchRouteDetails(id: string) {
  const key = `route:${id}`;
  const cached = getCached<any>(key);
  if (cached) return cached;

  const res = await fetch(`${API_URL}/routes/${id}`);
  if (!res.ok) throw new Error('Failed to fetch route details');
  const data = await res.json();
  setCache(key, data, TTL.routes);
  return data;
}

export async function fetchRoutesGeoJSON() {
  const cached = getCached<any>('routesGeoJSON');
  if (cached) return cached;

  const res = await fetch(`${API_URL}/routes/geojson`);
  if (!res.ok) throw new Error('Failed to fetch routes geojson');
  const data = await res.json();
  setCache('routesGeoJSON', data, TTL.geojson);
  return data;
}

export async function fetchLiveTelemetryGeoJSON() {
  const cached = getCached<any>('liveTelemetryGeoJSON');
  if (cached) return cached;

  const res = await fetch(`${API_URL}/telemetry/geojson`);
  if (!res.ok) throw new Error('Failed to fetch telemetry geojson');
  const data = await res.json();
  setCache('liveTelemetryGeoJSON', data, TTL.telemetry);
  return data;
}

export async function fetchAllStopsGeoJSON() {
  const cached = getCached<any>('allStopsGeoJSON');
  if (cached) return cached;

  const res = await fetch(`${API_URL}/routes/stops/geojson`);
  if (!res.ok) throw new Error('Failed to fetch stops geojson');
  const data = await res.json();
  setCache('allStopsGeoJSON', data, TTL.geojson);
  return data;
}

export async function fetchAnalyticsOverview() {
  const cached = getCached<any>('analyticsOverview');
  if (cached) return cached;

  const res = await fetch(`${API_URL}/analytics/overview`);
  if (!res.ok) throw new Error('Failed to fetch analytics overview');
  const data = await res.json();
  setCache('analyticsOverview', data, TTL.analytics);
  return data;
}

export async function fetchMaintenance() {
  const cached = getCached<any[]>('maintenance');
  if (cached) return cached;

  const res = await fetch(`${API_URL}/maintenance`);
  if (!res.ok) throw new Error('Failed to fetch maintenance logs');
  const data = await res.json();
  setCache('maintenance', data, TTL.maintenance);
  return data;
}

export async function fetchConductors() {
  const cached = getCached<any[]>('conductors');
  if (cached) return cached;

  const res = await fetch(`${API_URL}/operators/verifications?status=PENDING`);
  if (!res.ok) throw new Error('Failed to fetch conductors');
  const data = await res.json();
  setCache('conductors', data, TTL.conductors);
  return data;
}

export async function fetchStopHeatmap() {
  const cached = getCached<any[]>('stopHeatmap');
  if (cached) return cached;

  try {
    const res = await fetch(`${API_URL}/routes/stops/heatmap`);
    if (!res.ok) return [];
    const data = await res.json();
    setCache('stopHeatmap', data, 60_000);
    return data;
  } catch (err) {
    return [];
  }
}
