import React from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { LogOut, LayoutDashboard, User, Shield } from 'lucide-react';
import { auth } from '../lib/firebase';
import { useAuth } from '../lib/auth';
import { StoryAILogo } from './StoryAILogo';

function NavItem({ to, icon: IconComponent, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-bold transition-colors ${
          isActive
            ? 'bg-[#032940] text-white'
            : 'text-[#032940] hover:bg-[#032940]/10'
        }`
      }
      end
    >
      <IconComponent size={18} />
      <span>{children}</span>
    </NavLink>
  );
}

export function AppShell() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const isAdmin = user?.email && adminEmails.includes(user.email.toLowerCase());

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F0F0F0] text-[#333333] font-body">
      <header className="h-16 bg-white border-b border-[#E0E0E0] sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-5 h-full flex items-center justify-between">
          <Link to="/app" className="flex items-center gap-3">
            <StoryAILogo className="w-10 h-10" />
            <div className="leading-tight">
              <div className="font-heading font-black text-lg text-[#032940] uppercase">
                StoryAI
              </div>
              <div className="text-[11px] font-bold tracking-widest uppercase text-[#730E20]">
                Creative Studio
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            {user && (
              <div className="hidden sm:flex items-center gap-3 bg-[#F0F0F0] px-3 py-1.5 rounded-xl border border-[#E0E0E0]">
                <div className="w-7 h-7 rounded-full bg-[#032940]/10 flex items-center justify-center text-[#032940] font-black text-xs">
                  {(user.displayName || user.email || 'U')[0]?.toUpperCase()}
                </div>
                <div className="text-xs">
                  <div className="font-bold text-[#032940] truncate max-w-[220px]">
                    {user.displayName || 'Creator'}
                  </div>
                  <div className="text-[#555555] truncate max-w-[220px]">{user.email}</div>
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="text-[#555555] hover:text-[#730E20] flex items-center gap-2 text-sm font-bold transition-colors bg-[#F0F0F0] px-4 py-2 rounded-xl border border-[#E0E0E0]"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-5 py-6 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
        <aside className="bg-white border border-[#E0E0E0] rounded-2xl p-3 h-fit sticky top-24">
          <nav className="flex flex-col gap-1">
            <NavItem to="/app" icon={LayoutDashboard}>
              Dashboard
            </NavItem>
            <NavItem to="/app/profile" icon={User}>
              Profile
            </NavItem>
            {isAdmin && (
              <NavItem to="/app/admin" icon={Shield}>
                Admin
              </NavItem>
            )}
          </nav>

          <div className="mt-4 p-3 rounded-xl bg-[#032940]/5 border border-[#032940]/10">
            <div className="text-xs font-black tracking-widest uppercase text-[#032940]">
              Studio tips
            </div>
            <div className="text-xs text-[#555555] mt-2 leading-relaxed font-semibold">
              Parse a script into shots, then batch-generate frames and refine the best “takes” per
              shot.
            </div>
          </div>
        </aside>

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

