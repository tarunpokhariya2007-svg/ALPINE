import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import {
  ArrowLeft,
  FileText,
  MessageSquare,
  Brain,
  StickyNote,
  FolderOpen,
  CalendarDays,
  Shield,
  Loader2,
} from 'lucide-react'

const API_BASE = 'https://legal-ai-z7vb.onrender.com'

type CaseStatus = 'open' | 'in_progress' | 'resolved' | 'closed'

interface CaseItem {
  id: number
  user_id: number
  title: string
  description: string
  category: string
  severity: string
  status: CaseStatus
  created_at: string
  updated_at: string
}

const statusMap: Record<
  CaseStatus,
  { label: string; color: string; background: string }
> = {
  open: {
    label: 'Active',
    color: 'var(--blue)',
    background: 'var(--blue-subtle)',
  },
  in_progress: {
    label: 'In Progress',
    color: '#F59E0B',
    background: 'rgba(245,158,11,0.1)',
  },
  resolved: {
    label: 'Resolved',
    color: 'var(--emerald)',
    background: 'var(--emerald-subtle)',
  },
  closed: {
    label: 'Closed',
    color: 'var(--text-muted)',
    background: 'rgba(120,120,120,0.1)',
  },
}

export default function CaseWorkspace() {
  const { caseId } = useParams()
  const navigate = useNavigate()

  const [caseItem, setCaseItem] = useState<CaseItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadCase = async () => {
      const token = localStorage.getItem('token')

      if (!token) {
        navigate('/login')
        return
      }

      const id = Number(caseId)

      if (!Number.isInteger(id) || id <= 0) {
        setError('Invalid case.')
        setLoading(false)
        return
      }

      try {
        const response = await fetch(
          `${API_BASE}/api/cases/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        const data = await response.json()

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || 'Failed to load case.'
          )
        }

        setCaseItem(data.case)
      } catch (err) {
        console.error('LOAD CASE ERROR:', err)

        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load case.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadCase()
  }, [caseId, navigate])

  if (loading) {
    return (
      <div
        className="card"
        style={{
          padding: 70,
          textAlign: 'center',
        }}
      >
        <Loader2
          size={30}
          style={{
            color: 'var(--blue)',
            animation: 'spin 1s linear infinite',
          }}
        />

        <div
          style={{
            marginTop: 12,
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
          }}
        >
          Loading case workspace...
        </div>

        <style>
          {`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    )
  }

  if (error || !caseItem) {
    return (
      <div
        className="card"
        style={{
          padding: 50,
          textAlign: 'center',
        }}
      >
        <FolderOpen
          size={36}
          color="var(--text-subtle)"
        />

        <h2
          style={{
            color: 'var(--text)',
            fontSize: '1.05rem',
            marginTop: 12,
          }}
        >
          Case unavailable
        </h2>

        <p
          style={{
            color: 'var(--text-muted)',
            fontSize: '0.82rem',
          }}
        >
          {error || 'This case could not be found.'}
        </p>

        <Link
          to="/dashboard/cases"
          className="btn-primary"
          style={{
            display: 'inline-flex',
            marginTop: 12,
            padding: '9px 15px',
            borderRadius: 8,
            textDecoration: 'none',
            fontSize: '0.8rem',
            fontWeight: 650,
          }}
        >
          Back to My Cases
        </Link>
      </div>
    )
  }

  const status = statusMap[caseItem.status]

  const formatDate = (value: string) => {
    if (!value) return ''

    return new Date(value).toLocaleDateString(
      'en-IN',
      {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }
    )
  }

  const workspaceItems = [
    {
      icon: FileText,
      title: 'Documents',
      description:
        'Keep documents related to this case together.',
      path: '/dashboard/documents',
    },
    {
      icon: Brain,
      title: 'AI Analysis',
      description:
        'Analyze this legal matter with Nyaya AI.',
      path: '/dashboard/ai-assistant',
    },
    {
      icon: MessageSquare,
      title: 'Case Conversations',
      description:
        'Continue discussions related to this case.',
      path: '/dashboard/ai-assistant',
    },
    {
      icon: StickyNote,
      title: 'Notes',
      description:
        'Keep your own notes and important reminders.',
      path: '#notes',
    },
  ]

  return (
    <div className="page-enter">
      <button
        type="button"
        onClick={() => navigate('/dashboard/cases')}
        style={{
          border: 'none',
          background: 'transparent',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          cursor: 'pointer',
          padding: 0,
          marginBottom: 20,
          fontSize: '0.82rem',
          fontWeight: 600,
        }}
      >
        <ArrowLeft size={15} />
        My Cases
      </button>

      <div
        className="card"
        style={{
          padding: 22,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 16,
            alignItems: 'flex-start',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                marginBottom: 9,
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: 'var(--blue-subtle)',
                  color: 'var(--blue)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <FolderOpen size={19} />
              </div>

              <div>
                <div
                  style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.7rem',
                  }}
                >
                  Case #{caseItem.id}
                </div>

                <h1
                  style={{
                    margin: 0,
                    color: 'var(--text)',
                    fontSize: '1.35rem',
                    fontWeight: 800,
                    letterSpacing: '-0.025em',
                  }}
                >
                  {caseItem.title}
                </h1>
              </div>
            </div>

            <p
              style={{
                color: 'var(--text-muted)',
                fontSize: '0.84rem',
                lineHeight: 1.6,
                margin: '10px 0 0',
                maxWidth: 800,
              }}
            >
              {caseItem.description}
            </p>
          </div>

          <span
            className="badge"
            style={{
              color: status.color,
              background: status.background,
              whiteSpace: 'nowrap',
            }}
          >
            {status.label}
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 18,
            flexWrap: 'wrap',
            marginTop: 18,
            paddingTop: 15,
            borderTop: '1px solid var(--border)',
            color: 'var(--text-muted)',
            fontSize: '0.75rem',
          }}
        >
          <span>
            <Shield
              size={13}
              style={{
                verticalAlign: 'middle',
                marginRight: 5,
              }}
            />
            {caseItem.category}
          </span>

          <span>
            Priority: <strong>{caseItem.severity}</strong>
          </span>

          <span>
            <CalendarDays
              size={13}
              style={{
                verticalAlign: 'middle',
                marginRight: 5,
              }}
            />
            Created {formatDate(caseItem.created_at)}
          </span>
        </div>
      </div>

      <div style={{ marginBottom: 13 }}>
        <h2
          style={{
            color: 'var(--text)',
            fontSize: '1rem',
            fontWeight: 750,
            margin: 0,
          }}
        >
          Case Workspace
        </h2>

        <p
          style={{
            color: 'var(--text-muted)',
            fontSize: '0.78rem',
            marginTop: 4,
          }}
        >
          Everything related to this legal matter belongs here.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 12,
        }}
      >
        {workspaceItems.map(item => {
          const Icon = item.icon

          if (item.path === '#notes') {
            return (
              <div
                key={item.title}
                className="card card-interactive"
                style={{
                  padding: 19,
                  cursor: 'default',
                }}
              >
                <Icon
                  size={20}
                  color="var(--blue)"
                />

                <div
                  style={{
                    marginTop: 13,
                    color: 'var(--text)',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                  }}
                >
                  {item.title}
                </div>

                <div
                  style={{
                    marginTop: 5,
                    color: 'var(--text-muted)',
                    fontSize: '0.75rem',
                    lineHeight: 1.5,
                  }}
                >
                  {item.description}
                </div>
              </div>
            )
          }

          return (
            <Link
              key={item.title}
              to={item.path}
              className="card card-interactive"
              style={{
                padding: 19,
                textDecoration: 'none',
                display: 'block',
              }}
            >
              <Icon
                size={20}
                color="var(--blue)"
              />

              <div
                style={{
                  marginTop: 13,
                  color: 'var(--text)',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                }}
              >
                {item.title}
              </div>

              <div
                style={{
                  marginTop: 5,
                  color: 'var(--text-muted)',
                  fontSize: '0.75rem',
                  lineHeight: 1.5,
                }}
              >
                {item.description}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}