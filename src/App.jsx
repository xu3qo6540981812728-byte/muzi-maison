import LegacyApp from './components/LegacyApp'
import { Navigate, Route, Routes } from 'react-router-dom'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LegacyApp routeMode="home" />} />
      <Route path="/member" element={<LegacyApp routeMode="member" />} />
      <Route path="/cart" element={<LegacyApp routeMode="cart" />} />
      <Route path="/admin/dashboard" element={<LegacyApp routeMode="admin-dashboard" />} />
      <Route path="/admin/orders" element={<LegacyApp routeMode="admin-orders" />} />
      <Route path="/admin/customers" element={<LegacyApp routeMode="admin-customers" />} />
      <Route path="/admin/products" element={<LegacyApp routeMode="admin-products" />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
