import { useState } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import {
  Home, UtensilsCrossed, BookOpen, CreditCard,
  Settings, Bell, Layers, RefreshCw, User, KeyRound, LogOut, ChevronDown, Megaphone
} from 'lucide-react'
import { useApp, ROLES } from '../context/AppContext'
import { getAvatarUrl, getInitials } from '../utils/avatar'
import sjsmCrest from '../assets/sjsm_crest_real.png'
import sjsmCampusPhoto from '../assets/sjsm_campus_real.jpg'

export default function AppShell({ children }) {
  const { 
    role, 
    setRole, 
    currentUser, 
    logout, 
    liveAccounts, 
    notifications, 
    unreadNotifsCount, 
    markAllNotificationsRead, 
    preloadLibraryCatalog 
  } = useApp()
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [showNotifs, setShowNotifs] = useState(false)
  const navigate = useNavigate()

  // Capstone-defined Navigation Tabs per Role (Strictly matching ISSRMSTOSUBMIT-1.pdf)
  const allTabs = [
    { key: 'home',               label: 'Home',                  icon: Home,           path: '/home',              roles: ['student', 'canteen_personnel', 'library_personnel', 'registrar', 'admin'] },
    { key: 'announcements',      label: 'Announcements',         icon: Megaphone,      path: '/announcements',     roles: ['admin'] },
    { key: 'canteen',            label: 'Canteen / E-Wallet',    icon: UtensilsCrossed,path: '/canteen',           roles: ['student', 'canteen_personnel'] },
    { key: 'library',            label: 'Library Circulation',   icon: BookOpen,       path: '/library',           roles: ['student', 'library_personnel'] },
    { key: 'rfid-attendance',    label: 'RFID Attendance',       icon: RefreshCw,      path: '/logging-records',   roles: ['student', 'admin'] },
    { key: 'financial-services', label: 'Financial Services',    icon: CreditCard,     path: '/financial-services',roles: ['registrar'] },
    { key: 'audit-logs',         label: 'Audit Logs',            icon: Layers,         path: '/audit-logs',        roles: ['admin'] },
    { key: 'settings',           label: 'Settings',              icon: Settings,       path: '/settings',          roles: ['admin'] },
  ]

  const figmaTabs = allTabs.filter(tab => tab.roles.includes(role))
  const activeRoleData = ROLES.find(r => r.key === role) || ROLES[0]

  const handleSignOut = () => {
    setShowProfileDropdown(false)
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fdfaf4] font-['Plus_Jakarta_Sans',sans-serif] relative">
      {/* ── Global Campus Photo Background Texture ── */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `url(${sjsmCampusPhoto})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 20%',
          backgroundAttachment: 'fixed',
          opacity: 0.07,
          filter: 'contrast(125%) grayscale(20%)'
        }}
      />

      {/* ── Top Header Bar (Comfortable 72px) ── */}
      <header className="w-full relative z-30 select-none shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        
        {/* Main Header Container (72px) */}
        <div 
          className="relative w-full h-[72px]"
          style={{
            background: 'linear-gradient(90deg, #4c110e 0%, #50100d 36%, #520f0d 65%, #530f0c 100%)'
          }}
        >
          {/* Architecture Overlay */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <img
              src={sjsmCampusPhoto}
              alt="Campus Architecture Overlay"
              className="w-full h-full object-cover pointer-events-none"
              style={{
                opacity: 0.23,
                mixBlendMode: 'overlay',
                objectPosition: 'center 30%'
              }}
            />
          </div>

          {/* Centered Inner Container (Pulls Saint Joseph and Profile closer to center) */}
          <div className="relative z-10 w-full max-w-[1200px] h-full mx-auto px-6 sm:px-8 flex items-center justify-between">
            
            {/* ── Left: Brand Crest + Titles ── */}
            <div className="flex items-center">
              <Link to="/home" className="flex items-center gap-3.5 group">
                <img 
                  src={sjsmCrest} 
                  alt="Saint Joseph's School of Mactan" 
                  className="w-[50px] h-[45px] object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] group-hover:scale-105 transition-transform" 
                />
                <div className="flex flex-col">
                  <span className="font-['Plus_Jakarta_Sans',sans-serif] text-[15px] font-bold text-white leading-tight">
                    Saint Joseph’s School of Mactan
                  </span>
                  <span className="font-['Inter',sans-serif] text-[10px] font-bold text-[#c8a227] tracking-wider uppercase mt-[1px]">
                    ISSRMS · INTEGRATED STUDENT SERVICES AND RESOURCE MANAGEMENT SYSTEM
                  </span>
                </div>
              </Link>
            </div>

            {/* ── Right: Bell Icon + Joel Avatar + User Profile ── */}
            <div className="flex items-center gap-4 sm:gap-5">
              
              {/* Notification Bell */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifs(!showNotifs)}
                  className="relative p-1 text-[#9b8b8b] hover:text-white transition-colors cursor-pointer"
                  aria-label="Alerts"
                >
                  <Bell size={20} className="stroke-[1.75]" />
                  {unreadNotifsCount > 0 && (
                    <span className="absolute top-0 right-0 w-[8px] h-[8px] rounded-full bg-[#c8a227] animate-pulse" />
                  )}
                </button>

                {showNotifs && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifs(false)} />
                    <div className="absolute right-0 mt-2.5 w-84 bg-white rounded-2xl shadow-xl border border-[#EDE0D4] py-2 z-50 animate-fade-in text-xs text-[#1A0A0A]">
                      <div className="px-4 py-2 border-b border-[#EDE0D4] font-bold flex justify-between items-center">
                        <span className="font-['Plus_Jakarta_Sans',sans-serif] text-sm">Notifications</span>
                        <div className="flex items-center gap-2">
                          {unreadNotifsCount > 0 && (
                            <button 
                              onClick={markAllNotificationsRead}
                              className="text-[10px] text-[#611a17] hover:underline font-bold"
                            >
                              Mark read
                            </button>
                          )}
                          <span className="text-[10px] text-[#c8a227] font-bold uppercase tracking-wider">Campus Alerts</span>
                        </div>
                      </div>
                      <div className="max-h-72 overflow-y-auto divide-y divide-[#EDE0D4]/70">
                        {(!notifications || notifications.length === 0) ? (
                          <div className="p-4 text-center text-[#9b8b8b]">No active alerts right now.</div>
                        ) : (
                          notifications.map(n => (
                            <div key={n.id} className={`px-4 py-2.5 hover:bg-[#FAF8F5] transition-colors ${!n.isRead ? 'bg-amber-50/40' : ''}`}>
                              <div className="flex items-center justify-between">
                                <p className="font-semibold text-[#611a17] text-[11px] uppercase tracking-wide">{n.type?.replace('_', ' ') || 'Notification'}</p>
                                <span className="text-[9px] text-[#9b8b8b]">{n.time}</span>
                              </div>
                              <p className="text-[11px] text-[#1A0A0A] mt-0.5 leading-snug">{n.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Profile Dropdown Container */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center gap-3 cursor-pointer select-none text-left focus:outline-none group"
                >
                  {/* Avatar with gold border (42x42) */}
                  <div className="w-[42px] h-[42px] rounded-full ring-[2px] ring-[#c8a227] bg-[#FAF8F5] flex items-center justify-center shrink-0 overflow-hidden group-hover:ring-[3px] transition-all shadow-sm">
                    <img 
                      src={getAvatarUrl(currentUser?.name || currentUser?.id, role)} 
                      alt={currentUser?.name || 'User Profile'} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <span className="hidden w-full h-full bg-[#42100E] text-[#c8a227] items-center justify-center font-bold text-xs">
                      {getInitials(currentUser?.name || activeRoleData.label)}
                    </span>
                  </div>

                  {/* Separator line */}
                  <div className="w-[1px] h-[14px] bg-white/25 hidden sm:block" />

                  {/* User Info Text */}
                  <div className="hidden sm:flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="font-['Plus_Jakarta_Sans',sans-serif] text-[14px] font-bold text-white leading-tight">
                        {currentUser?.id || '22100277'}
                      </span>
                      <ChevronDown size={13} className="text-[#9b8b8b] group-hover:text-white transition-colors" />
                    </div>
                    <span className="font-['Plus_Jakarta_Sans',sans-serif] text-[11px] font-normal text-[#cbb9b9] leading-tight mt-[1px]">
                      {currentUser?.title || activeRoleData.label}
                    </span>
                  </div>
                </button>

                {/* ── Profile Dropdown Menu ── */}
                {showProfileDropdown && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowProfileDropdown(false)} 
                    />
                    <div className="absolute right-0 mt-2.5 w-64 bg-white rounded-xl shadow-2xl border border-[#EDE0D4] py-1.5 z-50 animate-fade-in text-xs text-[#1A0A0A]">
                      {/* User Mini Summary */}
                      <div className="px-3.5 py-2.5 border-b border-[#EDE0D4]/70 bg-[#FAF8F5]">
                        <p className="font-bold text-[12.5px] text-[#1A0A0A]">{currentUser?.name || 'Joel June Fabillar'}</p>
                        <p className="text-[10.5px] text-[#611a17] font-semibold">ID: {currentUser?.id || '22100277'}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-[9.5px] font-bold bg-[#c8a227]/15 text-[#a88020] uppercase">
                          {currentUser?.title || activeRoleData.label}
                        </span>
                      </div>

                      {/* Role Switcher with Live Accounts */}
                      <div className="px-3.5 py-2 border-b border-[#EDE0D4]/70 bg-white">
                        <span className="text-[9.5px] font-bold text-[#6b5b5b] uppercase tracking-wider block mb-1">
                          Switch Live Demo Role
                        </span>
                        <select
                          value={role}
                          onChange={(e) => {
                            setRole(e.target.value)
                            navigate('/home')
                          }}
                          className="w-full bg-[#FAF8F5] text-[#1A0A0A] text-xs font-semibold px-2 py-1.5 rounded-lg border border-[#EDE0D4] outline-none cursor-pointer focus:border-[#611a17]"
                        >
                          {ROLES.map(r => (
                            <option key={r.key} value={r.key}>
                              {r.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Navigation Links */}
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setShowProfileDropdown(false)
                            navigate('/profile')
                          }}
                          className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-[#FAF8F5] transition-colors font-medium text-[#1A0A0A] cursor-pointer text-left"
                        >
                          <User size={14} className="text-[#611a17]" />
                          <span>View My Profile</span>
                        </button>

                        <button
                          onClick={() => {
                            setShowProfileDropdown(false)
                            navigate('/password-reset')
                          }}
                          className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-[#FAF8F5] transition-colors font-medium text-[#1A0A0A] cursor-pointer text-left"
                        >
                          <KeyRound size={14} className="text-[#611a17]" />
                          <span>Change Password</span>
                        </button>

                        {role === 'admin' && (
                          <button
                            onClick={() => {
                              setShowProfileDropdown(false)
                              navigate('/settings')
                            }}
                            className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-[#FAF8F5] transition-colors font-medium text-[#1A0A0A] cursor-pointer text-left"
                          >
                            <Settings size={14} className="text-[#611a17]" />
                            <span>System Settings</span>
                          </button>
                        )}
                      </div>

                      {/* Sign Out */}
                      <div className="border-t border-[#EDE0D4]/70 pt-1 mt-0.5">
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-red-50 text-[#991b1b] transition-colors font-semibold cursor-pointer text-left"
                        >
                          <LogOut size={14} />
                          <span>Sign Out of ISSRMS</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* Rectangle 2: 6px solid Gold stripe separating Header from Tabs (#c8a227) */}
        <div className="w-full h-[6px] bg-[#c8a227]" />

        {/* ── Sub Navigation Row (Centered Container, Left-Aligned Tabs) ── */}
        <div className="w-full h-[47px] bg-white border-b border-[#e6dfdf] shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="w-full max-w-[1200px] h-full mx-auto px-6 sm:px-8 flex items-center justify-start overflow-x-auto scrollbar-none">
            <nav className="flex items-center justify-start gap-7 sm:gap-9 lg:gap-12 h-full">
              {figmaTabs.map(({ key, label, icon: Icon, path }) => (
                <NavLink
                  key={key}
                  to={path}
                  onMouseEnter={() => {
                    if (key === 'library') preloadLibraryCatalog?.()
                  }}
                  className={({ isActive }) => `
                    relative h-full flex items-center gap-2 font-['Plus_Jakarta_Sans',sans-serif] text-[12px] font-bold whitespace-nowrap transition-colors
                    ${isActive ? 'text-[#611a17]' : 'text-[#6b5b5b] hover:text-[#611a17]'}
                  `}
                >
                  {({ isActive }) => (
                    <>
                      <Icon 
                        size={13} 
                        className={isActive ? 'text-[#c8a227]' : 'text-[#9b8b8b]'} 
                      />
                      <span>{label}</span>
                      {isActive && (
                        <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#c8a227]" />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* ── Main Page Body (Aligned with 1200px Centered Container) ── */}
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-6 py-8 relative z-10">
        {children}
      </main>
    </div>
  )
}
