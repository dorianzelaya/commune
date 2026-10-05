import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import NavBar from './components/NavBar'
import LiturgicalTheme from './components/LiturgicalTheme'
import PageTransition from './components/PageTransition'
import Home from './pages/Home'
import Readings from './pages/Readings'
import Rosary from './pages/Rosary'
import Struggle from './pages/Struggle'
import Register from './pages/Register'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Saint from './pages/Saint'
import ExaminationOfConscience from './pages/ExaminationOfConscience'
import Prayers from './pages/Prayers'
import Bible from './pages/Bible'
import Profile from './pages/Profile'

const AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password']

function AnimatedRoutes() {
  const location = useLocation()
  const bibleKey = location.state?.bibleKey ?? 'bible'

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/register" element={
          <PageTransition><Register /></PageTransition>
        } />
        <Route path="/login" element={
          <PageTransition><Login /></PageTransition>
        } />
        <Route path="/forgot-password" element={
          <PageTransition><ForgotPassword /></PageTransition>
        } />
        <Route path="/reset-password" element={
          <PageTransition><ResetPassword /></PageTransition>
        } />
        <Route path="/home" element={
          <ProtectedRoute><PageTransition><Home /></PageTransition></ProtectedRoute>
        } />
        <Route path="/readings" element={
          <ProtectedRoute><PageTransition><Readings /></PageTransition></ProtectedRoute>
        } />
        <Route path="/rosary" element={
          <ProtectedRoute><PageTransition><Rosary /></PageTransition></ProtectedRoute>
        } />
        <Route path="/struggle" element={
          <ProtectedRoute><PageTransition><Struggle /></PageTransition></ProtectedRoute>
        } />
        <Route path="/saint" element={
          <ProtectedRoute><PageTransition><Saint /></PageTransition></ProtectedRoute>
        } />
        <Route path="/examination" element={
          <ProtectedRoute><PageTransition><ExaminationOfConscience /></PageTransition></ProtectedRoute>
        } />
        <Route path="/prayers" element={
          <ProtectedRoute><PageTransition><Prayers /></PageTransition></ProtectedRoute>
        } />
        <Route path="/bible" element={
          <ProtectedRoute>
            <PageTransition key={bibleKey}>
              <Bible />
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute><PageTransition><Profile /></PageTransition></ProtectedRoute>
        } />
      </Routes>
    </AnimatePresence>
  )
}

function AppShell() {
  const location = useLocation()
  const hideNav = AUTH_ROUTES.includes(location.pathname)

  return (
    <div className="app-shell">
      {/* Renders nothing. Sets data-color on <html>, which swaps the page
          background to the day's liturgical colour or to whatever the user
          pinned in settings. */}
      <LiturgicalTheme />
      <div className={`app-content ${hideNav ? 'no-nav' : ''}`}>
        <AnimatedRoutes />
      </div>
      {!hideNav && <NavBar />}
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
