import { GatewayStatus } from './types';
import { RTT_THRESHOLDS } from './constants';

export const getStatus = (rtt: number): GatewayStatus =>
  rtt < RTT_THRESHOLDS.GOOD ? 'UP' : rtt < RTT_THRESHOLDS.WARN ? 'DEGRADED' : 'DOWN';

export const getRttColor = (rtt: number): string =>
  rtt < RTT_THRESHOLDS.GOOD ? '#10b981' : rtt < RTT_THRESHOLDS.WARN ? '#f59e0b' : '#ef4444';
