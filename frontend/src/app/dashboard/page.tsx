'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Navbar } from '@/components/HomeSections';
import { ThemeChart, TimelineChart, DistrictChart } from '@/components/Charts';
import { api, DashboardOverview, HeatmapPoint, Constituency } from '@/lib/api';
import {
  MessageSquare, AlertTriangle, TrendingUp, MapPin,
  RefreshCw, Loader2, Sparkles,
} from 'lucide-react';

const DemandMap = dynamic(() => import('@/components/DemandMap'), { ssr: false });

const SENTIMENT_COLORS: Record<string, string> = {
  URGENT: 'bg-red-100 text-red-700',
  NEGATIVE: 'bg-orange-100 text-orange-700',
  NEUTRAL: 'bg-slate-100 text-slate-700',
  POSITIVE: 'bg-green-100 text-green-700',
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [heatmap, setHeatmap] = useState<HeatmapPoint[]>([]);
  const [constituencies, setConstituencies] = useState<Constituency[]>([]);
  const [constituencyId, setConstituencyId] = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const loadData = async (cId?: string) => {
    setLoading(true);
    try {
      const [overview, heat, constituencies] = await Promise.all([
        api.getDashboard(cId),
        api.getHeatmap(cId),
        api.getConstituencies(),
      ]);
      setData(overview);
      setHeatmap(heat);
      setConstituencies(constituencies);
      if (!cId && constituencies.length > 0) {
        setConstituencyId(constituencies[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(constituencyId || undefined);
  }, [constituencyId]);

  const handleGenerate = async () => {
    if (!constituencyId) return;
    setGenerating(true);
    try {
      await api.generateRecommendations(constituencyId);
      await loadData(constituencyId);
    } finally {
      setGenerating(false);
    }
  };

  if (loading && !data) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-blue-700" />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">MP Dashboard</h1>
            <p className="text-slate-600">Evidence-based development planning insights</p>
          </div>
          <div className="flex gap-3">
            <select
              value={constituencyId}
              onChange={(e) => setConstituencyId(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
            >
              {constituencies.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <button onClick={handleGenerate} disabled={generating} className="btn-primary flex items-center gap-2 text-sm">
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Regenerate Recommendations
            </button>
          </div>
        </div>

        {data?.aiSummary && (
          <div className="card mb-6 bg-blue-50 border-blue-200 flex gap-3">
            <Sparkles className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900 mb-1">AI Summary</p>
              <p className="text-blue-800 text-sm">{data.aiSummary}</p>
            </div>
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={MessageSquare} label="Total Submissions" value={data?.totalSubmissions ?? 0} color="blue" />
          <StatCard icon={AlertTriangle} label="Active Issues" value={data?.activeIssues ?? 0} color="red" />
          <StatCard icon={TrendingUp} label="Trending Topics" value={data?.trendingTopics?.length ?? 0} color="amber" />
          <StatCard icon={MapPin} label="Top Hotspot" value={data?.topHotspot?.districtName ?? '—'} color="green" isText />
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <h2 className="font-semibold text-lg mb-4">Trending Development Topics</h2>
            <ThemeChart data={(data?.trendingTopics ?? []).map((t) => ({ name: t.name, count: t.count }))} />
          </div>
          <div className="card">
            <h2 className="font-semibold text-lg mb-4">Demand by District</h2>
            <DistrictChart data={data?.districtDemand ?? []} />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 card">
            <h2 className="font-semibold text-lg mb-4">Geographic Demand Heatmap</h2>
            <DemandMap points={heatmap} />
          </div>
          <div className="card">
            <h2 className="font-semibold text-lg mb-4">Submissions Over Time</h2>
            <TimelineChart data={data?.timeline ?? []} />
          </div>
        </div>

        <div className="card mb-8">
          <h2 className="font-semibold text-lg mb-4">Recommended Projects (Priority Ranking)</h2>
          {data?.recommendations?.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-500">
                    <th className="pb-3 pr-4">Rank</th>
                    <th className="pb-3 pr-4">Project</th>
                    <th className="pb-3 pr-4">Demand</th>
                    <th className="pb-3 pr-4">Impact</th>
                    <th className="pb-3 pr-4">Cost</th>
                    <th className="pb-3 pr-4">Requests</th>
                    <th className="pb-3">Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recommendations.map((r) => (
                    <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 pr-4 font-bold text-blue-700">#{r.rank}</td>
                      <td className="py-3 pr-4">
                        <div className="font-medium">{r.title}</div>
                        <div className="text-xs text-slate-500">{r.description}</div>
                      </td>
                      <td className="py-3 pr-4">{r.demandScore}</td>
                      <td className="py-3 pr-4">{r.impactScore}</td>
                      <td className="py-3 pr-4">{r.estimatedCost}</td>
                      <td className="py-3 pr-4">{r.citizenRequestCount}</td>
                      <td className="py-3">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${
                          r.priorityScore >= 80 ? 'bg-green-100 text-green-700' :
                          r.priorityScore >= 60 ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {r.priorityScore}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-slate-500 text-center py-8">
              No recommendations yet. Click &quot;Regenerate Recommendations&quot; to compute priorities.
            </p>
          )}
        </div>

        <div className="card">
          <h2 className="font-semibold text-lg mb-4">Recent Feedback</h2>
          <div className="space-y-3">
            {(data?.recentFeedback ?? []).map((f) => (
              <div key={f.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                <div className="flex-1">
                  <p className="text-sm">{f.processedContent || f.rawContent}</p>
                  <div className="flex flex-wrap gap-2 mt-2 text-xs">
                    {f.theme && <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{f.theme.name}</span>}
                    {f.sentiment && (
                      <span className={`px-2 py-0.5 rounded ${SENTIMENT_COLORS[f.sentiment] || 'bg-slate-100'}`}>
                        {f.sentiment}
                      </span>
                    )}
                    {f.district && <span className="text-slate-500">{f.district.name}</span>}
                    <span className="text-slate-400">{new Date(f.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function StatCard({
  icon: Icon, label, value, color, isText,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  color: string;
  isText?: boolean;
}) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-700',
    red: 'bg-red-100 text-red-700',
    amber: 'bg-amber-100 text-amber-700',
    green: 'bg-green-100 text-green-700',
  };
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colors[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="stat-label">{label}</p>
        <p className={isText ? 'text-lg font-bold' : 'stat-value'}>{value}</p>
      </div>
    </div>
  );
}
