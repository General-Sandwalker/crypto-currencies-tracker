import { useId } from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface SparklineProps {
  data: number[];
  positive: boolean;
  height?: number;
}

export default function Sparkline({ data, positive, height = 56 }: SparklineProps) {
  const uid = useId();

  if (!data || data.length === 0) return null;

  const chartData = data
    .filter((_, i) => i % Math.max(1, Math.floor(data.length / 40)) === 0)
    .map((price, i) => ({ i, price }));

  const color = positive ? '#10b981' : '#f43f5e';
  // Stable per-instance ID — no Math.random() in the render path
  const gradId = `spark-${uid.replace(/:/g, '')}`;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="price"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#${gradId})`}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
