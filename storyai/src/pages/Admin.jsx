import React from 'react';
import { Shield, Users, Activity, SlidersHorizontal } from 'lucide-react';
import { useAuth } from '../lib/auth';

function Card({ icon: Icon, title, children }) {
  return (
    <div className="bg-white border border-[#E0E0E0] rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-[#032940]/10 text-[#032940] flex items-center justify-center">
          <Icon size={18} />
        </div>
        <div className="font-heading font-black text-lg text-[#032940]">{title}</div>
      </div>
      <div className="mt-3 text-sm text-[#555555] font-semibold leading-relaxed">{children}</div>
    </div>
  );
}

export function AdminPage() {
  const { user } = useAuth();
  const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const isAdmin = user?.email && adminEmails.includes(user.email.toLowerCase());

  if (!isAdmin) {
    return (
      <div className="bg-white border border-[#E0E0E0] rounded-2xl p-8 shadow-sm">
        <div className="font-heading font-black text-2xl text-[#032940]">Admin</div>
        <div className="text-[#555555] font-semibold mt-2">
          You don’t have access to the admin surface.
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-heading font-black text-3xl text-[#032940]">Admin</div>
          <div className="text-[#555555] font-semibold mt-1">
            System oversight, user management, and studio configuration.
          </div>
        </div>
        <div className="px-4 py-2 rounded-2xl bg-[#032940] text-white text-sm font-black flex items-center gap-2">
          <Shield size={16} /> Admin Access
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <Card icon={Users} title="Users">
          List/search users, disable accounts, reset access. (Next: connect to your chosen user store
          / admin API.)
        </Card>
        <Card icon={Activity} title="Usage">
          Track generations, failures, latency, and costs. (Next: log backend generation events and
          render charts here.)
        </Card>
        <Card icon={SlidersHorizontal} title="Providers">
          Set default models, quotas, and allowed providers. (Next: admin config collection in
          Firestore.)
        </Card>
      </div>
    </div>
  );
}

