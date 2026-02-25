import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginMock from './pages/LoginMock'
import Dashboard from './pages/Dashboard'
import RFQList from './pages/RFQList'
import RFQCreate from './pages/RFQCreate'
import RFQDetail from './pages/RFQDetail'
import QuoteCreate from './pages/QuoteCreate'
import CatalogPage from './pages/CatalogPage'
import Layout from './components/Layout'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const ok = localStorage.getItem('tenantCompanyId') && localStorage.getItem('userRole')
  return ok ? <>{children}</> : <Navigate to="/" replace />
}

function Protected({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <Layout>{children}</Layout>
    </RequireAuth>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"              element={<LoginMock />} />
        <Route path="/dashboard"     element={<Protected><Dashboard /></Protected>} />
        <Route path="/catalog"       element={<Protected><CatalogPage /></Protected>} />
        <Route path="/rfqs"          element={<Protected><RFQList /></Protected>} />
        <Route path="/rfqs/new"      element={<Protected><RFQCreate /></Protected>} />
        <Route path="/rfqs/:id"      element={<Protected><RFQDetail /></Protected>} />
        <Route path="/rfqs/:id/quote" element={<Protected><QuoteCreate /></Protected>} />
      </Routes>
    </BrowserRouter>
  )
}
