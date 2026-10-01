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
  Globe,
  ChevronDown,
} from 'lucide-react'

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
  'Cambodia',
  'Cameroon',
  'Canada',
  'Cape Verde',
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
  const [country, setCountry] = useState('India')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleTabChange = (selectedTab: 'citizen' | 'advocate') => {
    setTab(selectedTab)

    if (selectedTab === 'advocate') {
      navigate('/advocate-login')
    } else {
      navigate('/login')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setError('')

    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }

    if (!password.trim()) {
      setError('Please enter your password.')
      return
    }

    if (!country) {
      setError('Please select your country.')
      return
    }

    setLoading(true)

    try {
      const endpoint = isAdvocate
        ? 'https://legal-ai-z7vb.onrender.com/api/auth/advocate-login'
        : 'https://legal-ai-z7vb.onrender.com/api/auth/login'

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
          country,
          name: name.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'Login failed. Please check your credentials.'
        )
      }

      if (data.token) {
        localStorage.setItem('token', data.token)
      }

      /*
       * Save the logged-in user's complete profile.
       *
       * The Advocate Dashboard reads the display name from
       * localStorage.user. Some backend responses may return
       * fullName, full_name, or name, so normalize all of them
       * into fullName here.
       */
      if (data.user) {
        const loggedInUser = {
          ...data.user,
          fullName:
            data.user.fullName ||
            data.user.full_name ||
            data.user.name ||
            (isAdvocate ? data.user.advocateName : undefined) ||
            name.trim() ||
            email.trim(),
        }

        localStorage.setItem(
          'user',
          JSON.stringify(loggedInUser)
        )
      } else {
        /*
         * Fallback: if the backend does not return a user object,
         * still save enough information for the dashboard header
         * to display the current account name.
         */
        localStorage.setItem(
          'user',
          JSON.stringify({
            fullName: name.trim() || email.trim(),
            email: email.trim(),
            role: isAdvocate ? 'advocate' : 'citizen',
            country,
          })
        )
      }

      if (isAdvocate) {
        navigate('/advocate-dashboard')
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      console.error('LOGIN ERROR:', err)

      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Unable to login. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        background: '#000',
        color: '#fff',
      }}
    >
      {/* =====================================================
          LEFT SIDE
      ===================================================== */}

      <div
        style={{
          background:
            'linear-gradient(135deg, #20204f 0%, #17264b 55%, #073c3b 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '60px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 150,
            height: 150,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 50,
            position: 'relative',
          }}
        >
          <Scale
            size={70}
            strokeWidth={1.2}
            style={{
              color: '#8a8cff',
            }}
          />
        </div>

        <h1
          style={{
            fontSize: '2rem',
            fontWeight: 800,
            marginBottom: 16,
          }}
        >
          Justice at Your Fingertips
        </h1>

        <p
          style={{
            fontSize: '1.05rem',
            lineHeight: 1.7,
            color: '#c2c7e8',
            maxWidth: 500,
            marginBottom: 35,
          }}
        >
          AI-powered legal guidance in your language.
          <br />
          Know your rights, connect with verified advocates.
        </p>

        <div
          style={{
            display: 'flex',
            gap: 16,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <Stat value="97.4%" label="AI Accuracy" />
          <Stat value="1,840+" label="Advocates" />
          <Stat value="48K+" label="Cases Guided" />
        </div>
      </div>

      {/* =====================================================
          RIGHT SIDE
      ===================================================== */}

      <div
        style={{
          background: '#000',
          padding: '50px 70px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          overflowY: 'auto',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 520,
            margin: '0 auto',
          }}
        >
          {/* LOGO */}

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 10,
              marginBottom: 42,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background:
                  'linear-gradient(135deg, #f6d365, #8d5de8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Scale size={23} color="#fff" />
            </div>

            <div
              style={{
                fontSize: '1.45rem',
                fontWeight: 800,
              }}
            >
              Nyaya<span style={{ color: '#f4cf38' }}>AI</span>
            </div>
          </div>

          {/* =================================================
              CITIZEN / ADVOCATE TABS
          ================================================= */}

          <div
            style={{
              border: '1px solid #4c3d00',
              borderRadius: 14,
              padding: 4,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              marginBottom: 38,
            }}
          >
            <button
              type="button"
              onClick={() => handleTabChange('citizen')}
              style={{
                border: 'none',
                borderRadius: 10,
                padding: '14px 10px',
                background:
                  tab === 'citizen' ? '#111' : 'transparent',
                color:
                  tab === 'citizen' ? '#f3cc39' : '#bbb',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              🛡 Citizen
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('advocate')}
              style={{
                border: 'none',
                borderRadius: 10,
                padding: '14px 10px',
                background:
                  tab === 'advocate' ? '#111' : 'transparent',
                color:
                  tab === 'advocate' ? '#f3cc39' : '#bbb',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              ♙ Advocate Portal
            </button>
          </div>

          {/* =================================================
              TITLE
          ================================================= */}

          <h2
            style={{
              fontSize: '1.8rem',
              fontWeight: 800,
              marginBottom: 8,
            }}
          >
            {isSignup ? 'Create your account' : 'Welcome back'}
          </h2>

          <p
            style={{
              color: '#aaa',
              marginBottom: 28,
            }}
          >
            {isSignup
              ? 'Create your NyayaAI account.'
              : `Sign in to your ${
                  isAdvocate ? 'advocate' : 'citizen'
                } account.`}
          </p>

          {/* =================================================
              GOOGLE
          ================================================= */}

          <button
            type="button"
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: 10,
              border: '1px solid #4c3d00',
              background: '#090909',
              color: '#fff',
              fontSize: '0.95rem',
              fontWeight: 700,
              cursor: 'pointer',
              marginBottom: 25,
            }}
          >
            <span style={{ marginRight: 10 }}>G</span>
            Continue with Google
          </button>

          {/* DIVIDER */}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              color: '#999',
              marginBottom: 24,
              fontSize: '0.85rem',
            }}
          >
            <div
              style={{
                height: 1,
                background: '#403500',
                flex: 1,
              }}
            />

            <span>or continue with email</span>

            <div
              style={{
                height: 1,
                background: '#403500',
                flex: 1,
              }}
            />
          </div>

          {/* =================================================
              FORM
          ================================================= */}

          <form onSubmit={handleSubmit}>
            {isSignup && (
              <FormField
                label="Full Name"
                icon={<Award size={17} />}
              >
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  style={inputStyle}
                />
              </FormField>
            )}

            {/* EMAIL */}

            <FormField
              label="Email Address"
              icon={<Mail size={17} />}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                style={inputStyle}
              />
            </FormField>

            {/* =================================================
                COUNTRY SELECTOR
            ================================================= */}

            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: 8,
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  color: '#eee',
                }}
              >
                Country
              </label>

              <div
                style={{
                  position: 'relative',
                }}
              >
                <Globe
                  size={17}
                  style={{
                    position: 'absolute',
                    left: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#888',
                    pointerEvents: 'none',
                    zIndex: 2,
                  }}
                />

                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  style={{
                    ...inputStyle,
                    paddingLeft: 45,
                    paddingRight: 40,
                    appearance: 'none',
                    cursor: 'pointer',
                    color: '#111',
                    background: '#eef4ff',
                  }}
                >
                  <option value="">
                    Select your country
                  </option>

                  {countries.map((item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={18}
                  style={{
                    position: 'absolute',
                    right: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#555',
                    pointerEvents: 'none',
                  }}
                />
              </div>
            </div>

            {/* PASSWORD */}

            <div style={{ marginBottom: 12 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 8,
                }}
              >
                <label
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: 700,
                  }}
                >
                  Password
                </label>

                {!isSignup && (
                  <Link
                    to="/forgot-password"
                    style={{
                      color: '#f3cc39',
                      fontSize: '0.8rem',
                      textDecoration: 'none',
                      fontWeight: 600,
                    }}
                  >
                    Forgot password?
                  </Link>
                )}
              </div>

              <div
                style={{
                  position: 'relative',
                }}
              >
                <Lock
                  size={17}
                  style={{
                    position: 'absolute',
                    left: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#777',
                  }}
                />

                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Enter your password"
                  style={{
                    ...inputStyle,
                    paddingLeft: 45,
                    paddingRight: 48,
                  }}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    border: 'none',
                    background: 'transparent',
                    color: '#777',
                    cursor: 'pointer',
                  }}
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* ERROR */}

            {error && (
              <div
                style={{
                  background: 'rgba(255,70,70,0.1)',
                  border: '1px solid rgba(255,70,70,0.4)',
                  color: '#ff7676',
                  padding: '11px 13px',
                  borderRadius: 8,
                  fontSize: '0.83rem',
                  marginTop: 15,
                  marginBottom: 15,
                }}
              >
                {error}
              </div>
            )}

            {/* SUBMIT */}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                marginTop: 22,
                padding: '15px',
                border: 'none',
                borderRadius: 10,
                background:
                  'linear-gradient(90deg, #f9dc68, #e9c337)',
                color: '#080808',
                fontSize: '1rem',
                fontWeight: 800,
                cursor: loading
                  ? 'not-allowed'
                  : 'pointer',
                opacity: loading ? 0.7 : 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 8,
              }}
            >
              {loading
                ? 'Please wait...'
                : isSignup
                ? 'Create Account'
                : 'Sign In'}

              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          {/* =================================================
              SIGN UP
          ================================================= */}

          <div
            style={{
              textAlign: 'center',
              marginTop: 25,
              color: '#aaa',
              fontSize: '0.9rem',
            }}
          >
            {isSignup ? (
              <>
                Already have an account?{' '}
                <Link
                  to="/login"
                  style={{
                    color: '#f3cc39',
                    fontWeight: 700,
                    textDecoration: 'none',
                  }}
                >
                  Sign In
                </Link>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  style={{
                    color: '#f3cc39',
                    fontWeight: 700,
                    textDecoration: 'none',
                  }}
                >
                  Sign Up Free
                </Link>
              </>
            )}
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 6,
              marginTop: 25,
              color: '#666',
              fontSize: '0.72rem',
              textAlign: 'center',
            }}
          >
            <Shield size={13} />
            By continuing, you agree to our Terms of Service
            and Privacy Policy.
          </div>
        </div>
      </div>
    </div>
  )
}

/* =========================================================
   SMALL COMPONENTS
========================================================= */

function Stat({
  value,
  label,
}: {
  value: string
  label: string
}) {
  return (
    <div
      style={{
        minWidth: 105,
        padding: '16px 20px',
        borderRadius: 12,
        border: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(255,255,255,0.05)',
      }}
    >
      <div
        style={{
          fontSize: '1.3rem',
          fontWeight: 800,
        }}
      >
        {value}
      </div>

      <div
        style={{
          color: '#9fa7c8',
          fontSize: '0.75rem',
          marginTop: 3,
        }}
      >
        {label}
      </div>
    </div>
  )
}

function FormField({
  label,
  icon,
  children,
}: {
  label: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label
        style={{
          display: 'block',
          marginBottom: 8,
          fontSize: '0.9rem',
          fontWeight: 700,
        }}
      >
        {label}
      </label>

      <div
        style={{
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 14,
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#777',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        >
          {icon}
        </div>

        {children}
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '14px 15px',
  borderRadius: 10,
  border: '1px solid #403500',
  background: '#eef4ff',
  color: '#111',
  fontSize: '0.92rem',
  outline: 'none',
}