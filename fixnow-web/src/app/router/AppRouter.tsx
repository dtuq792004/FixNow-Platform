import { Navigate, createBrowserRouter } from 'react-router-dom'
import { CustomerLayout } from '../../layouts/CustomerLayout'
import { ProviderLayout } from '../../layouts/ProviderLayout'
import { ProtectedRoute } from '../../modules/auth/components/ProtectedRoute'
import { ForgotPasswordPage } from '../../modules/auth/pages/ForgotPasswordPage'
import { LoginPage } from '../../modules/auth/pages/LoginPage'
import { ResetPasswordPage } from '../../modules/auth/pages/ResetPasswordPage'
import { SignupPage } from '../../modules/auth/pages/SignupPage'
import { VerificationPage } from '../../modules/auth/pages/VerificationPage'
import { ChattingPage } from '../../modules/chat/pages/ChattingPage'
import { CustomerHomePage } from '../../modules/customer/pages/CustomerHomePage'
import { GuestAboutPage } from '../../modules/guest/pages/GuestAboutPage'
import { GuestBlogPage } from '../../modules/guest/pages/GuestBlogPage'
import { GuestServicesPage } from '../../modules/guest/pages/GuestServicesPage'
import { GuestSupportPage } from '../../modules/guest/pages/GuestSupportPage'
import { LandingPage } from '../../modules/guest/pages/LandingPage'
import { PaymentPage } from '../../modules/payment/pages/PaymentPage'
import { ProviderDashboardPage } from '../../modules/provider/pages/ProviderDashboardPage'
import { ProviderCompleteJobPage } from '../../modules/provider/pages/ProviderCompleteJobPage'
import { ProviderJobDetailPage } from '../../modules/provider/pages/ProviderJobDetailPage'
import { ProviderJobsPage } from '../../modules/provider/pages/ProviderJobsPage'
import { ProviderMessagesPage } from '../../modules/provider/pages/ProviderMessagesPage'
import { ProviderNotificationsPage } from '../../modules/provider/pages/ProviderNotificationsPage'
import { ProviderProfilePage } from '../../modules/provider/pages/ProviderProfilePage'
import { ProviderRequestPage } from '../../modules/provider/pages/ProviderRequestPage'
import { ProviderReviewsPage } from '../../modules/provider/pages/ProviderReviewsPage'
import { ProviderServicesPage } from '../../modules/provider/pages/ProviderServicesPage'
import { ProviderStartJobPage } from '../../modules/provider/pages/ProviderStartJobPage'
import { ProviderWalletPage } from '../../modules/provider/pages/ProviderWalletPage'
import { AddressPage } from '../../modules/profile/pages/AddressPage'
import { ProfileCustomerPage } from '../../modules/profile/pages/ProfileCustomerPage'
import { RequestBookingPage } from '../../modules/request/pages/RequestBookingPage'
import { ReviewServicePage } from '../../modules/request/pages/ReviewServicePage'
import { ServiceHistoryPage } from '../../modules/request/pages/ServiceHistoryPage'
import { TrackingProcessPage } from '../../modules/request/pages/TrackingProcessPage'
import { ROLES } from '../../shared/constants/roles'

export const appRouter = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  { path: '/services', element: <GuestServicesPage /> },
  { path: '/about', element: <GuestAboutPage /> },
  { path: '/blog', element: <GuestBlogPage /> },
  { path: '/support', element: <GuestSupportPage /> },
  { path: '/auth/login', element: <LoginPage /> },
  { path: '/auth/signup', element: <SignupPage /> },
  { path: '/auth/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/auth/verification', element: <VerificationPage /> },
  { path: '/auth/reset-password', element: <ResetPasswordPage /> },
  { path: '/login', element: <Navigate to="/auth/login" replace /> },
  { path: '/signup', element: <Navigate to="/auth/signup" replace /> },
  { path: '/forgot-password', element: <Navigate to="/auth/forgot-password" replace /> },
  { path: '/verification', element: <Navigate to="/auth/verification" replace /> },
  {
    path: '/customer',
    element: (
      <ProtectedRoute allowedRoles={[ROLES.CUSTOMER]}>
        <CustomerLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="home" replace /> },
      { path: 'home', element: <CustomerHomePage /> },
      { path: 'request/new', element: <RequestBookingPage /> },
      { path: 'payment/:requestId', element: <PaymentPage /> },
      { path: 'tracking/:requestId', element: <TrackingProcessPage /> },
      { path: 'history', element: <ServiceHistoryPage /> },
      { path: 'review/:requestId', element: <ReviewServicePage /> },
      { path: 'profile', element: <ProfileCustomerPage /> },
      { path: 'addresses', element: <AddressPage /> },
      { path: 'chat', element: <ChattingPage /> },
    ],
  },
  {
    path: '/provider',
    element: (
      <ProtectedRoute allowedRoles={[ROLES.PROVIDER]}>
        <ProviderLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <ProviderDashboardPage /> },
      { path: 'jobs', element: <ProviderJobsPage /> },
      { path: 'jobs/request', element: <ProviderRequestPage /> },
      { path: 'jobs/:jobId', element: <ProviderJobDetailPage /> },
      { path: 'jobs/:jobId/start', element: <ProviderStartJobPage /> },
      { path: 'jobs/:jobId/complete', element: <ProviderCompleteJobPage /> },
      { path: 'services', element: <ProviderServicesPage /> },
      { path: 'wallet', element: <ProviderWalletPage /> },
      { path: 'reviews', element: <ProviderReviewsPage /> },
      { path: 'messages', element: <ProviderMessagesPage /> },
      { path: 'notifications', element: <ProviderNotificationsPage /> },
      { path: 'profile', element: <ProviderProfilePage /> },
      { path: '*', element: <Navigate to="dashboard" replace /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
