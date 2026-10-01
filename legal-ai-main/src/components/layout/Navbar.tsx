import { useState } from 'react'
import { Link, useLocation } from 'react-router'

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Features', href: '/#features' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Find Advocates', href: '/dashboard/advocates' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'About', href: '/#about' },
  { label: 'Contact', href: '/#contact' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        width: '100%',
        background: '#000000',
        borderBottom: '1px solid rgba(212, 175, 55, 0.25)',
        boxShadow: '0 2px 20px rgba(0,0,0,0.45)',
      }}
    >
      <div
        style={{
          maxWidth: 1240,
          margin: '0 auto',
          padding: '0 24px',
        }}
      >
        {/* =====================================================
            NAVBAR
            ===================================================== */}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            height: 72,
            gap: 28,
          }}
        >

          {/* =====================================================
              ALPINE LOGO
              ===================================================== */}

          <Link
            to="/"
            style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontFamily:
                  'Arial, Helvetica, sans-serif',

                fontSize: '24px',

                fontWeight: 900,

                letterSpacing: '4px',

                color: '#D4AF37',

                lineHeight: 1,

                textTransform: 'uppercase',

                whiteSpace: 'nowrap',

                textShadow:
                  '0 0 12px rgba(212,175,55,0.18)',
              }}
            >
              ALPINE
            </span>
          </Link>


          {/* =====================================================
              DESKTOP NAVIGATION
              ===================================================== */}

          <div
            className="hidden lg:flex"
            style={{
              alignItems: 'center',
              gap: 4,
              flex: 1,
            }}
          >
            {navLinks.map((link) => {

              const active =
                link.href === '/'
                  ? location.pathname === '/'
                  : location.pathname === link.href

              return (
                <a
                  key={link.label}
                  href={link.href}
                  style={{
                    padding: '8px 12px',

                    borderRadius: 8,

                    fontSize: '0.9rem',

                    fontWeight: 600,

                    color: active
                      ? '#D4AF37'
                      : '#E2E2E2',

                    textDecoration: 'none',

                    background: active
                      ? 'rgba(212,175,55,0.08)'
                      : 'transparent',

                    border: active
                      ? '1px solid rgba(212,175,55,0.22)'
                      : '1px solid transparent',

                    transition:
                      'all 0.2s ease',

                    whiteSpace: 'nowrap',
                  }}

                  onMouseEnter={(e) => {
                    e.currentTarget.style.color =
                      '#D4AF37'

                    e.currentTarget.style.background =
                      'rgba(212,175,55,0.08)'

                    e.currentTarget.style.borderColor =
                      'rgba(212,175,55,0.22)'
                  }}

                  onMouseLeave={(e) => {
                    e.currentTarget.style.color =
                      active
                        ? '#D4AF37'
                        : '#E2E2E2'

                    e.currentTarget.style.background =
                      active
                        ? 'rgba(212,175,55,0.08)'
                        : 'transparent'

                    e.currentTarget.style.borderColor =
                      active
                        ? 'rgba(212,175,55,0.22)'
                        : 'transparent'
                  }}
                >
                  {link.label}
                </a>
              )
            })}
          </div>


          {/* =====================================================
              RIGHT SIDE
              ===================================================== */}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginLeft: 'auto',
              flexShrink: 0,
            }}
          >

            {/* =================================================
                LOGIN
                ================================================= */}

            <Link
              to="/login"
              className="hidden sm:inline-flex"
              style={{
                height: 44,

                padding: '0 18px',

                borderRadius: 9,

                border:
                  '1px solid rgba(212,175,55,0.55)',

                background: '#050505',

                color: '#FFFFFF',

                textDecoration: 'none',

                fontSize: '0.9rem',

                fontWeight: 650,

                alignItems: 'center',

                justifyContent: 'center',

                transition:
                  'all 0.2s ease',
              }}

              onMouseEnter={(e) => {
                e.currentTarget.style.color =
                  '#D4AF37'

                e.currentTarget.style.borderColor =
                  '#D4AF37'

                e.currentTarget.style.background =
                  'rgba(212,175,55,0.08)'
              }}

              onMouseLeave={(e) => {
                e.currentTarget.style.color =
                  '#FFFFFF'

                e.currentTarget.style.borderColor =
                  'rgba(212,175,55,0.55)'

                e.currentTarget.style.background =
                  '#050505'
              }}
            >
              Login
            </Link>


            {/* =================================================
                GET STARTED
                ================================================= */}

            <Link
              to="/signup"
              className="hidden sm:inline-flex"
              style={{
                height: 44,

                padding: '0 22px',

                borderRadius: 9,

                background:
                  'linear-gradient(135deg, #F5DD78, #D4AF37)',

                border:
                  '1px solid #E8CC65',

                color: '#000000',

                textDecoration: 'none',

                fontSize: '0.9rem',

                fontWeight: 750,

                alignItems: 'center',

                justifyContent: 'center',

                gap: 8,

                boxShadow:
                  '0 5px 20px rgba(212,175,55,0.18)',

                transition:
                  'all 0.2s ease',
              }}

              onMouseEnter={(e) => {
                e.currentTarget.style.transform =
                  'translateY(-1px)'

                e.currentTarget.style.boxShadow =
                  '0 8px 25px rgba(212,175,55,0.28)'
              }}

              onMouseLeave={(e) => {
                e.currentTarget.style.transform =
                  'translateY(0)'

                e.currentTarget.style.boxShadow =
                  '0 5px 20px rgba(212,175,55,0.18)'
              }}
            >
              <span
                style={{
                  fontSize: 18,
                  lineHeight: 1,
                  color: '#000000',
                  fontWeight: 900,
                }}
              >
                ✦
              </span>

              Get Started
            </Link>


            {/* =================================================
                GOLD THREE-LINE MENU
                ================================================= */}

            <button
              type="button"

              aria-label={
                mobileOpen
                  ? 'Close navigation menu'
                  : 'Open navigation menu'
              }

              onClick={() =>
                setMobileOpen(
                  (value) => !value
                )
              }

              className="lg:hidden"

              style={{
                width: 44,
                height: 44,

                padding: 0,

                borderRadius: 9,

                border:
                  '1.5px solid #D4AF37',

                background: '#050505',

                display: 'flex',

                flexDirection: 'column',

                alignItems: 'center',

                justifyContent: 'center',

                gap: 5,

                cursor: 'pointer',

                boxShadow:
                  '0 0 15px rgba(212,175,55,0.18)',
              }}
            >

              {mobileOpen ? (

                <>
                  <span
                    style={{
                      width: 23,
                      height: 2.5,
                      background: '#D4AF37',
                      borderRadius: 3,
                      display: 'block',
                      transform:
                        'rotate(45deg) translateY(5px)',
                    }}
                  />

                  <span
                    style={{
                      width: 23,
                      height: 2.5,
                      background: '#D4AF37',
                      borderRadius: 3,
                      display: 'block',
                      transform:
                        'rotate(-45deg) translateY(-5px)',
                    }}
                  />
                </>

              ) : (

                <>
                  <span
                    style={{
                      width: 23,
                      height: 2.5,
                      background: '#D4AF37',
                      borderRadius: 3,
                      display: 'block',
                    }}
                  />

                  <span
                    style={{
                      width: 23,
                      height: 2.5,
                      background: '#D4AF37',
                      borderRadius: 3,
                      display: 'block',
                    }}
                  />

                  <span
                    style={{
                      width: 23,
                      height: 2.5,
                      background: '#D4AF37',
                      borderRadius: 3,
                      display: 'block',
                    }}
                  />
                </>
              )}

            </button>

          </div>
        </div>


        {/* =====================================================
            MOBILE MENU
            ===================================================== */}

        {mobileOpen && (
          <div
            style={{
              borderTop:
                '1px solid rgba(212,175,55,0.20)',

              padding:
                '14px 0 18px',

              display: 'flex',

              flexDirection: 'column',

              gap: 5,

              background: '#000000',
            }}
          >

            {navLinks.map((link) => {

              const active =
                link.href === '/'
                  ? location.pathname === '/'
                  : location.pathname === link.href

              return (
                <a
                  key={link.label}

                  href={link.href}

                  onClick={() =>
                    setMobileOpen(false)
                  }

                  style={{
                    padding:
                      '11px 13px',

                    borderRadius: 8,

                    fontSize:
                      '0.9rem',

                    fontWeight: 600,

                    color: active
                      ? '#D4AF37'
                      : '#E2E2E2',

                    textDecoration:
                      'none',

                    background:
                      active
                        ? 'rgba(212,175,55,0.08)'
                        : 'transparent',

                    border:
                      active
                        ? '1px solid rgba(212,175,55,0.18)'
                        : '1px solid transparent',
                  }}
                >
                  {link.label}
                </a>
              )
            })}


            {/* MOBILE LOGIN + GET STARTED */}

            <div
              style={{
                display: 'flex',
                gap: 10,
                paddingTop: 10,
              }}
            >

              <Link
                to="/login"
                onClick={() =>
                  setMobileOpen(false)
                }
                style={{
                  flex: 1,

                  padding: 11,

                  borderRadius: 8,

                  textAlign: 'center',

                  border:
                    '1px solid rgba(212,175,55,0.55)',

                  color: '#FFFFFF',

                  background: '#050505',

                  textDecoration: 'none',

                  fontSize:
                    '0.875rem',

                  fontWeight: 600,
                }}
              >
                Login
              </Link>


              <Link
                to="/signup"
                onClick={() =>
                  setMobileOpen(false)
                }
                style={{
                  flex: 1,

                  padding: 11,

                  borderRadius: 8,

                  textAlign: 'center',

                  color: '#000000',

                  background:
                    'linear-gradient(135deg, #F5DD78, #D4AF37)',

                  textDecoration: 'none',

                  fontSize:
                    '0.875rem',

                  fontWeight: 700,
                }}
              >
                Get Started
              </Link>

            </div>

          </div>
        )}

      </div>
    </nav>
  )
}