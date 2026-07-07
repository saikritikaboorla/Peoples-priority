import { Navbar, Hero, Features, Workflow } from '@/components/HomeSections';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <Workflow />
      <footer className="bg-slate-900 text-slate-400 py-8 text-center text-sm">
        Peoples Priority — Evidence-based development planning for Members of Parliament
      </footer>
    </>
  );
}
