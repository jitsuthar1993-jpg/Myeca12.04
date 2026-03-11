// Simple Chart Component Wrapper

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { FONT_SIZES } from '@/styles/fonts';

interface ChartProps {
  title: string;
  data: { name: string; value: number }[];
  type?: 'line' | 'area' | 'bar';
  height?: number;
}

export function Chart({ title, data, type = 'line', height = 300 }: ChartProps) {
  const chartContent = (
    <ResponsiveContainer width="100%" height={height}>
      {type === 'line' && (
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" stroke="#666" fontSize={FONT_SIZES.xs} />
          <YAxis stroke="#666" fontSize={FONT_SIZES.xs} />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
        </LineChart>
      )}
      {type === 'area' && (
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" stroke="#666" fontSize={FONT_SIZES.xs} />
          <YAxis stroke="#666" fontSize={FONT_SIZES.xs} />
          <Tooltip />
          <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
        </AreaChart>
      )}
      {type === 'bar' && (
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" stroke="#666" fontSize={FONT_SIZES.xs} />
          <YAxis stroke="#666" fontSize={FONT_SIZES.xs} />
          <Tooltip />
          <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      )}
    </ResponsiveContainer>
  );

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{chartContent}</CardContent>
    </Card>
  );
}

