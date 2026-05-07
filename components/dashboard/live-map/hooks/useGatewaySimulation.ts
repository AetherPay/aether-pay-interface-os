import { useState, useEffect, useRef } from 'react';
import { Gateway } from '../types';
import { GATEWAY_DEFINITIONS, HISTORY_LEN } from '../constants';

function initGateways(): Gateway[] {
  return GATEWAY_DEFINITIONS.map(def => ({
    ...def,
    currentRtt: def.baseRtt + Math.round((Math.random() - 0.5) * 20),
    history: Array.from({ length: HISTORY_LEN }, () =>
      def.baseRtt + Math.round((Math.random() - 0.5) * 30)
    ),
    spiking: false,
  }));
}

export function useGatewaySimulation(): Gateway[] {
  const [gateways, setGateways] = useState<Gateway[]>(initGateways);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setGateways(prev => prev.map(g => {
        const noise = Math.round((Math.random() - 0.5) * 18);
        const newRtt = g.spiking
          ? Math.max(g.baseRtt, g.currentRtt - 30)
          : Math.max(10, Math.min(600, g.baseRtt + noise));
        return { ...g, currentRtt: newRtt, history: [...g.history.slice(1), newRtt] };
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const scheduleSpike = (): ReturnType<typeof setTimeout> =>
      setTimeout(() => {
        setGateways(prev => {
          const idx = Math.floor(Math.random() * prev.length);
          return prev.map((g, i) =>
            i === idx ? { ...g, currentRtt: 420 + Math.round(Math.random() * 180), spiking: true } : g
          );
        });
        const recovery = setTimeout(
          () => setGateways(prev => prev.map(g => ({ ...g, spiking: false }))),
          6_000 + Math.random() * 6_000
        );
        timers.current.push(recovery, scheduleSpike());
      }, 20_000 + Math.random() * 40_000);

    timers.current.push(scheduleSpike());
    return () => timers.current.forEach(clearTimeout);
  }, []);

  return gateways;
}
