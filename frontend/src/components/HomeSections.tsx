'use client';

import Link from 'next/link';
import { MessageSquarePlus, LayoutDashboard, MapPin, Users } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-blue-700 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg text-slate-900">Peoples Priority</span>
              <span className="hidden sm:block text-xs text-slate-500">Citizen Feedback Platform</span>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/submit" className="btn-secondary flex items-center gap-2 text-sm">
              <MessageSquarePlus className="w-4 h-4" />
              Submit Feedback
            </Link>
            <Link href="/dashboard" className="btn-primary flex items-center gap-2 text-sm">
              <LayoutDashboard className="w-4 h-4" />
              MP Dashboard
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-400 rounded-full blur-3xl" />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="max-w-3xl">
          <p className="text-blue-200 font-medium mb-4">AI-Powered Development Planning</p>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-6">
            Transform Citizen Voices into Evidence-Based Development Decisions
          </h1>
          <p className="text-lg text-blue-100 mb-8 leading-relaxed">
            Collect feedback in any language via voice, text, or photos. Our AI identifies recurring
            needs, maps demand hotspots, and recommends high-priority projects backed by public data.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/submit" className="bg-white text-blue-800 hover:bg-blue-50 font-semibold px-6 py-3 rounded-lg transition-colors">
              Share Your Feedback
            </Link>
            <Link href="/dashboard" className="border border-white/30 hover:bg-white/10 font-semibold px-6 py-3 rounded-lg transition-colors">
              View MP Dashboard
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

const FEATURES = [
  { icon: MessageSquarePlus, title: 'Multi-Channel Collection', desc: 'Web, mobile, WhatsApp, voice, and image submissions' },
  { icon: Users, title: 'Multilingual AI', desc: 'Automatic language detection, speech-to-text, and theme classification' },
  { icon: MapPin, title: 'Geographic Mapping', desc: 'Heatmaps and district-level demand analysis' },
  { icon: LayoutDashboard, title: 'Smart Recommendations', desc: 'Priority scoring combining citizen demand with public datasets' },
];

export function Features() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-4">How It Works</h2>
        <p className="text-slate-600 text-center max-w-2xl mx-auto mb-12">
          From scattered complaints to actionable development priorities — powered by AI and public data.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="card hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <f.icon className="w-6 h-6 text-blue-700" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-slate-600 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Workflow() {
  const steps = [
    'Citizen Submission', 'AI Processing', 'Theme Detection',
    'Location Mapping', 'Data Integration', 'Priority Ranking', 'MP Dashboard',
  ];
  return (
    <section className="py-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-center mb-10">System Workflow</h2>
        <div className="flex flex-wrap justify-center items-center gap-2">
          {steps.map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <span className="bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-full">{step}</span>
              {i < steps.length - 1 && <span className="text-slate-400 hidden sm:inline">→</span>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
