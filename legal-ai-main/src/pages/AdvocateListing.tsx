import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import {
  Search,
  Star,
  MapPin,
  Briefcase,
  Globe,
  Clock,
  Filter,
  ChevronDown,
  Award,
} from 'lucide-react'

const API_URL = 'http://localhost:5001'

const cities = [
  'All Cities',
  'New Delhi',
  'Mumbai',
  'Kolkata',
  'Hyderabad',
  'Ahmedabad',
  'Bangalore',
  'Lucknow',
  'Chennai',
]

const areas = [
  'All Areas',
  'Property Law',
  'Criminal Defence',
  'Family Law',
  'Consumer Law',
  'Corporate Law',
  'Employment Law',
  'Tax Law',
  'Immigration',
]

const feeRanges = [
  'Any Fee',
  'Under ₹1,000',
  '₹1,000–₹1,500',
  '₹1,500–₹2,000',
  'Above ₹2,000',
]

export default function AdvocateListing() {
  const [search, setSearch] = useState('')
  const [city, setCity] = useState('All Cities')
  const [area, setArea] = useState('All Areas')
  const [feeRange, setFeeRange] = useState('Any Fee')
  const [minRating, setMinRating] = useState(0)
  const [showFilters, setShowFilters] = useState(false)

  const [availability, setAvailability] =
    useState<'All' | 'Available Now' | 'Busy'>('All')

  const [expandedId, setExpandedId] =
    useState<string | null>(null)

  const [advocates, setAdvocates] =
    useState<any[]>([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')


  // =====================================================
  // LOAD REAL ADVOCATES FROM BACKEND
  // =====================================================

  useEffect(() => {

    const loadAdvocates = async () => {

      try {

        setLoading(true)
        setError('')

        const response = await fetch(
          `${API_URL}/api/lawyers`
        )

        if (!response.ok) {
          throw new Error(
            `Server error: ${response.status}`
          )
        }

        const data = await response.json()

        console.log(
          'ADVOCATES FROM BACKEND:',
          data
        )


        if (
          !data.success ||
          !Array.isArray(data.lawyers)
        ) {

          throw new Error(
            'Invalid advocate data received from server.'
          )

        }


        // -------------------------------------------------
        // Convert backend user data to card data
        // -------------------------------------------------

        const formatted =
          data.lawyers.map(
            (lawyer: any) => {

              const name =
                lawyer.full_name ||
                'Advocate'


              const initials =
                name
                  .split(' ')
                  .filter(Boolean)
                  .map(
                    (n: string) =>
                      n[0]
                  )
                  .join('')
                  .substring(0, 2)
                  .toUpperCase()


              return {

                id:
                  String(lawyer.id),

                name,

                initials,

                color:
                  '#2563EB',

                // We don't have practice-area
                // data in users table yet.
                specializations:
                  ['General Practice'],

                // No rating column in current
                // users table.
                rating:
                  0,

                reviews:
                  0,

                // No experience column yet.
                experience:
                  0,

                languages:
                  ['English', 'Hindi'],

                // No consultation fee column yet.
                fee:
                  0,

                // No city column yet.
                city:
                  'India',

                court:
                  'High Court',

                available:
                  true,

                about:
                  'Registered advocate available for legal consultation.',

                email:
                  lawyer.email || '',

                phone:
                  lawyer.phone || '',

              }

            }
          )


        setAdvocates(formatted)

      } catch (err: any) {

        console.error(
          'LOAD ADVOCATES ERROR:',
          err
        )

        setError(
          err.message ||
          'Failed to load advocates.'
        )

        setAdvocates([])

      } finally {

        setLoading(false)

      }

    }


    loadAdvocates()

  }, [])


  // =====================================================
  // FILTER
  // =====================================================

  const filtered =
    advocates.filter(a => {

      const searchText =
        search.toLowerCase()


      const matchSearch =
        !search ||
        a.name
          .toLowerCase()
          .includes(searchText) ||
        a.specializations.some(
          (s: string) =>
            s
              .toLowerCase()
              .includes(searchText)
        )


      const matchCity =
        city === 'All Cities' ||
        a.city === city


      const matchArea =
        area === 'All Areas' ||
        a.specializations.some(
          (s: string) =>
            s === area
        )


      const matchRating =
        a.rating >= minRating


      const matchFee =
        feeRange === 'Any Fee' ||

        (
          feeRange === 'Under ₹1,000' &&
          a.fee < 1000
        ) ||

        (
          feeRange === '₹1,000–₹1,500' &&
          a.fee >= 1000 &&
          a.fee <= 1500
        ) ||

        (
          feeRange === '₹1,500–₹2,000' &&
          a.fee > 1500 &&
          a.fee <= 2000
        ) ||

        (
          feeRange === 'Above ₹2,000' &&
          a.fee > 2000
        )


      const matchAvailability =
        availability === 'All' ||

        (
          availability === 'Available Now' &&
          a.available
        ) ||

        (
          availability === 'Busy' &&
          !a.available
        )


      return (
        matchSearch &&
        matchCity &&
        matchArea &&
        matchRating &&
        matchFee &&
        matchAvailability
      )

    })


  // =====================================================
  // UI
  // =====================================================

  return (

    <div className="page-enter">

      {/* Header */}

      <div style={{ marginBottom: 24 }}>

        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            color: 'var(--text)',
            letterSpacing: '-0.03em',
            marginBottom: 4,
          }}
        >
          Find an Advocate
        </h1>

        <p
          style={{
            color: 'var(--text-muted)',
            fontSize: '0.9rem',
          }}
        >
          {advocates.length} registered advocates
        </p>

      </div>


      {/* Search + filters */}

      <div
        className="card"
        style={{
          padding: 16,
          marginBottom: 20,
        }}
      >

        <div
          style={{
            display: 'flex',
            gap: 10,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >

          <div
            style={{
              flex: 1,
              minWidth: 220,
              position: 'relative',
            }}
          >

            <Search
              size={15}
              style={{
                position: 'absolute',
                left: 10,
                top: '50%',
                transform:
                  'translateY(-50%)',
                color:
                  'var(--text-muted)',
              }}
            />

            <input
              className="input"
              placeholder="Search by name or specialization..."
              value={search}
              onChange={e =>
                setSearch(e.target.value)
              }
              style={{
                paddingLeft: 32,
              }}
            />

          </div>


          <SelectFilter
            label="City"
            value={city}
            options={cities}
            onChange={setCity}
          />

          <SelectFilter
            label="Practice Area"
            value={area}
            options={areas}
            onChange={setArea}
          />

          <SelectFilter
            label="Fee Range"
            value={feeRange}
            options={feeRanges}
            onChange={setFeeRange}
          />


          <button
            onClick={() =>
              setShowFilters(
                s => !s
              )
            }
            style={{
              padding:
                '8px 14px',
              borderRadius: 8,
              border:
                '1px solid var(--border)',
              background:
                showFilters
                  ? 'var(--blue-subtle)'
                  : 'var(--bg-secondary)',
              color:
                showFilters
                  ? 'var(--blue)'
                  : 'var(--text-muted)',
              cursor:
                'pointer',
              display:
                'flex',
              alignItems:
                'center',
              gap: 6,
              fontSize:
                '0.875rem',
              fontWeight:
                500,
            }}
          >
            <Filter size={14} />
            More Filters
          </button>

        </div>


        {showFilters && (

          <div
            style={{
              marginTop: 14,
              paddingTop: 14,
              borderTop:
                '1px solid var(--border)',
              display:
                'flex',
              gap: 16,
              flexWrap:
                'wrap',
              alignItems:
                'center',
            }}
          >

            <div>

              <label
                style={{
                  fontSize:
                    '0.78rem',
                  fontWeight:
                    600,
                  color:
                    'var(--text-muted)',
                  display:
                    'block',
                  marginBottom:
                    6,
                }}
              >
                Minimum Rating
              </label>

              <div
                style={{
                  display:
                    'flex',
                  gap: 6,
                }}
              >

                {[0, 4, 4.5, 4.8].map(
                  r => (

                    <button
                      key={r}
                      onClick={() =>
                        setMinRating(r)
                      }
                      style={{
                        padding:
                          '5px 12px',
                        borderRadius: 7,
                        fontSize:
                          '0.78rem',
                        fontWeight: 600,
                        border:
                          '1px solid var(--border)',
                        cursor:
                          'pointer',
                        background:
                          minRating === r
                            ? 'var(--blue-subtle)'
                            : 'var(--bg-secondary)',
                        color:
                          minRating === r
                            ? 'var(--blue)'
                            : 'var(--text-muted)',
                      }}
                    >
                      {r === 0
                        ? 'Any'
                        : `${r}+`} ⭐
                    </button>

                  )
                )}

              </div>

            </div>


            <div>

              <label
                style={{
                  fontSize:
                    '0.78rem',
                  fontWeight:
                    600,
                  color:
                    'var(--text-muted)',
                  display:
                    'block',
                  marginBottom:
                    6,
                }}
              >
                Availability
              </label>

              <div
                style={{
                  display:
                    'flex',
                  gap: 6,
                }}
              >

                {(
                  [
                    'All',
                    'Available Now',
                    'Busy',
                  ] as const
                ).map(a => (

                  <button
                    key={a}
                    onClick={() =>
                      setAvailability(a)
                    }
                    style={{
                      padding:
                        '5px 12px',
                      borderRadius: 7,
                      fontSize:
                        '0.78rem',
                      fontWeight: 500,
                      border:
                        '1px solid var(--border)',
                      cursor:
                        'pointer',
                      background:
                        availability === a
                          ? 'var(--blue-subtle)'
                          : 'var(--bg-secondary)',
                      color:
                        availability === a
                          ? 'var(--blue)'
                          : 'var(--text-muted)',
                    }}
                  >
                    {a}
                  </button>

                ))}

              </div>

            </div>

          </div>

        )}

      </div>


      {/* Loading */}

      {loading && (

        <div
          style={{
            padding: 60,
            textAlign:
              'center',
            color:
              'var(--text-muted)',
          }}
        >
          Loading advocates...
        </div>

      )}


      {/* Error */}

      {!loading && error && (

        <div
          className="card"
          style={{
            padding: 30,
            textAlign:
              'center',
          }}
        >

          <div
            style={{
              fontSize:
                '2rem',
              marginBottom:
                10,
            }}
          >
            ⚠️
          </div>

          <div
            style={{
              fontWeight:
                700,
              color:
                'var(--text)',
              marginBottom:
                6,
            }}
          >
            Unable to load advocates
          </div>

          <div
            style={{
              color:
                'var(--text-muted)',
              fontSize:
                '0.9rem',
            }}
          >
            {error}
          </div>

        </div>

      )}


      {/* Results count */}

      {!loading && !error && (

        <div
          style={{
            marginBottom: 16,
            display:
              'flex',
            alignItems:
              'center',
            gap: 8,
          }}
        >

          <span
            style={{
              fontSize:
                '0.875rem',
              color:
                'var(--text-muted)',
            }}
          >
            Showing{' '}

            <strong
              style={{
                color:
                  'var(--text)',
              }}
            >
              {filtered.length}
            </strong>{' '}

            advocates
          </span>


          {(
            city !== 'All Cities' ||
            area !== 'All Areas' ||
            feeRange !== 'Any Fee' ||
            minRating > 0 ||
            availability !== 'All'
          ) && (

            <button
              onClick={() => {

                setCity(
                  'All Cities'
                )

                setArea(
                  'All Areas'
                )

                setFeeRange(
                  'Any Fee'
                )

                setMinRating(0)

                setAvailability(
                  'All'
                )

              }}
              style={{
                fontSize:
                  '0.78rem',
                color:
                  'var(--blue)',
                background:
                  'none',
                border:
                  'none',
                cursor:
                  'pointer',
                fontWeight:
                  500,
              }}
            >
              Clear all filters
            </button>

          )}

        </div>

      )}


      {/* Advocate cards */}

      {!loading &&
        !error &&
        filtered.length > 0 && (

          <div
            style={{
              display:
                'grid',
              gridTemplateColumns:
                'repeat(2, 1fr)',
              gap: 16,
            }}
            className="advocates-grid"
          >

            {filtered.map(a => (

              <div
                key={a.id}
                className="card card-interactive"
                style={{
                  padding: 22,
                }}
              >

                {/* Top */}

                <div
                  style={{
                    display:
                      'flex',
                    gap: 14,
                    marginBottom:
                      14,
                  }}
                >

                  <div
                    className="avatar"
                    style={{
                      width: 56,
                      height: 56,
                      fontSize:
                        '1rem',
                      background:
                        `linear-gradient(135deg, ${a.color}, ${a.color}88)`,
                    }}
                  >
                    {a.initials}
                  </div>


                  <div
                    style={{
                      flex: 1,
                      minWidth: 0,
                    }}
                  >

                    <div
                      style={{
                        display:
                          'flex',
                        alignItems:
                          'flex-start',
                        justifyContent:
                          'space-between',
                        gap: 8,
                      }}
                    >

                      <div>

                        <div
                          style={{
                            fontWeight:
                              700,
                            color:
                              'var(--text)',
                            fontSize:
                              '0.95rem',
                          }}
                        >
                          {a.name}
                        </div>

                        <div
                          style={{
                            display:
                              'flex',
                            alignItems:
                              'center',
                            gap: 6,
                            marginTop:
                              2,
                          }}
                        >

                          <Award
                            size={11}
                            style={{
                              color:
                                'var(--emerald)',
                            }}
                          />

                          <span
                            style={{
                              fontSize:
                                '0.7rem',
                              color:
                                'var(--emerald)',
                              fontWeight:
                                600,
                            }}
                          >
                            Registered Advocate
                          </span>

                        </div>

                      </div>


                      <span
                        style={{
                          padding:
                            '4px 10px',
                          borderRadius:
                            99,
                          fontSize:
                            '0.7rem',
                          fontWeight:
                            700,
                          flexShrink:
                            0,
                          background:
                            a.available
                              ? 'var(--emerald-subtle)'
                              : 'var(--bg-secondary)',
                          color:
                            a.available
                              ? 'var(--emerald)'
                              : 'var(--text-muted)',
                        }}
                      >
                        {a.available
                          ? '● Available'
                          : '○ Busy'}
                      </span>

                    </div>

                  </div>

                </div>


                {/* Specialization */}

                <div
                  style={{
                    display:
                      'flex',
                    gap: 6,
                    flexWrap:
                      'wrap',
                    marginBottom:
                      12,
                  }}
                >

                  {a.specializations.map(
                    (s: string) => (

                      <span
                        key={s}
                        className="badge"
                        style={{
                          background:
                            `color-mix(in srgb, ${a.color} 10%, transparent)`,
                          color:
                            a.color,
                        }}
                      >
                        {s}
                      </span>

                    )
                  )}

                </div>


                <p
                  style={{
                    fontSize:
                      '0.8rem',
                    color:
                      'var(--text-muted)',
                    lineHeight:
                      1.5,
                    marginBottom:
                      14,
                  }}
                >
                  {a.about}
                </p>


                {/* Meta */}

                <div
                  style={{
                    display:
                      'grid',
                    gridTemplateColumns:
                      'repeat(4, 1fr)',
                    gap: 10,
                    marginBottom:
                      14,
                  }}
                >

                  <MetaStat
                    icon={Star}
                    val={
                      a.rating
                        ? `${a.rating}`
                        : 'New'
                    }
                    sub={
                      a.reviews
                        ? `${a.reviews} reviews`
                        : 'No reviews'
                    }
                    iconColor="#F59E0B"
                    fill
                  />

                  <MetaStat
                    icon={Briefcase}
                    val={
                      a.experience
                        ? `${a.experience}yr`
                        : '—'
                    }
                    sub="experience"
                  />

                  <MetaStat
                    icon={MapPin}
                    val={a.city}
                    sub={a.court}
                  />

                  <MetaStat
                    icon={Globe}
                    val={
                      a.languages.length.toString()
                    }
                    sub="languages"
                  />

                </div>


                {/* Languages */}

                <div
                  style={{
                    display:
                      'flex',
                    gap: 6,
                    flexWrap:
                      'wrap',
                    marginBottom:
                      16,
                  }}
                >

                  {a.languages.map(
                    (l: string) => (

                      <span
                        key={l}
                        style={{
                          padding:
                            '2px 8px',
                          borderRadius:
                            6,
                          fontSize:
                            '0.68rem',
                          fontWeight:
                            500,
                          background:
                            'var(--bg-secondary)',
                          color:
                            'var(--text-muted)',
                          border:
                            '1px solid var(--border)',
                        }}
                      >
                        {l}
                      </span>

                    )
                  )}

                </div>


                {/* Footer */}

                <div
                  style={{
                    display:
                      'flex',
                    alignItems:
                      'center',
                    justifyContent:
                      'space-between',
                    borderTop:
                      '1px solid var(--border)',
                    paddingTop:
                      14,
                  }}
                >

                  <div>

                    <div
                      style={{
                        fontSize:
                          '1.2rem',
                        fontWeight:
                          800,
                        color:
                          'var(--text)',
                      }}
                    >
                      {a.fee > 0
                        ? `₹${a.fee.toLocaleString()}`
                        : 'Contact'}
                    </div>

                    <div
                      style={{
                        fontSize:
                          '0.7rem',
                        color:
                          'var(--text-muted)',
                      }}
                    >
                      consultation
                    </div>

                  </div>


                  <div
                    style={{
                      display:
                        'flex',
                      gap: 8,
                    }}
                  >

                    <button
                      onClick={() =>
                        setExpandedId(
                          id =>
                            id === a.id
                              ? null
                              : a.id
                        )
                      }
                      style={{
                        padding:
                          '8px 14px',
                        borderRadius:
                          8,
                        fontSize:
                          '0.8rem',
                        fontWeight:
                          600,
                        border:
                          '1px solid var(--border)',
                        background:
                          expandedId === a.id
                            ? 'var(--blue-subtle)'
                            : 'var(--bg-secondary)',
                        color:
                          expandedId === a.id
                            ? 'var(--blue)'
                            : 'var(--text-muted)',
                        cursor:
                          'pointer',
                      }}
                    >
                      {expandedId === a.id
                        ? 'Hide Profile'
                        : 'View Profile'}
                    </button>


                    <Link
                      to={`/dashboard/booking?advocateId=${a.id}`}
                      className={
                        a.available
                          ? 'btn-primary'
                          : ''
                      }
                      style={{
                        padding:
                          '8px 16px',
                        borderRadius:
                          8,
                        fontSize:
                          '0.8rem',
                        fontWeight:
                          700,
                        textDecoration:
                          'none',
                        display:
                          'inline-flex',
                        alignItems:
                          'center',
                        gap: 5,
                        ...(a.available
                          ? {}
                          : {
                              background:
                                'var(--bg-secondary)',
                              color:
                                'var(--text-subtle)',
                              border:
                                '1px solid var(--border)',
                              cursor:
                                'not-allowed',
                              opacity:
                                0.6,
                            }),
                      }}
                    >
                      <Clock size={13} />

                      {a.available
                        ? 'Book Consultation'
                        : 'Unavailable'}
                    </Link>

                  </div>

                </div>


                {/* Expanded profile */}

                {expandedId === a.id && (

                  <div
                    style={{
                      marginTop:
                        16,
                      paddingTop:
                        16,
                      borderTop:
                        '1px solid var(--border)',
                    }}
                  >

                    <div
                      style={{
                        display:
                          'grid',
                        gridTemplateColumns:
                          '1fr 1fr',
                        gap: 10,
                        fontSize:
                          '0.8rem',
                      }}
                    >

                      <div>
                        <span
                          style={{
                            color:
                              'var(--text-muted)',
                          }}
                        >
                          Email:
                        </span>{' '}

                        <strong
                          style={{
                            color:
                              'var(--text)',
                          }}
                        >
                          {a.email || 'Not provided'}
                        </strong>
                      </div>


                      <div>
                        <span
                          style={{
                            color:
                              'var(--text-muted)',
                          }}
                        >
                          Phone:
                        </span>{' '}

                        <strong
                          style={{
                            color:
                              'var(--text)',
                          }}
                        >
                          {a.phone || 'Not provided'}
                        </strong>
                      </div>


                      <div>
                        <span
                          style={{
                            color:
                              'var(--text-muted)',
                          }}
                        >
                          Experience:
                        </span>{' '}

                        <strong
                          style={{
                            color:
                              'var(--text)',
                          }}
                        >
                          {a.experience
                            ? `${a.experience} years`
                            : 'Not provided'}
                        </strong>
                      </div>


                      <div>
                        <span
                          style={{
                            color:
                              'var(--text-muted)',
                          }}
                        >
                          Consultation:
                        </span>{' '}

                        <strong
                          style={{
                            color:
                              'var(--text)',
                          }}
                        >
                          {a.fee
                            ? `₹${a.fee.toLocaleString()}/hr`
                            : 'Not provided'}
                        </strong>
                      </div>

                    </div>

                  </div>

                )}

              </div>

            ))}

          </div>

        )}


      {/* No advocates */}

      {!loading &&
        !error &&
        filtered.length === 0 && (

          <div
            style={{
              padding:
                '60px 20px',
              textAlign:
                'center',
            }}
          >

            <div
              style={{
                fontSize:
                  '2.5rem',
                marginBottom:
                  12,
              }}
            >
              🔍
            </div>

            <div
              style={{
                fontWeight:
                  700,
                color:
                  'var(--text)',
                marginBottom:
                  6,
              }}
            >
              No advocates found
            </div>

            <div
              style={{
                color:
                  'var(--text-muted)',
                fontSize:
                  '0.9rem',
              }}
            >
              No registered advocates match your filters.
            </div>

          </div>

        )}


      <style>{`
        @media (max-width: 900px) {
          .advocates-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

    </div>

  )
}


// =====================================================
// META STAT
// =====================================================

function MetaStat({
  icon: Icon,
  val,
  sub,
  iconColor,
  fill,
}: {
  icon: typeof Star
  val: string
  sub: string
  iconColor?: string
  fill?: boolean
}) {

  return (

    <div
      style={{
        textAlign:
          'center',
      }}
    >

      <div
        style={{
          display:
            'flex',
          alignItems:
            'center',
          justifyContent:
            'center',
          gap: 3,
        }}
      >

        <Icon
          size={12}
          style={{
            color:
              iconColor ||
              'var(--text-muted)',
          }}
          fill={
            fill
              ? iconColor ||
                'currentColor'
              : 'none'
          }
        />

        <span
          style={{
            fontSize:
              '0.825rem',
            fontWeight:
              700,
            color:
              'var(--text)',
          }}
        >
          {val}
        </span>

      </div>

      <div
        style={{
          fontSize:
            '0.65rem',
          color:
            'var(--text-subtle)',
          marginTop:
            1,
        }}
      >
        {sub}
      </div>

    </div>

  )
}


// =====================================================
// SELECT FILTER
// =====================================================

function SelectFilter({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange: (v: string) => void
}) {

  return (

    <div
      style={{
        position:
          'relative',
      }}
    >

      <select
        value={value}
        onChange={e =>
          onChange(
            e.target.value
          )
        }
        style={{
          padding:
            '8px 28px 8px 12px',
          borderRadius:
            8,
          border:
            '1px solid var(--border)',
          background:
            'var(--bg-secondary)',
          color:
            'var(--text)',
          fontSize:
            '0.875rem',
          cursor:
            'pointer',
          appearance:
            'none',
          outline:
            'none',
          fontFamily:
            'inherit',
        }}
      >

        {options.map(o => (

          <option
            key={o}
            value={o}
          >
            {o}
          </option>

        ))}

      </select>


      <ChevronDown
        size={13}
        style={{
          position:
            'absolute',
          right: 8,
          top: '50%',
          transform:
            'translateY(-50%)',
          color:
            'var(--text-muted)',
          pointerEvents:
            'none',
        }}
      />

    </div>

  )
}