import AppShell from '../components/AppShell'
import { useApp } from '../context/AppContext'
import { Link } from 'react-router-dom'
import { KeyRound, Shield } from 'lucide-react'
import { getAvatarUrl, getInitials } from '../utils/avatar'

export default function Profile() {
  const { role, currentUser } = useApp()

  const isStudent = role === 'student'
  const userName = currentUser?.name || 'Institutional User'
  const userId = currentUser?.id || '22100277'
  const userTitle = currentUser?.title || (
    role === 'admin' ? 'Administrator' :
    role === 'registrar' ? 'Registrar' :
    role === 'canteen_personnel' ? 'Canteen Personnel' :
    role === 'library_personnel' ? 'Library Personnel' : 'Student / Parent'
  )

  const department = role === 'admin' ? 'Office of the Principal' :
                     role === 'registrar' ? 'Office of the Registrar' :
                     role === 'canteen_personnel' ? 'Canteen Operations' :
                     role === 'library_personnel' ? 'Library Services' : 'Senior High School - STEM Strand'

  const sectionOrOffice = isStudent ? 'Grade 11 - St. Benedict' : 'Administration'
  const phone = isStudent ? '+63 918 123 4567' : '+63 917 123 4567'
  const email = isStudent ? '—' : `${userId.toLowerCase()}@sjsm.edu.ph`

  return (
    <AppShell>
      <div className="max-w-[720px] mx-auto space-y-5">
        <div>
          <h2 className="text-2xl font-bold font-['Plus_Jakarta_Sans',sans-serif] text-[#1A0A0A]">My Profile</h2>
          <p className="text-xs mt-0.5 text-[#6B5B5B]">Your institutional profile and contact details</p>
        </div>

        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl p-5 border border-[#EDE0D4] shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <div className="w-20 h-20 rounded-2xl ring-[3px] ring-[#c8a227] bg-[#FAF8F5] p-1 flex items-center justify-center shrink-0 shadow-md overflow-hidden">
            <img 
              src={getAvatarUrl(userName || userId, role)} 
              alt={userName} 
              className="w-full h-full object-cover rounded-xl"
              onError={(e) => {
                e.target.style.display = 'none';
                if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
              }}
            />
            <span className="hidden w-full h-full bg-[#4e1412] text-[#c8a227] items-center justify-center font-['Plus_Jakarta_Sans',sans-serif] font-bold text-2xl tracking-wider rounded-xl">
              {getInitials(userName)}
            </span>
          </div>

          <div className="flex-1 text-center sm:text-left space-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <div>
                <h3 className="font-bold text-lg text-[#1A0A0A] leading-tight">{userName}</h3>
                <p className="text-xs font-mono text-[#611a17] font-semibold mt-0.5">ID: {userId}</p>
              </div>
              <span className="self-center sm:self-start px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#c8a227]/15 text-[#a88020] uppercase tracking-wide">
                {userTitle}
              </span>
            </div>
          </div>
        </div>

        {/* Institutional Record Details Card */}
        <div className="bg-white rounded-2xl p-5 border border-[#EDE0D4] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#EDE0D4]/70 pb-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#9B8B8B]">Institutional Record</p>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              Active Status
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            <div className="bg-[#FAF8F5] rounded-xl p-3 border border-[#EDE0D4]/70">
              <p className="text-[10px] font-bold uppercase text-[#9B8B8B] mb-0.5">Full Name</p>
              <p className="font-semibold text-[#1A0A0A]">{userName}</p>
            </div>

            <div className="bg-[#FAF8F5] rounded-xl p-3 border border-[#EDE0D4]/70">
              <p className="text-[10px] font-bold uppercase text-[#9B8B8B] mb-0.5">Identification Number</p>
              <p className="font-semibold text-[#1A0A0A] font-mono">{userId}</p>
            </div>

            <div className="bg-[#FAF8F5] rounded-xl p-3 border border-[#EDE0D4]/70">
              <p className="text-[10px] font-bold uppercase text-[#9B8B8B] mb-0.5">Department / Track</p>
              <p className="font-semibold text-[#1A0A0A]">{department}</p>
            </div>

            <div className="bg-[#FAF8F5] rounded-xl p-3 border border-[#EDE0D4]/70">
              <p className="text-[10px] font-bold uppercase text-[#9B8B8B] mb-0.5">Section / Assignment</p>
              <p className="font-semibold text-[#1A0A0A]">{sectionOrOffice}</p>
            </div>

            <div className="bg-[#FAF8F5] rounded-xl p-3 border border-[#EDE0D4]/70">
              <p className="text-[10px] font-bold uppercase text-[#9B8B8B] mb-0.5">Contact Number</p>
              <p className="font-semibold text-[#1A0A0A]">{phone}</p>
            </div>

            <div className="bg-[#FAF8F5] rounded-xl p-3 border border-[#EDE0D4]/70">
              <p className="text-[10px] font-bold uppercase text-[#9B8B8B] mb-0.5">Email Address</p>
              <p className="font-semibold text-[#1A0A0A]">{email}</p>
            </div>
          </div>

          <div className="border-t border-[#EDE0D4]/70 pt-4 flex justify-end">
            <Link 
              to="/password-reset" 
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#611a17] hover:bg-[#4e1412] text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
            >
              <KeyRound size={13} /> Change Password
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
