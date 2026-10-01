import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router'
import {
  Camera,
  Edit2,
  Save,
  MapPin,
  Mail,
  Phone,
  Award,
  ChevronDown,
  Check,
} from 'lucide-react'


// =====================================================
// BACKEND URL
// =====================================================

const API_URL = 'https://legal-ai-z7vb.onrender.com'


// =====================================================
// PROFILE
// =====================================================

export default function Profile() {

  const location = useLocation()

  const isAdvocate =
    location.pathname.startsWith('/advocate')


  // ===================================================
  // STATE
  // ===================================================

  const [editing, setEditing] =
    useState(false)

  const [loading, setLoading] =
    useState(true)

  const [saving, setSaving] =
    useState(false)


  const [name, setName] =
    useState('')

  const [email, setEmail] =
    useState('')

  const [phone, setPhone] =
    useState('')

  const [city, setCity] =
    useState('')

  const [bio, setBio] =
    useState('')

  const [barCouncilNo, setBarCouncilNo] = useState('')
  const [practiceAreas, setPracticeAreas] = useState<string[]>([])
  const [highCourt, setHighCourt] = useState('')
  const [enrollmentYear, setEnrollmentYear] = useState('')
  const [practiceDropdownOpen, setPracticeDropdownOpen] = useState(false)
  const practiceDropdownRef = useRef<HTMLDivElement | null>(null)
  const [userData, setUserDataState] = useState<any>({})

  const PRACTICE_AREA_OPTIONS = [
    'Property Law',
    'Criminal Defence',
    'Family Law',
    'Consumer Law',
    'Corporate Law',
    'Employment Law',
    'Tax Law',
    'Immigration Law',
    'Constitutional Law',
    'Civil Litigation',
    'Cyber Law',
    'Intellectual Property Law',
    'Banking & Finance Law',
    'Real Estate Law',
    'Labour Law',
    'Medical Negligence',
    'Environmental Law',
    'Arbitration & Mediation',
    'Divorce & Matrimonial Law',
    'Criminal Law',
    'Contract Law',
    'Startup & Business Law',
  ]


  // ===================================================
  // LOAD USER
  // ===================================================

  useEffect(() => {

    loadProfile()

  }, [])

  // Close the Practice Area dropdown when clicking anywhere outside it.
  useEffect(() => {
    if (!practiceDropdownOpen) return

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node | null

      if (
        practiceDropdownRef.current &&
        target &&
        !practiceDropdownRef.current.contains(target)
      ) {
        setPracticeDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [practiceDropdownOpen])


  // ===================================================
  // LOAD PROFILE FROM BACKEND
  // ===================================================

  const loadProfile = async () => {

    try {

      const token =
        localStorage.getItem('token')


      // -----------------------------------------------
      // IF THERE IS NO TOKEN
      // -----------------------------------------------

      if (!token) {

        console.warn(
          'No login token found'
        )

        loadFromLocalStorage()

        setLoading(false)

        return
      }


      // -----------------------------------------------
      // GET PROFILE FROM DATABASE
      // -----------------------------------------------

      const response =
        await fetch(
          `${API_URL}/api/profile`,
          {
            method: 'GET',

            headers: {
              Authorization:
                `Bearer ${token}`,

              'Content-Type':
                'application/json',
            },
          }
        )


      const data =
        await response.json()


      console.log(
        'PROFILE RESPONSE:',
        data
      )


      if (
        response.ok &&
        data.success &&
        data.user
      ) {

        setUserData(
          data.user
        )


        // ---------------------------------------------
        // KEEP LOCAL STORAGE UPDATED
        // ---------------------------------------------

        localStorage.setItem(
          'user',
          JSON.stringify(
            data.user
          )
        )

      } else {

        console.warn(
          'Could not load profile from server:',
          data.message
        )

        loadFromLocalStorage()

      }

    } catch (error) {

      console.error(
        'LOAD PROFILE ERROR:',
        error
      )

      // ---------------------------------------------
      // FALLBACK
      // ---------------------------------------------

      loadFromLocalStorage()

    } finally {

      setLoading(false)

    }

  }


  // ===================================================
  // LOAD FROM LOCAL STORAGE
  // ===================================================

  const loadFromLocalStorage = () => {

    try {

      const storedUser =
        localStorage.getItem('user')


      if (
        !storedUser ||
        storedUser === 'undefined' ||
        storedUser === 'null'
      ) {

        setName(
          isAdvocate
            ? 'Advocate'
            : 'Citizen'
        )

        setEmail('')

        setPhone('')

        setCity('')

        return

      }


      const user =
        JSON.parse(storedUser)


      setUserData(user)

    } catch (error) {

      console.error(
        'LOCAL STORAGE ERROR:',
        error
      )

    }

  }


  // ===================================================
  // SET USER DATA
  // ===================================================

  const setUserData = (
    user: any
  ) => {

    setUserDataState(user || {})

    const fullName =
      user?.fullName ||
      user?.full_name ||
      user?.name ||
      user?.advocateName ||
      user?.displayName ||
      user?.username ||
      ''


    const userEmail =
      user?.email || ''


    const userPhone =
      user?.phone ||
      user?.phoneNumber ||
      user?.mobile ||
      ''


    const userCity =
      user?.city ||
      user?.location ||
      ''


    // -----------------------------------------------
    // REMOVE "Adv." FROM NAME
    // -----------------------------------------------

    const cleanName =
      String(fullName)
        .replace(
          /^Adv\.\s*/i,
          ''
        )
        .trim()


    setName(
      cleanName
    )

    setEmail(
      userEmail
    )

    setPhone(
      userPhone
    )

    setCity(
      userCity
    )


    // -----------------------------------------------
    // BIO
    // -----------------------------------------------

    setBio(user?.bio || '')

    setBarCouncilNo(
      user?.barCouncilNo ||
      user?.bar_council_no ||
      ''
    )

    const storedPracticeAreas =
      user?.practiceAreas ||
      user?.practice_areas ||
      user?.specialization ||
      ''

    if (Array.isArray(storedPracticeAreas)) {
      setPracticeAreas(storedPracticeAreas.filter(Boolean))
    } else if (storedPracticeAreas) {
      setPracticeAreas(
        String(storedPracticeAreas)
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
      )
    } else {
      setPracticeAreas([])
    }

    setHighCourt(
      user?.highCourt ||
      user?.high_court ||
      ''
    )

    setEnrollmentYear(
      user?.enrollmentYear != null
        ? String(user.enrollmentYear)
        : user?.enrollment_year != null
          ? String(user.enrollment_year)
          : ''
    )

  }


  // ===================================================
  // SAVE PROFILE
  // ===================================================

  const handleSaveProfile = async () => {

    const token =
      localStorage.getItem('token')


    // -----------------------------------------------
    // CHECK LOGIN
    // -----------------------------------------------

    if (!token) {

      alert(
        'Your login session has expired. Please login again.'
      )

      return

    }


    // -----------------------------------------------
    // VALIDATION
    // -----------------------------------------------

    if (!name.trim()) {

      alert(
        'Please enter your full name.'
      )

      return

    }


    if (!email.trim()) {

      alert(
        'Please enter your email.'
      )

      return

    }


    setSaving(true)


    try {

      console.log(
        'Saving profile...'
      )


      // -----------------------------------------------
      // SEND TO BACKEND
      // -----------------------------------------------

      const response =
        await fetch(
          `${API_URL}/api/profile`,
          {
            method: 'PUT',

            headers: {

              'Content-Type':
                'application/json',

              Authorization:
                `Bearer ${token}`,

            },

            body:
              JSON.stringify({
                fullName: name.trim(),
                email: email.trim(),
                phone: phone.trim(),
                city: city.trim(),
                bio: bio.trim(),
                ...(isAdvocate
                  ? {
                      barCouncilNo: barCouncilNo.trim(),
                      practiceAreas,
                      highCourt: highCourt.trim(),
                      enrollmentYear: enrollmentYear.trim(),
                    }
                  : {}),
              })

            }

          )



      const data =
        await response.json()


      console.log(
        'UPDATE PROFILE RESPONSE:',
        data
      )


      // -----------------------------------------------
      // ERROR
      // -----------------------------------------------

      if (
        !response.ok ||
        !data.success
      ) {

        throw new Error(
          data.message ||
          'Failed to update profile'
        )

      }


      // -----------------------------------------------
      // UPDATED USER
      // -----------------------------------------------

      const updatedUser =
        data.user


      if (!updatedUser) {

        throw new Error(
          'Server did not return updated user information'
        )

      }


      // -----------------------------------------------
      // SAVE TO LOCAL STORAGE
      // -----------------------------------------------

      localStorage.setItem(
        'user',
        JSON.stringify(
          updatedUser
        )
      )


      // -----------------------------------------------
      // UPDATE SCREEN
      // -----------------------------------------------

      setUserData(
        updatedUser
      )


      // -----------------------------------------------
      // EXIT EDIT MODE
      // -----------------------------------------------

      setPracticeDropdownOpen(false)
      setEditing(false)


      alert(
        'Profile updated successfully!'
      )


    } catch (error) {

      console.error(
        'SAVE PROFILE ERROR:',
        error
      )


      alert(
        error instanceof Error
          ? error.message
          : 'Failed to update profile'
      )

    } finally {

      setSaving(false)

    }

  }


  // ===================================================
  // PRACTICE AREA SELECTION
  // ===================================================

  const togglePracticeArea = (area: string) => {
    setPracticeAreas((previous) =>
      previous.includes(area)
        ? previous.filter((item) => item !== area)
        : [...previous, area]
    )
  }


  // ===================================================
  // CANCEL EDIT
  // ===================================================

  const handleEditButton = () => {

    if (editing) {

      // ---------------------------------------------
      // CANCEL
      // ---------------------------------------------

      loadProfile()

      setPracticeDropdownOpen(false)

      setEditing(false)

    } else {

      // ---------------------------------------------
      // START EDITING
      // ---------------------------------------------

      setEditing(true)

    }

  }


  // ===================================================
  // INITIALS
  // ===================================================

  const getInitials = (
    userName: string
  ) => {

    const words =
      userName
        .split(/\s+/)
        .filter(Boolean)


    if (
      words.length >= 2
    ) {

      return (
        words[0].charAt(0) +
        words[1].charAt(0)
      ).toUpperCase()

    }


    return userName
      .slice(0, 2)
      .toUpperCase()

  }


  const userInitials =
    getInitials(
      name || (
        isAdvocate
          ? 'Advocate'
          : 'Citizen'
      )
    )

  // ---------------------------------------------------
  // DATA-DRIVEN ADVOCATE STATS
  // ---------------------------------------------------
  const currentYear = new Date().getFullYear()

  const parsedEnrollmentYear = Number(enrollmentYear)

  const hasValidEnrollmentYear =
    Number.isInteger(parsedEnrollmentYear) &&
    parsedEnrollmentYear >= 1900 &&
    parsedEnrollmentYear <= currentYear

  const experienceYears = hasValidEnrollmentYear
    ? Math.max(0, currentYear - parsedEnrollmentYear)
    : null

  const ratingValue =
    Number(userData?.rating) > 0
      ? Number(userData.rating).toFixed(1)
      : null

  const reviewCount =
    Number(userData?.reviewCount ?? userData?.reviews) > 0
      ? Number(userData.reviewCount ?? userData.reviews)
      : 0

  const totalCases =
    Number(userData?.totalCases ?? userData?.cases) > 0
      ? Number(userData.totalCases ?? userData.cases)
      : 0

  const selectedCourt =
    highCourt.trim() || 'Not specified'


  // ===================================================
  // DOCUMENTS
  // ===================================================

  // Documents will be populated when real document data is connected.
  const documents: any[] = []

  // ===================================================
  // APPOINTMENTS
  // ===================================================

  // Appointments will be populated from real booking data when connected.
  const appointments: any[] = []

  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {

    return (

      <div
        className="page-enter"
        style={{
          display:
            'flex',

          alignItems:
            'center',

          justifyContent:
            'center',

          minHeight:
            '400px',

          color:
            'var(--text-muted)',

          fontSize:
            '0.9rem',
        }}
      >

        Loading profile...

      </div>

    )

  }


  // ===================================================
  // UI
  // ===================================================

  return (

    <div
      className="page-enter"
      style={{
        display:
          'flex',

        flexDirection:
          'column',

        gap:
          24,

        maxWidth:
          860,
      }}
    >


      {/* =================================================
          PROFILE HEADER
          ================================================= */}

      <div
        className="card"
        style={{
          padding:
            28
        }}
      >

        <div
          style={{
            display:
              'flex',

            gap:
              24,

            alignItems:
              'flex-start',

            flexWrap:
              'wrap',
          }}
        >


          {/* =============================================
              AVATAR
              ============================================= */}

          <div
            style={{
              position:
                'relative',
            }}
          >

            <div
              className="avatar"
              style={{
                width:
                  88,

                height:
                  88,

                fontSize:
                  '1.8rem',

                background:
                  isAdvocate
                    ? 'linear-gradient(135deg, var(--emerald), #065F46)'
                    : 'linear-gradient(135deg, var(--blue), #7C3AED)',
              }}
            >

              {userInitials}

            </div>


            <button
              type="button"
              style={{
                position:
                  'absolute',

                bottom:
                  0,

                right:
                  0,

                width:
                  28,

                height:
                  28,

                borderRadius:
                  '50%',

                border:
                  '2px solid var(--bg-card)',

                background:
                  'var(--blue)',

                cursor:
                  'pointer',

                display:
                  'flex',

                alignItems:
                  'center',

                justifyContent:
                  'center',
              }}
            >

              <Camera
                size={13}
                color="white"
              />

            </button>

          </div>


          {/* =============================================
              USER INFORMATION
              ============================================= */}

          <div
            style={{
              flex:
                1,

              minWidth:
                200,
            }}
          >

            <div
              style={{
                display:
                  'flex',

                alignItems:
                  'center',

                gap:
                  12,

                marginBottom:
                  4,

                flexWrap:
                  'wrap',
              }}
            >

              <h1
                style={{
                  fontSize:
                    '1.4rem',

                  fontWeight:
                    800,

                  color:
                    'var(--text)',

                  letterSpacing:
                    '-0.02em',
                }}
              >

                {isAdvocate
                  ? `Adv. ${name}`
                  : name}

              </h1>


              {isAdvocate && (

                <span
                  style={{
                    display:
                      'inline-flex',

                    alignItems:
                      'center',

                    gap:
                      4,

                    padding:
                      '4px 10px',

                    borderRadius:
                      99,

                    fontSize:
                      '0.7rem',

                    fontWeight:
                      700,

                    background:
                      'var(--emerald-subtle)',

                    color:
                      'var(--emerald)',

                    border:
                      '1px solid var(--emerald-light)',
                  }}
                >

                  <Award
                    size={11}
                  />

                  Verified Advocate

                </span>

              )}

            </div>


            {/* CONTACT INFORMATION */}

            <div
              style={{
                display:
                  'flex',

                gap:
                  16,

                flexWrap:
                  'wrap',
              }}
            >

              {(
                [
                  [Mail, email],
                  [Phone, phone],
                  [MapPin, city],
                ] as [
                  typeof Mail,
                  string
                ][]
              ).map(
                ([Icon, val], i) => (

                  <div
                    key={i}
                    style={{
                      display:
                        'flex',

                      alignItems:
                        'center',

                      gap:
                        5,

                      fontSize:
                        '0.82rem',

                      color:
                        'var(--text-muted)',
                    }}
                  >

                    <Icon
                      size={13}
                      style={{
                        color:
                          'var(--text-subtle)',

                        flexShrink:
                          0,
                      }}
                    />

                    {val ||
                      'Not provided'}

                  </div>

                )
              )}

            </div>


            {/* ADVOCATE STATS */}

            {isAdvocate && (

              <div
                style={{
                  display:
                    'flex',

                  gap:
                    16,

                  marginTop:
                    12,

                  flexWrap:
                    'wrap',
                }}
              >

                {[
                  [
                    ratingValue
                      ? `${ratingValue} ⭐`
                      : 'New user',
                    ratingValue
                      ? `${reviewCount} reviews`
                      : 'No ratings yet'
                  ],

                  [
                    experienceYears !== null
                      ? `${experienceYears}yr`
                      : 'Not specified',
                    'experience'
                  ],

                  [
                    String(totalCases),
                    'cases'
                  ],

                  [
                    selectedCourt,
                    'court'
                  ],

                ].map(
                  ([v, l]) => (

                    <div
                      key={l}
                    >

                      <span
                        style={{
                          fontWeight:
                            700,

                          color:
                            'var(--text)',

                          fontSize:
                            '0.9rem',
                        }}
                      >

                        {v}

                      </span>

                      <span
                        style={{
                          color:
                            'var(--text-muted)',

                          fontSize:
                            '0.75rem',

                          marginLeft:
                            4,
                        }}
                      >

                        {l}

                      </span>

                    </div>

                  )
                )}

              </div>

            )}

          </div>


          {/* =============================================
              EDIT / SAVE BUTTON
              ============================================= */}

          <button
            type="button"
            onClick={() => {

              if (editing) {

                handleSaveProfile()

              } else {

                handleEditButton()

              }

            }}
            disabled={
              saving
            }
            className={
              editing
                ? 'btn-emerald'
                : 'btn-ghost'
            }
            style={{
              padding:
                '9px 18px',

              borderRadius:
                9,

              fontSize:
                '0.85rem',

              fontWeight:
                600,

              cursor:
                saving
                  ? 'not-allowed'
                  : 'pointer',

              border:
                editing
                  ? 'none'
                  : '1px solid var(--border)',

              display:
                'flex',

              alignItems:
                'center',

              gap:
                6,

              opacity:
                saving
                  ? 0.7
                  : 1,
            }}
          >

            {editing ? (

              <>

                <Save
                  size={14}
                />

                {saving
                  ? 'Saving...'
                  : 'Save Changes'}

              </>

            ) : (

              <>

                <Edit2
                  size={14}
                />

                Edit Profile

              </>

            )}

          </button>

        </div>

      </div>


      {/* =================================================
          PERSONAL INFORMATION
          ================================================= */}

      <div
        className="card"
        style={{
          padding:
            24
        }}
      >

        <h2
          style={{
            fontWeight:
              700,

            color:
              'var(--text)',

            fontSize:
              '0.95rem',

            marginBottom:
              20,
          }}
        >

          Personal Information

        </h2>


        <div
          style={{
            display:
              'grid',

            gridTemplateColumns:
              '1fr 1fr',

            gap:
              16,
          }}
          className="form-grid"
        >

          {[
            {
              label:
                'Full Name',

              val:
                name,

              set:
                setName,

              type:
                'text',
            },

            {
              label:
                'Email Address',

              val:
                email,

              set:
                setEmail,

              type:
                'email',
            },

            {
              label:
                'Phone Number',

              val:
                phone,

              set:
                setPhone,

              type:
                'tel',
            },

            {
              label:
                'City / Location',

              val:
                city,

              set:
                setCity,

              type:
                'text',
            },

          ].map((f) => (

            <div
              key={f.label}
            >

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

                {f.label}

              </label>


              <input
                type={
                  f.type
                }

                className="input"

                value={
                  f.val
                }

                onChange={
                  (e) =>
                    f.set(
                      e.target.value
                    )
                }

                readOnly={
                  !editing
                }
              />

            </div>

          ))}

        </div>


        {/* BIO */}

        <div
          style={{
            marginTop:
              16,
          }}
        >

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

            Bio / About

          </label>


          <textarea
            className="input"

            rows={3}

            value={
              bio
            }

            onChange={
              (e) =>
                setBio(
                  e.target.value
                )
            }

            readOnly={
              !editing
            }

            style={{
              resize:
                editing
                  ? 'vertical'
                  : 'none',
            }}
          />

        </div>


        {/* ADVOCATE INFORMATION */}

        {isAdvocate && (
          <div
            style={{
              marginTop: 16,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 16,
            }}
            className="form-grid"
          >
            <div>
              <label
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  display: 'block',
                  marginBottom: 6,
                }}
              >
                Bar Council No.
              </label>

              <input
                type="text"
                className="input"
                value={barCouncilNo}
                onChange={(e) => setBarCouncilNo(e.target.value)}
                readOnly={!editing}
                placeholder="Enter Bar Council number"
              />
            </div>

            <div ref={practiceDropdownRef} style={{ position: 'relative' }}>
              <label
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  display: 'block',
                  marginBottom: 6,
                }}
              >
                Practice Area
              </label>

              {editing ? (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setPracticeDropdownOpen((open) => !open)
                    }
                    style={{
                      width: '100%',
                      minHeight: 42,
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: '1px solid var(--border)',
                      background: 'var(--bg-card)',
                      color: practiceAreas.length
                        ? 'var(--text)'
                        : 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '0.85rem',
                    }}
                  >
                    <span
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {practiceAreas.length
                        ? practiceAreas.join(', ')
                        : 'Select practice areas'}
                    </span>

                    <ChevronDown
                      size={16}
                      style={{
                        flexShrink: 0,
                        transform: practiceDropdownOpen
                          ? 'rotate(180deg)'
                          : 'none',
                        transition: 'transform 0.15s ease',
                      }}
                    />
                  </button>

                  {practiceDropdownOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        marginTop: 6,
                        maxHeight: 280,
                        overflowY: 'auto',
                        padding: 6,
                        borderRadius: 10,
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        boxShadow: '0 16px 40px rgba(0,0,0,0.45)',
                        zIndex: 50,
                      }}
                    >
                      {PRACTICE_AREA_OPTIONS.map((area) => {
                        const selected = practiceAreas.includes(area)

                        return (
                          <button
                            key={area}
                            type="button"
                            onClick={() => togglePracticeArea(area)}
                            style={{
                              width: '100%',
                              border: 'none',
                              background: selected
                                ? 'var(--bg-secondary)'
                                : 'transparent',
                              color: 'var(--text)',
                              padding: '9px 10px',
                              borderRadius: 7,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 9,
                              cursor: 'pointer',
                              textAlign: 'left',
                              fontSize: '0.8rem',
                            }}
                          >
                            <span
                              style={{
                                width: 18,
                                height: 18,
                                borderRadius: 5,
                                border: '1px solid var(--border)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                background: selected
                                  ? '#D4AF37'
                                  : 'transparent',
                              }}
                            >
                              {selected && (
                                <Check
                                  size={12}
                                  color="#111"
                                  strokeWidth={3}
                                />
                              )}
                            </span>

                            <span>{area}</span>
                          </button>
                        )
                      })}

                      <div
                        style={{
                          borderTop: '1px solid var(--border)',
                          marginTop: 4,
                          padding: '8px 8px 4px',
                          fontSize: '0.7rem',
                          color: 'var(--text-subtle)',
                        }}
                      >
                        Select one or more practice areas.
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <input
                  type="text"
                  className="input"
                  value={
                    practiceAreas.length
                      ? practiceAreas.join(', ')
                      : 'Not specified'
                  }
                  readOnly
                />
              )}
            </div>

            <div>
              <label
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  display: 'block',
                  marginBottom: 6,
                }}
              >
                High Court
              </label>

              <input
                type="text"
                className="input"
                value={highCourt}
                onChange={(e) => setHighCourt(e.target.value)}
                readOnly={!editing}
                placeholder="e.g. Delhi High Court"
              />
            </div>

            <div>
              <label
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  display: 'block',
                  marginBottom: 6,
                }}
              >
                Enrollment Year
              </label>

              <input
                type="number"
                min="1900"
                max={new Date().getFullYear()}
                className="input"
                value={enrollmentYear}
                onChange={(e) => setEnrollmentYear(e.target.value)}
                readOnly={!editing}
                placeholder="e.g. 2009"
              />
            </div>
          </div>
        )}

        </div>


      {/* =================================================
          DOCUMENTS
          ================================================= */}

      <div
        className="card"
        style={{
          padding:
            24
        }}
      >

        <div
          style={{
            display:
              'flex',

            justifyContent:
              'space-between',

            alignItems:
              'center',

            marginBottom:
              18,
          }}
        >

          <h2
            style={{
              fontWeight:
                700,

              color:
                'var(--text)',

              fontSize:
                '0.95rem',
            }}
          >

            {isAdvocate
              ? 'Credentials & Documents'
              : 'Uploaded Documents'}

          </h2>


          <button
            type="button"
            className="btn-primary"
            style={{
              padding:
                '7px 14px',

              borderRadius:
                8,

              fontSize:
                '0.78rem',

              fontWeight:
                600,

              border:
                'none',

              cursor:
                'pointer',
            }}
          >

            Upload +

          </button>

        </div>


        <div
          style={{
            display:
              'flex',

            flexDirection:
              'column',

            gap:
              10,
          }}
        >

          {documents.length ? (
            documents.map(
              (d, i) => (
                <div key={i}>
                  {d.name}
                </div>
              )
            )
          ) : (
            <div
              style={{
                padding: '18px',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '0.82rem',
                border: '1px dashed var(--border)',
                borderRadius: 10,
              }}
            >
              No documents uploaded yet.
            </div>
          )}

        </div>

      </div>


      {/* =================================================
          APPOINTMENTS
          ================================================= */}

      <div
        className="card"
        style={{
          padding:
            24
        }}
      >

        <h2
          style={{
            fontWeight:
              700,

            color:
              'var(--text)',

            fontSize:
              '0.95rem',

            marginBottom:
              18,
          }}
        >

          Appointments

        </h2>


        <div
          style={{
            display:
              'flex',

            flexDirection:
              'column',

            gap:
              12,
          }}
        >

          {appointments.length ? (
            appointments.map(
              (a, i) => (
                <div key={i}>
                  {a.with}
                </div>
              )
            )
          ) : (
            <div
              style={{
                padding: '18px',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '0.82rem',
                border: '1px dashed var(--border)',
                borderRadius: 10,
              }}
            >
              No appointments yet.
            </div>
          )}

        </div>

      </div>


      {/* =================================================
          RESPONSIVE
          ================================================= */}

      <style>{`

        @media (max-width: 700px) {

          .form-grid {
            grid-template-columns:
              1fr !important;
          }

        }

      `}</style>

    </div>

  )

}