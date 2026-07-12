'use client';

import { ResponsiveContainer, type ResponsiveContainerProps } from 'recharts';

interface ChartContainerProps {
  children: React.ReactElement;
  height?: number;
  className?: string;
}

export function ChartContainer({ children, height = 300, className }: ChartContainerProps) {
  return (
    <div className={className} style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}
