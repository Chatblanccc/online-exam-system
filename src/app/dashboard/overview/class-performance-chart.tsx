"use client";

import { useState, useEffect } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";

type ClassData = {
  name: string;
  rate: number;
  count: number;
};

export function ClassPerformanceChart({ data }: { data: ClassData[] }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="h-80 w-full" />;
  }

  if (data.length === 0) {
    return (
      <div className="flex h-80 items-center justify-center text-muted-foreground text-sm">
        暂无班级数据分析
      </div>
    );
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--muted-foreground)/0.1)" />
          <XAxis 
            type="number"
            tickLine={false} 
            axisLine={false} 
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            unit="%"
            domain={[0, 100]}
          />
          <YAxis 
            dataKey="name"
            type="category"
            tickLine={false} 
            axisLine={false}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} 
            width={80}
          />
          <Tooltip 
            cursor={false}
            contentStyle={{ 
              backgroundColor: "white", 
              borderColor: "#e2e8f0",
              borderRadius: "0.5rem",
              color: "#0f172a",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
              padding: "8px 12px",
            }}
            formatter={(value: number) => [`${value}%`, "平均得分率"]}
          />
          <Bar 
            dataKey="rate" 
            fill="hsl(var(--primary))" 
            radius={[0, 4, 4, 0]}
            barSize={30}
          >
             {data.map((entry, index) => (
              <Cell key={`cell-${index}`} className="hover:opacity-80 transition-opacity" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

