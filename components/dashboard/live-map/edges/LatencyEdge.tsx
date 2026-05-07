import React from 'react';
import { BaseEdge, EdgeProps, getBezierPath } from '@xyflow/react';
import { LatencyEdgeType } from '../types';

const LatencyEdge: React.FC<EdgeProps<LatencyEdgeType>> = ({
  id, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition,
  data, style,
}) => {
  const [edgePath] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
  const color  = data?.color ?? '#475569';
  const status = data?.status ?? 'UP';
  return (
    <>
      <BaseEdge id={id} path={edgePath} style={style} />
      {status !== 'UP' && (
        <circle r="3.5" fill={color} opacity="0.9">
          <animateMotion dur={status === 'DOWN' ? '1s' : '1.8s'} repeatCount="indefinite" path={edgePath} />
        </circle>
      )}
    </>
  );
};

export default LatencyEdge;
