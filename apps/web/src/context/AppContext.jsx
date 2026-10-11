import { createContext, useContext, useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'

const AppContext = createContext(null)

export const ROLES = [
  { key: 'student',           label: 'Student / Parent',     short: 'SP' },
  { key: 'registrar',         label: 'Registrar',             short: 'RG' },
  { key: 'canteen_personnel', label: 'Canteen Personnel',     short: 'CP' },
  { key: 'library_personnel', label: 'Library Personnel',     short: 'LP' },
  { key: 'admin',             label: 'Administrator',         short: 'AD' },
]

export const ROLE_ACCESS = {
  student:           ['home', 'canteen', 'library', 'logging-records', 'profile'],
  registrar:         ['home', 'financial-services', 'profile'],
  canteen_personnel: ['home', 'canteen', 'profile'],
  library_personnel: ['home', 'library', 'profile'],
  admin:             ['home', 'announcements', 'logging-records', 'audit-logs', 'settings', 'profile'],
}

export function AppProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('issrms_token') || null)
  const [role, setRoleState] = useState(() => localStorage.getItem('issrms_role') || 'admin')
  const [activeStudentId, setActiveStudentId] = useState('STU-2026-0891')
  const [liveAccounts, setLiveAccounts] = useState([])
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('issrms_user')
    if (saved) {
      try { return JSON.parse(saved) } catch (_) {}
    }
    return {
      id: '22100277',
      name: 'Joel June Fabillar',
      title: 'Administrator',
      role: 'admin',
      avatar: 'joel',
      must_change_password: false
    }
  })
  const [mustChangePassword, setMustChangePassword] = useState(false)
  const [libraryCatalogCache, setLibraryCatalogCache] = useState([])
  const [notifications, setNotifications] = useState([])
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(0)

  // 1. Fetch live accounts and roles directly from MySQL on mount
  const refreshLiveAccounts = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/v1/auth/roles-overview')
      if (res.ok) {
        const data = await res.json()
        setLiveAccounts(data.accounts || [])
        // Ensure active role's token is always updated with a fresh signed token from MySQL
        if (data.accounts?.length > 0) {
          const currentRole = localStorage.getItem('issrms_role') || 'admin'
          const defaultAcc = data.accounts.find(a => a.role === currentRole) || data.accounts[0]
          if (defaultAcc?.token) {
            setToken(defaultAcc.token)
            localStorage.setItem('issrms_token', defaultAcc.token)
          }
        }
      }
    } catch (err) {
      console.warn('Could not load live roles from backend:', err.message)
    }
  }

  // Eagerly preload Library Catalog before the page is ever visited
  const preloadLibraryCatalog = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/v1/library/catalog')
      if (res.ok) {
        const data = await res.json()
        if (data.books) {
          setLibraryCatalogCache(data.books.map(b => ({
            ...b,
            available: b.available > 0,
            copiesAvailable: b.available
          })))
        }
      }
    } catch (err) {
      console.warn('Library preloading error:', err)
    }
  }

  // Fetch Live Notifications from MySQL
  const loadNotifications = async () => {
    const activeToken = token || localStorage.getItem('issrms_token')
    if (!activeToken) return
    try {
      const res = await fetch('http://localhost:5000/api/v1/notifications', {
        headers: { 'Authorization': 'Bearer ' + activeToken }
      })
      if (res.ok) {
        const data = await res.json()
        if (data.notifications) {
          setNotifications(data.notifications)
          setUnreadNotifsCount(data.notifications.filter(n => !n.isRead).length)
        }
      }
    } catch (err) {
      console.warn('Could not load notifications:', err)
    }
  }

  const markAllNotificationsRead = async () => {
    const activeToken = token || localStorage.getItem('issrms_token')
    if (!activeToken) return
    try {
      await fetch('http://localhost:5000/api/v1/notifications/mark-read', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + activeToken }
      })
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadNotifsCount(0)
    } catch (err) {
      console.warn('Failed to mark notifications read:', err)
    }
  }

  useEffect(() => {
    refreshLiveAccounts()
    preloadLibraryCatalog() // Parallel prefetch on initialization
  }, [])

  useEffect(() => {
    if (token) {
      loadNotifications()
    }
  }, [token])

  // 2. Live Login API integration (Argon2id against MySQL)
  const login = async (idNumber, password) => {
    try {
      const res = await fetch('http://localhost:5000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_number: idNumber, password })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed')
      }

      setToken(data.token)
      localStorage.setItem('issrms_token', data.token)
      
      const userProfile = {
        id: data.user.id_number,
        name: data.user.name,
        role: data.user.role,
        title: data.user.role === 'admin' ? 'Administrator' :
               data.user.role === 'registrar' ? 'Registrar' :
               data.user.role === 'canteen_personnel' ? 'Canteen Personnel' :
               data.user.role === 'library_personnel' ? 'Library Personnel' : 'Student / Parent',
        avatar: data.user.id_number === '22100277' ? 'joel' : 'default',
        must_change_password: Boolean(data.user.must_change_password)
      }

      setCurrentUser(userProfile)
      setRoleState(data.user.role)
      setMustChangePassword(Boolean(data.user.must_change_password))
      localStorage.setItem('issrms_role', data.user.role)
      localStorage.setItem('issrms_user', JSON.stringify(userProfile))

      if (data.user.role === 'student') {
        setActiveStudentId(data.user.id_number)
      }

      refreshLiveAccounts()

      return { success: true, user: userProfile, must_change_password: Boolean(data.user.must_change_password) }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  // 3. Logout
  const logout = () => {
    setToken(null)
    localStorage.removeItem('issrms_token')
    localStorage.removeItem('issrms_role')
    localStorage.removeItem('issrms_user')
    setRoleState('admin')
    setCurrentUser({
      id: '22100277',
      name: 'Joel June Fabillar',
      title: 'Administrator',
      role: 'admin',
      avatar: 'joel',
      must_change_password: false
    })
    setMustChangePassword(false)
  }

  // 4. Role Switcher using Live MySQL Accounts
  const setRole = (newRole) => {
    setRoleState(newRole)
    localStorage.setItem('issrms_role', newRole)

    // Find the live account from MySQL corresponding to this role
    const matchedLiveAccount = liveAccounts.find(a => a.role === newRole)
    if (matchedLiveAccount) {
      if (matchedLiveAccount.token) {
        setToken(matchedLiveAccount.token)
        localStorage.setItem('issrms_token', matchedLiveAccount.token)
      }
      const profile = {
        id: matchedLiveAccount.id,
        name: matchedLiveAccount.name,
        title: matchedLiveAccount.title,
        role: matchedLiveAccount.role,
        avatar: matchedLiveAccount.avatar,
        must_change_password: matchedLiveAccount.must_change_password
      }
      setCurrentUser(profile)
      localStorage.setItem('issrms_user', JSON.stringify(profile))
      if (newRole === 'student') {
        setActiveStudentId(matchedLiveAccount.id)
      }
    }
  }

  return (
    <AppContext.Provider 
      value={{ 
        token, 
        role, 
        setRole, 
        currentUser, 
        setCurrentUser, 
        activeStudentId, 
        setActiveStudentId, 
        login, 
        logout,
        mustChangePassword,
        setMustChangePassword,
        liveAccounts,
        refreshLiveAccounts,
        libraryCatalogCache,
        setLibraryCatalogCache,
        preloadLibraryCatalog,
        notifications,
        unreadNotifsCount,
        loadNotifications,
        markAllNotificationsRead
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)

export function ProtectedRoute({ children, allowedRoles }) {
  const { role } = useApp()
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/home" replace />
  }
  return children
}
