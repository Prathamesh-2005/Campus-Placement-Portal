import { useNavigate } from 'react-router-dom';
import { ArrowRight, Briefcase, Users, TrendingUp, CheckCircle2, Zap, Shield, GraduationCap, Building2 } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Instrument+Serif:ital@0;1&display=swap');
        
        .font-display { font-family: 'Instrument Serif', serif; }
        .font-body { font-family: 'DM Sans', sans-serif; }

        .hero-grid {
          background-image: 
            linear-gradient(rgba(15, 23, 42, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(15, 23, 42, 0.04) 1px, transparent 1px);
          background-size: 48px 48px;
        }

        .stat-bar {
          height: 3px;
          background: linear-gradient(90deg, #1e293b, #3b82f6);
          border-radius: 2px;
        }

        .card-hover {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .card-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(15, 23, 42, 0.12);
        }

        .tag {
          font-family: 'DM Sans', sans-serif;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .marquee-track {
          display: flex;
          gap: 2.5rem;
          animation: marquee 20s linear infinite;
          width: max-content;
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        .stripe-divider {
          background: repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 4px,
            rgba(15, 23, 42, 0.06) 4px,
            rgba(15, 23, 42, 0.06) 8px
          );
        }
      `}</style>

      <Navbar />

      {/* ── HERO ── */}
      <section className="font-body hero-grid min-h-screen pt-20 flex flex-col justify-center px-6 lg:px-16 border-b border-slate-200">
        <div className="max-w-7xl mx-auto w-full">

          {/* eyebrow */}
          <div className="flex items-center gap-3 mb-10">
            <span className="tag text-slate-400">Campus Placement Platform</span>
            <div className="flex-1 max-w-[60px] stat-bar"></div>
            <span className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 tag px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              Live & Active
            </span>
          </div>

          {/* headline */}
          <div className="grid lg:grid-cols-12 gap-8 items-end mb-12">
            <div className="lg:col-span-8">
              <h1 className="font-display text-[56px] sm:text-[72px] lg:text-[88px] leading-[0.95] text-slate-900">
                Where talent<br />
                <span className="italic text-blue-600">meets</span> opportunity
              </h1>
            </div>
            <div className="lg:col-span-4 lg:pb-3">
              <p className="text-slate-500 text-base leading-relaxed max-w-xs">
                CampusHire connects students, companies, and placement officers in one seamless workflow.
              </p>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => navigate('/register')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors group"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>

          {/* stats row */}
          <div className="grid grid-cols-3 divide-x divide-slate-200 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
            {[
              { value: '500+', label: 'Job Drives', color: 'text-blue-600' },
              { value: '2,000+', label: 'Students Placed', color: 'text-emerald-600' },
              { value: '95%', label: 'Success Rate', color: 'text-amber-600' },
            ].map(({ value, label, color }) => (
              <div key={label} className="px-6 py-5 group hover:bg-slate-50 transition-colors">
                <div className={`text-3xl font-semibold ${color} font-display`}>{value}</div>
                <div className="tag text-slate-400 mt-1">{label}</div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── TICKER ── */}
      <div className="stripe-divider border-y border-slate-200 py-3 overflow-hidden bg-slate-50">
        <div className="marquee-track font-body tag text-slate-400">
          {[
            '✦  Students', '✦  Companies', '✦  TNP Officers',
            '✦  Job Drives', '✦  Real-time Tracking', '✦  Verified Profiles',
            '✦  Students', '✦  Companies', '✦  TNP Officers',
            '✦  Job Drives', '✦  Real-time Tracking', '✦  Verified Profiles',
          ].map((item, i) => (
            <span key={i} className="whitespace-nowrap">{item}</span>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <section className="font-body py-24 px-6 lg:px-16 bg-white">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex items-start justify-between mb-16 flex-wrap gap-4">
            <div>
              <span className="tag text-slate-400">Roles & Capabilities</span>
              <h2 className="font-display text-4xl lg:text-5xl text-slate-900 mt-2">Built for everyone<br/><span className="italic">in the process</span></h2>
            </div>
            <div className="max-w-xs text-sm text-slate-500 leading-relaxed mt-4">
              Three distinct dashboards, one unified platform — designed for clarity at every step.
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-px bg-slate-200 rounded-xl overflow-hidden border border-slate-200">
            {[
              {
                icon: <GraduationCap className="w-5 h-5" />,
                role: 'Students',
                tagColor: 'bg-blue-50 text-blue-700 border-blue-200',
                accent: 'bg-blue-600',
                desc: 'Browse active placement drives, apply in seconds, and track every application in real-time.',
                features: ['Browse job drives', 'One-click applications', 'Live status updates', 'Resume management'],
              },
              {
                icon: <Building2 className="w-5 h-5" />,
                role: 'Companies',
                tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                accent: 'bg-emerald-600',
                desc: 'Post placement drives, review verified applicant profiles, and manage the entire hiring pipeline.',
                features: ['Create job drives', 'Review applicants', 'Bulk status updates', 'Resume access'],
              },
              {
                icon: <TrendingUp className="w-5 h-5" />,
                role: 'TNP Officers',
                tagColor: 'bg-amber-50 text-amber-700 border-amber-200',
                accent: 'bg-amber-600',
                desc: 'Oversee placements end-to-end — approve drives, verify students, and track analytics.',
                features: ['Approve job drives', 'Verify student profiles', 'Analytics dashboard', 'Placement reports'],
              },
            ].map(({ icon, role, tagColor, accent, desc, features }) => (
              <div key={role} className="bg-white p-8 card-hover">
                <div className="flex items-center justify-between mb-6">
                  <span className={`inline-flex items-center gap-1.5 tag px-2.5 py-1 rounded-full border ${tagColor}`}>
                    {icon} {role}
                  </span>
                  <div className={`w-2 h-2 rounded-full ${accent}`}></div>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-8">{desc}</p>
                <ul className="space-y-2.5">
                  {features.map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-slate-700 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY CAMPUSHIRE ── */}
      <section className="font-body py-24 px-6 lg:px-16 bg-slate-950 text-white">
        <div className="max-w-7xl mx-auto">

          <div className="mb-16">
            <span className="tag text-slate-500">Why choose us</span>
            <h2 className="font-display text-4xl lg:text-5xl text-white mt-2">
              Less friction.<br />
              <span className="italic text-blue-400">More placements.</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-slate-800 rounded-xl overflow-hidden border border-slate-800">
            {[
              { icon: <Zap className="w-5 h-5 text-blue-400" />, title: 'Real-time Updates', body: 'Application statuses, notifications and drive changes reflected instantly.' },
              { icon: <Shield className="w-5 h-5 text-emerald-400" />, title: 'Verified Profiles', body: 'Every student and company is verified before accessing the platform.' },
              { icon: <Users className="w-5 h-5 text-amber-400" />, title: 'Role-based Access', body: 'Purpose-built dashboards for students, companies, and placement officers.' },
              { icon: <TrendingUp className="w-5 h-5 text-rose-400" />, title: 'Placement Analytics', body: 'Track offer rates, department-wise placement, and hiring trends.' },
            ].map(({ icon, title, body }) => (
              <div key={title} className="bg-slate-900 p-8 hover:bg-slate-800 transition-colors group">
                <div className="mb-5">{icon}</div>
                <h4 className="text-white text-sm font-semibold mb-2">{title}</h4>
                <p className="text-slate-400 text-xs leading-relaxed">{body}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="font-body py-24 px-6 lg:px-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            <div>
              <span className="tag text-slate-400">Get started today</span>
              <h2 className="font-display text-4xl lg:text-5xl text-slate-900 mt-2 leading-tight">
                Your placement journey<br />
                <span className="italic text-blue-600">starts here.</span>
              </h2>
            </div>

            <div className="flex flex-col gap-4">
              <p className="text-slate-500 text-sm leading-relaxed">
                Join thousands of students and 150+ companies already using CampusHire to simplify campus recruitment.
              </p>
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => navigate('/register')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors group"
                >
                  Create Account
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center gap-2 px-6 py-3 border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Already a member?
                </button>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Shield className="w-4 h-4 text-emerald-500" />
                <span className="text-xs text-slate-400">Secure platform. No spam. No hidden fees.</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="font-body bg-slate-950 text-slate-500 py-12 px-6 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-10 mb-10">
            <div>
              <div className="text-white font-semibold text-base mb-2">CampusHire</div>
              <p className="text-xs leading-relaxed text-slate-500">Streamlining campus placements for everyone involved.</p>
            </div>
            {[
              { heading: 'Product', links: ['Features', 'Pricing', 'Security'] },
              { heading: 'Company', links: ['About', 'Blog', 'Contact'] },
              { heading: 'Legal', links: ['Privacy', 'Terms'] },
            ].map(({ heading, links }) => (
              <div key={heading}>
                <h4 className="tag text-slate-400 mb-4">{heading}</h4>
                <ul className="space-y-2">
                  {links.map(l => (
                    <li key={l}><a href="#" className="text-xs hover:text-white transition-colors">{l}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-800 pt-6">
            <p className="text-xs text-center text-slate-600">© 2026 CampusHire. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}