import { useState, useEffect } from 'react'
import AppShell from '../components/AppShell'
import { ROLES, ROLE_ACCESS, useApp } from '../context/AppContext'
import { 
  Shield, Info, Check, X, ShieldAlert, Plus, Search, 
  KeyRound, RefreshCw, Send, Printer, Copy, CheckCircle2, AlertCircle, Smartphone 
} from 'lucide-react'
import { SkeletonTableRows, SkeletonCard } from '../components/Skeleton'
import logo from '../assets/logo.png'

const adminSections = [
  { key: 'roles',   label: 'Roles & Accounts', icon: Shield },
  { key: 'about',   label: 'About ISSRMS',     icon: Info },
]

const moduleLabels = [
  { key: 'home',               label: 'Home' },
  { key: 'announcements',      label: 'Announcements' },
  { key: 'financial-services', label: 'Financial Services' },
  { key: 'canteen',            label: 'Canteen / E-Wallet' },
  { key: 'library',            label: 'Library' },
  { key: 'logging-records',    label: 'Logging Records' },
  { key: 'audit-logs',         label: 'Audit Logs' },
  { key: 'settings',           label: 'Settings' },
]

export default function Settings() {
  const { token } = useApp()
  const [active, setActive] = useState('roles')

  // Live Accounts State
  const [accountsList, setAccountsList] = useState([])
  const [unprovisionedList, setUnprovisionedList] = useState([])
  const [loading, setLoading] = useState(true)

  const [showInactive, setShowInactive] = useState(false)
  const [userSearch, setUserSearch] = useState('')
  const [userRoleFilter, setUserRoleFilter] = useState('All')

  // Modal States
  const [showProvisionModal, setShowProvisionModal] = useState(false)
  const [modalTab, setModalTab] = useState('zone1') // 'zone1' | 'manual'
  const [selectedStudentToProvision, setSelectedStudentToProvision] = useState(null)
  const [customName, setCustomName] = useState('')
  const [customId, setCustomId] = useState('')
  const [customRole, setCustomRole] = useState('student')
  const [customTempPw, setCustomTempPw] = useState('')

  // Credential Slip / Success Result Modal
  const [provisionedCredential, setProvisionedCredential] = useState(null)
  const [copied, setCopied] = useState(false)

  // Fetch accounts from live MySQL
  const loadAccounts = async () => {
    try {
      setLoading(true)
      const res = await fetch('http://localhost:5000/api/v1/admin/accounts', {
        headers: { 'Authorization': 'Bearer ' + token }
      })
      if (res.ok) {
        const data = await res.json()
        setAccountsList(data.accounts || [])
      }

      // Fetch unprovisioned students
      const resUn = await fetch('http://localhost:5000/api/v1/admin/unprovisioned-students', {
        headers: { 'Authorization': 'Bearer ' + token }
      })
      if (resUn.ok) {
        const dataUn = await resUn.json()
        setUnprovisionedList(dataUn.unprovisioned || [])
      }
    } catch (err) {
      console.error('Failed to load accounts:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAccounts()
  }, [token])

  // Toggle Account Active / Inactive
  const handleToggleStatus = async (idNumber) => {
    try {
      const res = await fetch('http://localhost:5000/api/v1/admin/toggle-status', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token 
        },
        body: JSON.stringify({ id_number: idNumber })
      })
      if (res.ok) {
        setAccountsList(prev => prev.map(a => a.id_number === idNumber ? { ...a, is_active: !a.is_active } : a))
      }
    } catch (err) {
      alert('Failed to toggle status: ' + err.message)
    }
  }

  // Admin Reset Temporary Password
  const handleResetTempPassword = async (idNumber, name) => {
    if (!confirm(`Generate a new temporary password for ${name} (${idNumber})?`)) return

    try {
      const res = await fetch('http://localhost:5000/api/v1/admin/reset-temp-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ id_number: idNumber })
      })
      const data = await res.json()
      if (res.ok) {
        setProvisionedCredential({
          id_number: idNumber,
          name: name,
          temporary_password: data.temporary_password,
          delivery_channels: {
            sms: 'Dispatched to registered contact on file',
            printed_slip: 'Ready for re-issuance',
            admin_copy: data.temporary_password
          }
        })
        loadAccounts()
      } else {
        alert(data.error || 'Failed to reset password')
      }
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  // Handle Provision Account (from Zone 1 or manual)
  const handleProvisionSubmit = async (e) => {
    e?.preventDefault()

    const targetId = modalTab === 'zone1' ? selectedStudentToProvision?.id_number : customId
    const targetRole = modalTab === 'zone1' ? 'student' : customRole
    const targetCustomName = modalTab === 'zone1' 
      ? `${selectedStudentToProvision?.first_name} ${selectedStudentToProvision?.last_name}` 
      : customName

    if (!targetId) return

    try {
      const res = await fetch('http://localhost:5000/api/v1/admin/provision-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
          id_number: targetId,
          role: targetRole,
          custom_name: targetCustomName,
          custom_temp_password: customTempPw || undefined
        })
      })

      const data = await res.json()
      if (res.ok) {
        setProvisionedCredential(data.account)
        setShowProvisionModal(false)
        setSelectedStudentToProvision(null)
        setCustomId('')
        setCustomName('')
        setCustomTempPw('')
        loadAccounts()
      } else {
        alert(data.error || 'Failed to provision account')
      }
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <AppShell>
      <div className="space-y-5">
        <div>
          <h2 className="text-2xl font-bold font-['Plus_Jakarta_Sans',sans-serif] text-[#1A0A0A]">System Settings</h2>
          <p className="text-xs mt-0.5 text-[#6B5B5B]">
            Cryptographic RBAC enforcement, institutional account provisioning, and temporary credential delivery
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-5">
          {/* Settings Left Navigation */}
          <div className="bg-white rounded-2xl p-2 h-fit border border-[#EDE0D4] shadow-sm">
            {adminSections.map(({ key, label, icon: Icon }) => (
              <button 
                key={key} 
                onClick={() => setActive(key)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs font-semibold mb-1 transition-colors cursor-pointer ${active === key ? 'bg-[#611a17]/10 text-[#611a17]' : 'text-[#6B5B5B] hover:bg-[#FAF8F5]'}`}
              >
                <Icon size={15} className={active === key ? 'text-[#611a17]' : 'text-[#9B8B8B]'} />
                {label}
              </button>
            ))}
          </div>

          {/* Settings Main Content Area */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 space-y-6 border border-[#EDE0D4] shadow-sm">

            {/* ── ROLES & PERMISSIONS TAB ── */}
            {active === 'roles' && (
              <>
                <div>
                  <h3 className="font-bold text-base text-[#1A0A0A]">Roles & Permissions Matrix (RBAC)</h3>
                  <p className="text-xs text-[#6B5B5B]">
                    Strict operational partition per Saint Joseph School of Mactan Capstone Specification (REQ-5.3-2)
                  </p>
                </div>

                <div className="overflow-x-auto rounded-xl border border-[#EDE0D4]">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-[#FAF8F5] border-b border-[#EDE0D4]">
                        <th className="px-4 py-2.5 text-left font-bold text-[#6B5B5B]">Role / Access Group</th>
                        {moduleLabels.map(m => (
                          <th key={m.key} className="px-3 py-2.5 text-center font-bold text-[#6B5B5B] text-[11px]">{m.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EDE0D4]">
                      {ROLES.map(r => {
                        const permittedModules = ROLE_ACCESS[r.key] || []
                        return (
                          <tr key={r.key} className="hover:bg-[#FAF8F5]/60 transition-colors">
                            <td className="px-4 py-2.5 font-semibold text-left text-[#1A0A0A]">{r.label}</td>
                            {moduleLabels.map(m => {
                              const isPermitted = permittedModules.includes(m.key)
                              return (
                                <td key={m.key} className="px-3 py-2.5 text-center">
                                  {isPermitted ? (
                                    <div className="w-4.5 h-4.5 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                                      <Check size={11} strokeWidth={3} />
                                    </div>
                                  ) : (
                                    <div className="w-4.5 h-4.5 rounded-full bg-red-50 text-red-700 flex items-center justify-center mx-auto">
                                      <X size={11} strokeWidth={3} />
                                    </div>
                                  )}
                                </td>
                              )
                            })}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* ── ACCOUNT PROVISIONING & CREDENTIAL MANAGEMENT ── */}
                <div className="pt-4 border-t border-[#EDE0D4] space-y-3.5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-base text-[#1A0A0A]">
                        Live Institutional System Accounts ({accountsList.length})
                      </h3>
                      <p className="text-xs text-[#6B5B5B]">
                        Portal accounts synchronized with Registrar student records
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setShowInactive(!showInactive)} 
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${showInactive ? 'bg-[#611a17] text-white border-[#611a17]' : 'border-[#EDE0D4] hover:bg-[#FAF8F5] text-[#6B5B5B]'}`}
                      >
                        {showInactive ? 'Hide' : 'Show'} Inactive
                      </button>

                      <button 
                        onClick={() => setShowProvisionModal(true)} 
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#611a17] hover:bg-[#4e1412] text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
                      >
                        <Plus size={14} /> Provision Account
                        {unprovisionedList.length > 0 && (
                          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-[#c8a227] text-black font-extrabold">
                            {unprovisionedList.length} New
                          </span>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Search and Filter */}
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1 max-w-xs">
                      <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9B8B8B]" />
                      <input 
                        placeholder="Search by name or ID…" 
                        value={userSearch} 
                        onChange={e => setUserSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#EDE0D4] rounded-lg outline-none focus:border-[#611a17]" 
                      />
                    </div>
                    <select 
                      value={userRoleFilter} 
                      onChange={e => setUserRoleFilter(e.target.value)} 
                      className="px-2.5 py-1.5 text-xs bg-white border border-[#EDE0D4] rounded-lg outline-none cursor-pointer focus:border-[#611a17]"
                    >
                      <option value="All">All Roles</option>
                      {ROLES.map(r => (<option key={r.key} value={r.key}>{r.label}</option>))}
                    </select>
                  </div>

                  {/* Accounts Table */}
                  <div className="overflow-x-auto rounded-xl border border-[#EDE0D4]">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-[#FAF8F5] border-b border-[#EDE0D4]">
                          <th className="px-4 py-2.5 text-left font-semibold text-[#6B5B5B]">User Account</th>
                          <th className="px-4 py-2.5 text-left font-semibold text-[#6B5B5B]">ID Number</th>
                          <th className="px-4 py-2.5 text-center font-semibold text-[#6B5B5B]">Role</th>
                          <th className="px-4 py-2.5 text-center font-semibold text-[#6B5B5B]">Password Status</th>
                          <th className="px-4 py-2.5 text-center font-semibold text-[#6B5B5B]">Status</th>
                          <th className="px-4 py-2.5 text-right font-semibold text-[#6B5B5B]">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EDE0D4]">
                        {loading ? (
                          <SkeletonTableRows rows={6} cols={6} />
                        ) : accountsList.filter(u => {
                          const ms = !userSearch || (u.name && u.name.toLowerCase().includes(userSearch.toLowerCase())) || u.id_number.toLowerCase().includes(userSearch.toLowerCase())
                          const mr = userRoleFilter === 'All' || u.role === userRoleFilter
                          const mi = showInactive || u.is_active
                          return ms && mr && mi
                        }).length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-[#9B8B8B] font-semibold text-xs">
                              No accounts match current filters.
                            </td>
                          </tr>
                        ) : (
                          accountsList.filter(u => {
                            const ms = !userSearch || (u.name && u.name.toLowerCase().includes(userSearch.toLowerCase())) || u.id_number.toLowerCase().includes(userSearch.toLowerCase())
                            const mr = userRoleFilter === 'All' || u.role === userRoleFilter
                            const mi = showInactive || u.is_active
                            return ms && mr && mi
                          }).map(user => (
                          <tr key={user.account_id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                            <td className="px-4 py-3 font-semibold text-[#1A0A0A]">
                              {user.name}
                            </td>
                            <td className="px-4 py-3 text-[#611a17] font-mono font-medium">
                              {user.id_number}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FAF8F5] border border-[#EDE0D4] text-[#1A0A0A] uppercase">
                                {user.role}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              {user.must_change_password ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                  <KeyRound size={10} /> Temp PW (Must Change)
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                  <Check size={10} /> Permanent
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button 
                                onClick={() => handleToggleStatus(user.id_number)}
                                className={`px-2 py-0.5 rounded-full text-[9px] font-bold border transition-colors cursor-pointer ${user.is_active ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-red-50 hover:text-red-800' : 'bg-red-50 text-red-800 border-red-200 hover:bg-emerald-50 hover:text-emerald-800'}`}
                              >
                                {user.is_active ? 'ACTIVE' : 'INACTIVE'}
                              </button>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => handleResetTempPassword(user.id_number, user.name)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-[#611a17] hover:bg-[#611a17]/10 rounded-md transition-colors cursor-pointer"
                              >
                                <RefreshCw size={11} /> Reset Temp PW
                              </button>
                            </td>
                          </tr>
                        ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl flex items-start gap-3 bg-[#c8a227]/10 border border-[#c8a227]/25 text-xs text-[#6B5B5B]">
                  <ShieldAlert size={17} className="text-[#A88020] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-[#A88020]">Account Provisioning Guidelines</p>
                    <p className="mt-0.5 leading-relaxed">
                      Newly provisioned student and staff accounts are assigned a temporary password. Users will be prompted to establish their permanent password upon their first sign-in.
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* ── ABOUT ISSRMS TAB ── */}
            {active === 'about' && (
              <div className="text-center py-8 space-y-4 font-['Plus_Jakarta_Sans',sans-serif] text-[#1A0A0A]">
                <img src={logo} alt="SJSM Logo" className="w-16 h-16 mx-auto" />
                <div>
                  <p className="text-lg font-bold">Integrated Student Services and Records Management System</p>
                  <p className="text-xs text-[#6B5B5B]">Saint Joseph School of Mactan, Inc. · USC Capstone Project</p>
                </div>
                <p className="text-xs text-[#9B8B8B] max-w-md mx-auto leading-relaxed">
                  Dual-zone architecture with read-only institutional synchronization, Argon2id cryptographic authentication, double-entry financial ledger engine, and RBAC operational segregation.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── MODAL 1: PROVISION ACCOUNT MODAL ── */}
      {showProvisionModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full space-y-4 shadow-2xl border border-[#EDE0D4] animate-fade-in text-xs">
            <div className="flex justify-between items-start border-b border-[#EDE0D4]/70 pb-3">
              <div>
                <h3 className="font-bold text-sm text-[#1A0A0A]">Provision Institutional Account</h3>
                <p className="text-[11px] text-[#6B5B5B]">Sync from Zone 1 or create administrative account</p>
              </div>
              <button onClick={() => setShowProvisionModal(false)} className="text-gray-400 hover:text-black font-bold text-base">&times;</button>
            </div>

            {/* Tab selector */}
            <div className="flex rounded-lg bg-[#FAF8F5] p-1 border border-[#EDE0D4]">
              <button
                type="button"
                onClick={() => setModalTab('zone1')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${modalTab === 'zone1' ? 'bg-white shadow text-[#611a17] font-bold' : 'text-[#6B5B5B]'}`}
              >
                Sync from Zone 1 ({unprovisionedList.length} Unlinked)
              </button>
              <button
                type="button"
                onClick={() => setModalTab('manual')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${modalTab === 'manual' ? 'bg-white shadow text-[#611a17] font-bold' : 'text-[#6B5B5B]'}`}
              >
                Manual Entry
              </button>
            </div>

            {modalTab === 'zone1' ? (
              <div className="space-y-3">
                <p className="text-[11px] text-[#6B5B5B]">
                  The following active students are registered in the Registrar's enrollment directory but do not yet have an active portal account:
                </p>

                {unprovisionedList.length === 0 ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-emerald-800">
                    <CheckCircle2 size={20} className="mx-auto mb-1 text-emerald-600" />
                    <p className="font-bold text-xs">All Enrolled Students Provisioned</p>
                    <p className="text-[10px] mt-0.5">Every enrolled student has an active account.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {unprovisionedList.map(st => (
                      <div 
                        key={st.id_number}
                        onClick={() => setSelectedStudentToProvision(st)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${selectedStudentToProvision?.id_number === st.id_number ? 'border-[#611a17] bg-[#611a17]/5 ring-1 ring-[#611a17]' : 'border-[#EDE0D4] hover:bg-[#FAF8F5]'}`}
                      >
                        <div>
                          <p className="font-bold text-[#1A0A0A]">{st.first_name} {st.last_name}</p>
                          <p className="text-[10px] font-mono text-[#611a17]">{st.id_number} · {st.grade_level} ({st.section})</p>
                          <p className="text-[10px] text-[#9B8B8B] mt-0.5">Parent Contact: {st.parent_contact || st.contact_number}</p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#c8a227]/20 text-[#a88020]">
                          Ready
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-2 flex justify-end gap-2">
                  <button 
                    type="button" 
                    onClick={() => setShowProvisionModal(false)}
                    className="px-3 py-1.5 border border-[#EDE0D4] rounded-lg text-xs font-semibold text-[#6B5B5B] hover:bg-[#FAF8F5]"
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    disabled={!selectedStudentToProvision}
                    onClick={handleProvisionSubmit}
                    className="px-4 py-1.5 bg-[#611a17] hover:bg-[#4e1412] disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-colors shadow"
                  >
                    Generate Credentials & Provision
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleProvisionSubmit} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#6B5B5B] mb-1">Full Name</label>
                  <input 
                    type="text" 
                    required 
                    value={customName} 
                    onChange={e => setCustomName(e.target.value)}
                    placeholder="e.g. Maria Santos" 
                    className="w-full px-3 py-1.5 bg-white border border-[#EDE0D4] rounded-lg text-xs outline-none focus:border-[#611a17]" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#6B5B5B] mb-1">ID Number</label>
                    <input 
                      type="text" 
                      required 
                      value={customId} 
                      onChange={e => setCustomId(e.target.value)}
                      placeholder="e.g. EMP-2026-0099" 
                      className="w-full px-3 py-1.5 bg-white border border-[#EDE0D4] rounded-lg text-xs font-mono outline-none focus:border-[#611a17]" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#6B5B5B] mb-1">Role</label>
                    <select 
                      value={customRole} 
                      onChange={e => setCustomRole(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#EDE0D4] rounded-lg text-xs outline-none cursor-pointer focus:border-[#611a17]"
                    >
                      {ROLES.map(r => (<option key={r.key} value={r.key}>{r.label}</option>))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#6B5B5B] mb-1">
                    Custom Temporary Password (Optional)
                  </label>
                  <input 
                    type="text" 
                    value={customTempPw} 
                    onChange={e => setCustomTempPw(e.target.value)}
                    placeholder="Leave blank to auto-generate secure PIN" 
                    className="w-full px-3 py-1.5 bg-white border border-[#EDE0D4] rounded-lg text-xs outline-none focus:border-[#611a17]" 
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button 
                    type="button" 
                    onClick={() => setShowProvisionModal(false)}
                    className="px-3 py-1.5 border border-[#EDE0D4] rounded-lg text-xs font-semibold text-[#6B5B5B] hover:bg-[#FAF8F5]"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-1.5 bg-[#611a17] hover:bg-[#4e1412] text-white rounded-lg text-xs font-bold transition-colors shadow"
                  >
                    Create & Provision
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── MODAL 2: TEMPORARY CREDENTIALS / PASSWORD RESET DIALOG ── */}
      {provisionedCredential && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl border border-[#EDE0D4] animate-fade-in text-xs">
            <div className="flex justify-between items-start border-b border-[#EDE0D4]/70 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#1A0A0A]">Temporary Password Issued</h3>
                  <p className="text-[10px] text-[#6B5B5B]">Account credentials ready for initial login</p>
                </div>
              </div>
              <button 
                onClick={() => setProvisionedCredential(null)} 
                className="text-gray-400 hover:text-black font-bold text-base cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Account Details Card */}
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EDE0D4] space-y-2.5">
              <div className="flex justify-between text-xs">
                <span className="text-[#6B5B5B]">User Account:</span>
                <span className="font-bold text-[#1A0A0A]">{provisionedCredential.name}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#6B5B5B]">Identification No:</span>
                <span className="font-bold font-mono text-[#611a17]">{provisionedCredential.id_number}</span>
              </div>

              {/* Copyable Temporary Password Field */}
              <div className="pt-2 border-t border-[#EDE0D4]/70">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6B5B5B] mb-1">
                  Temporary Password
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={provisionedCredential.temporary_password}
                    className="flex-1 px-3 py-2 bg-white border border-[#D5C9BE] rounded-lg font-mono font-bold text-sm text-[#611a17] select-all outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(provisionedCredential.temporary_password)}
                    className="px-3 py-2 bg-white border border-[#D5C9BE] hover:bg-[#FAF8F5] rounded-lg text-xs font-semibold text-[#1A0A0A] flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Copy size={13} />
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>

            {/* Delivery Notification Status */}
            {provisionedCredential.parent_phone && (
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-emerald-800 text-[11px]">
                <Smartphone size={14} className="text-emerald-700 shrink-0" />
                <span>SMS notification dispatched to registered mobile: <strong>{provisionedCredential.parent_phone}</strong></span>
              </div>
            )}

            <p className="text-[11px] text-[#6B5B5B]">
              The user will be prompted to set a permanent password upon their next sign-in.
            </p>

            {/* Modal Actions */}
            <div className="flex justify-end pt-2 border-t border-[#EDE0D4]/70">
              <button
                type="button"
                onClick={() => setProvisionedCredential(null)}
                className="px-5 py-2 bg-[#611a17] hover:bg-[#4e1412] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}
