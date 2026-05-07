import { useCallback } from 'react';
import type { NodePositionChange } from '@xyflow/react';

const STORAGE_KEY = 'aetherpay:live-map:positions';

type PositionMap = Record<string, { x: number; y: number }>;

function loadPositions(): PositionMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PositionMap) : {};
  } catch {
    return {};
  }
}

function savePositions(positions: PositionMap): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
  } catch {
    // localStorage unavailable — fail silently
  }
}

export function useMapLayout() {
  const savedPositions = loadPositions();

  const getPosition = useCallback(
    (id: string, fallback: { x: number; y: number }) =>
      savedPositions[id] ?? fallback,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const persistNodeMove = useCallback((changes: NodePositionChange[]) => {
    const current = loadPositions();
    let changed = false;
    changes.forEach(change => {
      if (change.type === 'position' && change.position && !change.dragging) {
        current[change.id] = change.position;
        changed = true;
      }
    });
    if (changed) savePositions(current);
  }, []);

  return { getPosition, persistNodeMove };
}
