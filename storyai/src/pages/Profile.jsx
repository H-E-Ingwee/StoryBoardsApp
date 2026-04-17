import React, { useMemo, useState } from 'react';
import { updateProfile } from 'firebase/auth';
import { Save } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { auth } from '../lib/firebase';

export function ProfilePage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.displayName || '');
  const [status, setStatus] = useState('');

  const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  const isAdmin = useMemo(() => {
    if (!user?.email) return false;
    return adminEmails.includes(user.email.toLowerCase());
  }, [user?.email, adminEmails]);

  const save = async () => {
    setStatus('');
    try {
      await updateProfile(auth.currentUser, { displayName: name.trim() });
      setStatus('Saved.');
    } catch (e) {
      console.error(e);
      setStatus('Failed to save profile.');
    }
  };

  if (!user) return null;

  return (
    <div>
      <div className="font-heading font-black text-3xl text-[#032940]">Profile</div>
      <div className="text-[#555555] font-semibold mt-1">
        Manage your account details and studio preferences.
      </div>

      <div className="mt-6 bg-white border border-[#E0E0E0] rounded-2xl p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-black text-[#555555] uppercase tracking-widest mb-2">
              Display name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 rounded-xl bg-[#F0F0F0] border border-[#E0E0E0] outline-none focus:ring-2 focus:ring-[#032940] text-sm font-semibold text-[#032940]"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-xs font-black text-[#555555] uppercase tracking-widest mb-2">
              Email
            </label>
            <div className="w-full p-3 rounded-xl bg-[#F0F0F0] border border-[#E0E0E0] text-sm font-semibold text-[#032940]">
              {user.email}
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={save}
            className="px-4 py-2 rounded-xl text-sm font-black text-white bg-[#032940] hover:bg-[#021B2B] transition-colors flex items-center gap-2"
            type="button"
          >
            <Save size={16} /> Save
          </button>
          {status && <div className="text-sm font-semibold text-[#555555]">{status}</div>}
        </div>
      </div>

      <div className="mt-6 bg-white border border-[#E0E0E0] rounded-2xl p-6 shadow-sm">
        <div className="font-heading font-black text-xl text-[#032940]">Access</div>
        <div className="text-sm text-[#555555] font-semibold mt-2">
          Role: <span className="text-[#032940] font-black">{isAdmin ? 'Admin' : 'Creator'}</span>
        </div>
        <div className="text-xs text-[#555555] font-semibold mt-3">
          Admin access is controlled by <code className="font-black">VITE_ADMIN_EMAILS</code>.
        </div>
      </div>
    </div>
  );
}

