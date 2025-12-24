"use client";

import { useState, useEffect } from "react";
import {
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ExamTrendData = {
  title: string;
  rate: number;
};

export function ScoreDistributionChart({ data }: { data: ExamTrendData[] }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="h-80 w-full" />;
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground)/0.1)" />
          <XAxis 
            dataKey="title" 
            tickLine={false} 
            axisLine={false} 
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            dy={10}
            interval="preserveStartEnd"
          />
          <YAxis 
            tickLine={false} 
            axisLine={false}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} 
            dx={-10}
            unit="%"
            domain={[0, 100]}
          />
          <Tooltip 
            cursor={{ stroke: "hsl(var(--muted-foreground)/0.3)", strokeWidth: 1 }}
            contentStyle={{ 
              backgroundColor: "hsl(var(--card))", 
              borderColor: "hsl(var(--border))",
              borderRadius: "0.5rem",
              color: "hsl(var(--card-foreground))",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
              padding: "8px 12px",
            }}
            itemStyle={{ color: "hsl(var(--primary))", fontWeight: 500 }}
            labelStyle={{ color: "hsl(var(--muted-foreground))", marginBottom: "4px" }}
            formatter={(value: number) => [`${value}%`, "平均得分率"]}
          />
          <Line 
            type="monotone" 
            dataKey="rate" 
            stroke="hsl(var(--primary))" 
            strokeWidth={2}
            dot={{ fill: "hsl(var(--background))", stroke: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
