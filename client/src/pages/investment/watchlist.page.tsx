import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Trash2, ArrowUpRight, ArrowDownRight, Bell, Plus } from "lucide-react";
import { Link } from "wouter";
import SEO from "@/components/SEO";
import { useState } from "react";

// Mock Watchlist Data
const initialWatchlist = [
  { id: 1, symbol: "RELIANCE", name: "Reliance Industries", price: 2456.75, change: 12.50, changePercent: 0.51 },
  { id: 2, symbol: "TCS", name: "Tata Consultancy Services", price: 3450.20, change: -15.30, changePercent: -0.44 },
  { id: 3, symbol: "INFY", name: "Infosys Limited", price: 1420.50, change: 8.20, changePercent: 0.58 },
  { id: 4, symbol: "HDFCBANK", name: "HDFC Bank Ltd", price: 1650.00, change: 5.00, changePercent: 0.30 },
  { id: 5, symbol: "ICICIBANK", name: "ICICI Bank Ltd", price: 980.15, change: -2.40, changePercent: -0.24 },
];

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState(initialWatchlist);
  const [searchQuery, setSearchQuery] = useState("");

  const handleRemove = (id: number) => {
    setWatchlist(watchlist.filter(item => item.id !== id));
  };

  const filteredWatchlist = watchlist.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <SEO 
        title="My Watchlist - MyeCA"
        description="Track your favorite stocks and mutual funds in real-time."
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Watchlist</h1>
          <p className="text-slate-600">Track real-time prices of your favorite assets</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input 
              placeholder="Search watchlist..." 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Symbol
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stocks & ETFs</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Change</TableHead>
                <TableHead className="text-right">Change %</TableHead>
                <TableHead className="text-center">Alerts</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWatchlist.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    No stocks found in your watchlist.
                  </TableCell>
                </TableRow>
              ) : (
                filteredWatchlist.map((stock) => {
                  const isPositive = stock.change >= 0;
                  return (
                    <TableRow key={stock.id}>
                      <TableCell>
                        <Link href={`/investment/stocks/${stock.symbol}`} className="hover:underline">
                          <div className="font-semibold text-slate-900">{stock.symbol}</div>
                          <div className="text-xs text-slate-500">{stock.name}</div>
                        </Link>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        \u20B9{stock.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className={`text-right font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {isPositive ? '+' : ''}{stock.change.toFixed(2)}
                      </TableCell>
                      <TableCell className={`text-right font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        <div className="flex items-center justify-end gap-1">
                          {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {Math.abs(stock.changePercent).toFixed(2)}%
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600">
                          <Bell className="w-4 h-4" />
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleRemove(stock.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
