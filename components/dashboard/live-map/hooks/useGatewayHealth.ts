import { useState, useEffect, useRef } from 'react';
import { Gateway, GatewayStatus } from '../types';
import { GATEWAY_DEFINITIONS, HISTORY_LEN } from '../constants';
import { useGatewaySimulation } from './useGatewaySimulation';

const API_BASE        = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const ADMIN_KEY       = import.meta.env.VITE_ADMIN_KEY || '';
const POLL_MS         = 30_000;
const STALE_CHECK_MS  = 5_000;   // how often we check for staleness
const STALE_AFTER_MS  = POLL_MS + 8_000; // consider dead if no success in this window

interface ApiGateway {
  id: string;
  provider: string;
  label: string;
  location: string;
  rtt: number;
  status: GatewayStatus;
  checkedAt: string;
}

interface ApiResponse {
  gateways: ApiGateway[];
  checkedAt: string;
}

// Map API response onto Gateway shape, preserving history from previous state
function mergeApiData(
  apiGateways: ApiGateway[],
  prev: Gateway[],
): Gateway[] {
  return GATEWAY_DEFINITIONS.map(def => {
    const api  = apiGateways.find(g => g.id === def.id);
    const last = prev.find(g => g.id === def.id);
    const rtt  = api?.rtt ?? last?.currentRtt ?? def.baseRtt;

    return {
      ...def,
      currentRtt: rtt,
      spiking:    false,
      history:    last
        ? [...last.history.slice(1), rtt]
        : Array.from({ length: HISTORY_LEN }, () => rtt),
    };
  });
}

async function fetchHealth(): Promise<ApiResponse> {
  const res = await fetch(`${API_BASE}/v1/admin/health/providers`, {
    headers: { 'X-Admin-Key': ADMIN_KEY },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<ApiResponse>;
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useGatewayHealth(): { gateways: Gateway[]; isLive: boolean } {
  const simulated        = useGatewaySimulation();           // always running as fallback
  const [live, setLive]  = useState<Gateway[] | null>(null);
  const [isLive, setIsLive] = useState(false);
  const prevRef          = useRef<Gateway[]>([]);
  const lastSuccessRef   = useRef<number | null>(null);

  // Main poll — fetches real data every 30s
  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      try {
        const data = await fetchHealth();
        if (cancelled) return;
        setLive(prev => {
          const merged = mergeApiData(data.gateways, prevRef.current);
          prevRef.current = merged;
          return merged;
        });
        lastSuccessRef.current = Date.now();
        setIsLive(true);
      } catch {
        // API unreachable — stale check will flip isLive shortly
      }
    };

    poll();
    const interval = setInterval(poll, POLL_MS);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  // Staleness watchdog — runs every 5s to flip isLive off quickly
  useEffect(() => {
    const check = () => {
      const last = lastSuccessRef.current;
      if (last !== null && Date.now() - last > STALE_AFTER_MS) {
        setIsLive(false);
      }
    };
    const id = setInterval(check, STALE_CHECK_MS);
    return () => clearInterval(id);
  }, []);

  return { gateways: live ?? simulated, isLive };
}
