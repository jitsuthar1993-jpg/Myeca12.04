import React from "react";

type Datum = Record<string, string | number | null | undefined>;
type ChartChild = React.ReactElement<Record<string, unknown>>;
export type ChartPayloadItem = {
  color?: string;
  dataKey?: string | number;
  name?: string | number;
  value?: string | number;
  payload: Record<string, string | number | null | undefined>;
};
export type TooltipProps = {
  active?: boolean;
  payload?: ChartPayloadItem[];
  label?: React.ReactNode;
  labelClassName?: string;
  labelFormatter?: (...args: any[]) => React.ReactNode;
  formatter?: (...args: any[]) => React.ReactNode;
  color?: string;
  [key: string]: unknown;
};
export type LegendProps = {
  payload?: Array<{
    color?: string;
    dataKey?: string | number;
    value?: string | number;
  }>;
  verticalAlign?: "top" | "bottom" | "middle";
  [key: string]: unknown;
};

const CHART_WIDTH = 640;
const CHART_HEIGHT = 320;
const MARGIN = { top: 26, right: 28, bottom: 44, left: 54 };
const DEFAULT_COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

function numericValue(value: unknown) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function childKind(child: React.ReactNode) {
  if (!React.isValidElement(child)) return "";
  const type = child.type as { displayName?: string; name?: string };
  return type.displayName || type.name || "";
}

function getChildrenByKind(children: React.ReactNode, kind: string) {
  return React.Children.toArray(children).filter(
    (child): child is ChartChild => React.isValidElement(child) && childKind(child) === kind,
  );
}

function formatLabel(value: unknown) {
  if (typeof value === "number") {
    return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value);
  }
  return String(value ?? "");
}

function getPointPath(points: Array<{ x: number; y: number }>) {
  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
}

function getAreaPath(points: Array<{ x: number; y: number }>, baseline: number) {
  if (points.length === 0) return "";
  return `${getPointPath(points)} L ${points[points.length - 1].x} ${baseline} L ${points[0].x} ${baseline} Z`;
}

function getArcPath(cx: number, cy: number, radius: number, startAngle: number, endAngle: number) {
  const start = {
    x: cx + radius * Math.cos(startAngle),
    y: cy + radius * Math.sin(startAngle),
  };
  const end = {
    x: cx + radius * Math.cos(endAngle),
    y: cy + radius * Math.sin(endAngle),
  };
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
}

function chartFrame(
  children: React.ReactNode,
  options: { label?: string; height?: number; className?: string } = {},
) {
  return (
    <svg
      viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
      role="img"
      aria-label={options.label || "Chart"}
      className={options.className}
      style={{ width: "100%", height: options.height || "100%", display: "block" }}
      preserveAspectRatio="none"
    >
      {children}
    </svg>
  );
}

function renderAxes(data: Datum[], xKey: string, yMax: number) {
  const plotWidth = CHART_WIDTH - MARGIN.left - MARGIN.right;
  const plotHeight = CHART_HEIGHT - MARGIN.top - MARGIN.bottom;
  const ticks = [0, 0.25, 0.5, 0.75, 1];
  const xStep = data.length > 1 ? plotWidth / (data.length - 1) : plotWidth;
  const xLabels = data.length > 8 ? data.filter((_, index) => index % Math.ceil(data.length / 6) === 0) : data;

  return (
    <g>
      {ticks.map((tick) => {
        const y = MARGIN.top + plotHeight - tick * plotHeight;
        return (
          <g key={tick}>
            <line x1={MARGIN.left} x2={CHART_WIDTH - MARGIN.right} y1={y} y2={y} stroke="#e5e7eb" strokeDasharray="4 4" />
            <text x={MARGIN.left - 12} y={y + 4} textAnchor="end" fontSize="11" fill="#64748b">
              {formatLabel(Math.round(yMax * tick))}
            </text>
          </g>
        );
      })}
      <line x1={MARGIN.left} x2={MARGIN.left} y1={MARGIN.top} y2={CHART_HEIGHT - MARGIN.bottom} stroke="#cbd5e1" />
      <line x1={MARGIN.left} x2={CHART_WIDTH - MARGIN.right} y1={CHART_HEIGHT - MARGIN.bottom} y2={CHART_HEIGHT - MARGIN.bottom} stroke="#cbd5e1" />
      {xLabels.map((item, index) => {
        const originalIndex = data.indexOf(item);
        const x = MARGIN.left + (data.length > 1 ? originalIndex * xStep : plotWidth / 2);
        return (
          <text key={`${String(item[xKey])}-${index}`} x={x} y={CHART_HEIGHT - 18} textAnchor="middle" fontSize="11" fill="#64748b">
            {String(item[xKey] ?? "")}
          </text>
        );
      })}
    </g>
  );
}

function renderLegend(series: ChartChild[]) {
  return (
    <g>
      {series.map((child, index) => {
        const label = String(child.props.name || child.props.dataKey || `Series ${index + 1}`);
        const color = String(child.props.stroke || child.props.fill || DEFAULT_COLORS[index % DEFAULT_COLORS.length]);
        const x = MARGIN.left + index * 126;
        return (
          <g key={label} transform={`translate(${x} 14)`}>
            <rect width="10" height="10" rx="2" fill={color} />
            <text x="16" y="10" fontSize="12" fill="#475569">
              {label}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function CartesianChart({
  data = [],
  children,
  type,
  className,
}: {
  data?: Datum[];
  children?: React.ReactNode;
  type: "line" | "area" | "bar";
  className?: string;
}) {
  const lineSeries = getChildrenByKind(children, "Line");
  const areaSeries = getChildrenByKind(children, "Area");
  const barSeries = getChildrenByKind(children, "Bar");
  const series = type === "bar" ? barSeries : type === "area" ? areaSeries : lineSeries;
  const xAxis = getChildrenByKind(children, "XAxis")[0];
  const xKey = String(xAxis?.props.dataKey || "name");
  const keys = series.map((child) => String(child.props.dataKey || "value"));
  const yMax = Math.max(1, ...data.flatMap((item) => keys.map((key) => numericValue(item[key]))));
  const plotWidth = CHART_WIDTH - MARGIN.left - MARGIN.right;
  const plotHeight = CHART_HEIGHT - MARGIN.top - MARGIN.bottom;
  const baseline = CHART_HEIGHT - MARGIN.bottom;
  const xStep = data.length > 1 ? plotWidth / (data.length - 1) : plotWidth;
  const barSlot = data.length > 0 ? plotWidth / data.length : plotWidth;
  const barWidth = Math.max(8, Math.min(36, (barSlot / Math.max(1, series.length)) * 0.65));

  return chartFrame(
    <>
      {renderAxes(data, xKey, yMax)}
      {type !== "bar" &&
        series.map((child, seriesIndex) => {
          const key = String(child.props.dataKey || "value");
          const color = String(child.props.stroke || child.props.fill || DEFAULT_COLORS[seriesIndex % DEFAULT_COLORS.length]);
          const points = data.map((item, index) => ({
            x: MARGIN.left + (data.length > 1 ? index * xStep : plotWidth / 2),
            y: baseline - (numericValue(item[key]) / yMax) * plotHeight,
          }));

          return (
            <g key={key}>
              {type === "area" && <path d={getAreaPath(points, baseline)} fill={color} opacity="0.18" />}
              <path d={getPointPath(points)} fill="none" stroke={color} strokeWidth={String(child.props.strokeWidth || 2.5)} strokeLinecap="round" strokeLinejoin="round" />
              {points.map((point, index) => (
                <circle key={`${key}-${index}`} cx={point.x} cy={point.y} r="3" fill="#fff" stroke={color} strokeWidth="2" />
              ))}
            </g>
          );
        })}
      {type === "bar" &&
        data.map((item, itemIndex) => {
          const center = MARGIN.left + itemIndex * barSlot + barSlot / 2;
          return (
            <g key={`${String(item[xKey])}-${itemIndex}`}>
              {series.map((child, seriesIndex) => {
                const key = String(child.props.dataKey || "value");
                const color = String(child.props.fill || child.props.stroke || DEFAULT_COLORS[seriesIndex % DEFAULT_COLORS.length]);
                const value = numericValue(item[key]);
                const height = (value / yMax) * plotHeight;
                const x = center - (series.length * barWidth) / 2 + seriesIndex * barWidth;
                return <rect key={key} x={x} y={baseline - height} width={barWidth - 2} height={height} rx="4" fill={color} />;
              })}
            </g>
          );
        })}
      {getChildrenByKind(children, "Legend").length > 0 && renderLegend(series)}
    </>,
    { className },
  );
}

function PieChartBase({ children, className }: { children?: React.ReactNode; className?: string }) {
  const pie = getChildrenByKind(children, "Pie")[0];
  const cells = getChildrenByKind(pie?.props.children as React.ReactNode, "Cell");
  const data = (pie?.props.data as Datum[]) || [];
  const dataKey = String(pie?.props.dataKey || "value");
  const nameKey = String(pie?.props.nameKey || "name");
  const total = Math.max(1, data.reduce((sum, item) => sum + numericValue(item[dataKey]), 0));
  const radius = 96;
  let cursor = -Math.PI / 2;

  return chartFrame(
    <>
      {data.map((item, index) => {
        const value = numericValue(item[dataKey]);
        const next = cursor + (value / total) * Math.PI * 2;
        const color = String(cells[index]?.props.fill || (item.color as string) || DEFAULT_COLORS[index % DEFAULT_COLORS.length]);
        const path = getArcPath(220, 158, radius, cursor, next);
        cursor = next;
        return <path key={`${String(item[nameKey])}-${index}`} d={path} fill={color} stroke="#fff" strokeWidth="2" />;
      })}
      <circle cx="220" cy="158" r="46" fill="#fff" />
      {data.slice(0, 6).map((item, index) => {
        const color = String(cells[index]?.props.fill || (item.color as string) || DEFAULT_COLORS[index % DEFAULT_COLORS.length]);
        return (
          <g key={`${String(item[nameKey])}-legend`} transform={`translate(370 ${72 + index * 28})`}>
            <rect width="10" height="10" rx="2" fill={color} />
            <text x="18" y="10" fontSize="12" fill="#475569">
              {String(item[nameKey] ?? `Item ${index + 1}`)} ({formatLabel(item[dataKey])})
            </text>
          </g>
        );
      })}
    </>,
    { className },
  );
}

export function ResponsiveContainer({
  children,
  height = 300,
  className,
}: {
  children?: React.ReactNode;
  width?: number | string;
  height?: number | string;
  className?: string;
}) {
  return (
    <div className={className} style={{ width: "100%", height }}>
      {children}
    </div>
  );
}

export function LineChart(props: Record<string, unknown>) {
  return <CartesianChart {...props} type="line" />;
}
LineChart.displayName = "LineChart";

export function AreaChart(props: Record<string, unknown>) {
  return <CartesianChart {...props} type="area" />;
}
AreaChart.displayName = "AreaChart";

export function BarChart(props: Record<string, unknown>) {
  return <CartesianChart {...props} type="bar" />;
}
BarChart.displayName = "BarChart";

export function PieChart(props: Record<string, unknown>) {
  return <PieChartBase {...props} />;
}
PieChart.displayName = "PieChart";

export function Line(_: Record<string, unknown>) {
  return null;
}
Line.displayName = "Line";

export function Area(_: Record<string, unknown>) {
  return null;
}
Area.displayName = "Area";

export function Bar(_: Record<string, unknown>) {
  return null;
}
Bar.displayName = "Bar";

export function Pie(_: Record<string, unknown>) {
  return null;
}
Pie.displayName = "Pie";

export function Cell(_: Record<string, unknown>) {
  return null;
}
Cell.displayName = "Cell";

export function XAxis(_: Record<string, unknown>) {
  return null;
}
XAxis.displayName = "XAxis";

export function YAxis(_: Record<string, unknown>) {
  return null;
}
YAxis.displayName = "YAxis";

export function CartesianGrid(_: Record<string, unknown>) {
  return null;
}
CartesianGrid.displayName = "CartesianGrid";

export function Tooltip(_: TooltipProps) {
  return null;
}
Tooltip.displayName = "Tooltip";

export function Legend(_: LegendProps) {
  return null;
}
Legend.displayName = "Legend";
