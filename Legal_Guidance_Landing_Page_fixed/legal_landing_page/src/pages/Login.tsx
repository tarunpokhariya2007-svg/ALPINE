import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import {
  Scale,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  Award,
  Search,
  ChevronDown,
  Check,
} from 'lucide-react'

// =====================================================
// COUNTRIES
// =====================================================

const countries = [
  'Afghanistan',
  'Albania',
  'Algeria',
  'Andorra',
  'Angola',
  'Antigua and Barbuda',
  'Argentina',
  'Armenia',
  'Australia',
  'Austria',
  'Azerbaijan',
  'Bahamas',
  'Bahrain',
  'Bangladesh',
  'Barbados',
  'Belarus',
  'Belgium',
  'Belize',
  'Benin',
  'Bhutan',
  'Bolivia',
  'Bosnia and Herzegovina',
  'Botswana',
  'Brazil',
  'Brunei',
  'Bulgaria',
  'Burkina Faso',
  'Burundi',
  'Cabo Verde',
  'Cambodia',
  'Cameroon',
  'Canada',
  'Central African Republic',
  'Chad',
  'Chile',
  'China',
  'Colombia',
  'Comoros',
  'Congo',
  'Costa Rica',
  'Croatia',
  'Cuba',
  'Cyprus',
  'Czech Republic',
  'Denmark',
  'Djibouti',
  'Dominica',
  'Dominican Republic',
  'Ecuador',
  'Egypt',
  'El Salvador',
  'Equatorial Guinea',
  'Eritrea',
  'Estonia',
  'Eswatini',
  'Ethiopia',
  'Fiji',
  'Finland',
  'France',
  'Gabon',
  'Gambia',
  'Georgia',
  'Germany',
  'Ghana',
  'Greece',
  'Grenada',
  'Guatemala',
  'Guinea',
  'Guinea-Bissau',
  'Guyana',
  'Haiti',
  'Honduras',
  'Hungary',
  'Iceland',
  'India',
  'Indonesia',
  'Iran',
  'Iraq',
  'Ireland',
  'Israel',
  'Italy',
  'Jamaica',
  'Japan',
  'Jordan',
  'Kazakhstan',
  'Kenya',
  'Kiribati',
  'Kuwait',
  'Kyrgyzstan',
  'Laos',
  'Latvia',
  'Lebanon',
  'Lesotho',
  'Liberia',
  'Libya',
  'Liechtenstein',
  'Lithuania',
  'Luxembourg',
  'Madagascar',
  'Malawi',
  'Malaysia',
  'Maldives',
  'Mali',
  'Malta',
  'Marshall Islands',
  'Mauritania',
  'Mauritius',
  'Mexico',
  'Micronesia',
  'Moldova',
  'Monaco',
  'Mongolia',
  'Montenegro',
  'Morocco',
  'Mozambique',
  'Myanmar',
  'Namibia',
  'Nauru',
  'Nepal',
  'Netherlands',
  'New Zealand',
  'Nicaragua',
  'Niger',
  'Nigeria',
  'North Korea',
  'North Macedonia',
  'Norway',
  'Oman',
  'Pakistan',
  'Palau',
  'Palestine',
  'Panama',
  'Papua New Guinea',
  'Paraguay',
  'Peru',
  'Philippines',
  'Poland',
  'Portugal',
  'Qatar',
  'Romania',
  'Russia',
  'Rwanda',
  'Saint Kitts and Nevis',
  'Saint Lucia',
  'Saint Vincent and the Grenadines',
  'Samoa',
  'San Marino',
  'Sao Tome and Principe',
  'Saudi Arabia',
  'Senegal',
  'Serbia',
  'Seychelles',
  'Sierra Leone',
  'Singapore',
  'Slovakia',
  'Slovenia',
  'Solomon Islands',
  'Somalia',
  'South Africa',
  'South Korea',
  'South Sudan',
  'Spain',
  'Sri Lanka',
  'Sudan',
  'Suriname',
  'Sweden',
  'Switzerland',
  'Syria',
  'Taiwan',
  'Tajikistan',
  'Tanzania',
  'Thailand',
  'Timor-Leste',
  'Togo',
  'Tonga',
  'Trinidad and Tobago',
  'Tunisia',
  'Turkey',
  'Turkmenistan',
  'Tuvalu',
  'Uganda',
  'Ukraine',
  'United Arab Emirates',
  'United Kingdom',
  'United States',
  'Uruguay',
  'Uzbekistan',
  'Vanuatu',
  'Vatican City',
  'Venezuela',
  'Vietnam',
  'Yemen',
  'Zambia',
  'Zimbabwe',
]

// =====================================================
// MAIN LOGIN COMPONENT
// =====================================================

export default function Login() {
  const location = useLocation()
  const navigate = useNavigate()

  const isAdvocate = location.pathname === '/advocate-login'
  const isSignup = location.pathname === '/signup'

  const [tab, setTab] = useState<'citizen' | 'advocate'>(
    isAdvocate ? 'advocate' : 'citizen'
  )

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

  const [showPw, setShowPw] = useState(false)

  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  // =====================================================
  // COUNTRY STATES
  // =====================================================

  const [country, setCountry] = useState('')

  const [countrySearch, setCountrySearch] = useState('')

  const [countryOpen, setCountryOpen] = useState(false)

  const filteredCountries = countries.filter((item) =>
    item.toLowerCase().includes(countrySearch.toLowerCase())
  )

  // =====================================================
  // LOGIN / SIGNUP
  // =====================================================

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    setLoading(true)

    setTimeout(() => {
      setLoading(false)

      if (tab === 'advocate') {
        navigate('/advocate')
      } else {
        navigate('/dashboard')
      }
    }, 1000)
  }

  // =====================================================
  // GOOGLE LOGIN
  // =====================================================

  const handleGoogleLogin = () => {
    setGoogleLoading(true)

    setTimeout(() => {
      setGoogleLoading(false)

      if (tab === 'advocate') {
        navigate('/advocate')
      } else {
        navigate('/dashboard')
      }
    }, 1000)
  }

  // =====================================================
  // COLORS
  // =====================================================

  const accentColor =
    tab === 'advocate'
      ? 'var(--emerald)'
      : 'var(--blue)'

  const accentGrad =
    tab === 'advocate'
      ? 'linear-gradient(135deg, var(--emerald), #065F46)'
      : 'linear-gradient(135deg, var(--blue), #7C3AED)'

  // =====================================================
  // UI
  // =====================================================

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        background: 'var(--bg)',
      }}
    >
      {/* =================================================
          LEFT PANEL
      ================================================= */}

      <div
        style={{
          flex: 1,
          display: 'none',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '60px 40px',
          background:
            'linear-gradient(145deg, #0F172A 0%, #1E1B4B 40%, #0D3B2E 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
        className="auth-left"
      >
        {/* Background glow */}

        <div
          style={{
            position: 'absolute',
            width: 500,
            height: 500,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',
            top: -100,
            left: -100,
          }}
        />

        <div
          style={{
            position: 'absolute',
            width: 400,
            height: 400,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)',
            bottom: -80,
            right: -80,
          }}
        />

        <div
          style={{
            position: 'relative',
            textAlign: 'center',
          }}
        >
          <LoginIllustration
            isAdvocate={tab === 'advocate'}
          />

          <h2
            style={{
              color: 'white',
              fontSize: '1.6rem',
              fontWeight: 800,
              marginTop: 32,
              letterSpacing: '-0.03em',
            }}
          >
            {tab === 'advocate'
              ? 'Empower Your Practice with AI'
              : 'Justice at Your Fingertips'}
          </h2>

          <p
            style={{
              color: 'rgba(255,255,255,0.6)',
              marginTop: 12,
              lineHeight: 1.7,
              maxWidth: 360,
            }}
          >
            {tab === 'advocate'
              ? 'AI-powered research, smart client management, and automated drafting for modern advocates.'
              : 'AI-powered legal guidance in your language. Know your rights, connect with verified advocates.'}
          </p>

          <div
            style={{
              display: 'flex',
              gap: 16,
              justifyContent: 'center',
              marginTop: 32,
            }}
          >
            {[
              {
                val: '97.4%',
                lbl: 'AI Accuracy',
              },
              {
                val: '1,840+',
                lbl: 'Advocates',
              },
              {
                val: '48K+',
                lbl: 'Cases Guided',
              },
            ].map((s) => (
              <div
                key={s.lbl}
                style={{
                  padding: '12px 16px',
                  borderRadius: 12,
                  textAlign: 'center',
                  background: 'rgba(255,255,255,0.05)',
                  border:
                    '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <div
                  style={{
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    color: 'white',
                  }}
                >
                  {s.val}
                </div>

                <div
                  style={{
                    fontSize: '0.7rem',
                    color: 'rgba(255,255,255,0.5)',
                    marginTop: 2,
                  }}
                >
                  {s.lbl}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* =================================================
          RIGHT PANEL
      ================================================= */}

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '48px 24px',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 420,
          }}
        >
          {/* =================================================
              LOGO
          ================================================= */}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 40,
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: accentGrad,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Scale
                size={18}
                color="white"
              />
            </div>

            <span
              style={{
                fontSize: '1.2rem',
                fontWeight: 800,
                color: 'var(--text)',
                letterSpacing: '-0.02em',
              }}
            >
              Nyaya
              <span
                style={{
                  color: accentColor,
                }}
              >
                AI
              </span>
            </span>
          </div>

          {/* =================================================
              ROLE TABS
          ================================================= */}

          <div
            style={{
              display: 'flex',
              background: 'var(--bg-secondary)',
              borderRadius: 12,
              padding: 4,
              marginBottom: 32,
              border: '1px solid var(--border)',
            }}
          >
            {(
              ['citizen', 'advocate'] as const
            ).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setTab(r)}
                style={{
                  flex: 1,
                  padding: '9px',
                  borderRadius: 9,
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                  border: 'none',
                  background:
                    tab === r
                      ? 'var(--bg-card)'
                      : 'transparent',
                  color:
                    tab === r
                      ? r === 'advocate'
                        ? 'var(--emerald)'
                        : 'var(--blue)'
                      : 'var(--text-muted)',
                  boxShadow:
                    tab === r
                      ? 'var(--shadow-sm)'
                      : 'none',
                  textTransform: 'capitalize',
                }}
              >
                {r === 'advocate' ? (
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 5,
                    }}
                  >
                    <Award size={14} />
                    Advocate Portal
                  </span>
                ) : (
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 5,
                    }}
                  >
                    <Shield size={14} />
                    Citizen
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* =================================================
              ADVOCATE BADGE
          ================================================= */}

          {tab === 'advocate' && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 16px',
                background: 'var(--emerald-subtle)',
                border:
                  '1px solid var(--emerald-light)',
                borderRadius: 10,
                marginBottom: 20,
              }}
            >
              <Award
                size={18}
                style={{
                  color: 'var(--emerald)',
                  flexShrink: 0,
                }}
              />

              <div>
                <div
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: 'var(--emerald)',
                  }}
                >
                  Verified Advocate Portal
                </div>

                <div
                  style={{
                    fontSize: '0.72rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  Bar Council enrollment required
                  for verification
                </div>
              </div>
            </div>
          )}

          {/* =================================================
              HEADING
          ================================================= */}

          <h1
            style={{
              fontSize: '1.6rem',
              fontWeight: 800,
              color: 'var(--text)',
              letterSpacing: '-0.03em',
              marginBottom: 6,
            }}
          >
            {isSignup
              ? 'Create your account'
              : 'Welcome back'}
          </h1>

          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: '0.9rem',
              marginBottom: 28,
            }}
          >
            {isSignup
              ? `Join NyayaAI as a ${
                  tab === 'advocate'
                    ? 'verified advocate'
                    : 'citizen'
                }.`
              : `Sign in to your ${
                  tab === 'advocate'
                    ? 'advocate'
                    : 'citizen'
                } account.`}
          </p>

          {/* =================================================
              GOOGLE BUTTON
          ================================================= */}

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            style={{
              width: '100%',
              padding: '11px',
              borderRadius: 10,
              fontWeight: 600,
              fontSize: '0.9rem',
              border:
                '1px solid var(--border)',
              background: 'var(--bg-card)',
              color: 'var(--text)',
              cursor: googleLoading
                ? 'wait'
                : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              marginBottom: 20,
              transition: 'all 0.15s',
              opacity: googleLoading
                ? 0.75
                : 1,
            }}
          >
            {googleLoading ? (
              <span
                style={{
                  display: 'inline-block',
                  width: 16,
                  height: 16,
                  border:
                    '2px solid var(--border)',
                  borderTopColor:
                    'var(--text-muted)',
                  borderRadius: '50%',
                  animation:
                    'spin 0.7s linear infinite',
                }}
              />
            ) : (
              <svg
                viewBox="0 0 18 18"
                width={18}
                height={18}
                fill="none"
                style={{
                  flexShrink: 0,
                }}
              >
                <path
                  d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
                  fill="#4285F4"
                />

                <path
                  d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
                  fill="#34A853"
                />

                <path
                  d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
                  fill="#FBBC05"
                />

                <path
                  d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
                  fill="#EA4335"
                />
              </svg>
            )}

            {googleLoading
              ? 'Connecting...'
              : 'Continue with Google'}
          </button>

          {/* =================================================
              DIVIDER
          ================================================= */}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                flex: 1,
                height: 1,
                background: 'var(--border)',
              }}
            />

            <span
              style={{
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
              }}
            >
              or continue with email
            </span>

            <div
              style={{
                flex: 1,
                height: 1,
                background: 'var(--border)',
              }}
            />
          </div>

          {/* =================================================
              FORM
          ================================================= */}

          <form
            onSubmit={handleSubmit}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            {/* =================================================
                FULL NAME
            ================================================= */}

            {isSignup && (
              <div>
                <label
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'var(--text)',
                    display: 'block',
                    marginBottom: 6,
                  }}
                >
                  Full Name{' '}
                  {tab === 'advocate'
                    ? '(as per Bar Council)'
                    : ''}
                </label>

                <input
                  className="input"
                  type="text"
                  placeholder="e.g. Priya Sharma"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  required
                />
              </div>
            )}

            {/* =================================================
                COUNTRY SEARCH SELECTOR
            ================================================= */}

            <div
              style={{
                position: 'relative',
              }}
            >
              <label
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: 'var(--text)',
                  display: 'block',
                  marginBottom: 6,
                }}
              >
                Country
              </label>

              {/* Selected country button */}

              <button
                type="button"
                onClick={() =>
                  setCountryOpen(
                    (previous) => !previous
                  )}
                style={{
                  width: '100%',
                  minHeight: 42,
                  padding: '10px 38px 10px 12px',
                  borderRadius: 8,
                  border:
                    '1px solid var(--border)',
                  background:
                    'var(--bg-card)',
                  color: country
                    ? 'var(--text)'
                    : 'var(--text-muted)',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  position: 'relative',
                }}
              >
                {country ||
                  'Select your country'}

                <ChevronDown
                  size={16}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: `translateY(-50%) ${
                      countryOpen
                        ? 'rotate(180deg)'
                        : ''
                    }`,
                    transition:
                      'transform 0.2s',
                    color:
                      'var(--text-muted)',
                  }}
                />
              </button>

              {/* =================================================
                  DROPDOWN
              ================================================= */}

              {countryOpen && (
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: 'calc(100% + 5px)',
                    zIndex: 1000,
                    background:
                      'var(--bg-card)',
                    border:
                      '1px solid var(--border)',
                    borderRadius: 10,
                    boxShadow:
                      '0 15px 40px rgba(0,0,0,0.35)',
                    overflow: 'hidden',
                  }}
                >
                  {/* Search box */}

                  <div
                    style={{
                      padding: 10,
                      borderBottom:
                        '1px solid var(--border)',
                      background:
                        'var(--bg-card)',
                    }}
                  >
                    <div
                      style={{
                        position: 'relative',
                      }}
                    >
                      <Search
                        size={15}
                        style={{
                          position:
                            'absolute',
                          left: 10,
                          top: '50%',
                          transform:
                            'translateY(-50%)',
                          color:
                            'var(--text-muted)',
                        }}
                      />

                      <input
                        autoFocus
                        type="text"
                        value={countrySearch}
                        onChange={(e) =>
                          setCountrySearch(
                            e.target.value
                          )
                        }
                        placeholder="Search country..."
                        style={{
                          width: '100%',
                          boxSizing:
                            'border-box',
                          padding:
                            '9px 10px 9px 32px',
                          borderRadius: 7,
                          border:
                            '1px solid var(--border)',
                          background:
                            'var(--bg-secondary)',
                          color:
                            'var(--text)',
                          outline: 'none',
                          fontSize:
                            '0.82rem',
                        }}
                      />
                    </div>
                  </div>

                  {/* Country list */}

                  <div
                    style={{
                      maxHeight: 220,
                      overflowY: 'auto',
                    }}
                  >
                    {filteredCountries.length >
                    0 ? (
                      filteredCountries.map(
                        (item) => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => {
                              setCountry(item)
                              setCountrySearch(
                                ''
                              )
                              setCountryOpen(
                                false
                              )
                            }}
                            style={{
                              width: '100%',
                              padding:
                                '10px 12px',
                              border: 'none',
                              background:
                                item ===
                                country
                                  ? 'var(--bg-secondary)'
                                  : 'transparent',
                              color:
                                'var(--text)',
                              textAlign:
                                'left',
                              cursor:
                                'pointer',
                              fontSize:
                                '0.83rem',
                              display: 'flex',
                              alignItems:
                                'center',
                              justifyContent:
                                'space-between',
                            }}
                            onMouseEnter={(
                              e
                            ) => {
                              e.currentTarget.style.background =
                                'var(--bg-secondary)'
                            }}
                            onMouseLeave={(
                              e
                            ) => {
                              e.currentTarget.style.background =
                                item ===
                                country
                                  ? 'var(--bg-secondary)'
                                  : 'transparent'
                            }}
                          >
                            <span>
                              {item}
                            </span>

                            {item ===
                              country && (
                              <Check
                                size={15}
                                style={{
                                  color:
                                    accentColor,
                                }}
                              />
                            )}
                          </button>
                        )
                      )
                    ) : (
                      <div
                        style={{
                          padding:
                            '20px 12px',
                          textAlign:
                            'center',
                          color:
                            'var(--text-muted)',
                          fontSize:
                            '0.82rem',
                        }}
                      >
                        No country found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* =================================================
                EMAIL
            ================================================= */}

            <div>
              <label
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: 'var(--text)',
                  display: 'block',
                  marginBottom: 6,
                }}
              >
                Email Address
              </label>

              <div
                style={{
                  position: 'relative',
                }}
              >
                <Mail
                  size={15}
                  style={{
                    position:
                      'absolute',
                    left: 11,
                    top: '50%',
                    transform:
                      'translateY(-50%)',
                    color:
                      'var(--text-muted)',
                  }}
                />

                <input
                  className="input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  required
                  style={{
                    paddingLeft: 34,
                  }}
                />
              </div>
            </div>

            {/* =================================================
                PASSWORD
            ================================================= */}

            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent:
                    'space-between',
                  marginBottom: 6,
                }}
              >
                <label
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'var(--text)',
                  }}
                >
                  Password
                </label>

                {!isSignup && (
                  <a
                    href="#"
                    style={{
                      fontSize: '0.78rem',
                      color: accentColor,
                      textDecoration:
                        'none',
                      fontWeight: 500,
                    }}
                  >
                    Forgot password?
                  </a>
                )}
              </div>

              <div
                style={{
                  position: 'relative',
                }}
              >
                <Lock
                  size={15}
                  style={{
                    position:
                      'absolute',
                    left: 11,
                    top: '50%',
                    transform:
                      'translateY(-50%)',
                    color:
                      'var(--text-muted)',
                  }}
                />

                <input
                  className="input"
                  type={
                    showPw
                      ? 'text'
                      : 'password'
                  }
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  required
                  style={{
                    paddingLeft: 34,
                    paddingRight: 36,
                  }}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPw(
                      (s) => !s
                    )
                  }
                  style={{
                    position:
                      'absolute',
                    right: 10,
                    top: '50%',
                    transform:
                      'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color:
                      'var(--text-muted)',
                  }}
                >
                  {showPw ? (
                    <EyeOff size={15} />
                  ) : (
                    <Eye size={15} />
                  )}
                </button>
              </div>
            </div>

            {/* =================================================
                ADVOCATE BAR COUNCIL
            ================================================= */}

            {tab === 'advocate' &&
              isSignup && (
                <div>
                  <label
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color:
                        'var(--text)',
                      display: 'block',
                      marginBottom: 6,
                    }}
                  >
                    Bar Council
                    Enrollment Number
                  </label>

                  <input
                    className="input"
                    type="text"
                    placeholder="e.g. D/1624/2018"
                  />
                </div>
              )}

            {/* =================================================
                SUBMIT
            ================================================= */}

            <button
              type="submit"
              className={
                tab === 'advocate'
                  ? 'btn-emerald'
                  : 'btn-primary'
              }
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 10,
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: loading
                  ? 'wait'
                  : 'pointer',
                border: 'none',
                display: 'flex',
                alignItems:
                  'center',
                justifyContent:
                  'center',
                gap: 8,
                marginTop: 4,
                opacity: loading
                  ? 0.8
                  : 1,
              }}
            >
              {loading ? (
                <span
                  style={{
                    display:
                      'inline-block',
                    width: 18,
                    height: 18,
                    border:
                      '2px solid rgba(255,255,255,0.3)',
                    borderTopColor:
                      'white',
                    borderRadius:
                      '50%',
                    animation:
                      'spin 0.7s linear infinite',
                  }}
                />
              ) : (
                <>
                  {isSignup
                    ? 'Create Account'
                    : 'Sign In'}

                  <ArrowRight
                    size={16}
                  />
                </>
              )}
            </button>
          </form>

          {/* =================================================
              SIGN UP / SIGN IN
          ================================================= */}

          <p
            style={{
              textAlign: 'center',
              marginTop: 20,
              fontSize: '0.875rem',
              color:
                'var(--text-muted)',
            }}
          >
            {isSignup
              ? 'Already have an account? '
              : "Don't have an account? "}

            <Link
              to={
                isSignup
                  ? '/login'
                  : '/signup'
              }
              style={{
                color: accentColor,
                fontWeight: 600,
                textDecoration:
                  'none',
              }}
            >
              {isSignup
                ? 'Sign In'
                : 'Sign Up Free'}
            </Link>
          </p>

          {/* =================================================
              TERMS
          ================================================= */}

          <p
            style={{
              textAlign: 'center',
              marginTop: 16,
              fontSize: '0.72rem',
              color:
                'var(--text-subtle)',
              lineHeight: 1.5,
            }}
          >
            By continuing, you agree
            to our{' '}
            <a
              href="#"
              style={{
                color:
                  'var(--text-muted)',
              }}
            >
              Terms of Service
            </a>{' '}
            and{' '}
            <a
              href="#"
              style={{
                color:
                  'var(--text-muted)',
              }}
            >
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>

      {/* =================================================
          CSS
      ================================================= */}

      <style>{`
        @media (min-width: 900px) {
          .auth-left {
            display: flex !important;
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}

// =====================================================
// LOGIN ILLUSTRATION
// =====================================================

function LoginIllustration({
  isAdvocate,
}: {
  isAdvocate: boolean
}) {
  return (
    <svg
      viewBox="0 0 280 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        width: 280,
        height: 220,
      }}
    >
      <circle
        cx="140"
        cy="110"
        r="90"
        fill="rgba(255,255,255,0.04)"
      />

      {/* Courthouse */}

      <rect
        x="80"
        y="130"
        width="120"
        height="70"
        rx="4"
        fill="rgba(255,255,255,0.08)"
        stroke="rgba(255,255,255,0.15)"
        strokeWidth="1"
      />

      <rect
        x="95"
        y="120"
        width="90"
        height="15"
        rx="2"
        fill="rgba(255,255,255,0.1)"
      />

      <line
        x1="140"
        y1="100"
        x2="140"
        y2="120"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="2"
      />

      <polygon
        points="110,100 140,80 170,100"
        fill="rgba(255,255,255,0.1)"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="1"
      />

      {isAdvocate ? (
        <>
          {/* Advocate badge */}

          <circle
            cx="140"
            cy="55"
            r="28"
            fill="rgba(16,185,129,0.2)"
            stroke="rgba(16,185,129,0.4)"
            strokeWidth="1.5"
          />

          <text
            x="140"
            y="62"
            fontSize="24"
            textAnchor="middle"
          >
            ⚖️
          </text>

          <rect
            x="105"
            y="88"
            width="70"
            height="20"
            rx="6"
            fill="rgba(16,185,129,0.3)"
          />

          <text
            x="140"
            y="102"
            fontSize="8"
            fill="#10B981"
            textAnchor="middle"
            fontFamily="Inter"
            fontWeight="700"
          >
            BAR COUNCIL VERIFIED
          </text>
        </>
      ) : (
        <>
          {/* AI shield */}

          <circle
            cx="140"
            cy="55"
            r="28"
            fill="rgba(59,130,246,0.2)"
            stroke="rgba(59,130,246,0.4)"
            strokeWidth="1.5"
          />

          <text
            x="140"
            y="62"
            fontSize="24"
            textAnchor="middle"
          >
            🤖
          </text>

          <rect
            x="110"
            y="88"
            width="60"
            height="20"
            rx="6"
            fill="rgba(59,130,246,0.3)"
          />

          <text
            x="140"
            y="102"
            fontSize="8"
            fill="#3B82F6"
            textAnchor="middle"
            fontFamily="Inter"
            fontWeight="700"
          >
            AI LEGAL HELP
          </text>
        </>
      )}

      {/* Floating dots */}

      <circle
        cx="60"
        cy="80"
        r="4"
        fill={
          isAdvocate
            ? '#10B981'
            : '#3B82F6'
        }
        opacity="0.5"
      />

      <circle
        cx="220"
        cy="70"
        r="3"
        fill={
          isAdvocate
            ? '#10B981'
            : '#3B82F6'
        }
        opacity="0.4"
      />

      <circle
        cx="230"
        cy="160"
        r="5"
        fill={
          isAdvocate
            ? '#10B981'
            : '#3B82F6'
        }
        opacity="0.3"
      />

      <circle
        cx="50"
        cy="170"
        r="3"
        fill="rgba(255,255,255,0.3)"
      />
    </svg>
  )
}