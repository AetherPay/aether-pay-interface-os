import { ProviderId } from './types';

export const PROVIDER_META: Record<ProviderId, { label: string; color: string }> = {
  stripe:  { label: 'Stripe',        color: '#6366f1' },
  mtn:     { label: 'MTN MoMo',      color: '#f59e0b' },
  orange:  { label: 'Orange Money',  color: '#f97316' },
  wave:    { label: 'Wave',          color: '#10b981' },
  usdc:    { label: 'USDC · Circle', color: '#3b82f6' },
};

export const STATUS_META = {
  UP:       { label: 'Nominal',  color: '#10b981' },
  DEGRADED: { label: 'Dégradé', color: '#f59e0b' },
  DOWN:     { label: 'Critique', color: '#ef4444' },
} as const;

export const RTT_THRESHOLDS = { GOOD: 300, WARN: 600 } as const;
export const HUB_NODE_ID = 'aetherpay-hub';
export const HUB_POSITION = { x: 360, y: 290 };
export const HISTORY_LEN = 24;

type GatewayDef = {
  id: string;
  provider: ProviderId;
  providerLabel: string;
  location: string;
  position: { x: number; y: number };
  baseRtt: number;
  uptime: number;
  successRate: number;
};

export const GATEWAY_DEFINITIONS: GatewayDef[] = [
  { id: 'stripe-eu',  provider: 'stripe', providerLabel: 'Stripe',        location: 'Paris · EU-West',      position: { x: 490, y: 20  }, baseRtt: 42,  uptime: 99.99, successRate: 99.8 },
  { id: 'stripe-us',  provider: 'stripe', providerLabel: 'Stripe',        location: 'New York · US-East',   position: { x: 60,  y: 20  }, baseRtt: 92,  uptime: 99.97, successRate: 99.7 },
  { id: 'usdc',       provider: 'usdc',   providerLabel: 'USDC · Circle', location: 'New York · US',        position: { x: 20,  y: 135 }, baseRtt: 80,  uptime: 99.9,  successRate: 99.5 },
  { id: 'wave-sn',    provider: 'wave',   providerLabel: 'Wave',          location: 'Dakar · Sénégal',      position: { x: 40,  y: 260 }, baseRtt: 86,  uptime: 99.6,  successRate: 99.2 },
  { id: 'orange-sn',  provider: 'orange', providerLabel: 'Orange Money',  location: 'Dakar · Sénégal',      position: { x: 20,  y: 372 }, baseRtt: 108, uptime: 99.4,  successRate: 98.8 },
  { id: 'mtn-sn',     provider: 'mtn',    providerLabel: 'MTN MoMo',      location: 'Dakar · Sénégal',      position: { x: 50,  y: 484 }, baseRtt: 142, uptime: 98.5,  successRate: 97.8 },
  { id: 'orange-ml',  provider: 'orange', providerLabel: 'Orange Money',  location: 'Bamako · Mali',        position: { x: 230, y: 100 }, baseRtt: 168, uptime: 98.2,  successRate: 97.5 },
  { id: 'mtn-gh',     provider: 'mtn',    providerLabel: 'MTN MoMo',      location: 'Accra · Ghana',        position: { x: 310, y: 510 }, baseRtt: 128, uptime: 99.1,  successRate: 98.2 },
  { id: 'wave-ci',    provider: 'wave',   providerLabel: 'Wave',          location: "Abidjan · Côte d'Iv",  position: { x: 150, y: 600 }, baseRtt: 112, uptime: 99.3,  successRate: 98.7 },
  { id: 'orange-ci',  provider: 'orange', providerLabel: 'Orange Money',  location: "Abidjan · Côte d'Iv",  position: { x: 370, y: 620 }, baseRtt: 122, uptime: 99.0,  successRate: 98.1 },
  { id: 'mtn-ci',     provider: 'mtn',    providerLabel: 'MTN MoMo',      location: "Abidjan · Côte d'Iv",  position: { x: 130, y: 710 }, baseRtt: 118, uptime: 99.2,  successRate: 98.5 },
  { id: 'mtn-cm',     provider: 'mtn',    providerLabel: 'MTN MoMo',      location: 'Douala · Cameroun',    position: { x: 660, y: 380 }, baseRtt: 158, uptime: 98.8,  successRate: 97.9 },
];
