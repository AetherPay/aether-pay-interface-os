import { Node, Edge } from '@xyflow/react';

export type GatewayStatus = 'UP' | 'DEGRADED' | 'DOWN';
export type ProviderId = 'stripe' | 'mtn' | 'orange' | 'wave' | 'usdc';

export interface Gateway {
  id: string;
  provider: ProviderId;
  providerLabel: string;
  location: string;
  position: { x: number; y: number };
  baseRtt: number;
  currentRtt: number;
  uptime: number;
  successRate: number;
  history: number[];
  spiking: boolean;
}

export interface GatewayNodeData extends Record<string, unknown> {
  gateway: Gateway;
  isSelected: boolean;
}

export interface HubNodeData extends Record<string, unknown> {
  upCount: number;
  degradedCount: number;
  downCount: number;
  total: number;
}

export interface LatencyEdgeData extends Record<string, unknown> {
  status: GatewayStatus;
  color: string;
}

// React Flow v12 node/edge types (NodeProps<T> requires full Node<Data, Type>)
export type GatewayNodeType = Node<GatewayNodeData, 'gateway'>;
export type HubNodeType     = Node<HubNodeData,     'hub'>;
export type LatencyEdgeType = Edge<LatencyEdgeData, 'latency'>;
