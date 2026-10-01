import { createBrowserRouter } from 'react-router'
import YourBookings from '../pages/YourBookings'
import RootLayout from '../components/layout/RootLayout'
import DashboardLayout from '../components/layout/DashboardLayout'

import Landing from '../pages/Landing'
import Login from '../pages/Login'
import CitizenDashboard from '../pages/CitizenDashboard'
import AIAssistant from '../pages/AIAssistant'
import AdvocateListing from '../pages/AdvocateListing'
import AdvocateDashboard from '../pages/AdvocateDashboard'
import AIResearch from '../pages/AIResearch'
import Booking from '../pages/Booking'
import Profile from '../pages/Profile'
import Cases from '../pages/Cases'
import NewCase from '../pages/NewCase'
import CaseWorkspace from '../pages/CaseWorkspace'
import Documents from '../pages/Documents'
import Notifications from '../pages/Notifications'
import Settings from '../pages/Settings'

import AdvocateAppointments from '../pages/advocate/Appointments'
import AdvocateClients from '../pages/advocate/Clients'
import AdvocateConsultationRequests from '../pages/advocate/ConsultationRequests'
import AdvocateAvailability from '../pages/advocate/Availability'
import AdvocateEarnings from '../pages/advocate/Earnings'
import AdvocateAnalytics from '../pages/advocate/Analytics'

import NotFound from '../pages/NotFound'

export const router = createBrowserRouter([
  {
    Component: RootLayout,
    children: [
      { index: true, Component: Landing },
      { path: 'login', Component: Login },
      { path: 'advocate-login', Component: Login },
      { path: 'signup', Component: Login },
    ],
  },

  {
    path: 'dashboard',
    Component: DashboardLayout,
    children: [
      { index: true, Component: CitizenDashboard },
      { path: 'ai-assistant', Component: AIAssistant },
      { path: 'advocates', Component: AdvocateListing },
      { path: 'booking', Component: Booking },
      { path: 'profile', Component: Profile },
      { path: 'cases', Component: Cases },
      { path: 'cases/:caseId', Component: CaseWorkspace },
      { path: 'new-case', Component: NewCase },
      { path: 'documents', Component: Documents },
      { path: 'bookings', Component: YourBookings },
      { path: 'notifications', Component: Notifications },
      { path: 'settings', Component: Settings },
    ],
  },

  {
    path: 'advocate',
    Component: DashboardLayout,
    children: [
      { index: true, Component: AdvocateDashboard },
      { path: 'appointments', Component: AdvocateAppointments },
      { path: 'clients', Component: AdvocateClients },
      {
        path: 'consultation-requests',
        Component: AdvocateConsultationRequests,
      },
      { path: 'availability', Component: AdvocateAvailability },
      { path: 'ai-research', Component: AIResearch },
      { path: 'profile', Component: Profile },
      { path: 'documents', Component: Documents },
      { path: 'earnings', Component: AdvocateEarnings },
      { path: 'analytics', Component: AdvocateAnalytics },
      { path: 'settings', Component: Settings },
      { path: 'notifications', Component: Notifications },
    ],
  },

  { path: '*', Component: NotFound },
])
