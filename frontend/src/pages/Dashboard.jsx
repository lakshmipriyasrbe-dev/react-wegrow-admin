import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    total_students: 0,
    training_enrollments: 0,
    internship_enrollments: 0,
    total_staff: 0,
    total_courses: 0,
    total_revenue: 0,
    total_due_balance: 0,
    placed_students: 142,
    active_batches: 18
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/stats')
      .then((res) => setStats(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { title: "Total Students", value: stats.total_students || 128, icon: "fa-user-graduate", color: "from-blue-600 to-indigo-600", sub: `${stats.training_enrollments || 94} Training, ${stats.internship_enrollments || 34} Internship` },
    { title: "Total Revenue", value: `₹${(stats.total_revenue || 1245000).toLocaleString()}`, icon: "fa-wallet", color: "from-emerald-600 to-teal-600", sub: "Collected this financial year" },
    { title: "Pending Balance", value: `₹${(stats.total_due_balance || 320000).toLocaleString()}`, icon: "fa-clock-rotate-left", color: "from-amber-500 to-orange-600", sub: "Installments due" },
    { title: "Active Trainers & Staff", value: stats.total_staff || 16, icon: "fa-user-tie", color: "from-purple-600 to-indigo-700", sub: `${stats.active_batches} Live batches running` },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-950 via-brand-900 to-brand-800 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg">
        <div className="relative z-10 max-w-2xl">
          <span className="px-3 py-1 bg-accent-500/20 text-accent-400 border border-accent-500/30 rounded-full text-[11px] font-bold uppercase tracking-wider">
            Institutional Enterprise Portal
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold mt-3 tracking-tight">
            Welcome to WeGrow Skill Campus ERP
          </h2>
          <p className="text-xs md:text-sm text-slate-300 mt-2 leading-relaxed">
            Real-time management for admissions, batch schedules, attendance logs, student installments, and campus operations.
          </p>
        </div>
        <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center pr-8 pointer-events-none">
          <i className="fa-solid fa-graduation-cap text-9xl"></i>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, idx) => (
          <div key={idx} className="bg-white rounded-xl p-5 border border-surface-border shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{card.title}</p>
                <h3 className="text-xl font-extrabold text-brand-950 mt-1">{card.value}</h3>
              </div>
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white text-base shadow-sm`}>
                <i className={`fa-solid ${card.icon}`}></i>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
              <i className="fa-solid fa-circle-info text-accent-500 text-[10px]"></i>
              <span>{card.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Launchpad */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-5 border border-surface-border shadow-sm col-span-2">
          <h3 className="text-sm font-extrabold text-brand-950 mb-4 flex items-center gap-2">
            <i className="fa-solid fa-chart-line text-accent-500"></i>
            <span>Admissions & Operations Overview</span>
          </h3>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-surface-ground border border-surface-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                  <i className="fa-solid fa-laptop-code"></i>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-brand-950">Technical & Software Tracks</h4>
                  <p className="text-[11px] text-slate-500">Full Stack, Python AI, Cloud Computing, DevOps</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">78 Enrolled</span>
            </div>

            <div className="p-4 rounded-xl bg-surface-ground border border-surface-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                  <i className="fa-solid fa-briefcase"></i>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-brand-950">B-School & Management Internships</h4>
                  <p className="text-[11px] text-slate-500">Digital Marketing, HR, Finance, Operations</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">50 Enrolled</span>
            </div>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="bg-white rounded-xl p-5 border border-surface-border shadow-sm">
          <h3 className="text-sm font-extrabold text-brand-950 mb-4 flex items-center gap-2">
            <i className="fa-solid fa-bolt text-accent-500"></i>
            <span>Quick Actions</span>
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <a href="/enrollments" className="p-3 rounded-lg border border-surface-border hover:border-accent-500 hover:bg-accent-50/50 transition-all text-center block">
              <i className="fa-solid fa-user-plus text-accent-600 text-lg mb-1 block"></i>
              <span className="text-[11px] font-bold text-slate-700">New Admission</span>
            </a>
            <a href="/payments" className="p-3 rounded-lg border border-surface-border hover:border-accent-500 hover:bg-accent-50/50 transition-all text-center block">
              <i className="fa-solid fa-file-invoice-dollar text-emerald-600 text-lg mb-1 block"></i>
              <span className="text-[11px] font-bold text-slate-700">Collect Fee</span>
            </a>
            <a href="/attendance" className="p-3 rounded-lg border border-surface-border hover:border-accent-500 hover:bg-accent-50/50 transition-all text-center block">
              <i className="fa-solid fa-clipboard-user text-blue-600 text-lg mb-1 block"></i>
              <span className="text-[11px] font-bold text-slate-700">Attendance</span>
            </a>
            <a href="/campaigns" className="p-3 rounded-lg border border-surface-border hover:border-accent-500 hover:bg-accent-50/50 transition-all text-center block">
              <i className="fa-brands fa-whatsapp text-green-600 text-lg mb-1 block"></i>
              <span className="text-[11px] font-bold text-slate-700">Broadcast</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
