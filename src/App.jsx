import LegacyApp from './components/LegacyApp'
import { Navigate, Route, Routes, matchPath, useLocation } from 'react-router-dom'

function RoutedLegacyApp() {
  const { pathname } = useLocation()
  const productMatch = matchPath('/product/:productId', pathname)
  const groupHostMatch = matchPath('/group/host/:sessionId', pathname)
  const groupJoinMatch = matchPath('/group/join/:sessionId', pathname)

  let routeMode = 'home'
  let standaloneAdminPage = false
  let routeProductId = null
  let routeGroupSessionId = null
  let bootstrapFriendSessionId = null

  if (productMatch?.params?.productId) {
    routeMode = 'product'
    routeProductId = productMatch.params.productId
  } else if (groupHostMatch?.params?.sessionId) {
    routeMode = 'group-host'
    routeGroupSessionId = groupHostMatch.params.sessionId
  } else if (groupJoinMatch?.params?.sessionId) {
    routeMode = 'home'
    bootstrapFriendSessionId = groupJoinMatch.params.sessionId
  } else if (pathname === '/member') {
    routeMode = 'member'
  } else if (pathname === '/cart') {
    routeMode = 'cart'
  } else if (pathname === '/admin/dashboard') {
    routeMode = 'admin-dashboard'
    standaloneAdminPage = true
  } else if (pathname === '/admin/orders') {
    routeMode = 'admin-orders'
    standaloneAdminPage = true
  } else if (pathname === '/admin/customers') {
    routeMode = 'admin-customers'
    standaloneAdminPage = true
  } else if (pathname === '/admin/products') {
    routeMode = 'admin-products'
    standaloneAdminPage = true
  } else if (pathname !== '/') {
    return <Navigate to="/" replace />
  }

  return (
    <LegacyApp
      routeMode={routeMode}
      routeProductId={routeProductId}
      routeGroupSessionId={routeGroupSessionId || ''}
      bootstrapFriendSessionId={bootstrapFriendSessionId || ''}
      standaloneAdminPage={standaloneAdminPage}
    />
  )
}

function App() {
  return (
    <Routes>
      <Route path="*" element={<RoutedLegacyApp />} />
    </Routes>
  )
}

export default App
