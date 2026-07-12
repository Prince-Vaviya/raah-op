export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000/ws';

export async function fetchTelemetry() {
  const res = await fetch(`${API_URL}/telemetry`);
  if (!res.ok) throw new Error('Failed to fetch telemetry');
  return res.json();
}

export async function fetchAlerts() {
  const res = await fetch(`${API_URL}/alerts`);
  if (!res.ok) throw new Error('Failed to fetch alerts');
  return res.json();
}

export async function fetchAnalytics() {
  const res = await fetch(`${API_URL}/analytics/daily`);
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return res.json();
}

export async function fetchRoutes() {
  const res = await fetch(`${API_URL}/routes`);
  if (!res.ok) throw new Error('Failed to fetch routes');
  return res.json();
}

export async function fetchRouteDetails(id: string) {
  const res = await fetch(`${API_URL}/routes/${id}`);
  if (!res.ok) throw new Error('Failed to fetch route details');
  return res.json();
}

export async function fetchRoutesGeoJSON() {
  const res = await fetch(`${API_URL}/routes/geojson`);
  if (!res.ok) throw new Error('Failed to fetch routes geojson');
  return res.json();
}

export async function fetchLiveTelemetryGeoJSON() {
  const res = await fetch(`${API_URL}/telemetry/geojson`);
  if (!res.ok) throw new Error('Failed to fetch telemetry geojson');
  return res.json();
}

export async function fetchAllStopsGeoJSON() {
  const res = await fetch(`${API_URL}/routes/stops/geojson`);
  if (!res.ok) throw new Error('Failed to fetch stops geojson');
  return res.json();
}
