import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { Search, MapPin, Mail, Phone, Clock, Filter, ChevronDown, Award, UserRound } from 'lucide-react'

const API_URL = 'https://legal-ai-z7vb.onrender.com'

interface Advocate {
  id: string
  name: string
  initials: string
  email: string
  phone: string
  createdAt: string
}

const colors = ['#2563EB', '#7C3AED', '#059669', '#EF4444', '#F59E0B', '#06B6D4']

export default function AdvocateListing() {
  const [search, setSearch] = useState('')
  const [city, setCity] = useState('All Cities')
  const [showFilters, setShowFilters] = useState(false)
  const [advocates, setAdvocates] = useState<Advocate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadAdvocates() {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(`${API_URL}/api/lawyers`)
        const data = await response.json().catch(() => ({}))

        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Failed to load advocates')
        }

        const rows = Array.isArray(data.lawyers) ? data.lawyers : []

        const formatted: Advocate[] = rows.map((lawyer: any, index: number) => {
          const name = String(lawyer.full_name || 'Advocate').trim()
          const initials = name
            .split(/\s+/)
            .filter(Boolean)
            .map((part: string) => part[0])
            .join('')
            .substring(0, 2)
            .toUpperCase()

          return {
            id: String(lawyer.id),
            name,
            initials: initials || 'A',
            email: String(lawyer.email || ''),
            phone: String(lawyer.phone || ''),
            createdAt: String(lawyer.created_at || ''),
          }
        })

        if (!cancelled) setAdvocates(formatted)
      } catch (err: any) {
        console.error('LOAD ADVOCATES ERROR:', err)
        if (!cancelled) setError(err?.message || 'Unable to load advocates')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadAdvocates()
    return () => { cancelled = true }
  }, [])

  const cities = useMemo(() => ['All Cities'], [])

  const filtered = advocates.filter(a => {
    const q = search.trim().toLowerCase()
    return !q || a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q) || a.phone.toLowerCase().includes(q)
  })

  return (
    <div className="page-enter">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.03em', marginBottom: 4 }}>
          Find an Advocate
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          {loading ? 'Loading registered advocates…' : `${advocates.length} registered advocate${advocates.length === 1 ? '' : 's'}`}
        </p>
      </div>

      <div className="card" style={{ padding: 16, marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: 220, position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              className="input"
              placeholder="Search by advocate name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 32 }}
            />
          </div>

          <SelectFilter label="City" value={city} options={cities} onChange={setCity} />

          <button
            onClick={() => setShowFilters(v => !v)}
            style={{
              padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border)',
              background: showFilters ? 'var(--blue-subtle)' : 'var(--bg-secondary)',
              color: showFilters ? 'var(--blue)' : 'var(--text-muted)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', fontWeight: 500,
            }}
          >
            <Filter size={14} /> More Filters
          </button>
        </div>

        {showFilters && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            Specialization, rating, fee and availability are shown only when those fields exist in the database. No demo values are used here.
          </div>
        )}
      </div>

      {error && (
        <div style={{ marginBottom: 18, padding: '12px 14px', borderRadius: 10, background: '#FEE2E2', color: '#B91C1C', fontSize: '0.85rem' }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Showing <strong style={{ color: 'var(--text)' }}>{filtered.length}</strong> registered advocates
        </span>
      </div>

      {loading ? (
        <div className="card" style={{ padding: 50, textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading real advocate profiles…
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: 60, textAlign: 'center' }}>
          <UserRound size={38} style={{ color: 'var(--text-subtle)', marginBottom: 12 }} />
          <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>No registered advocates found</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            An advocate will appear here automatically after registering with the Advocate role.
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }} className="advocates-grid">
          {filtered.map((a, index) => (
            <div key={a.id} className="card card-interactive" style={{ padding: 22 }}>
              <div style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
                <div className="avatar" style={{
                  width: 56, height: 56, fontSize: '1rem',
                  background: `linear-gradient(135deg, ${colors[index % colors.length]}, ${colors[index % colors.length]}88)`,
                }}>
                  {a.initials}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.95rem' }}>{a.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                        <Award size={11} style={{ color: 'var(--emerald)' }} />
                        <span style={{ fontSize: '0.7rem', color: 'var(--emerald)', fontWeight: 600 }}>Registered Advocate</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 16 }}>
                <ContactRow icon={Mail} text={a.email || 'Email not provided'} />
                <ContactRow icon={Phone} text={a.phone || 'Phone not provided'} />
                <ContactRow icon={MapPin} text="Location not provided" />
              </div>

              <div style={{ padding: 12, borderRadius: 9, background: 'var(--bg-secondary)', color: 'var(--text-muted)', fontSize: '0.78rem', lineHeight: 1.5, marginBottom: 16 }}>
                This profile is loaded directly from the registered advocate account. Specialization, rating, experience and consultation fee are not invented when they are not stored in the database.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                <button
                  onClick={() => setExpandedId(v => v === a.id ? null : a.id)}
                  style={{
                    padding: '8px 14px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600,
                    border: '1px solid var(--border)', background: expandedId === a.id ? 'var(--blue-subtle)' : 'var(--bg-secondary)',
                    color: expandedId === a.id ? 'var(--blue)' : 'var(--text-muted)', cursor: 'pointer',
                  }}
                >
                  {expandedId === a.id ? 'Hide Profile' : 'View Profile'}
                </button>

                <Link
                  to={`/dashboard/booking?advocateId=${encodeURIComponent(a.id)}`}
                  className="btn-primary"
                  style={{ padding: '8px 16px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5 }}
                >
                  <Clock size={13} /> Book Consultation
                </Link>
              </div>

              {expandedId === a.id && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div><strong style={{ color: 'var(--text)' }}>Account ID:</strong> {a.id}</div>
                    <div><strong style={{ color: 'var(--text)' }}>Role:</strong> Advocate</div>
                    <div><strong style={{ color: 'var(--text)' }}>Email:</strong> {a.email || '—'}</div>
                    <div><strong style={{ color: 'var(--text)' }}>Phone:</strong> {a.phone || '—'}</div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <style>{`@media (max-width: 900px) { .advocates-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  )
}

function ContactRow({ icon: Icon, text }: { icon: typeof Mail; text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
      <Icon size={14} />
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{text}</span>
    </div>
  )
}

function SelectFilter({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div style={{ position: 'relative' }}>
      <select
        aria-label={label}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          padding: '8px 28px 8px 12px', borderRadius: 8, border: '1px solid var(--border)',
          background: 'var(--bg-secondary)', color: 'var(--text)', fontSize: '0.875rem',
          cursor: 'pointer', appearance: 'none', outline: 'none', fontFamily: 'inherit',
        }}
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown size={13} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
    </div>
  )
}
