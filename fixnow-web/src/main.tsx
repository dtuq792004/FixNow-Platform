import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { AppProviders } from './app/providers/AppProviders'
import { appRouter } from './app/router/AppRouter'
import { trackPageview } from './shared/analytics/webAnalytics'
import 'leaflet/dist/leaflet.css'
import './index.css'

// Web analytics first-party: pageview lúc tải + mỗi lần đổi route (SPA).
trackPageview(window.location.pathname)
appRouter.subscribe((state) => trackPageview(state.location.pathname))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <RouterProvider router={appRouter} />
    </AppProviders>
  </StrictMode>,
)
