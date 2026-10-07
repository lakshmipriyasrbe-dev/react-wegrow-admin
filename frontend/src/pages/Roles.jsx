import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';

const MODULES_LIST = [
  { key: 'course', label: 'Courses' },
  { key: 'tasks', label: 'Tasks' },
  { key: 'event', label: 'Events' },
  { key: 'event_category', label: 'Event Category' },
  { key: 'offer', label: 'Offer' },
  { key: 'course_enquiry', label: 'Course Enquiry' },
  { key: 'enquiry_followup', label: 'Enquiry Follow-up' },
  { key: 'pamphlet_registration', label: 'Pamphlet Registration' },
  { key: 'enrollment', label: 'Student Enrollment' },
  { key: 'enrollment_internship', label: 'Internship Enrollment' },
  { key: 'course_closure', label: 'Course Closure' },
  { key: 'student_performance', label: 'Student Performance' },
  { key: 'student_feedback', label: 'Student Feedback' },
  { key: 'feedback_review', label: 'Feedback Review' },
  { key: 'attendance', label: 'Staff Attendance' },
  { key: 'student_attendance', label: 'Student Attendance' },
  { key: 'payroll', label: 'Payroll' },
  { key: 'payment_mode', label: 'Payment Mode' },
  { key: 'bank', label: 'Bank' },
  { key: 'receipt', label: 'Receipt' },
  { key: 'expense_category', label: 'Expense Category' },
  { key: 'expense_entry', label: 'Expense Entry' },
  { key: 'leave_approval', label: 'Leave Approval' },
  { key: 'installment_followup', label: 'Installment Follow-up' },
  { key: 'installment_reminders', label: 'Installment Reminders' },
  { key: 'questions', label: 'Question Bank' },
  { key: 'campaign', label: 'WhatsApp Campaign' },
  { key: 'report_enrollment', label: 'Enrollment Report', isReport: true },
  { key: 'report_payments', label: 'Payments Report', isReport: true },
  { key: 'report_attendance', label: 'Attendance Report', isReport: true },
  { key: 'report_payroll', label: 'Payroll Report', isReport: true },
  { key: 'report_expense', label: 'Expense Report', isReport: true },
  { key: 'report_gst_invoice', label: 'GST Invoice Report', isReport: true },
];

export default function Roles() {
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'form'
  const [editId, setEditId] = useState(null);
  const [roles, setRoles] = useState([]);
  const [companies, setCompanies] = useState([]);

  const [formData, setFormData] = useState({
    role_name: '',
    description: '',
    permissions: {}
  });

  const roleNameInputRef = useRef(null);

  const [errors, setErrors] = useState({});
  const [expandedCompanies, setExpandedCompanies] = useState({});
  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);

  const fetchRoles = () => {
    setLoading(true);
    api.get('/roles')
      .then((res) => {
        if (Array.isArray(res.data)) {
          setRoles(res.data);
        }
      })
      .catch((err) => {
        console.error("Error fetching roles:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const fetchCompanies = () => {
    api.get('/companies')
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setCompanies(res.data);
          const firstCompKey = res.data[0].company_id || res.data[0].id;
          setExpandedCompanies({ [firstCompKey]: true });
        }
      })
      .catch((err) => {
        console.error("Error fetching companies for permissions:", err);
      });
  };

  useEffect(() => {
    fetchRoles();
    fetchCompanies();
  }, []);

  const handleAddNew = () => {
    setEditId(null);
    const initialPerms = {};
    const activeCompanies = companies.length > 0 ? companies : [{ id: 1, company_id: '1', company_name: 'Main Branch', branch: '' }];

    activeCompanies.forEach(comp => {
      const compKey = comp.company_id || comp.id;
      initialPerms[compKey] = {};
      MODULES_LIST.forEach(mod => {
        initialPerms[compKey][mod.key] = { add: false, edit: false, view: false, delete: false };
      });
    });

    setFormData({
      role_name: '',
      description: '',
      permissions: initialPerms
    });
    setErrors({});
    if (activeCompanies.length > 0) {
      const firstKey = activeCompanies[0].company_id || activeCompanies[0].id;
      setExpandedCompanies({ [firstKey]: true });
    }
    setViewMode('form');
  };

  const handleEdit = async (r) => {
    const roleIdentifier = r.role_id || r.id;
    setEditId(roleIdentifier);
    setLoading(true);

    const activeCompanies = companies.length > 0 ? companies : [{ id: 1, company_id: '1', company_name: 'Main Branch', branch: '' }];
    const initialPerms = {};

    activeCompanies.forEach(comp => {
      const compKey = comp.company_id || comp.id;
      initialPerms[compKey] = {};
      MODULES_LIST.forEach(mod => {
        initialPerms[compKey][mod.key] = { add: false, edit: false, view: false, delete: false };
      });
    });

    try {
      const res = await api.get(`/roles/${roleIdentifier}/permissions`);
      if (Array.isArray(res.data)) {
        res.data.forEach(perm => {
          let compId = perm.company_id || activeCompanies[0].company_id || activeCompanies[0].id;
          let pageKey = perm.permission_page || perm.page_name;

          if (!initialPerms[compId]) {
            initialPerms[compId] = {};
          }

          initialPerms[compId][pageKey] = {
            add: perm.can_add === 1 || (perm.permission_action && perm.permission_action.includes('add')),
            edit: perm.can_edit === 1 || (perm.permission_action && perm.permission_action.includes('edit')),
            view: perm.can_view === 1 || (perm.permission_action && perm.permission_action.includes('view')),
            delete: perm.can_delete === 1 || (perm.permission_action && perm.permission_action.includes('delete'))
          };
        });
      }
    } catch (err) {
      console.error("Error fetching permissions for role:", err);
    } finally {
      setLoading(false);
    }

    setFormData({
      role_name: r.role_name || '',
      description: r.description || '',
      permissions: initialPerms
    });
    setErrors({});
    if (activeCompanies.length > 0) {
      const firstKey = activeCompanies[0].company_id || activeCompanies[0].id;
      setExpandedCompanies({ [firstKey]: true });
    }
    setViewMode('form');
  };

  const handleDelete = async (r) => {
    const roleIdentifier = r.role_id || r.id;
    if (window.confirm(`Are you sure you want to delete role "${r.role_name}"?`)) {
      try {
        await api.delete(`/roles/${roleIdentifier}`);
        fetchRoles();
      } catch (err) {
        console.error("Error deleting role:", err);
        alert(err.response?.data?.detail || "Failed to delete role.");
      }
    }
  };

  const toggleCompanyAccordion = (compId) => {
    setExpandedCompanies(prev => ({
      ...prev,
      [compId]: !prev[compId]
    }));
  };

  const handleActionChange = (compId, pageKey, action, checked) => {
    setFormData(prev => {
      const compPerms = prev.permissions[compId] || {};
      const pagePerms = compPerms[pageKey] || { add: false, edit: false, view: false, delete: false };

      const updated = { ...pagePerms, [action]: checked };

      if (checked && (action === 'add' || action === 'edit' || action === 'delete')) {
        updated.view = true;
      }

      if (!checked && action === 'view') {
        updated.add = false;
        updated.edit = false;
        updated.delete = false;
      }

      return {
        ...prev,
        permissions: {
          ...prev.permissions,
          [compId]: {
            ...compPerms,
            [pageKey]: updated
          }
        }
      };
    });
  };

  const handleSelectAllRow = (compId, pageKey, checked) => {
    setFormData(prev => {
      const compPerms = prev.permissions[compId] || {};
      return {
        ...prev,
        permissions: {
          ...prev.permissions,
          [compId]: {
            ...compPerms,
            [pageKey]: {
              add: checked,
              edit: checked,
              view: checked,
              delete: checked
            }
          }
        }
      };
    });
  };

  const isRowAllSelected = (compId, pageKey, isReport) => {
    const p = formData.permissions[compId]?.[pageKey] || { add: false, edit: false, view: false, delete: false };
    if (isReport) {
      return !!p.view;
    }
    return !!(p.add && p.edit && p.view && p.delete);
  };

  const validateRoleName = (name) => {
    const trimmed = typeof name === 'string' ? name.trim() : '';
    if (!trimmed) {
      return "enter role name";
    }
    if (!/^[a-zA-Z\s-]+$/.test(trimmed)) {
      return "Role name should only contain letters, spaces, and hyphens (e.g. Staff - Faculty, Front-Office)";
    }
    if (trimmed.length < 2) {
      return "Role name must be at least 2 characters";
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const roleNameErr = validateRoleName(formData.role_name);
    if (roleNameErr) {
      setErrors({ role_name: roleNameErr });
      if (roleNameInputRef.current) {
        roleNameInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        roleNameInputRef.current.focus();
      }
      return;
    }

    setLoading(true);

    const payload = {
      role_name: formData.role_name.trim(),
      description: (formData.description || '').trim(),
      permissions: formData.permissions
    };

    try {
      if (editId) {
        await api.put(`/roles/${editId}`, payload);
      } else {
        await api.post('/roles', payload);
      }
      fetchRoles();
      setViewMode('list');
    } catch (err) {
      console.error("Save role error:", err);
      let errMsg = "Failed to save role in database.";
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          const apiErrors = {};
          err.response.data.detail.forEach(d => {
            const field = d.loc[d.loc.length - 1];
            apiErrors[field] = d.msg.replace('Value error, ', '');
          });
          setErrors(prev => ({ ...prev, ...apiErrors }));
          errMsg = "Please fix the highlighted validation errors.";
        } else {
          errMsg = err.response.data.detail;
        }
      }
      if (roleNameInputRef.current) {
        roleNameInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        roleNameInputRef.current.focus();
      }
      alert(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const filteredRoles = roles.filter(r =>
    (r.role_name && r.role_name.toLowerCase().includes(search.toLowerCase())) ||
    (r.description && r.description.toLowerCase().includes(search.toLowerCase())) ||
    (r.role_id && r.role_id.toLowerCase().includes(search.toLowerCase()))
  );

  const activeCompanyList = companies.length > 0 ? companies : [{ id: 1, company_name: 'Main Institutional Branch', branch: 'Default' }];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">Role Management</h2>
      </div>

      {viewMode === 'form' ? (
        /* ================= EXACT ROLE FORM ================= */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 max-w-6xl mx-auto space-y-8">
          <form onSubmit={handleSubmit} noValidate className="space-y-8">
            {/* Top Inputs: Role Name & Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Role Name <span className="text-slate-700">*</span>
                </label>
                <input
                  ref={roleNameInputRef}
                  type="text"
                  required
                  placeholder="e.g. Supervisor, Trainer, Branch-Manager"
                  value={formData.role_name}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({ ...formData, role_name: val });
                    if (errors.role_name) {
                      setErrors({ ...errors, role_name: validateRoleName(val) });
                    }
                  }}
                  onBlur={(e) => {
                    const err = validateRoleName(e.target.value);
                    setErrors({ ...errors, role_name: err });
                  }}
                  className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg outline-none transition-all text-slate-800 placeholder-slate-400 ${
                    errors.role_name
                      ? 'border-red-400 focus:border-red-600 focus:ring-1 focus:ring-red-600 bg-red-50/20'
                      : 'border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600'
                  }`}
                />
                {errors.role_name && (
                  <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.role_name}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="Describe this role and responsibilities..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all text-slate-800 placeholder-slate-400"
                />
              </div>
            </div>

            {/* Section Header */}
            <div>
              <h3 className="text-base font-bold text-[#0056b3] pb-2 border-b border-slate-200">
                Company-Wise Permission Setup
              </h3>
            </div>

            {/* Company Accordions */}
            <div className="space-y-4">
              {activeCompanyList.map((comp) => {
                const isExpanded = !!expandedCompanies[comp.id];
                return (
                  <div key={comp.id} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
                    {/* Accordion Header */}
                    <div
                      onClick={() => toggleCompanyAccordion(comp.id)}
                      className="bg-[#F3F8FD] px-5 py-4 flex items-center justify-between cursor-pointer select-none hover:bg-[#EBF3FC] transition-colors border-b border-slate-200"
                    >
                      <div className="flex items-center gap-3">
                        <i className="fa-solid fa-building text-[#0056b3] text-base"></i>
                        <span className="font-extrabold text-sm text-[#0056b3]">{comp.company_name}</span>
                        {comp.branch && (
                          <span className="text-xs font-bold text-slate-600 ml-2">({comp.branch})</span>
                        )}
                      </div>
                      <i className={`fa-solid fa-chevron-down text-xs text-[#0056b3] transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}></i>
                    </div>

                    {/* Accordion Content: Permissions Table */}
                    {isExpanded && (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-700">
                          <thead>
                            <tr className="border-b border-slate-200 text-[#0056b3] text-[11px] font-extrabold uppercase tracking-wider bg-white">
                              <th className="px-6 py-3.5 w-1/3">MODULE / PAGE</th>
                              <th className="px-4 py-3.5 text-center">SELECT ALL</th>
                              <th className="px-4 py-3.5 text-center">ADD</th>
                              <th className="px-4 py-3.5 text-center">EDIT</th>
                              <th className="px-4 py-3.5 text-center">VIEW</th>
                              <th className="px-4 py-3.5 text-center">DELETE</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {MODULES_LIST.map((mod) => {
                              const p = formData.permissions[comp.id]?.[mod.key] || { add: false, edit: false, view: false, delete: false };
                              const rowSelected = isRowAllSelected(comp.id, mod.key, mod.isReport);

                              return (
                                <tr key={mod.key} className="hover:bg-slate-50/70 transition-colors">
                                  {/* Module / Page title and key */}
                                  <td className="px-6 py-3.5">
                                    <p className="font-bold text-slate-800 text-xs">{mod.label}</p>
                                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">{mod.key}</p>
                                  </td>

                                  {/* Select All */}
                                  <td className="px-4 py-3.5 text-center">
                                    <input
                                      type="checkbox"
                                      checked={rowSelected}
                                      onChange={(e) => handleSelectAllRow(comp.id, mod.key, e.target.checked)}
                                      className="w-4 h-4 rounded border-slate-300 text-[#0056b3] focus:ring-blue-500 cursor-pointer"
                                    />
                                  </td>

                                  {/* Add */}
                                  <td className="px-4 py-3.5 text-center">
                                    {!mod.isReport ? (
                                      <input
                                        type="checkbox"
                                        checked={p.add}
                                        onChange={(e) => handleActionChange(comp.id, mod.key, 'add', e.target.checked)}
                                        className="w-4 h-4 rounded border-slate-300 text-[#0056b3] focus:ring-blue-500 cursor-pointer"
                                      />
                                    ) : (
                                      <span className="text-slate-300">-</span>
                                    )}
                                  </td>

                                  {/* Edit */}
                                  <td className="px-4 py-3.5 text-center">
                                    {!mod.isReport ? (
                                      <input
                                        type="checkbox"
                                        checked={p.edit}
                                        onChange={(e) => handleActionChange(comp.id, mod.key, 'edit', e.target.checked)}
                                        className="w-4 h-4 rounded border-slate-300 text-[#0056b3] focus:ring-blue-500 cursor-pointer"
                                      />
                                    ) : (
                                      <span className="text-slate-300">-</span>
                                    )}
                                  </td>

                                  {/* View */}
                                  <td className="px-4 py-3.5 text-center">
                                    <input
                                      type="checkbox"
                                      checked={p.view}
                                      onChange={(e) => handleActionChange(comp.id, mod.key, 'view', e.target.checked)}
                                      className="w-4 h-4 rounded border-slate-300 text-[#0056b3] focus:ring-blue-500 cursor-pointer"
                                    />
                                  </td>

                                  {/* Delete */}
                                  <td className="px-4 py-3.5 text-center">
                                    {!mod.isReport ? (
                                      <input
                                        type="checkbox"
                                        checked={p.delete}
                                        onChange={(e) => handleActionChange(comp.id, mod.key, 'delete', e.target.checked)}
                                        className="w-4 h-4 rounded border-slate-300 text-[#0056b3] focus:ring-blue-500 cursor-pointer"
                                      />
                                    ) : (
                                      <span className="text-slate-300">-</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom Error Notification & Buttons */}
            {errors.role_name && (
              <div
                onClick={() => {
                  roleNameInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  roleNameInputRef.current?.focus();
                }}
                className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-lg flex items-center justify-between cursor-pointer hover:bg-red-100 transition-colors shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <i className="fa-solid fa-triangle-exclamation text-red-600 text-sm"></i>
                  <span><strong>Validation Error:</strong> {errors.role_name}</span>
                </div>
                <span className="text-red-600 font-bold flex items-center gap-1.5 text-xs">
                  Scroll up to fix <i className="fa-solid fa-arrow-up"></i>
                </span>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-[#0056b3] hover:bg-[#004494] text-white text-sm font-bold rounded-lg shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
              >
                <i className="fa-solid fa-floppy-disk text-xs"></i>
                <span>{editId ? 'Update Role & Permissions' : 'Save Role & Permissions'}</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* ================= ACTIVE ROLES LIST VIEW ================= */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-bold text-slate-800">Configured Roles</h3>
            </div>
            <button
              onClick={handleAddNew}
              className="px-4 py-2 bg-[#0056b3] hover:bg-[#004494] text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
            >
              <i className="fa-solid fa-plus text-xs"></i>
              <span>Add New Role</span>
            </button>
          </div>

          {/* List Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span>Show</span>
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="px-2 py-1 border border-slate-300 rounded-md outline-none bg-white font-medium"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>entries</span>
            </div>

            <div className="relative">
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search roles..."
                className="pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-xs w-56 sm:w-64"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-y border-slate-200">
                <tr>
                  <th className="px-4 py-3">Sno</th>
                  <th className="px-4 py-3">Role ID</th>
                  <th className="px-4 py-3">Role Name</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRoles.length > 0 ? (
                  filteredRoles.map((r, idx) => (
                    <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 font-medium">{idx + 1}</td>
                      <td className="px-4 py-3 font-mono font-bold text-accent-600">{r.role_id || `ROL${r.id.toString().padStart(3, '0')}`}</td>
                      <td className="px-4 py-3 font-bold text-[#0056b3]">{r.role_name}</td>
                      <td className="px-4 py-3 text-slate-600">{r.description || '-'}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(r)}
                            title="Edit Role & Permissions"
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <i className="fa-solid fa-pen-to-square text-sm"></i>
                          </button>
                          <button
                            onClick={() => handleDelete(r)}
                            title="Delete Role"
                            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <i className="fa-solid fa-trash-can text-sm"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-400 font-medium">
                      {loading ? "Loading roles..." : "No roles found. Click \"Add New Role\" to create your first role."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Showing {filteredRoles.length > 0 ? 1 : 0} to {filteredRoles.length} of {filteredRoles.length} entries</span>
          </div>
        </div>
      )}
    </div>
  );
}
