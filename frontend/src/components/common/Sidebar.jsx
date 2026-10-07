import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const menuStructure = [
  {
    title: 'Dashboard',
    icon: 'fa-gauge-high',
    path: '/dashboard',
    dropdown: false,
  },
  {
    title: 'Master',
    icon: 'fa-sliders',
    menuId: 'master-menu',
    dropdown: true,
    children: [
      { path: '/company', label: 'Company Details' },
      { path: '/roles', label: 'Role Management' },
      { path: '/users', label: 'User Management' },
      { path: '/staff', label: 'Staff Members' },
      { path: '/courses', label: 'Courses' },
      { path: '/event-categories', label: 'Event Categories' },
      { path: '/events', label: 'Events' },
      { path: '/questions', label: 'Question Bank' },
      { path: '/tasks', label: 'Tasks' },
    ]
  },
  {
    title: 'Enquiry',
    icon: 'fa-headset',
    menuId: 'enquiry-menu',
    dropdown: true,
    children: [
      { path: '/enquiries', label: 'Course Enquiry' },
      { path: '/enquiry-followup', label: 'Enquiry Follow-up' },
      { path: '/pamphlet-registration', label: 'Pamphlet Registration' },
    ]
  },
  {
    title: 'Enrollment',
    icon: 'fa-user-graduate',
    menuId: 'enrollment-menu',
    dropdown: true,
    children: [
      { path: '/enrollments', label: 'Student Enrollment' },
      { path: '/enrollments-internship', label: 'Internship Enrollment' },
      { path: '/student-performance', label: 'Student Performance' },
      { path: '/feedback', label: 'Student Feedback' },
      { path: '/feedback-review', label: 'Feedback Review' },
      { path: '/course-closure', label: 'Course Closure' },
      { path: '/offers', label: 'Offer & Discounts' },
    ]
  },
  {
    title: 'Staff Management',
    icon: 'fa-user-tie',
    menuId: 'staff-menu',
    dropdown: true,
    children: [
      { path: '/attendance-staff', label: 'Staff Attendance' },
      { path: '/payroll', label: 'Monthly Payroll' },
    ]
  },
  {
    title: 'Payments',
    icon: 'fa-receipt',
    menuId: 'payments-menu',
    dropdown: true,
    children: [
      { path: '/payment-modes', label: 'Payment Mode' },
      { path: '/banks', label: 'Bank' },
      { path: '/payments', label: 'Receipt' },
    ]
  },
  {
    title: 'Fees Management',
    icon: 'fa-money-bill-wave',
    menuId: 'fees-menu',
    dropdown: true,
    children: [
      { path: '/installment-followup', label: 'Installment Follow-up' },
      { path: '/reports/installment-followup', label: 'Follow-up Report' },
      { path: '/reports/staff-collection', label: 'Staff Collection Report' },
    ]
  },
  {
    title: 'Expense',
    icon: 'fa-wallet',
    menuId: 'expense-menu',
    dropdown: true,
    children: [
      { path: '/expense-categories', label: 'Expense Category' },
      { path: '/expenses', label: 'Expense Entry' },
    ]
  },
  {
    title: 'HR Management',
    icon: 'fa-users',
    menuId: 'hr-menu',
    dropdown: true,
    children: [
      { path: '/leaves', label: 'Leave Approval' },
      { path: '/reports/leave', label: 'Leave Report' },
    ]
  },
  {
    title: 'Communication',
    icon: 'fa-comments',
    menuId: 'communication-menu',
    dropdown: true,
    children: [
      { path: '/installment-reminders', label: 'Installment Reminders' },
      { path: '/campaigns', label: 'WhatsApp Campaign' },
    ]
  },
  {
    title: 'Reports',
    icon: 'fa-chart-line',
    menuId: 'reports-menu',
    dropdown: true,
    children: [
      { path: '/reports/enrollment', label: 'Enrollment Report' },
      { path: '/reports/enrollment-tracker', label: 'Enrollment Tracker' },
      { path: '/reports/course-progress', label: 'Course Progress Report' },
      { path: '/reports/gst-invoice', label: 'GST Invoice Report' },
      { path: '/reports/payroll', label: 'Payroll Report' },
      { path: '/reports/payments', label: 'Payments Report' },
      { path: '/reports/expense', label: 'Expense Report' },
      { path: '/reports/attendance', label: 'Staff Attendance Report' },
      { path: '/reports/student-attendance', label: 'Student Attendance Report' },
      { path: '/reports/placement', label: 'Placement Report' },
      { path: '/reports/daily-work', label: 'Daily Work Report' },
      { path: '/reports/installments', label: 'Installment Report' },
      { path: '/reports/monthwise-installment', label: 'Monthwise Installment' },
    ]
  },
  {
    title: 'Student Attendance',
    icon: 'fa-user-check',
    path: '/attendance-student',
    dropdown: false,
  },
  {
    title: 'Student Tasks',
    icon: 'fa-tasks',
    path: '/student-tasks',
    dropdown: false,
  },
  {
    title: 'Daily Report',
    icon: 'fa-calendar-day',
    path: '/daily-report',
    dropdown: false,
  },
  {
    title: 'My Account',
    icon: 'fa-user-circle',
    menuId: 'account-menu',
    dropdown: true,
    children: [
      { path: '/profile', label: 'My Profile' },
      { path: '/apply-leave', label: 'Apply Leave' },
      { path: '/leave-history', label: 'My Leave History' },
    ]
  }
];

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({
    'master-menu': true,
    'enrollment-menu': false,
  });

  const toggleMenu = (menuId) => {
    setOpenMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  return (
    <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-brand-950 text-white flex flex-col transition-transform duration-200 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10 bg-brand-900/50">
        <img src="/wegrow-logo.png" alt="WeGrow Logo" className="h-9 w-auto object-contain bg-white/10 rounded p-1" />
        <div>
          <h1 className="font-extrabold text-sm tracking-wide text-white">WEGROW ERP</h1>
          <p className="text-[10px] text-accent-400 font-semibold tracking-wider uppercase">Institutional Portal</p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto custom-sidebar-scroll">
        {menuStructure.map((item, idx) => {
          if (!item.dropdown) {
            return (
              <NavLink
                key={idx}
                to={item.path}
                onClick={() => { if (window.innerWidth < 1024) onClose(); }}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-accent-600 to-accent-500 text-white active-nav-glow font-bold'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                <i className={`fa-solid ${item.icon} w-4 text-center text-sm opacity-90`}></i>
                <span>{item.title}</span>
              </NavLink>
            );
          }

          const isChildActive = item.children.some(c => location.pathname === c.path);
          const isMenuOpen = openMenus[item.menuId] || isChildActive;

          return (
            <div key={idx} className="space-y-0.5">
              <button
                onClick={() => toggleMenu(item.menuId)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isChildActive ? 'bg-white/10 text-accent-400' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <i className={`fa-solid ${item.icon} w-4 text-center text-sm opacity-90`}></i>
                  <span>{item.title}</span>
                </div>
                <i className={`fa-solid fa-chevron-right text-[10px] transition-transform duration-200 ${isMenuOpen ? 'rotate-90' : ''}`}></i>
              </button>

              {isMenuOpen && (
                <div className="pl-7 pr-1 py-1 space-y-0.5">
                  {item.children.map((child, cIdx) => (
                    <NavLink
                      key={cIdx}
                      to={child.path}
                      onClick={() => { if (window.innerWidth < 1024) onClose(); }}
                      className={({ isActive }) =>
                        `block px-3 py-1.5 rounded-md text-[11px] font-medium transition-all ${
                          isActive
                            ? 'bg-accent-600 text-white font-bold shadow-sm'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`
                      }
                    >
                      {child.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/10 text-[10px] text-slate-400 text-center bg-brand-900/40">
        <span className="font-mono text-accent-400">Enterprise v2.0 • PostgreSQL</span>
      </div>
    </aside>
  );
}
