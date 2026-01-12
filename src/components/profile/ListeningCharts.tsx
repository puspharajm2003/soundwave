import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { Calendar, TrendingUp, Clock, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ListeningData {
  date: string;
  minutes: number;
  songs: number;
}

interface GenreData {
  name: string;
  value: number;
  color: string;
}

interface HourlyData {
  hour: string;
  plays: number;
}

// Generate mock weekly data
const generateWeeklyData = (): ListeningData[] => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map(day => ({
    date: day,
    minutes: Math.floor(Math.random() * 180) + 20,
    songs: Math.floor(Math.random() * 40) + 5,
  }));
};

// Generate mock monthly data
const generateMonthlyData = (): ListeningData[] => {
  const data: ListeningData[] = [];
  for (let i = 1; i <= 30; i++) {
    data.push({
      date: `Day ${i}`,
      minutes: Math.floor(Math.random() * 200) + 10,
      songs: Math.floor(Math.random() * 50) + 5,
    });
  }
  return data;
};

// Generate hourly listening pattern
const generateHourlyData = (): HourlyData[] => {
  const hours: HourlyData[] = [];
  for (let i = 0; i < 24; i++) {
    const hour = i < 12 ? `${i || 12}AM` : `${i === 12 ? 12 : i - 12}PM`;
    // More plays in evening hours
    const baseValue = i >= 18 && i <= 22 ? 40 : i >= 6 && i <= 9 ? 25 : 10;
    hours.push({
      hour,
      plays: Math.floor(Math.random() * 20) + baseValue,
    });
  }
  return hours;
};

// Genre distribution
const genreData: GenreData[] = [
  { name: "Electronic", value: 35, color: "hsl(var(--primary))" },
  { name: "Pop", value: 25, color: "hsl(var(--accent))" },
  { name: "Rock", value: 20, color: "#f97316" },
  { name: "Hip Hop", value: 12, color: "#8b5cf6" },
  { name: "Classical", value: 8, color: "#10b981" },
];

type TimeRange = "week" | "month";

export const ListeningCharts: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>("week");

  const listeningData = useMemo(() => {
    return timeRange === "week" ? generateWeeklyData() : generateMonthlyData();
  }, [timeRange]);

  const hourlyData = useMemo(() => generateHourlyData(), []);

  const totalMinutes = listeningData.reduce((acc, d) => acc + d.minutes, 0);
  const totalSongs = listeningData.reduce((acc, d) => acc + d.songs, 0);
  const avgDaily = Math.round(totalMinutes / listeningData.length);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-3 rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value} {entry.name === "minutes" ? "min" : ""}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Time Range Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-display font-bold">Listening Trends</h3>
        </div>
        <div className="flex gap-2">
          <Button
            variant={timeRange === "week" ? "default" : "glass"}
            size="sm"
            onClick={() => setTimeRange("week")}
          >
            Week
          </Button>
          <Button
            variant={timeRange === "month" ? "default" : "glass"}
            size="sm"
            onClick={() => setTimeRange("month")}
          >
            Month
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-4 rounded-xl text-center">
          <Clock className="w-5 h-5 mx-auto mb-2 text-primary" />
          <p className="text-2xl font-bold">{Math.floor(totalMinutes / 60)}h</p>
          <p className="text-xs text-muted-foreground">Total Time</p>
        </div>
        <div className="glass-card p-4 rounded-xl text-center">
          <Music className="w-5 h-5 mx-auto mb-2 text-accent" />
          <p className="text-2xl font-bold">{totalSongs}</p>
          <p className="text-xs text-muted-foreground">Songs Played</p>
        </div>
        <div className="glass-card p-4 rounded-xl text-center">
          <Calendar className="w-5 h-5 mx-auto mb-2 text-secondary" />
          <p className="text-2xl font-bold">{avgDaily}m</p>
          <p className="text-xs text-muted-foreground">Avg/Day</p>
        </div>
      </div>

      {/* Listening Time Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 rounded-2xl"
      >
        <h4 className="font-medium mb-4">Minutes Listened</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={listeningData}>
              <defs>
                <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="minutes"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorMinutes)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Genre Distribution Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 rounded-2xl"
        >
          <h4 className="font-medium mb-4">Genre Distribution</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genreData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {genreData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value}%`, 'Share']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {genreData.map((genre) => (
              <div key={genre.name} className="flex items-center gap-1.5 text-xs">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: genre.color }}
                />
                <span>{genre.name}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Hourly Listening Pattern */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 rounded-2xl"
        >
          <h4 className="font-medium mb-4">Listening Pattern</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData.filter((_, i) => i % 3 === 0)}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis 
                  dataKey="hour" 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="plays" 
                  fill="hsl(var(--accent))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Songs Played Line Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-6 rounded-2xl"
      >
        <h4 className="font-medium mb-4">Songs Played</h4>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={listeningData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="songs"
                stroke="hsl(var(--accent))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--accent))", strokeWidth: 2 }}
                activeDot={{ r: 6, fill: "hsl(var(--accent))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
};

export default ListeningCharts;
