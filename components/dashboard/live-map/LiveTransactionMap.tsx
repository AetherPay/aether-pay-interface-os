import React, { useState, useEffect, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  MiniMap,
  Controls,
  useNodesState,
  useEdgesState,
  type NodeTypes,
  type EdgeTypes,
  type Node,
  type Edge,
  type NodeMouseHandler,
  type OnNodesChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useGatewayHealth } from './hooks/useGatewayHealth';
import { useMapLayout } from './hooks/useMapLayout';
import GatewayNode from './nodes/GatewayNode';
import HubNode from './nodes/HubNode';
import LatencyEdge from './edges/LatencyEdge';
import KpiBar from './components/KpiBar';
import DetailPanel from './components/DetailPanel';
import { getStatus, getRttColor } from './utils';
import { HUB_NODE_ID, HUB_POSITION } from './constants';
import type { GatewayNodeData, HubNodeData, LatencyEdgeData, Gateway } from './types';

const NODE_TYPES: NodeTypes = { gateway: GatewayNode, hub: HubNode };
const EDGE_TYPES: EdgeTypes = { latency: LatencyEdge };

function buildHubNode(
  gateways: Gateway[],
  getPosition: (id: string, fallback: { x: number; y: number }) => { x: number; y: number } = (_, fb) => fb,
): Node<HubNodeData> {
  return {
    id: HUB_NODE_ID,
    type: 'hub',
    position: getPosition(HUB_NODE_ID, HUB_POSITION),
    data: {
      upCount:       gateways.filter(g => getStatus(g.currentRtt) === 'UP').length,
      degradedCount: gateways.filter(g => getStatus(g.currentRtt) === 'DEGRADED').length,
      downCount:     gateways.filter(g => getStatus(g.currentRtt) === 'DOWN').length,
      total:         gateways.length,
    },
  };
}

function buildGatewayNodes(
  gateways: Gateway[],
  selectedId: string | null,
  getPosition: (id: string, fallback: { x: number; y: number }) => { x: number; y: number },
): Node<GatewayNodeData>[] {
  return gateways.map(g => ({
    id: g.id,
    type: 'gateway',
    position: getPosition(g.id, g.position),
    data: { gateway: g, isSelected: selectedId === g.id },
  }));
}

function buildEdges(gateways: Gateway[]): Edge<LatencyEdgeData>[] {
  return gateways.map(g => {
    const status = getStatus(g.currentRtt);
    const color  = getRttColor(g.currentRtt);
    return {
      id: `edge-${g.id}`,
      source: g.id,
      target: HUB_NODE_ID,
      type: 'latency',
      data: { status, color },
      style: { stroke: color, strokeWidth: status === 'DOWN' ? 2 : 1.2, opacity: status === 'DOWN' ? 0.85 : 0.4 },
    };
  });
}

const LiveTransactionMap: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { gateways, isLive } = useGatewayHealth();
  const { getPosition, persistNodeMove } = useMapLayout();

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Wrap onNodesChange to persist drag-end positions
  const handleNodesChange: OnNodesChange = useCallback(changes => {
    persistNodeMove(changes.filter(c => c.type === 'position') as Parameters<typeof persistNodeMove>[0]);
    onNodesChange(changes);
  }, [onNodesChange, persistNodeMove]);

  useEffect(() => {
    setNodes([buildHubNode(gateways, getPosition), ...buildGatewayNodes(gateways, null, getPosition)]);
    setEdges(buildEdges(gateways));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setNodes(prev => prev.map(node => {
      if (node.type === 'hub') return { ...node, data: buildHubNode(gateways).data };
      if (node.type === 'gateway') {
        const gw = gateways.find(g => g.id === node.id);
        if (gw) return { ...node, data: { gateway: gw, isSelected: selectedId === node.id } };
      }
      return node;
    }));
    setEdges(prev => prev.map(edge => {
      const gw = gateways.find(g => g.id === edge.source);
      if (!gw) return edge;
      const status = getStatus(gw.currentRtt);
      const color  = getRttColor(gw.currentRtt);
      return { ...edge, data: { status, color }, style: { stroke: color, strokeWidth: status === 'DOWN' ? 2 : 1.2, opacity: status === 'DOWN' ? 0.85 : 0.4 } };
    }));
  }, [gateways, selectedId]);

  const handleNodeClick: NodeMouseHandler = useCallback((_, node) => {
    if (node.id === HUB_NODE_ID) return;
    setSelectedId(prev => prev === node.id ? null : node.id);
  }, []);

  const selectedGateway = gateways.find(g => g.id === selectedId) ?? null;

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
      <KpiBar gateways={gateways} isLive={isLive} />
      <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col lg:flex-row">
        <div className="flex-1 min-h-[580px]">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={NODE_TYPES}
            edgeTypes={EDGE_TYPES}
            onNodesChange={handleNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={handleNodeClick}
            fitView
            fitViewOptions={{ padding: 0.12 }}
            minZoom={0.3}
            maxZoom={2}
            proOptions={{ hideAttribution: true }}
          >
            <Background variant={BackgroundVariant.Dots} color="#1e293b" gap={24} size={1.5} />
            <MiniMap
              nodeColor={node => node.type === 'hub' ? '#6366f1' : '#334155'}
              style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, width: 110, height: 70 }}
              maskColor="rgba(15, 23, 42, 0.75)"
            />
            <Controls style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8 }} />
          </ReactFlow>
        </div>
        <div className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-slate-800 bg-black/20 flex flex-col">
          <DetailPanel gateway={selectedGateway} onClose={() => setSelectedId(null)} />
        </div>
      </div>
    </div>
  );
};

export default LiveTransactionMap;
