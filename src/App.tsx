import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginMock from './pages/LoginMock'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import RFQList from './pages/RFQList'
import RFQCreate from './pages/RFQCreate'
import RFQDetail from './pages/RFQDetail'
import QuoteCreate from './pages/QuoteCreate'
import CatalogPage from './pages/CatalogPage'
import ProductDetail from './pages/ProductDetail'
import OrderList from './pages/OrderList'
import OrderDetail from './pages/OrderDetail'
import SupplierProfile from './pages/SupplierProfile'
import SellerDashboard from './pages/seller/SellerDashboard'
import SellerInventory from './pages/seller/SellerInventory'
import SellerQuoteResponse from './pages/seller/SellerQuoteResponse'
import SellerRFQList from './pages/seller/SellerRFQList'
import BuyerLayout from './components/BuyerLayout'
import { ToastProvider } from './contexts/ToastContext'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const ok = localStorage.getItem('tenantCompanyId') && localStorage.getItem('userRole')
  return ok ? <>{children}</> : <Navigate to="/login" replace />
}

function RequireSupplier({ children }: { children: React.ReactNode }) {
  const tenantId = localStorage.getItem('tenantCompanyId')
  const role     = localStorage.getItem('userRole')
  if (!tenantId || !role) return <Navigate to="/login" replace />
  if (role !== 'supplier_user') return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

function Protected({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <BuyerLayout>{children}</BuyerLayout>
    </RequireAuth>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/"          element={<LandingPage />} />
          <Route path="/login"     element={<LoginMock />} />

          {/* Protected — buyer/admin layout */}
          <Route path="/dashboard"              element={<Protected><Dashboard /></Protected>} />
          <Route path="/catalog"                element={<Protected><CatalogPage /></Protected>} />
          <Route path="/catalog/:categoryKey"   element={<Protected><ProductDetail /></Protected>} />
          <Route path="/rfqs"                   element={<Protected><RFQList /></Protected>} />
          <Route path="/rfqs/new"               element={<Protected><RFQCreate /></Protected>} />
          <Route path="/rfqs/:id"               element={<Protected><RFQDetail /></Protected>} />
          <Route path="/rfqs/:id/quote"         element={<Protected><QuoteCreate /></Protected>} />
          <Route path="/orders"                 element={<Protected><OrderList /></Protected>} />
          <Route path="/orders/:id"             element={<Protected><OrderDetail /></Protected>} />
          <Route path="/suppliers/:id"          element={<Protected><SupplierProfile /></Protected>} />

          {/* Seller Center — uses SellerLayout internally */}
          <Route path="/seller"                 element={<RequireSupplier><SellerDashboard /></RequireSupplier>} />
          <Route path="/seller/rfqs"            element={<RequireSupplier><SellerRFQList /></RequireSupplier>} />
          <Route path="/seller/inventory"       element={<RequireSupplier><SellerInventory /></RequireSupplier>} />
          <Route path="/seller/quotes"          element={<RequireSupplier><SellerQuoteResponse /></RequireSupplier>} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  )
}
