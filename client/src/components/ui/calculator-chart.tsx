import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { formatCurrency } from '@/lib/enhanced-calculator-utils';
import { FONT_SIZES } from '@/styles/fonts';

interface ChartProps {
  data: any[];
  type: 'line' | 'bar' | 'pie';
  title?: string;
  height?: number;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export function CalculatorChart({ data, type, title, height = 300 }: ChartProps) {
  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="year" 
              stroke="#6B7280"
              fontSize={FONT_SIZES.xs}
            />
            <YAxis 
              stroke="#6B7280"
              fontSize={FONT_SIZES.xs}
              tickFormatter={(value) => `\u20B9${(value / 100000).toFixed(1)}L`}
            />
            <Tooltip 
              formatter={(value: number, name: string) => [formatCurrency(value), name]}
              labelStyle={{ color: '#374151' }}
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #E5E7EB',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="investment" 
              stroke="#10B981" 
              strokeWidth={2}
              name="Total Investment"
              dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#3B82F6" 
              strokeWidth={2}
              name="Portfolio Value"
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        );

      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="year" 
              stroke="#6B7280"
              fontSize={FONT_SIZES.xs}
            />
            <YAxis 
              stroke="#6B7280"
              fontSize={FONT_SIZES.xs}
              tickFormatter={(value) => `\u20B9${(value / 100000).toFixed(1)}L`}
            />
            <Tooltip 
              formatter={(value: number, name: string) => [formatCurrency(value), name]}
              labelStyle={{ color: '#374151' }}
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #E5E7EB',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Bar 
              dataKey="investment" 
              fill="#10B981" 
              name="Investment" 
              radius={[2, 2, 0, 0]}
            />
            <Bar 
              dataKey="interestEarned" 
              fill="#3B82F6" 
              name="Interest Earned" 
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value, percent }) => 
                `${name}: ${formatCurrency(value)} (${(percent * 100).toFixed(1)}%)`
              }
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => formatCurrency(value)}
            />
          </PieChart>
        );

      default:
        return <div>Unsupported chart type</div>;
    }
  };

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
}

// Specific chart components for different calculators
export function SIPGrowthChart({ data }: { data: any[] }) {
  return (
    <CalculatorChart
      data={data}
      type="line"
      title="SIP Growth Over Time"
      height={350}
    />
  );
}

export function PPFBreakdownChart({ data }: { data: any[] }) {
  return (
    <CalculatorChart
      data={data}
      type="bar"
      title="PPF Investment vs Interest Breakdown"
      height={350}
    />
  );
}

export function InvestmentAllocationChart({ data }: { data: any[] }) {
  return (
    <CalculatorChart
      data={data}
      type="pie"
      title="Investment Allocation"
      height={400}
    />
  );
}
