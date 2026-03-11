import { useParams } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUpRight, ArrowDownRight, Bell, Star, TrendingUp, DollarSign, Activity, FileText } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar
} from "recharts";
import { FONT_SIZES } from "@/styles/fonts";
import SEO from "@/components/SEO";
import { useState } from "react";

// Mock Data Generators
const generateChartData = (days = 30) => {
  const data = [];
  let value = 1500;
  for (let i = 0; i < days; i++) {
    value = value + (Math.random() - 0.5) * 50;
    data.push({
      date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      price: Math.round(value)
    });
  }
  return data;
};

const stockData = {
  RELIANCE: {
    name: "Reliance Industries Ltd.",
    price: 2456.75,
    change: 12.50,
    changePercent: 0.51,
    sector: "Energy",
    marketCap: "16.5T",
    pe: 24.5,
    dividend: "0.3%"
  },
  TCS: {
    name: "Tata Consultancy Services",
    price: 3450.20,
    change: -15.30,
    changePercent: -0.44,
    sector: "Technology",
    marketCap: "12.8T",
    pe: 28.2,
    dividend: "1.2%"
  },
  INFY: {
    name: "Infosys Limited",
    price: 1420.50,
    change: 8.20,
    changePercent: 0.58,
    sector: "Technology",
    marketCap: "5.9T",
    pe: 22.1,
    dividend: "2.1%"
  }
};

export default function StockDetailsPage() {
  const params = useParams();
  const symbol = (params.symbol || 'RELIANCE').toUpperCase();
  const [timeframe, setTimeframe] = useState('1M');
  
  // Fallback for unknown symbols
  const stock = stockData[symbol as keyof typeof stockData] || {
    name: symbol,
    price: 1000 + Math.random() * 2000,
    change: (Math.random() - 0.5) * 50,
    changePercent: (Math.random() - 0.5) * 2,
    sector: "Unknown",
    marketCap: "--",
    pe: "--",
    dividend: "--"
  };

  const isPositive = stock.change >= 0;
  const chartData = generateChartData(timeframe === '1W' ? 7 : timeframe === '1M' ? 30 : timeframe === '1Y' ? 365 : 30);

  return (
    <div className="container mx-auto px-4 py-8">
      <SEO 
        title={`${stock.name} (${symbol}) Stock Price & Analysis - MyeCA`}
        description={`Get real-time stock price, charts, and analysis for ${stock.name}.`}
      />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold text-slate-900">{stock.name}</h1>
            <Badge variant="outline" className="text-slate-600 border-slate-300">{symbol}</Badge>
            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none">{stock.sector}</Badge>
          </div>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-bold text-slate-900">\u20B9{stock.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            <div className={`flex items-center mb-1.5 font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? <ArrowUpRight className="w-5 h-5 mr-1" /> : <ArrowDownRight className="w-5 h-5 mr-1" />}
              {isPositive ? '+' : ''}{stock.change.toFixed(2)} ({isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%)
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Bell className="w-4 h-4 mr-2" />
            Set Alert
          </Button>
          <Button>
            <Star className="w-4 h-4 mr-2" />
            Add to Watchlist
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Section */}
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
              <CardTitle className="text-base font-medium">Price Chart</CardTitle>
              <Tabs defaultValue="1M" onValueChange={setTimeframe} className="w-auto">
                <TabsList className="grid w-full grid-cols-4 h-8">
                  <TabsTrigger value="1W" className="text-xs">1W</TabsTrigger>
                  <TabsTrigger value="1M" className="text-xs">1M</TabsTrigger>
                  <TabsTrigger value="1Y" className="text-xs">1Y</TabsTrigger>
                  <TabsTrigger value="5Y" className="text-xs">5Y</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={isPositive ? "#16a34a" : "#dc2626"} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={isPositive ? "#16a34a" : "#dc2626"} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: FONT_SIZES.xs }}
                      minTickGap={30}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: FONT_SIZES.xs }}
                      domain={['auto', 'auto']}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: number) => [`\u20B9${value.toLocaleString()}`, 'Price']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="price" 
                      stroke={isPositive ? "#16a34a" : "#dc2626"} 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorPrice)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Fundamentals */}
          <Card>
            <CardHeader>
              <CardTitle>Fundamentals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Market Cap</p>
                  <p className="font-semibold text-slate-900">{stock.marketCap}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">P/E Ratio</p>
                  <p className="font-semibold text-slate-900">{stock.pe}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Dividend Yield</p>
                  <p className="font-semibold text-slate-900">{stock.dividend}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">52W High</p>
                  <p className="font-semibold text-slate-900">\u20B9{(stock.price * 1.2).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">52W Low</p>
                  <p className="font-semibold text-slate-900">\u20B9{(stock.price * 0.8).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Book Value</p>
                  <p className="font-semibold text-slate-900">\u20B9{(stock.price * 0.4).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">ROE</p>
                  <p className="font-semibold text-slate-900">18.5%</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Face Value</p>
                  <p className="font-semibold text-slate-900">\u20B910.00</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Performance Score */}
          <Card>
            <CardHeader>
              <CardTitle>Technical Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-4">
                <div className="relative w-32 h-32 flex items-center justify-center rounded-full border-8 border-slate-100">
                  <div className={`absolute inset-0 rounded-full border-8 ${isPositive ? 'border-t-green-500 border-r-green-500' : 'border-t-red-500 border-l-red-500'} transform -rotate-45`}></div>
                  <div className="text-center">
                    <span className={`text-3xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {isPositive ? 'Buy' : 'Sell'}
                    </span>
                  </div>
                </div>
                <div className="mt-6 w-full space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">RSI (14)</span>
                    <span className="font-medium text-slate-900">62.5 (Neutral)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">MACD</span>
                    <span className="font-medium text-green-600">Bullish Crossover</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Latest News */}
          <Card>
            <CardHeader>
              <CardTitle>Latest News</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="group cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-slate-100 rounded text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-slate-900 group-hover:text-blue-700 leading-snug">
                          {stock.name} announces quarterly results, beats estimates by 15%
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">2 hours ago • Financial Times</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="ghost" className="w-full mt-4 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                View All News
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
