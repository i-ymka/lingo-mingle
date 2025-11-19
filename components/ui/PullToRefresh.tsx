import React from 'react';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshIndicatorProps {
  pullDistance: number;
  isRefreshing: boolean;
  threshold: number;
}

const PullToRefreshIndicator: React.FC<PullToRefreshIndicatorProps> = ({
  pullDistance,
  isRefreshing,
  threshold,
}) => {
  const opacity = Math.min(pullDistance / threshold, 1);
  const rotation = (pullDistance / threshold) * 360;

  return (
    <div
      className="fixed top-0 left-0 right-0 flex justify-center items-center pointer-events-none z-50"
      style={{
        height: `${Math.min(pullDistance, threshold * 1.5)}px`,
        opacity: opacity,
        transition: pullDistance === 0 ? 'all 0.3s ease-out' : 'none',
      }}
    >
      <div className="bg-base-100/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
        <RefreshCw
          size={24}
          className={`text-primary ${isRefreshing ? 'animate-spin' : ''}`}
          style={{
            transform: isRefreshing ? 'none' : `rotate(${rotation}deg)`,
            transition: isRefreshing ? 'none' : 'transform 0.1s ease-out',
          }}
        />
      </div>
    </div>
  );
};

export default PullToRefreshIndicator;
