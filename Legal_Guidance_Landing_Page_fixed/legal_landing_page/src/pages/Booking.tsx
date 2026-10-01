import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { Calendar, Clock, Video, MapPin, CheckCircle, ChevronLeft, ChevronRight, Award } from 'lucide-react'

const API_URL = 'https://legal-ai-z7vb.onrender.com'
const timeSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM']
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

interface Advocate {
  id: string
  name: string
  email: string
  phone: string
}

interface Appointment {
  id: number
  date: string
  time: string
  mode: string
  status: string
  advocate_name: string
}

function getDaysInMonth(year: number, month: number) { return new Date(year, month + 1, 0).getDate() }
function getFirstDay(year: number, month: number) { return new Date(year, month, 1).getDay() }

function toISODate(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export default function Booking() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const advocateId = searchParams.get('advocateId') || ''

  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [mode, setMode] = useState<'video' | 'inperson'>('video')
  const [advocate, setAdvocate] = useState<Advocate | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)
  const [bookedAppointment, setBookedAppointment] = useState<Appointment | null>(null)
  const [error, setError] = useState('')

  const token = localStorage.getItem('token')

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        setError('')

        if (!advocateId) throw new Error('No advocate selected. Please return to Find an Advocate.')

        const advocateResponse = await fetch(`${API_URL}/api/lawyers`)
        const advocateData = await advocateResponse.json().catch(() => ({}))
        if (!advocateResponse.ok || !advocateData.success) throw new Error(advocateData.message || 'Failed to load advocate')

        const row = (Array.isArray(advocateData.lawyers) ? advocateData.lawyers : []).find((item: any) => String(item.id) === String(advocateId))
        if (!row) throw new Error('The selected advocate could not be found.')

        if (!cancelled) {
          setAdvocate({
            id: String(row.id),
            name: String(row.full_name || 'Advocate'),
            email: String(row.email || ''),
            phone: String(row.phone || ''),
          })
        }

        if (token) {
          const appointmentsResponse = await fetch(`${API_URL}/api/appointments`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          const appointmentData = await appointmentsResponse.json().catch(() => ({}))
          if (appointmentsResponse.ok && appointmentData.success && !cancelled) {
            setAppointments(Array.isArray(appointmentData.appointments) ? appointmentData.appointments : [])
          }
        }
      } catch (err: any) {
        console.error('BOOKING LOAD ERROR:', err)
        if (!cancelled) setError(err?.message || 'Unable to load booking information')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [advocateId, token])

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDay(year, month)

  const bookedSlotKeys = useMemo(() => {
    return new Set(
      appointments
        .filter(a => a.status !== 'declined')
        .map(a => `${String(a.date).slice(0, 10)}|${a.time}`)
    )
  }, [appointments])

  const selectedDate = selectedDay ? toISODate(year, month, selectedDay) : ''

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11) } else setMonth(m => m - 1)
    setSelectedDay(null); setSelectedTime(null)
  }

  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0) } else setMonth(m => m + 1)
    setSelectedDay(null); setSelectedTime(null)
  }

  async function confirmBooking() {
    if (!token) {
      setError('Please log in before booking an appointment.')
      return
    }
    if (!advocate || !selectedDate || !selectedTime) return

    try {
      setBooking(true)
      setError('')

      const response = await fetch(`${API_URL}/api/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          advocateId: advocate.id,
          date: selectedDate,
          time: selectedTime,
          mode,
        }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to book appointment')
      }

      setBookedAppointment(data.appointment)
    } catch (err: any) {
      console.error('BOOK APPOINTMENT ERROR:', err)
      setError(err?.message || 'Unable to book appointment')
    } finally {
      setBooking(false)
    }
  }

  if (bookedAppointment) {
    return (
      <div className="page-enter" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <div className="card" style={{ padding: 48, textAlign: 'center', maxWidth: 480 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--emerald-subtle)', border: '2px solid var(--emerald-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <CheckCircle size={34} style={{ color: 'var(--emerald)' }} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>Booking Request Sent!</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.6 }}>
            Your appointment request with <strong>{advocate?.name}</strong> has been saved. The advocate can confirm or decline it from their dashboard.
          </p>
          <div style={{ padding: '14px 18px', borderRadius: 10, background: 'var(--bg-secondary)', marginBottom: 24, textAlign: 'left' }}>
            <InfoRow label="Date" value={`${selectedDay} ${months[month]} ${year}`} />
            <InfoRow label="Time" value={selectedTime || ''} />
            <InfoRow label="Mode" value={mode === 'video' ? 'Video Call' : 'In-Person'} />
            <InfoRow label="Status" value="Pending confirmation" />
          </div>
          <button onClick={() => navigate('/dashboard')} className="btn-primary" style={{ width: '100%', padding: 12, borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700 }}>
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-enter">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 15, alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>Book Consultation</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Choose a date, time and consultation mode.</p>
        </div>
        <button onClick={() => navigate('/dashboard/advocates')} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-muted)', cursor: 'pointer' }}>
          Back to Advocates
        </button>
      </div>

      {error && <div style={{ marginBottom: 18, padding: '12px 14px', borderRadius: 10, background: '#FEE2E2', color: '#B91C1C', fontSize: '0.85rem' }}>{error}</div>}

      {loading ? (
        <div className="card" style={{ padding: 50, textAlign: 'center', color: 'var(--text-muted)' }}>Loading booking information…</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }} className="booking-grid">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <button onClick={prevMonth} style={navButtonStyle}><ChevronLeft size={16} /></button>
                <span style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.95rem' }}>{months[month]} {year}</span>
                <button onClick={nextMonth} style={navButtonStyle}><ChevronRight size={16} /></button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 8 }}>
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d} style={{ textAlign: 'center', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', padding: '4px 0' }}>{d}</div>)}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
                {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1
                  const date = new Date(year, month, day)
                  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
                  const isPast = date < todayDate
                  const isSelected = selectedDay === day
                  return (
                    <button key={day} onClick={() => { if (!isPast) { setSelectedDay(day); setSelectedTime(null) } }} disabled={isPast}
                      style={{ height: 36, borderRadius: 8, border: 'none', cursor: isPast ? 'default' : 'pointer', fontSize: '0.82rem', fontWeight: isSelected ? 700 : 400, background: isSelected ? 'var(--blue)' : 'transparent', color: isSelected ? 'white' : isPast ? 'var(--text-subtle)' : 'var(--text)' }}>
                      {day}
                    </button>
                  )
                })}
              </div>
            </div>

            {selectedDay && (
              <div className="card" style={{ padding: 20 }}>
                <h3 style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.9rem', marginBottom: 14 }}>
                  <Clock size={15} style={{ marginRight: 6, verticalAlign: 'middle', color: 'var(--blue)' }} />
                  Time Slots — {selectedDay} {months[month]}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {timeSlots.map(t => {
                    const booked = bookedSlotKeys.has(`${selectedDate}|${t}`)
                    const selected = selectedTime === t
                    return <button key={t} onClick={() => !booked && setSelectedTime(t)} disabled={booked}
                      style={{ padding: 9, borderRadius: 8, fontSize: '0.8rem', fontWeight: 600, cursor: booked ? 'default' : 'pointer', border: `1px solid ${selected ? 'var(--blue)' : 'var(--border)'}`, background: selected ? 'var(--blue)' : booked ? 'var(--bg-secondary)' : 'var(--bg-card)', color: selected ? 'white' : booked ? 'var(--text-subtle)' : 'var(--text)', textDecoration: booked ? 'line-through' : 'none' }}>
                      {t}
                    </button>
                  })}
                </div>
              </div>
            )}

            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.9rem', marginBottom: 14 }}>Consultation Mode</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {([{ id: 'video' as const, icon: Video, label: 'Video Call', sub: 'Online consultation' }, { id: 'inperson' as const, icon: MapPin, label: 'In-Person', sub: 'Location to be confirmed' }]).map(m => (
                  <button key={m.id} onClick={() => setMode(m.id)} style={{ padding: 14, borderRadius: 10, border: `1.5px solid ${mode === m.id ? 'var(--blue)' : 'var(--border)'}`, background: mode === m.id ? 'var(--blue-subtle)' : 'var(--bg-secondary)', cursor: 'pointer', textAlign: 'left' }}>
                    <m.icon size={18} style={{ color: mode === m.id ? 'var(--blue)' : 'var(--text-muted)', marginBottom: 6 }} />
                    <div style={{ fontWeight: 600, color: mode === m.id ? 'var(--blue)' : 'var(--text)', fontSize: '0.875rem' }}>{m.label}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{m.sub}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card" style={{ padding: 22 }}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                <div className="avatar" style={{ width: 52, height: 52, fontSize: '1rem' }}>
                  {(advocate?.name || 'Advocate').split(/\s+/).map(v => v[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.95rem' }}>{advocate?.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}><Award size={11} style={{ color: 'var(--emerald)' }} /><span style={{ fontSize: '0.7rem', color: 'var(--emerald)', fontWeight: 600 }}>Registered Advocate</span></div>
                </div>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                <div>Email: {advocate?.email || '—'}</div>
                <div>Phone: {advocate?.phone || '—'}</div>
              </div>
            </div>

            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.9rem', marginBottom: 14 }}>Booking Summary</h3>
              <InfoRow label="Date" value={selectedDay ? `${selectedDay} ${months[month]} ${year}` : '—'} />
              <InfoRow label="Time" value={selectedTime || '—'} />
              <InfoRow label="Mode" value={mode === 'video' ? 'Video Call' : 'In-Person'} />
              <InfoRow label="Fee" value="Not set" />
              <div style={{ height: 1, background: 'var(--border)', margin: '14px 0' }} />
              <button onClick={confirmBooking} disabled={booking || !selectedDay || !selectedTime || !advocate} className="btn-primary" style={{ width: '100%', padding: 13, borderRadius: 10, border: 'none', cursor: booking || !selectedDay || !selectedTime ? 'not-allowed' : 'pointer', fontWeight: 700, opacity: booking || !selectedDay || !selectedTime ? 0.5 : 1 }}>
                {booking ? 'Booking…' : 'Confirm Booking Request'}
              </button>
              <p style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 10 }}>No fake payment or fee is charged. Payment can be added later when a real payment gateway is connected.</p>
            </div>
          </div>
        </div>
      )}

      <style>{`@media (max-width: 900px) { .booking-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '4px 0', fontSize: '0.84rem' }}><span style={{ color: 'var(--text-muted)' }}>{label}</span><span style={{ fontWeight: 600, color: 'var(--text)', textAlign: 'right' }}>{value}</span></div>
}

const navButtonStyle = { width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' } as const
