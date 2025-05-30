import React from 'react';
import { Card } from '@/components/ui/card';

interface StatsData {
  revenue?: string;
  revenueChange?: string;
  margin?: string;
  marginChange?: string;
  growth?: string;
  growthChange?: string;
  cashFlow?: string;
  cashFlowLabel?: string;
}

const StatsPanel = ({ stats }: { stats?: StatsData }) => {
  // Sample sparkline data
  const revenueSparkline = [10, 12, 8, 14, 15];
  const marginSparkline = [21, 22, 23, 25.6];
  const growthSparkline = [5, 8, 10, 12];
  const cashFlowSparkline = [3.2, 3.5, 3.8, 4.1];
  
  const renderSparkline = (data: number[], color: string = 'text-green-500') => {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min;
    
    return (
      <div className="flex items-end h-6 gap-[2px]">
        {data.map((value, index) => {
          const height = range === 0 ? '50%' : `${((value - min) / range) * 100}%`;
          return (
            <div 
              key={index} 
              className={`w-1 ${color}`} 
              style={{ 
                height, 
                minHeight: '2px',
                transition: 'height 0.3s ease'
              }}
            />
          );
        })}
      </div>
    );
  };

  return null;
};

export default StatsPanel;
