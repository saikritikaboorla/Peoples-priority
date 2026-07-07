'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';

interface ThemeChartProps {
  data: { name: string; count: number }[];
}

export function ThemeChart({ data }: ThemeChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
        <XAxis type="number" />
        <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
        <Tooltip />
        <Bar dataKey="count" fill="#1e40af" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

interface TimelineChartProps {
  data: { date: string; count: number }[];
}

export function TimelineChart({ data }: TimelineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Line type="monotone" dataKey="count" stroke="#1e40af" strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

interface DistrictChartProps {
  data: { districtName: string; totalFeedback: number }[];
}

export function DistrictChart({ data }: DistrictChartProps) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <XAxis dataKey="districtName" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Bar dataKey="totalFeedback" fill="#f59e0b" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
