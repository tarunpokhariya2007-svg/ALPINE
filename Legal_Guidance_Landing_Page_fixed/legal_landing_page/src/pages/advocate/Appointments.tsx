import { useEffect, useState } from 'react'
import { Video, MapPin, Check, X, Calendar, UserRound } from 'lucide-react'

const API_URL = 'https://legal-ai-z7vb.onrender.com'

interface Appointment {
  id: number
  citizen_name: string
  citizen_email: string
  citizen_phone: string
  date: string
  time: string
  mode: string
  status: 'confirmed' | 'pending' | 'declined'
}

export default function Appointments() {
  const [appts, setAppts] = useState<Appointment[]>([])
  const [filter, setFilter] = useState<'All' | 'confirmed' | 'pending'>('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadAppointments() {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Please log in again.')

      const response = await fetch(`${API_URL}/api/appointments`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await response.json().catch(() => ({}))
      if (!response.ok || !data.success) throw new Error(data.message || 'Failed to load appointments')

      setAppts(Array.isArray(data.appointments) ? data.appointments : [])
      setError('')
    } catch (err: any) {
      console.error('LOAD APPOINTMENTS ERROR:', err)
      setError(err?.message || 'Failed to load appointments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadAppointments() }, [])

  async function respond(id: number, status: 'confirmed' | 'declined') {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/appointments/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok || !data.success) throw new Error(data.message || 'Failed to update appointment')
      setAppts(prev => prev.map(a => a.id === id ? { ...a, status } : a))
    } catch (err: any) {
      setError(err?.message || 'Failed to update appointment')
    }
  }

  const visible = appts.filter(a => a.status !== 'declined' && (filter === 'All' || a.status === filter))
  const confirmedCount = appts.filter(a => a.status === 'confirmed').length
  const pendingCount = appts.filter(a => a.status === 'pending').length

  return (
    <div className="page-enter">
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.03em' }}>Appointments</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 2 }}>{confirmedCount} confirmed · {pendingCount} pending</p>
      </div>

      {error && <div style={{ marginBottom: 16, padding: '12px 14px', borderRadius: 10, background: '#FEE2E2', color: '#B91C1C', fontSize: '0.85rem' }}>{error}</div>}

      <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
        {(['All', 'confirmed', 'pending'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: '7px 14px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', border: '1px solid var(--border)', textTransform: 'capitalize', background: filter === f ? 'var(--emerald)' : 'var(--bg-secondary)', color: filter === f ? 'white' : 'var(--text-muted)' }}>{f}</button>
        ))}
      </div>

      {loading ? (
        <div className="card" style={{ padding: 50, textAlign: 'center', color: 'var(--text-muted)' }}>Loading real appointments…</div>
      ) : visible.length === 0 ? (
        <div className="card" style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
          <UserRound size={36} style={{ marginBottom: 12 }} />
          <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 5 }}>No appointments yet</div>
          <div style={{ fontSize: '0.85rem' }}>Appointments booked by citizens will appear here.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {visible.map(a => (
            <div key={a.id} className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <div className="avatar" style={{ width: 42, height: 42, fontSize: '0.85rem' }}>{a.citizen_name?.split(/\s+/).map(x => x[0]).join('').slice(0, 2).toUpperCase() || 'C'}</div>
              <div style={{ flex: 1, minWidth: 160 }}>
                <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.9rem' }}>{a.citizen_name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>{a.citizen_email || a.citizen_phone || 'Citizen'}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', color: 'var(--text-muted)' }}><Calendar size={13} /> {String(a.date).slice(0, 10)}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{a.mode === 'video' ? <Video size={13} /> : <MapPin size={13} />} {a.time} · {a.mode === 'video' ? 'Video' : 'In-Person'}</div>
              {a.status === 'pending' ? (
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => respond(a.id, 'declined')} style={{ padding: '7px 10px', borderRadius: 7, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', fontWeight: 600 }}><X size={13} /> Decline</button>
                  <button onClick={() => respond(a.id, 'confirmed')} className="btn-emerald" style={{ padding: '7px 10px', borderRadius: 7, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', fontWeight: 600 }}><Check size={13} /> Confirm</button>
                </div>
              ) : <span className="badge" style={{ background: 'var(--emerald-subtle)', color: 'var(--emerald)' }}>Confirmed</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
