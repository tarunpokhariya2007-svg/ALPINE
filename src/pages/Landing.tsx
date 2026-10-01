import { Link, useNavigate } from 'react-router'
import { useEffect, useRef, useState } from 'react'
import {
  Scale, ArrowRight, CheckCircle, Shield, Zap, Globe, Lock,
  MessageSquare, Users, FileSearch, MapPin, Mic, ChevronRight,
  Award, Clock, TrendingUp, BookOpen, Crown, Code2, Database,
  Lightbulb, Target, ShieldCheck, BarChart3,
} from 'lucide-react'

const stats = [
  { value: '48,200+', label: 'Cases Guided', icon: BookOpen },
  { value: '1,840', label: 'Verified Advocates', icon: Award },
  { value: '97.4%', label: 'AI Accuracy', icon: TrendingUp },
  { value: '220+', label: 'Cities Covered', icon: MapPin },
]

const steps = [
  {
    step: '01', title: 'Describe Your Issue',
    desc: 'Simply type or speak your legal problem in any language — no legal jargon needed.',
    color: '#D4AF37',
  },
  {
    step: '02', title: 'AI Analyzes Your Case',
    desc: 'Our Agentic AI cross-references thousands of statutes, IPC sections, and precedents instantly.',
    color: '#8A6A24',
  },
  {
    step: '03', title: 'Receive Legal Guidance',
    desc: 'Get a structured report with relevant laws, recommended actions, required documents, and timelines.',
    color: '#D4AF37',
  },
  {
    step: '04', title: 'Hire an Advocate',
    desc: 'Browse verified advocates matched to your case type, read reviews, and book consultations.',
    color: '#A27B2C',
  },
]

const features = [
  {
    icon: MessageSquare, title: 'AI Legal Assistant',
    desc: 'ChatGPT-style interface trained on Indian law. Ask anything about your rights and get instant, accurate guidance.',
    color: '#D4AF37', bg: 'rgba(212,175,55,0.08)',
  },
  {
    icon: Users, title: 'Advocate Marketplace',
    desc: 'Connect with 1,840+ verified advocates filtered by specialization, city, language, and consultation fee.',
    color: '#8A6A24', bg: 'rgba(162,123,44,0.08)',
  },
  {
    icon: FileSearch, title: 'AI Document Analyzer',
    desc: 'Upload FIRs, contracts, court orders, and property papers. AI extracts key clauses and flags risks instantly.',
    color: '#D4AF37', bg: 'rgba(212,175,55,0.08)',
  },
  {
    icon: MapPin, title: 'Jurisdiction Finder',
    desc: 'Automatically identify the correct court, jurisdiction, and authority for your case type and location.',
    color: '#A27B2C', bg: 'rgba(162,123,44,0.08)',
  },
  {
    icon: Lock, title: 'Secure Chat',
    desc: 'End-to-end encrypted communication with advocates. Your legal matters stay strictly confidential.',
    color: '#8B4A42', bg: 'rgba(139,74,66,0.07)',
  },
  {
    icon: Globe, title: 'Multilingual Support',
    desc: 'Available in Hindi, English, Tamil, Bengali, Marathi, Telugu, Kannada, and 14 more Indian languages.',
    color: '#527B83', bg: 'rgba(82,123,131,0.08)',
  },
]

const pricing = [
  {
    label: 'Citizen',
    price: '₹0',
    period: 'Forever Free',
    highlight: false,
    color: '#D4AF37',
    features: [
      '5 AI consultations / month',
      'Basic document analysis',
      'Jurisdiction finder',
      'Browse advocate listings',
      'Multilingual support',
      'Community forum access',
    ],
    cta: 'Start Free',
    href: '/signup',
  },
  {
    label: 'Citizen Pro',
    price: '₹299',
    period: 'per month',
    highlight: true,
    color: '#D4AF37',
    features: [
      'Unlimited AI consultations',
      'Advanced document analysis (50 docs)',
      'Priority advocate matching',
      'Secure encrypted chat',
      'Case timeline tracker',
      'Export reports as PDF',
      'Dedicated support',
    ],
    cta: 'Get Pro',
    href: '/signup',
  },
  {
    label: 'Advocate',
    price: '₹999',
    period: 'per month',
    highlight: false,
    color: '#D4AF37',
    features: [
      'AI Research Assistant',
      'Case file analysis & summaries',
      'Similar judgment finder',
      'Draft argument generator',
      'Client management portal',
      'Analytics & earnings dashboard',
      'Verified badge & profile boost',
    ],
    cta: 'Join as Advocate',
    href: '/advocate-login',
  },
]

const teamProfileLinkStyle: React.CSSProperties = {
  display: 'block',
  padding: '8px 10px',
  borderRadius: 5,
  color: 'rgba(255,255,255,0.78)',
  textDecoration: 'none',
  fontSize: '0.75rem',
  whiteSpace: 'nowrap',
}

export default function Landing() {
  const [openSocial, setOpenSocial] = useState<'linkedin' | 'github' | null>(null)
  const [showDisclaimer, setShowDisclaimer] = useState(true)
  const socialRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const handleProtectedNavigation = (path: string) => {
    const token = localStorage.getItem('token')

    if (token) {
      navigate(path)
    } else {
      navigate('/login')
    }
  }

  useEffect(() => {
    const disclaimerTimer = window.setTimeout(() => {
      setShowDisclaimer(false)
    }, 10000)

    return () => window.clearTimeout(disclaimerTimer)
  }, [])

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (socialRef.current && !socialRef.current.contains(event.target as Node)) {
        setOpenSocial(null)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [])

  return (
    <div className="landing-page" style={{ overflowX: 'hidden' }}>
      <style>{`
        /* =====================================================
           NYAYA AI LANDING PAGE ONLY
           BLACK BACKGROUND + MOVING WHITE SPARKLES + GOLD UI
           ===================================================== */

        .landing-page {
          --landing-gold: #D4AF37;
          --landing-gold-light: #F0D878;
          --landing-gold-dark: #A88624;
          background: #000 !important;
          color: #fff !important;
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          isolation: isolate;
        }

        /* Two subtle moving particle layers */
        .landing-page::before,
        .landing-page::after {
          content: "";
          position: absolute;
          inset: -120px;
          pointer-events: none;
          z-index: 0;
          background-repeat: repeat;
        }

        .landing-page::before {
          background-image:
            radial-gradient(circle, rgba(255,255,255,.90) 0 1px, transparent 1.6px),
            radial-gradient(circle, rgba(255,255,255,.50) 0 1px, transparent 1.6px);
          background-size: 125px 125px, 195px 195px;
          background-position: 0 0, 45px 80px;
          animation: nyayaStars 38s linear infinite;
        }

        .landing-page::after {
          background-image:
            radial-gradient(circle, rgba(255,255,255,.35) 0 1px, transparent 1.6px),
            radial-gradient(circle, rgba(255,255,255,.20) 0 1px, transparent 1.6px);
          background-size: 165px 165px, 270px 270px;
          background-position: 25px 35px, 120px 70px;
          animation: nyayaStarsReverse 55s linear infinite;
        }

        @keyframes nyayaStars {
          from { transform: translate3d(0,0,0); }
          to   { transform: translate3d(130px,170px,0); }
        }

        @keyframes nyayaStarsReverse {
          from { transform: translate3d(0,0,0); }
          to   { transform: translate3d(-150px,100px,0); }
        }

        /* Keep every real landing element above the particles */
        .landing-page > * {
          position: relative;
          z-index: 1;
        }

        /* Remove old hero/mesh blue backgrounds */
        .landing-page .hero-gradient,
        .landing-page .mesh-gradient {
          background: #000 !important;
        }

        /* All landing sections stay black */
        .landing-page section,
        .landing-page footer {
          background-color: #000 !important;
        }

        /* White typography */
        .landing-page h1,
        .landing-page h2,
        .landing-page h3,
        .landing-page h4 {
          color: #fff !important;
        }

        .landing-page p,
        .landing-page span,
        .landing-page li {
          color: rgba(255,255,255,.78);
        }

        /* Gold highlighted headline */
        .landing-page .gradient-text {
          background: none !important;
          color: var(--landing-gold) !important;
          -webkit-text-fill-color: var(--landing-gold) !important;
        }

        /* Gold symbols/icons */
        .landing-page svg {
          color: var(--landing-gold) !important;
          stroke: var(--landing-gold) !important;
        }

        .landing-page .section-tag {
          color: var(--landing-gold) !important;
          background: rgba(212,175,55,.08) !important;
          border: 1px solid rgba(212,175,55,.30) !important;
        }

        /* Gold primary action */
        .landing-page .btn-primary {
          background: var(--landing-gold) !important;
          color: #000 !important;
          border: 1px solid var(--landing-gold-light) !important;
          box-shadow: 0 8px 28px rgba(212,175,55,.18) !important;
        }

        .landing-page .btn-primary svg {
          color: #000 !important;
          stroke: #000 !important;
        }

        /* Black/transparent secondary action */
        .landing-page .btn-ghost {
          background: rgba(255,255,255,.025) !important;
          color: #fff !important;
          border: 1px solid rgba(212,175,55,.35) !important;
        }

        .landing-page .btn-ghost svg {
          color: var(--landing-gold) !important;
          stroke: var(--landing-gold) !important;
        }

        /* Stats strip */
        .landing-page .stat-number {
          color: var(--landing-gold) !important;
        }

        /* Cards */
        .landing-page .card,
        .landing-page .feature-card {
          background: rgba(255,255,255,.025) !important;
          border: 1px solid rgba(212,175,55,.16) !important;
          box-shadow: 0 12px 35px rgba(0,0,0,.35);
        }

        .landing-page .card:hover,
        .landing-page .feature-card:hover {
          border-color: rgba(212,175,55,.42) !important;
        }

        /* Gold feature/step number backgrounds */
        .landing-page .badge {
          background: rgba(212,175,55,.10) !important;
          color: var(--landing-gold) !important;
        }

        /* Team cards */
        .landing-page .team-card:hover {
          transform: translateY(-8px);
          border-color: rgba(212,175,55,.55) !important;
          box-shadow: 0 24px 55px rgba(0,0,0,.50) !important;
        }

        /* Footer */
        .landing-page footer {
          border-top-color: rgba(212,175,55,.18) !important;
        }

        /* Footer logo */
        .landing-page footer a:hover {
          color: var(--landing-gold) !important;
        }

        /* CTA banner links */
        .landing-page a {
          transition: border-color .2s ease, color .2s ease, background .2s ease;
        }

        /* If the navbar is outside Landing.tsx, style it ONLY while
           this landing page exists. This does not affect dashboard pages. */
        body:has(.landing-page) nav {
          background: rgba(0,0,0,.88) !important;
          border-bottom: 1px solid rgba(212,175,55,.18) !important;
        }

        body:has(.landing-page) nav svg {
          color: var(--landing-gold) !important;
          stroke: var(--landing-gold) !important;
        }

        /* Responsive particle performance */
        @media (prefers-reduced-motion: reduce) {
          .landing-page::before,
          .landing-page::after {
            animation: none;
          }
        }
      `}</style>

      {/* ── Hero ── */}
      <section className="hero-gradient" style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', position: 'relative' }}>
        {/* Decorative orbs */}
        <div style={{
          position: 'absolute', width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(162,123,44,0.06) 0%, transparent 70%)',
          top: -100, left: -100, pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(36,52,71,0.05) 0%, transparent 70%)',
          bottom: 0, right: 100, pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px', width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}
            className="hero-grid">
            {/* Left */}
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 24 }}>
                <span className="section-tag">
                  <Zap size={12} /> Agentic AI Platform
                </span>
              </div>

              <h1 style={{
                fontSize: 'clamp(2.4rem, 4.5vw, 3.6rem)', fontWeight: 900,
                lineHeight: 1.1, letterSpacing: '-0.04em', marginBottom: 20, color: 'var(--text)',
              }}>
                AI Legal Guidance<br /><span className="gradient-text">for India</span><br />with Nyaya AI.
              </h1>

              <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 32, maxWidth: 480 }}>
                Nyaya AI provides AI-powered legal guidance in India, helps you understand your rights, analyze legal documents, find relevant legal information, and connect with advocates — all in your language.
              </p>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 40 }}>
                <button
                  type="button"
                  onClick={() => handleProtectedNavigation('/dashboard/ai-assistant')}
                  className="btn-primary"
                  style={{ padding: '14px 28px', borderRadius: 12, fontWeight: 700, fontSize: '1rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <MessageSquare size={18} />
                  Get Legal Help
                </button>
                <button
                  type="button"
                  onClick={() => handleProtectedNavigation('/dashboard/advocates')}
                  className="btn-ghost"
                  style={{ padding: '14px 28px', borderRadius: 12, fontWeight: 600, fontSize: '1rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <Users size={18} />
                  Find an Advocate
                  <ArrowRight size={16} />
                </button>
              </div>

              {/* Trust indicators */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                {['Bar Council Verified', 'ISO 27001 Certified', 'MeitY Recognized'].map(t => (
                  <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <CheckCircle size={14} style={{ color: '#D4AF37', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right – Illustration */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <HeroIllustration />
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }} className="stats-grid">
            {stats.map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div className="stat-number">{s.value}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: 4 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <span className="section-tag" style={{ marginBottom: 16, display: 'inline-flex' }}>
              <Clock size={12} /> How It Works
            </span>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.03em', marginTop: 12 }}>
              Justice in four steps
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: 12, maxWidth: 500, margin: '12px auto 0' }}>
              From describing your problem to hiring an advocate — NyayaAI guides you every step of the way.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }} className="steps-grid">
            {steps.map((s, i) => (
              <div key={s.step} className="card" style={{ padding: 28, position: 'relative' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14, marginBottom: 16,
                  background: `color-mix(in srgb, ${s.color} 12%, transparent)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 900, color: s.color }}>
                    {s.step}
                  </span>
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
                  {s.title}
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  {s.desc}
                </p>
                {i < steps.length - 1 && (
                  <ChevronRight size={18} style={{
                    position: 'absolute', right: -12, top: '50%', transform: 'translateY(-50%)',
                    color: 'var(--text-subtle)', zIndex: 1,
                  }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="mesh-gradient" style={{ padding: '100px 24px', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <span className="section-tag" style={{ marginBottom: 16, display: 'inline-flex' }}>
              <Zap size={12} /> Platform Features
            </span>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.03em', marginTop: 12 }}>
              Everything you need for legal clarity
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }} className="features-grid">
            {features.map(f => (
              <div key={f.title} className="feature-card" style={{ padding: 28 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14, background: f.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
                }}>
                  <f.icon size={22} style={{ color: f.color }} strokeWidth={2} />
                </div>
                <h3 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 8, fontSize: '1rem' }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Our Team ── */}
      <section id="about" style={{
        padding: '100px 24px',
        borderTop: '1px solid var(--border)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          width: 520,
          height: 520,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212,175,55,0.07) 0%, transparent 70%)',
          top: -180,
          left: '50%',
          transform: 'translateX(-50%)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Section heading */}
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <span className="section-tag" style={{
              marginBottom: 16,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
            }}>
              <Users size={14} /> Our Team
            </span>

            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 3.2rem)',
              fontWeight: 850,
              lineHeight: 1.15,
              letterSpacing: '-0.04em',
              color: 'var(--text)',
              marginTop: 12,
              marginBottom: 16,
            }}>
              Meet the People Behind <span className="gradient-text">Nyaya AI</span>
            </h2>

            <p style={{
              maxWidth: 760,
              margin: '0 auto',
              color: 'var(--text-muted)',
              fontSize: '1rem',
              lineHeight: 1.7,
            }}>
              A passionate team combining leadership, software engineering, and
              database expertise to build accessible and technology-driven legal
              guidance for India.
            </p>
          </div>

          {/* Team cards */}
          <div
            className="team-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: 28,
            }}
          >
            {/* Gaurav Singh — Team Lead */}
            <div className="team-card" style={{
              background: 'rgba(255,255,255,0.025)',
              border: '1px solid rgba(212,175,55,0.22)',
              borderRadius: 20,
              padding: 24,
              textAlign: 'center',
              boxShadow: '0 18px 45px rgba(0,0,0,0.35)',
              transition: 'transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease',
            }}>
              <div style={{
                width: 190,
                height: 190,
                margin: '0 auto 22px',
                borderRadius: '50%',
                padding: 4,
                background: 'linear-gradient(135deg, #D4AF37, #F5D76E, #A27B2C)',
                boxShadow: '0 0 35px rgba(212,175,55,0.18)',
              }}>
                <img
                  src="/team/gaurav.jpg"
                  alt="Gaurav Singh - Team Lead at Nyaya AI"
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    objectPosition: 'center top',
                    display: 'block',
                  }}
                />
              </div>

              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '8px 16px',
                borderRadius: 999,
                border: '1px solid rgba(212,175,55,0.55)',
                background: 'rgba(212,175,55,0.06)',
                color: '#D4AF37',
                fontSize: '0.82rem',
                fontWeight: 700,
                marginBottom: 16,
              }}>
                <Crown size={15} /> Team Lead
              </div>

              <h3 style={{
                color: 'var(--text)',
                fontSize: '1.55rem',
                fontWeight: 800,
                margin: '0 0 12px',
                letterSpacing: '-0.02em',
              }}>
                Gaurav Singh
              </h3>

              <p style={{
                color: 'var(--text-muted)',
                fontSize: '0.94rem',
                lineHeight: 1.7,
                margin: '0 0 24px',
                minHeight: 130,
              }}>
                Hi, I'm Gaurav Singh, the Team Lead of Nyaya AI. I coordinate the
                team, guide project direction, and help turn our ideas into practical
                solutions that make legal technology more accessible.
              </p>

              <div style={{
                height: 1,
                background: 'rgba(212,175,55,0.18)',
                marginBottom: 22,
              }} />

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 10,
                textAlign: 'left',
              }}>
                <div>
                  <Lightbulb size={22} style={{ color: '#D4AF37', marginBottom: 8 }} />
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.76rem', lineHeight: 1.4 }}>
                    Team<br />Management
                  </div>
                </div>
                <div>
                  <Users size={22} style={{ color: '#D4AF37', marginBottom: 8 }} />
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.76rem', lineHeight: 1.4 }}>
                    Project<br />Coordination
                  </div>
                </div>
                <div>
                  <Target size={22} style={{ color: '#D4AF37', marginBottom: 8 }} />
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.76rem', lineHeight: 1.4 }}>
                    Strategy &amp;<br />Planning
                  </div>
                </div>
              </div>
            </div>

            {/* Tarun Pokhariya — Backend & Frontend Developer */}
            <div className="team-card" style={{
              background: 'rgba(255,255,255,0.025)',
              border: '1px solid rgba(212,175,55,0.22)',
              borderRadius: 20,
              padding: 24,
              textAlign: 'center',
              boxShadow: '0 18px 45px rgba(0,0,0,0.35)',
              transition: 'transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease',
            }}>
              <div style={{
                width: 190,
                height: 190,
                margin: '0 auto 22px',
                borderRadius: '50%',
                padding: 4,
                background: 'linear-gradient(135deg, #D4AF37, #F5D76E, #A27B2C)',
                boxShadow: '0 0 35px rgba(212,175,55,0.18)',
              }}>
                <img
                  src="/team/tarun.jpg"
                  alt="Tarun Pokhariya - Backend and Frontend Developer at Nyaya AI"
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    objectPosition: 'center top',
                    display: 'block',
                  }}
                />
              </div>

              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '8px 16px',
                borderRadius: 999,
                border: '1px solid rgba(212,175,55,0.55)',
                background: 'rgba(212,175,55,0.06)',
                color: '#D4AF37',
                fontSize: '0.82rem',
                fontWeight: 700,
                marginBottom: 16,
              }}>
                <Code2 size={15} /> Backend &amp; Frontend Developer
              </div>

              <h3 style={{
                color: 'var(--text)',
                fontSize: '1.55rem',
                fontWeight: 800,
                margin: '0 0 12px',
                letterSpacing: '-0.02em',
              }}>
                Tarun Pokhariya
              </h3>

              <p style={{
                color: 'var(--text-muted)',
                fontSize: '0.94rem',
                lineHeight: 1.7,
                margin: '0 0 24px',
                minHeight: 130,
              }}>
                Hi, I'm Tarun Pokhariya, the Backend and Frontend Developer of
                Nyaya AI. I build and maintain the platform, develop user-facing
                features, and connect the frontend with reliable backend services.
              </p>

              <div style={{
                height: 1,
                background: 'rgba(212,175,55,0.18)',
                marginBottom: 22,
              }} />

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 10,
                textAlign: 'left',
              }}>
                <div>
                  <Code2 size={22} style={{ color: '#D4AF37', marginBottom: 8 }} />
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.76rem', lineHeight: 1.4 }}>
                    Full-Stack<br />Development
                  </div>
                </div>
                <div>
                  <Target size={22} style={{ color: '#D4AF37', marginBottom: 8 }} />
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.76rem', lineHeight: 1.4 }}>
                    Feature<br />Implementation
                  </div>
                </div>
                <div>
                  <ShieldCheck size={22} style={{ color: '#D4AF37', marginBottom: 8 }} />
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.76rem', lineHeight: 1.4 }}>
                    System<br />Integration
                  </div>
                </div>
              </div>
            </div>

            {/* Pragitya Ghosh — Database Manager */}
            <div className="team-card" style={{
              background: 'rgba(255,255,255,0.025)',
              border: '1px solid rgba(212,175,55,0.22)',
              borderRadius: 20,
              padding: 24,
              textAlign: 'center',
              boxShadow: '0 18px 45px rgba(0,0,0,0.35)',
              transition: 'transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease',
            }}>
              <div style={{
                width: 190,
                height: 190,
                margin: '0 auto 22px',
                borderRadius: '50%',
                padding: 4,
                background: 'linear-gradient(135deg, #D4AF37, #F5D76E, #A27B2C)',
                boxShadow: '0 0 35px rgba(212,175,55,0.18)',
              }}>
                <img
                  src="/team/pragitya.jpg"
                  alt="Pragitya Ghosh - Database Manager at Nyaya AI"
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    objectPosition: 'center top',
                    display: 'block',
                  }}
                />
              </div>

              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '8px 16px',
                borderRadius: 999,
                border: '1px solid rgba(212,175,55,0.55)',
                background: 'rgba(212,175,55,0.06)',
                color: '#D4AF37',
                fontSize: '0.82rem',
                fontWeight: 700,
                marginBottom: 16,
              }}>
                <Database size={15} /> Database Manager
              </div>

              <h3 style={{
                color: 'var(--text)',
                fontSize: '1.55rem',
                fontWeight: 800,
                margin: '0 0 12px',
                letterSpacing: '-0.02em',
              }}>
                Pragitya Ghosh
              </h3>

              <p style={{
                color: 'var(--text-muted)',
                fontSize: '0.94rem',
                lineHeight: 1.7,
                margin: '0 0 24px',
                minHeight: 130,
              }}>
                Hi, I'm Pragitya Ghosh, the Database Manager of Nyaya AI. I design
                and manage our data systems, focus on data integrity and security,
                and help ensure that our platform's information remains organized
                and reliable.
              </p>

              <div style={{
                height: 1,
                background: 'rgba(212,175,55,0.18)',
                marginBottom: 22,
              }} />

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 10,
                textAlign: 'left',
              }}>
                <div>
                  <Database size={22} style={{ color: '#D4AF37', marginBottom: 8 }} />
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.76rem', lineHeight: 1.4 }}>
                    Database<br />Design
                  </div>
                </div>
                <div>
                  <ShieldCheck size={22} style={{ color: '#D4AF37', marginBottom: 8 }} />
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.76rem', lineHeight: 1.4 }}>
                    Data Security<br />&amp; Integrity
                  </div>
                </div>
                <div>
                  <BarChart3 size={22} style={{ color: '#D4AF37', marginBottom: 8 }} />
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.76rem', lineHeight: 1.4 }}>
                    Performance<br />Optimization
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="hero-gradient" style={{ padding: '100px 24px', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <span className="section-tag" style={{ marginBottom: 16, display: 'inline-flex' }}>
              Simple Pricing
            </span>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.03em', marginTop: 12 }}>
              Transparent. Affordable. Fair.
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }} className="pricing-grid">
            {pricing.map(plan => (
              <div key={plan.label}
                className={plan.highlight ? 'card pricing-popular' : 'card'}
                style={{ padding: 32, position: 'relative' }}>
                {plan.highlight && (
                  <div style={{
                    position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                    background: '#D4AF37',
                    color: 'white', padding: '4px 16px', borderRadius: 99,
                    fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em', whiteSpace: 'nowrap',
                  }}>
                    MOST POPULAR
                  </div>
                )}

                <div style={{ marginBottom: 8 }}>
                  <div className="badge" style={{ background: `color-mix(in srgb, ${plan.color} 12%, transparent)`, color: plan.color, marginBottom: 12 }}>
                    {plan.label}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{ fontSize: '2.8rem', fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.04em' }}>
                      {plan.price}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>/{plan.period}</span>
                  </div>
                </div>

                <div style={{ height: 1, background: 'var(--border)', margin: '20px 0' }} />

                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      <CheckCircle size={15} style={{ color: plan.color, marginTop: 1, flexShrink: 0 }} />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link to={plan.href}
                  className={plan.highlight ? 'btn-primary' : (plan.color === 'var(--emerald)' ? 'btn-emerald' : 'btn-ghost')}
                  style={{
                    display: 'block', padding: '12px', borderRadius: 10, textAlign: 'center',
                    fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem',
                    ...((!plan.highlight && plan.color !== 'var(--emerald)') ? { border: '1px solid var(--border)' } : {}),
                  }}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section style={{ padding: '80px 24px', background: '#000000' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <Shield size={40} style={{ color: 'rgba(255,255,255,0.6)', margin: '0 auto 20px' }} />
          <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 800, color: 'white', letterSpacing: '-0.03em', marginBottom: 16 }}>
            Your rights. Our mission.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1rem', marginBottom: 32, lineHeight: 1.6 }}>
            Every Indian deserves access to quality legal help. NyayaAI makes that possible — free, fast, and in your language.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/signup" style={{
              padding: '14px 32px', borderRadius: 12, fontWeight: 700, fontSize: '1rem',
              background: '#F5F1E8', color: '#243447', textDecoration: 'none',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)', display: 'inline-flex', alignItems: 'center', gap: 8,
            }}>
              Get Started Free <ArrowRight size={18} />
            </Link>
            <button
              type="button"
              onClick={() => handleProtectedNavigation('/dashboard/advocates')}
              style={{
                padding: '14px 32px', borderRadius: 12, fontWeight: 600, fontSize: '1rem',
                background: 'rgba(255,255,255,0.15)', color: 'white',
                border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer',
              }}>
              Find an Advocate
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer id="contact" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', padding: '64px 24px 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, marginBottom: 48 }} className="footer-grid">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <span style={{
                  fontWeight: 900,
                  fontSize: '1.25rem',
                  letterSpacing: '4px',
                  color: '#D4AF37',
                }}>
                  ALPINE
                </span>
              </div>

              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 280 }}>
                AI-powered legal assistance platform, making legal guidance simple and accessible for everyone.
              </p>
              {/* Team social profiles */}
              <div
                ref={socialRef}
                style={{
                  display: 'flex',
                  gap: 8,
                  marginTop: 16,
                  flexWrap: 'wrap',
                }}
              >

                {/* LinkedIn */}
                <div style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() =>
                      setOpenSocial(
                        openSocial === 'linkedin' ? null : 'linkedin'
                      )
                    }
                    style={{
                      padding: '7px 12px',
                      borderRadius: 6,
                      background: 'var(--bg-card)',
                      border: '1px solid rgba(212,175,55,0.35)',
                      fontSize: '0.75rem',
                      color: '#D4AF37',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    LinkedIn
                  </button>

                  {openSocial === 'linkedin' && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 'calc(100% + 8px)',
                        left: 0,
                        minWidth: 190,
                        padding: 8,
                        borderRadius: 8,
                        background: '#080808',
                        border: '1px solid rgba(212,175,55,0.35)',
                        boxShadow: '0 12px 30px rgba(0,0,0,0.55)',
                        zIndex: 100,
                      }}
                    >
                      <a
                        href="https://www.linkedin.com/in/tarun-pokhariya-9971433a6"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={teamProfileLinkStyle}
                      >
                        Tarun Pokhariya
                      </a>

                      <a
                        href="https://www.linkedin.com/in/pragitya-ghosh-33ba5a381/"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={teamProfileLinkStyle}
                      >
                        Pragitya Ghosh
                      </a>

                      <a
                        href="https://www.linkedin.com/in/gaurav-singh-aa6a19376"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={teamProfileLinkStyle}
                      >
                        Gaurav Singh
                      </a>
                    </div>
                  )}
                </div>

                {/* GitHub */}
                <div style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() =>
                      setOpenSocial(
                        openSocial === 'github' ? null : 'github'
                      )
                    }
                    style={{
                      padding: '7px 12px',
                      borderRadius: 6,
                      background: 'var(--bg-card)',
                      border: '1px solid rgba(212,175,55,0.35)',
                      fontSize: '0.75rem',
                      color: '#D4AF37',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    GitHub
                  </button>

                  {openSocial === 'github' && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 'calc(100% + 8px)',
                        left: 0,
                        minWidth: 190,
                        padding: 8,
                        borderRadius: 8,
                        background: '#080808',
                        border: '1px solid rgba(212,175,55,0.35)',
                        boxShadow: '0 12px 30px rgba(0,0,0,0.55)',
                        zIndex: 100,
                      }}
                    >
                      <a
                        href="https://github.com/tarunpokhariya2007-svg"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={teamProfileLinkStyle}
                      >
                        Tarun Pokhariya
                      </a>

                      <a
                        href="https://github.com/gaurav8469"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={teamProfileLinkStyle}
                      >
                        Gaurav Singh
                      </a>

                      <a
                        href="https://github.com/Pragitya02"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={teamProfileLinkStyle}
                      >
                        Pragitya Ghosh
                      </a>
                    </div>
                  )}
                </div>

              </div>
            </div>
            {[
              { heading: 'Platform', links: ['AI Assistant', 'Find Advocates', 'Document Analyzer', 'Jurisdiction Finder', 'Pricing'] },
              { heading: 'For Advocates', links: ['Join as Advocate', 'AI Research Tool', 'Client Management', 'Earnings Dashboard', 'Verification'] },
              { heading: 'Company', links: ['About Us', 'Careers', 'Blog', 'Press', 'Contact', 'Privacy Policy'] },
            ].map(col => (
              <div key={col.heading}>
                <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text)', marginBottom: 16, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  {col.heading}
                </h4>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {col.links.map(l => (
                    <li key={l}>
                      <a href="#" style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textDecoration: 'none' }}>{l}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
              © 2026 NyayaAI Technologies Pvt. Ltd. · Not a substitute for professional legal advice. · CIN: U74140DL2024PTC000001
            </p>
            <div style={{ display: 'flex', gap: 16 }}>
              {['Terms', 'Privacy', 'Disclaimer', 'Grievance'].map(l => (
                <a key={l} href="#" style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', textDecoration: 'none' }}>{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        .nyaya-disclaimer {
          position: fixed;
          right: 20px;
          bottom: 20px;
          width: min(360px, calc(100vw - 32px));
          max-height: 190px;
          overflow-y: auto;
          padding: 14px 42px 14px 16px;
          background: rgba(8, 8, 8, 0.96);
          border: 1px solid rgba(212, 175, 55, 0.65);
          border-radius: 12px;
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.55);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 9999;
          scrollbar-width: thin;
        }

        .nyaya-disclaimer::-webkit-scrollbar {
          width: 6px;
        }

        .nyaya-disclaimer::-webkit-scrollbar-thumb {
          background: rgba(212, 175, 55, 0.65);
          border-radius: 10px;
        }

        .nyaya-disclaimer-title {
          margin: 0 0 7px;
          color: #D4AF37;
          font-size: 0.78rem;
          font-weight: 800;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .nyaya-disclaimer-text {
          margin: 0;
          color: rgba(255, 255, 255, 0.78);
          font-size: 0.72rem;
          line-height: 1.55;
        }

        .nyaya-disclaimer-close {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 28px;
          height: 28px;
          border: 1px solid rgba(212, 175, 55, 0.35);
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.04);
          color: #D4AF37;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 18px;
          line-height: 1;
          padding: 0;
        }

        .nyaya-disclaimer-close:hover {
          background: rgba(212, 175, 55, 0.12);
        }

        @media (max-width: 600px) {
          .nyaya-disclaimer {
            right: 12px;
            bottom: 12px;
            width: calc(100vw - 24px);
            max-height: 170px;
            padding: 13px 40px 13px 14px;
          }

          .nyaya-disclaimer-text {
            font-size: 0.7rem;
          }
        }
      `}</style>

      {showDisclaimer && (
        <div
          className="nyaya-disclaimer"
          role="dialog"
          aria-label="Legal disclaimer"
        >
          <button
            type="button"
            className="nyaya-disclaimer-close"
            onClick={() => setShowDisclaimer(false)}
            aria-label="Close disclaimer"
            title="Close"
          >
            ×
          </button>

          <p className="nyaya-disclaimer-title">Disclaimer</p>
          <p className="nyaya-disclaimer-text">
            Nyaya AI provides general legal information and AI-assisted
            guidance. It is not a substitute for advice from a qualified
            advocate. Laws and procedures may change, so users should verify
            important matters with a legal professional.
          </p>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .steps-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .features-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .team-grid { grid-template-columns: 1fr 1fr !important; }
          .pricing-grid { grid-template-columns: 1fr !important; }
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 600px) {
          .team-grid { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
          .steps-grid { grid-template-columns: 1fr !important; }
          .features-grid { grid-template-columns: 1fr !important; }
          .team-grid { grid-template-columns: 1fr !important; }
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

function HeroIllustration() {
  return (
    <div
      className="legal-scale-animation"
      style={{
        position: 'relative',
        width: 560,
        height: 460,
        maxWidth: '100%',
      }}
    >
      <svg
        viewBox="0 0 560 460"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          width: '100%',
          height: '100%',
          overflow: 'visible',
        }}
      >
        <defs>
          {/* Gold scale */}
          <linearGradient id="goldScale2" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFF1A8" />
            <stop offset="25%" stopColor="#D4AF37" />
            <stop offset="60%" stopColor="#A77F18" />
            <stop offset="100%" stopColor="#F3D76A" />
          </linearGradient>

          {/* Cloud */}
          <linearGradient id="cloudGold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFDF5" />
            <stop offset="100%" stopColor="#E9E2CF" />
          </linearGradient>

          <radialGradient id="scaleGlow">
            <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
          </radialGradient>

          <filter id="cloudShadow" x="-30%" y="-30%" width="160%" height="180%">
            <feDropShadow
              dx="0"
              dy="8"
              stdDeviation="8"
              floodColor="#000000"
              floodOpacity="0.45"
            />
          </filter>

          <filter id="goldBlur" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Arrow head */}
          <marker
            id="goldArrow"
            markerWidth="10"
            markerHeight="10"
            refX="8"
            refY="5"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path
              d="M0 0 L10 5 L0 10 L2.5 5 Z"
              fill="#D4AF37"
            />
          </marker>
        </defs>

        {/* Background glow */}
        <circle cx="280" cy="235" r="205" fill="url(#scaleGlow)" />

        {/* =====================================================
            MAIN BALANCE SCALE
            ===================================================== */}

        <g
          className="scale-balance"
          style={{ transformOrigin: '280px 225px' }}
        >
          {/* Top finial */}
          <circle
            cx="280"
            cy="42"
            r="18"
            fill="#050505"
            stroke="url(#goldScale2)"
            strokeWidth="3"
          />

          <path
            d="M271 58 L289 58 L294 82 L266 82 Z"
            fill="url(#goldScale2)"
          />

          {/* Center column */}
          <rect
            x="271"
            y="75"
            width="18"
            height="285"
            rx="9"
            fill="url(#goldScale2)"
            filter="url(#goldBlur)"
          />

          <rect
            x="275"
            y="85"
            width="4"
            height="265"
            rx="2"
            fill="#FFF0A6"
            opacity="0.65"
          />

          {/* Beam */}
          <path
            d="
              M105 128
              Q155 92 205 112
              Q242 128 280 112
              Q318 128 355 112
              Q405 92 455 128
            "
            stroke="url(#goldScale2)"
            strokeWidth="15"
            strokeLinecap="round"
            fill="none"
          />

          {/* Center joint */}
          <circle
            cx="280"
            cy="116"
            r="16"
            fill="#050505"
            stroke="url(#goldScale2)"
            strokeWidth="4"
          />

          <circle
            cx="280"
            cy="116"
            r="5"
            fill="#F3D76A"
          />

          {/* LEFT STRINGS */}
          <g className="left-pan">
            <line
              x1="145"
              y1="120"
              x2="145"
              y2="235"
              stroke="url(#goldScale2)"
              strokeWidth="3"
            />
            <line
              x1="105"
              y1="120"
              x2="145"
              y2="235"
              stroke="url(#goldScale2)"
              strokeWidth="3"
            />
            <line
              x1="185"
              y1="120"
              x2="145"
              y2="235"
              stroke="url(#goldScale2)"
              strokeWidth="3"
            />

            {/* Left pan */}
            <path
              d="
                M82 235
                Q145 260 208 235
                L194 261
                Q145 286 96 261
                Z
              "
              fill="url(#goldScale2)"
              stroke="#D4AF37"
              strokeWidth="2"
            />

            <path
              d="
                M85 235
                Q145 251 205 235
                Q145 264 85 235
              "
              fill="#090909"
            />
          </g>

          {/* RIGHT STRINGS */}
          <g className="right-pan">
            <line
              x1="415"
              y1="120"
              x2="415"
              y2="235"
              stroke="url(#goldScale2)"
              strokeWidth="3"
            />
            <line
              x1="375"
              y1="120"
              x2="415"
              y2="235"
              stroke="url(#goldScale2)"
              strokeWidth="3"
            />
            <line
              x1="455"
              y1="120"
              x2="415"
              y2="235"
              stroke="url(#goldScale2)"
              strokeWidth="3"
            />

            {/* Right pan */}
            <path
              d="
                M352 235
                Q415 260 478 235
                L464 261
                Q415 286 366 261
                Z
              "
              fill="url(#goldScale2)"
              stroke="#D4AF37"
              strokeWidth="2"
            />

            <path
              d="
                M355 235
                Q415 251 475 235
                Q415 264 355 235
              "
              fill="#090909"
            />
          </g>

          {/* Base */}
          <path
            d="
              M225 365
              Q280 338 335 365
              L360 392
              L200 392
              Z
            "
            fill="url(#goldScale2)"
          />

          <ellipse
            cx="280"
            cy="393"
            rx="82"
            ry="13"
            fill="#D4AF37"
            opacity="0.28"
          />
        </g>

        {/* =====================================================
            LEFT FULL CLOUD
            ===================================================== */}

        <g className="cloud-left" filter="url(#cloudShadow)">
          {/* Cloud */}
          <path
            d="
              M18 142
              C18 119 35 103 57 103
              C62 78 83 60 108 60
              C131 60 150 74 157 96
              C164 91 173 88 183 88
              C207 88 226 106 226 130
              C226 135 225 140 223 144
              C232 148 238 156 238 166
              C238 183 224 196 207 196
              L67 196
              C40 196 18 174 18 148
              Z
            "
            fill="url(#cloudGold)"
            stroke="#D4AF37"
            strokeWidth="3"
          />

          {/* Cloud highlight */}
          <path
            d="
              M48 142
              C48 126 61 116 76 116
              C82 95 99 82 118 82
              C136 82 150 94 155 111
            "
            stroke="#FFF7D0"
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.9"
          />

          {/* Text */}
          <text
            x="128"
            y="146"
            textAnchor="middle"
            fontSize="17"
            fontWeight="800"
            fill="#9C7517"
            fontFamily="Inter, Arial, sans-serif"
          >
            Know Your Rights
          </text>

          <text
            x="128"
            y="169"
            textAnchor="middle"
            fontSize="12"
            fontWeight="600"
            fill="#6F5A2A"
            fontFamily="Inter, Arial, sans-serif"
          >
            Get legal guidance
          </text>

          {/* Pointer connector */}
          <path
            d="M220 178 C245 188 250 203 164 228"
            stroke="#D4AF37"
            strokeWidth="3"
            strokeDasharray="7 7"
            markerEnd="url(#goldArrow)"
            fill="none"
          />

          {/* Moving arrow head */}
          <circle
            className="arrow-dot-left"
            cx="210"
            cy="188"
            r="4"
            fill="#FFF0A6"
          />
        </g>

        {/* =====================================================
            RIGHT FULL CLOUD
            ===================================================== */}

        <g className="cloud-right" filter="url(#cloudShadow)">
          {/* Cloud */}
          <path
            d="
              M322 142
              C322 119 339 103 361 103
              C366 78 387 60 412 60
              C435 60 454 74 461 96
              C468 91 477 88 487 88
              C511 88 530 106 530 130
              C530 135 529 140 527 144
              C536 148 542 156 542 166
              C542 183 528 196 511 196
              L371 196
              C344 196 322 174 322 148
              Z
            "
            fill="url(#cloudGold)"
            stroke="#D4AF37"
            strokeWidth="3"
          />

          {/* Cloud highlight */}
          <path
            d="
              M352 142
              C352 126 365 116 380 116
              C386 95 403 82 422 82
              C440 82 454 94 459 111
            "
            stroke="#FFF7D0"
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.9"
          />

          {/* Text */}
          <text
            x="432"
            y="146"
            textAnchor="middle"
            fontSize="17"
            fontWeight="800"
            fill="#9C7517"
            fontFamily="Inter, Arial, sans-serif"
          >
            Login &amp; Explore
          </text>

          <text
            x="432"
            y="169"
            textAnchor="middle"
            fontSize="12"
            fontWeight="600"
            fill="#6F5A2A"
            fontFamily="Inter, Arial, sans-serif"
          >
            Access your legal space
          </text>

          {/* Pointer connector */}
          <path
            d="M340 178 C315 188 310 203 396 228"
            stroke="#D4AF37"
            strokeWidth="3"
            strokeDasharray="7 7"
            markerEnd="url(#goldArrow)"
            fill="none"
          />

          {/* Moving arrow head */}
          <circle
            className="arrow-dot-right"
            cx="350"
            cy="188"
            r="4"
            fill="#FFF0A6"
          />
        </g>

        {/* Gold decorative dots */}
        <g fill="#D4AF37">
          <circle cx="32" cy="330" r="3" opacity="0.65" />
          <circle cx="52" cy="350" r="2" opacity="0.4" />
          <circle cx="505" cy="330" r="3" opacity="0.65" />
          <circle cx="525" cy="350" r="2" opacity="0.4" />
          <circle cx="280" cy="425" r="3" opacity="0.45" />
        </g>
      </svg>

      <style>{`
        /* Scale gently balances */
        .scale-balance {
          animation: scaleBalance 4.5s ease-in-out infinite;
        }

        @keyframes scaleBalance {
          0%, 100% {
            transform: rotate(-2deg);
          }

          50% {
            transform: rotate(2deg);
          }
        }

        /* Pans move opposite to the beam */
        .left-pan {
          animation: leftPanMove 4.5s ease-in-out infinite;
        }

        .right-pan {
          animation: rightPanMove 4.5s ease-in-out infinite;
        }

        @keyframes leftPanMove {
          0%, 100% {
            transform: translateY(5px);
          }

          50% {
            transform: translateY(-7px);
          }
        }

        @keyframes rightPanMove {
          0%, 100% {
            transform: translateY(-7px);
          }

          50% {
            transform: translateY(5px);
          }
        }

        /* Clouds float independently */
        .cloud-left {
          animation: leftCloudFloat 5s ease-in-out infinite;
        }

        .cloud-right {
          animation: rightCloudFloat 5s ease-in-out infinite;
        }

        @keyframes leftCloudFloat {
          0%, 100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes rightCloudFloat {
          0%, 100% {
            transform: translateY(-5px);
          }

          50% {
            transform: translateY(3px);
          }
        }

        /* Animated light traveling along left connector */
        .arrow-dot-left {
          animation: arrowLeft 2.2s linear infinite;
        }

        @keyframes arrowLeft {
          0% {
            transform: translate(0, 0);
            opacity: 0;
          }

          15% {
            opacity: 1;
          }

          50% {
            transform: translate(-35px, 18px);
            opacity: 1;
          }

          85% {
            transform: translate(-65px, 36px);
            opacity: 1;
          }

          100% {
            transform: translate(-70px, 40px);
            opacity: 0;
          }
        }

        /* Animated light traveling along right connector */
        .arrow-dot-right {
          animation: arrowRight 2.2s linear infinite;
        }

        @keyframes arrowRight {
          0% {
            transform: translate(0, 0);
            opacity: 0;
          }

          15% {
            opacity: 1;
          }

          50% {
            transform: translate(35px, 18px);
            opacity: 1;
          }

          85% {
            transform: translate(65px, 36px);
            opacity: 1;
          }

          100% {
            transform: translate(70px, 40px);
            opacity: 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .scale-balance,
          .left-pan,
          .right-pan,
          .cloud-left,
          .cloud-right,
          .arrow-dot-left,
          .arrow-dot-right {
            animation: none;
          }
        }

        @media (max-width: 700px) {
          .legal-scale-animation {
            width:   100% !important;
            height: auto !important;
            min-height: 400px;
          }
        }
      `}</style>
    </div>
  )
}