import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import * as XLSX from 'xlsx';

export default function Staff() {
  const [staffList, setStaffList] = useState([]);
  const [roles, setRoles] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'form'
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'inactive'
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [salaryFilter, setSalaryFilter] = useState('without_salary'); // 'without_salary' | 'with_salary' | 'all'

  // Form State
  const initialForm = {
    staff_name: '',
    staff_number: '',
    role_id: '',
    course_id: '',
    salary: '',
    username: '',
    password: '',
    doj: new Date().toISOString().slice(0, 10),
    address: '',
    status: 'Active',
    status_notes: ''
  };

  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Field refs for auto-focusing on error
  const nameRef = useRef(null);
  const numberRef = useRef(null);
  const roleRef = useRef(null);
  const salaryRef = useRef(null);
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);
  const dojRef = useRef(null);
  const notesRef = useRef(null);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await api.get('/staff');
      setStaffList(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching staff list:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await api.get('/roles');
      if (Array.isArray(res.data)) {
        setRoles(res.data);
      }
    } catch (err) {
      console.error("Error fetching roles:", err);
    }
  };

  useEffect(() => {
    fetchStaff();
    fetchRoles();
  }, []);

  // Validation
  const validateField = (field, value, allData = formData) => {
    const val = typeof value === 'string' ? value.trim() : (value || '');

    switch (field) {
      case 'staff_name':
        if (!val) return "Staff Name is required";
        if (!/^[a-zA-Z\s.-]+$/.test(val)) return "Staff Name should only contain letters and spaces";
        return "";

      case 'staff_number':
        if (!val) return "Contact Number is required";
        if (!/^[0-9]{10}$/.test(val)) return "Contact Number must be exactly 10 digits";
        return "";

      case 'role_id':
        if (!val && val !== 0) return "Please select a Role";
        return "";

      case 'salary':
        if (val === '' || val === null || val === undefined) return "Salary is required";
        if (isNaN(val) || Number(val) < 0) return "Please enter a valid salary amount";
        return "";

      case 'username':
        if (!val) return "Username is required";
        if (val.length < 3) return "Username must be at least 3 characters";
        return "";

      case 'password':
        if (!editId && !val) return "Password is required";
        return "";

      case 'doj':
        if (!val) return "Date of Joining is required";
        return "";

      case 'status_notes':
        if (allData.status !== 'Active' && !val) {
          return "Reason / Notes is required for non-active status";
        }
        return "";

      default:
        return "";
    }
  };

  const validateAll = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const err = validateField(key, formData[key], formData);
      if (err) newErrors[key] = err;
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      if (newErrors.staff_name && nameRef.current) nameRef.current.focus();
      else if (newErrors.staff_number && numberRef.current) numberRef.current.focus();
      else if (newErrors.role_id && roleRef.current) roleRef.current.focus();
      else if (newErrors.salary && salaryRef.current) salaryRef.current.focus();
      else if (newErrors.username && usernameRef.current) usernameRef.current.focus();
      else if (newErrors.password && passwordRef.current) passwordRef.current.focus();
      else if (newErrors.doj && dojRef.current) dojRef.current.focus();
      else if (newErrors.status_notes && notesRef.current) notesRef.current.focus();
      return false;
    }
    return true;
  };

  const handleInputChange = (field, value) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);
    if (touched[field]) {
      const err = validateField(field, value, updatedData);
      setErrors(prev => ({ ...prev, [field]: err }));
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const err = validateField(field, formData[field], formData);
    setErrors(prev => ({ ...prev, [field]: err }));
  };

  const handleAddNew = () => {
    setFormData(initialForm);
    setErrors({});
    setTouched({});
    setEditId(null);
    setShowPassword(false);
    setViewMode('form');
  };

  const handleEdit = (staff) => {
    setEditId(staff.id || staff.staff_id);
    setFormData({
      staff_name: staff.staff_name || staff.name || '',
      staff_number: staff.staff_number || staff.number || '',
      role_id: staff.role_id !== undefined && staff.role_id !== null ? staff.role_id : '',
      course_id: staff.course_id || staff.course || '',
      salary: staff.salary !== undefined && staff.salary !== null ? staff.salary : '',
      username: staff.username || '',
      password: '',
      doj: staff.doj ? staff.doj.slice(0, 10) : new Date().toISOString().slice(0, 10),
      address: staff.address || '',
      status: staff.status || 'Active',
      status_notes: staff.status_notes || ''
    });
    setErrors({});
    setTouched({});
    setShowPassword(false);
    setViewMode('form');
  };

  const handleDelete = async (staffIdentifier) => {
    if (window.confirm("Are you sure you want to delete this staff member?")) {
      try {
        await api.delete(`/staff/${staffIdentifier}`);
        fetchStaff();
      } catch (err) {
        console.error("Error deleting staff:", err);
        alert(err.response?.data?.detail || "Failed to delete staff member.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setTouched({
      staff_name: true,
      staff_number: true,
      role_id: true,
      salary: true,
      username: true,
      password: true,
      doj: true,
      status_notes: true
    });

    if (!validateAll()) {
      return;
    }

    setLoading(true);

    const payload = {
      staff_name: formData.staff_name.trim(),
      staff_number: formData.staff_number.trim(),
      role_id: formData.role_id ? Number(formData.role_id) : null,
      course_id: (formData.course_id || '').trim(),
      salary: Number(formData.salary || 0),
      username: formData.username.trim(),
      doj: formData.doj,
      address: (formData.address || '').trim(),
      status: formData.status || 'Active',
      status_notes: formData.status !== 'Active' ? (formData.status_notes || '').trim() : ''
    };

    if (formData.password && formData.password.trim()) {
      payload.password = formData.password.trim();
    }

    try {
      if (editId) {
        await api.put(`/staff/${editId}`, payload);
      } else {
        await api.post('/staff', payload);
      }
      fetchStaff();
      setViewMode('list');
    } catch (err) {
      console.error("Save staff error:", err);
      let errMsg = "Failed to save staff record in database.";
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
      alert(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Date Formatter (DD-MM-YYYY)
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    } catch {
      return dateStr;
    }
  };

  // Filter Staff by Tab, Search & Salary
  const filteredStaff = staffList.filter(s => {
    // 1. Tab filter (Active / Inactive)
    const staffStatus = (s.status || 'Active').toLowerCase();
    if (activeTab === 'active' && staffStatus !== 'active') return false;
    if (activeTab === 'inactive' && staffStatus === 'active') return false;

    // 2. Search query filter
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchId = (s.staff_id || '').toLowerCase().includes(q);
      const matchName = (s.staff_name || s.name || '').toLowerCase().includes(q);
      const matchNumber = (s.staff_number || s.number || '').toLowerCase().includes(q);
      const matchRole = (s.role || s.role_name || '').toLowerCase().includes(q);
      const matchUsername = (s.username || '').toLowerCase().includes(q);
      const matchNotes = (s.status_notes || '').toLowerCase().includes(q);
      if (!matchId && !matchName && !matchNumber && !matchRole && !matchUsername && !matchNotes) {
        return false;
      }
    }

    return true;
  });

  // Export to Excel using xlsx (matching xlsx.full.min.js reference)
  const handleExportExcel = () => {
    if (filteredStaff.length === 0) {
      alert("No staff records to export.");
      return;
    }

    const exportData = filteredStaff.map((s, idx) => {
      const row = {
        "SNO": idx + 1,
        "STAFF ID": s.staff_id || `ST${String(s.id).padStart(3, '0')}`,
        "NAME": s.staff_name || s.name || '',
        "NUMBER": s.staff_number || s.number || '',
        "ROLE": s.role || s.role_name || 'staff',
      };
      if (salaryFilter === 'with_salary' || salaryFilter === 'all') {
        row["SALARY"] = s.salary ? Number(s.salary) : 0;
      }
      row["DOJ"] = formatDate(s.doj);
      row["USERNAME"] = s.username || '';
      row["STATUS"] = s.status || 'Active';
      if (activeTab === 'inactive' || s.status !== 'Active') {
        row["REASON / NOTES"] = s.status_notes || '';
      }
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);

    // Set column auto widths
    const colWidths = [
      { wch: 6 },  // SNO
      { wch: 12 }, // STAFF ID
      { wch: 24 }, // NAME
      { wch: 16 }, // NUMBER
      { wch: 24 }, // ROLE
    ];
    if (salaryFilter === 'with_salary' || salaryFilter === 'all') {
      colWidths.push({ wch: 14 }); // SALARY
    }
    colWidths.push({ wch: 14 }); // DOJ
    colWidths.push({ wch: 18 }); // USERNAME
    colWidths.push({ wch: 14 }); // STATUS
    if (activeTab === 'inactive') {
      colWidths.push({ wch: 28 }); // REASON / NOTES
    }
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Staff_Directory");
    const statusParam = activeTab === 'active' ? 'Active' : 'Inactive';
    XLSX.writeFile(wb, `Staff_List_${statusParam}_${salaryFilter}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Print PDF using backend FPDF service (matching rpt_staff_list.php reference)
  const handlePrint = () => {
    const statusParam = activeTab === 'active' ? 'Active' : 'Inactive';
    const reportUrl = `/reports/rpt_staff_list.php?search=${encodeURIComponent(search.trim())}&current_status=${encodeURIComponent(statusParam)}&salary_filter=${encodeURIComponent(salaryFilter)}`;
    window.open(reportUrl, '_blank');
  };

  // Status Badge Helper
  const renderStatusBadge = (status, notes) => {
    const st = (status || 'Active').trim();
    let badgeClass = 'bg-[#e6f9ed] text-[#16a34a] border-emerald-200';
    if (st === 'Transferred') {
      badgeClass = 'bg-purple-50 text-purple-700 border-purple-200';
    } else if (st === 'Resigned') {
      badgeClass = 'bg-amber-50 text-amber-700 border-amber-200';
    } else if (st === 'Terminated') {
      badgeClass = 'bg-red-50 text-red-700 border-red-200';
    } else if (st === 'Abscond') {
      badgeClass = 'bg-rose-50 text-rose-800 border-rose-200';
    } else if (st === 'Inactive') {
      badgeClass = 'bg-slate-100 text-slate-700 border-slate-200';
    }

    return (
      <div>
        <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-semibold border ${badgeClass}`}>
          {st}
        </span>
        {notes && (
          <span className="block text-[10px] text-slate-500 font-normal italic mt-0.5 max-w-[140px] truncate" title={notes}>
            {notes}
          </span>
        )}
      </div>
    );
  };

  // Pagination calculations
  const totalRecords = filteredStaff.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const currentStaff = filteredStaff.slice(startIndex, startIndex + pageSize);

  // FORM VIEW
  if (viewMode === 'form') {
    return (
      <div className="space-y-6 pb-12">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            {editId ? 'Edit Staff' : 'New Staff'}
          </h1>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 max-w-6xl">
          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-6">
              {/* Row 1: Staff Name, Contact Number, Role */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Staff Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    ref={nameRef}
                    type="text"
                    value={formData.staff_name}
                    onChange={e => handleInputChange('staff_name', e.target.value)}
                    onBlur={() => handleBlur('staff_name')}
                    placeholder=""
                    className={`w-full px-3.5 py-2.5 text-sm rounded-lg border outline-none transition-colors ${
                      errors.staff_name && touched.staff_name
                        ? 'border-red-500 bg-red-50/20 focus:border-red-500'
                        : 'border-slate-300 focus:border-sky-600 focus:ring-1 focus:ring-sky-600'
                    }`}
                  />
                  {errors.staff_name && touched.staff_name && (
                    <p className="mt-1 text-xs text-red-600">{errors.staff_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Contact Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    ref={numberRef}
                    type="text"
                    maxLength={10}
                    value={formData.staff_number}
                    onChange={e => handleInputChange('staff_number', e.target.value.replace(/\D/g, ''))}
                    onBlur={() => handleBlur('staff_number')}
                    placeholder=""
                    className={`w-full px-3.5 py-2.5 text-sm rounded-lg border outline-none transition-colors ${
                      errors.staff_number && touched.staff_number
                        ? 'border-red-500 bg-red-50/20 focus:border-red-500'
                        : 'border-slate-300 focus:border-sky-600 focus:ring-1 focus:ring-sky-600'
                    }`}
                  />
                  {errors.staff_number && touched.staff_number && (
                    <p className="mt-1 text-xs text-red-600">{errors.staff_number}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    ref={roleRef}
                    value={formData.role_id}
                    onChange={e => handleInputChange('role_id', e.target.value)}
                    onBlur={() => handleBlur('role_id')}
                    className={`w-full px-3.5 py-2.5 text-sm rounded-lg border outline-none bg-white transition-colors ${
                      errors.role_id && touched.role_id
                        ? 'border-red-500 bg-red-50/20 focus:border-red-500'
                        : 'border-slate-300 focus:border-sky-600 focus:ring-1 focus:ring-sky-600'
                    }`}
                  >
                    <option value="">Select Role</option>
                    {roles.map(r => (
                      <option key={r.id || r.role_id} value={r.id || r.role_id}>
                        {r.role_name}
                      </option>
                    ))}
                    {roles.length === 0 && (
                      <>
                        <option value="4">staff</option>
                        <option value="5">incharger - enrollment</option>
                        <option value="6">telecaller</option>
                      </>
                    )}
                  </select>
                  {errors.role_id && touched.role_id && (
                    <p className="mt-1 text-xs text-red-600">{errors.role_id}</p>
                  )}
                </div>
              </div>

              {/* Row 2: Course, Salary, Username */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Course
                  </label>
                  <input
                    type="text"
                    value={formData.course_id}
                    onChange={e => handleInputChange('course_id', e.target.value)}
                    placeholder=""
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:border-sky-600 focus:ring-1 focus:ring-sky-600 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Salary <span className="text-red-500">*</span>
                  </label>
                  <input
                    ref={salaryRef}
                    type="number"
                    value={formData.salary}
                    onChange={e => handleInputChange('salary', e.target.value)}
                    onBlur={() => handleBlur('salary')}
                    placeholder=""
                    className={`w-full px-3.5 py-2.5 text-sm rounded-lg border outline-none transition-colors ${
                      errors.salary && touched.salary
                        ? 'border-red-500 bg-red-50/20 focus:border-red-500'
                        : 'border-slate-300 focus:border-sky-600 focus:ring-1 focus:ring-sky-600'
                    }`}
                  />
                  {errors.salary && touched.salary && (
                    <p className="mt-1 text-xs text-red-600">{errors.salary}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    ref={usernameRef}
                    type="text"
                    value={formData.username}
                    onChange={e => handleInputChange('username', e.target.value)}
                    onBlur={() => handleBlur('username')}
                    placeholder=""
                    className={`w-full px-3.5 py-2.5 text-sm rounded-lg border outline-none transition-colors ${
                      errors.username && touched.username
                        ? 'border-red-500 bg-red-50/20 focus:border-red-500'
                        : 'border-slate-300 focus:border-sky-600 focus:ring-1 focus:ring-sky-600'
                    }`}
                  />
                  {errors.username && touched.username && (
                    <p className="mt-1 text-xs text-red-600">{errors.username}</p>
                  )}
                </div>
              </div>

              {/* Row 3: Password, Date of Joining, Address */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Password <span className="text-red-500">{editId ? '' : '*'}</span>
                  </label>
                  <div className="relative">
                    <input
                      ref={passwordRef}
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={e => handleInputChange('password', e.target.value)}
                      onBlur={() => handleBlur('password')}
                      placeholder={editId ? '(Leave blank to keep current)' : ''}
                      className={`w-full pl-3.5 pr-10 py-2.5 text-sm rounded-lg border outline-none transition-colors ${
                        errors.password && touched.password
                          ? 'border-red-500 bg-red-50/20 focus:border-red-500'
                          : 'border-slate-300 focus:border-sky-600 focus:ring-1 focus:ring-sky-600'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
                    </button>
                  </div>
                  {errors.password && touched.password && (
                    <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Date of Joining <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      ref={dojRef}
                      type="date"
                      value={formData.doj}
                      onChange={e => handleInputChange('doj', e.target.value)}
                      onBlur={() => handleBlur('doj')}
                      className={`w-full px-3.5 py-2.5 text-sm rounded-lg border outline-none bg-white transition-colors ${
                        errors.doj && touched.doj
                          ? 'border-red-500 bg-red-50/20 focus:border-red-500'
                          : 'border-slate-300 focus:border-sky-600 focus:ring-1 focus:ring-sky-600'
                      }`}
                    />
                  </div>
                  {errors.doj && touched.doj && (
                    <p className="mt-1 text-xs text-red-600">{errors.doj}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Address
                  </label>
                  <textarea
                    rows={3}
                    value={formData.address}
                    onChange={e => handleInputChange('address', e.target.value)}
                    placeholder=""
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:border-sky-600 focus:ring-1 focus:ring-sky-600 outline-none transition-colors resize-y"
                  />
                </div>
              </div>

              {/* Row 4: Status and Conditional Reason/Notes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.status}
                    onChange={e => {
                      const newStatus = e.target.value;
                      handleInputChange('status', newStatus);
                      if (newStatus === 'Active') {
                        handleInputChange('status_notes', '');
                      }
                    }}
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:border-sky-600 focus:ring-1 focus:ring-sky-600 outline-none bg-white transition-colors"
                  >
                    <option value="Active">Active</option>
                    <option value="Transferred">Transferred</option>
                    <option value="Resigned">Resigned</option>
                    <option value="Terminated">Terminated</option>
                    <option value="Abscond">Abscond</option>
                  </select>
                </div>

                {formData.status !== 'Active' && (
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Reason / Notes <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      ref={notesRef}
                      rows={2}
                      value={formData.status_notes}
                      onChange={e => handleInputChange('status_notes', e.target.value)}
                      onBlur={() => handleBlur('status_notes')}
                      placeholder="Enter the reason or notes for status change..."
                      className={`w-full px-3.5 py-2 text-sm rounded-lg border outline-none transition-colors resize-y ${
                        errors.status_notes && touched.status_notes
                          ? 'border-red-500 bg-red-50/20 focus:border-red-500'
                          : 'border-slate-300 focus:border-sky-600 focus:ring-1 focus:ring-sky-600'
                      }`}
                    />
                    {errors.status_notes && touched.status_notes && (
                      <p className="mt-1 text-xs text-red-600">{errors.status_notes}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Submit Action */}
              <div className="pt-6 border-t border-slate-100 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-[#0056b3] hover:bg-[#004494] text-white text-sm font-semibold rounded-lg shadow-sm transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {loading ? 'Saving...' : (editId ? 'Update Staff' : 'Add Staff')}
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // LIST VIEW
  return (
    <div className="space-y-4 pb-12">
      {/* Top Header Row */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#004b87] tracking-tight">
          {activeTab === 'active' ? 'Active Staff' : 'Inactive Staff'}
        </h1>
        <button
          onClick={handleAddNew}
          className="px-5 py-2.5 bg-[#0056b3] hover:bg-[#004494] text-white text-sm font-semibold rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>Add New Staff</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-8 border-b border-slate-200 text-sm font-medium">
        <button
          onClick={() => { setActiveTab('active'); setCurrentPage(1); }}
          className={`flex items-center gap-2 pb-3.5 transition-all relative cursor-pointer ${
            activeTab === 'active'
              ? 'text-[#0056b3] font-bold border-b-2 border-[#0056b3]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <i className="fa-solid fa-user-check text-base" />
          <span>Active Staff</span>
        </button>

        <button
          onClick={() => { setActiveTab('inactive'); setCurrentPage(1); }}
          className={`flex items-center gap-2 pb-3.5 transition-all relative cursor-pointer ${
            activeTab === 'inactive'
              ? 'text-[#0056b3] font-bold border-b-2 border-[#0056b3]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <i className="fa-solid fa-user-xmark text-base" />
          <span>Inactive Staff</span>
        </button>
      </div>

      {/* Controls & Filter Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left Controls: Show entries & Salary Filter & Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Show Entries */}
            <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
              <span>Show</span>
              <select
                value={pageSize}
                onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 outline-none focus:border-sky-600 font-semibold"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>entries</span>
            </div>

            {/* Salary Filter */}
            <div>
              <select
                value={salaryFilter}
                onChange={e => setSalaryFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 outline-none focus:border-sky-600 font-medium"
              >
                <option value="without_salary">Without Salary</option>
                <option value="with_salary">With Salary</option>
                <option value="all">All Staff</option>
              </select>
            </div>

            {/* Print PDF Button */}
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#0062cc] hover:bg-[#0051a8] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
            >
              <i className="fa-solid fa-print text-sm" />
              <span>Print PDF</span>
            </button>

            {/* Export Excel Button */}
            <button
              onClick={handleExportExcel}
              className="px-4 py-2 bg-[#107c41] hover:bg-[#0d6535] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
            >
              <i className="fa-solid fa-file-excel text-sm" />
              <span>Export Excel</span>
            </button>
          </div>

          {/* Right Controls: Search Box */}
          <div className="relative w-full lg:w-72">
            <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="Search staff..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 bg-white outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600 transition-all text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* Staff Data Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[#0056b3] text-[11px] font-bold uppercase tracking-wider bg-slate-50/50">
                <th className="px-5 py-3.5 font-bold">SNO</th>
                <th className="px-5 py-3.5 font-bold">STAFF ID</th>
                <th className="px-5 py-3.5 font-bold">NAME</th>
                <th className="px-5 py-3.5 font-bold">NUMBER</th>
                <th className="px-5 py-3.5 font-bold">ROLE</th>
                {salaryFilter !== 'without_salary' && (
                  <th className="px-5 py-3.5 font-bold">SALARY</th>
                )}
                <th className="px-5 py-3.5 font-bold">DOJ</th>
                <th className="px-5 py-3.5 font-bold">USERNAME</th>
                <th className="px-5 py-3.5 font-bold">STATUS</th>
                <th className="px-5 py-3.5 font-bold text-center">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {currentStaff.length > 0 ? (
                currentStaff.map((staff, idx) => (
                  <tr key={staff.id || staff.staff_id} className="hover:bg-slate-50/70 transition-colors">
                    {/* SNO */}
                    <td className="px-5 py-3.5 text-slate-500 font-medium">
                      {startIndex + idx + 1}
                    </td>

                    {/* STAFF ID */}
                    <td className="px-5 py-3.5">
                      <span className="inline-block px-2.5 py-1 text-xs font-bold text-slate-800 bg-[#eef2f6] rounded-md tracking-wide">
                        {staff.staff_id || `ST${String(staff.id).padStart(3, '0')}`}
                      </span>
                    </td>

                    {/* NAME */}
                    <td className="px-5 py-3.5 font-medium text-slate-800">
                      {staff.staff_name || staff.name || '-'}
                    </td>

                    {/* NUMBER */}
                    <td className="px-5 py-3.5 text-slate-600 font-normal">
                      {staff.staff_number || staff.number || '-'}
                    </td>

                    {/* ROLE */}
                    <td className="px-5 py-3.5 text-slate-600 font-normal">
                      {staff.role || staff.role_name || 'staff'}
                    </td>

                    {/* Optional SALARY */}
                    {salaryFilter !== 'without_salary' && (
                      <td className="px-5 py-3.5 font-semibold text-slate-800">
                        ₹{Number(staff.salary || 0).toLocaleString('en-IN')}
                      </td>
                    )}

                    {/* DOJ */}
                    <td className="px-5 py-3.5 text-slate-600 font-normal">
                      {formatDate(staff.doj)}
                    </td>

                    {/* USERNAME */}
                    <td className="px-5 py-3.5 text-slate-600 font-normal">
                      {staff.username || '-'}
                    </td>

                    {/* STATUS */}
                    <td className="px-5 py-3.5">
                      {renderStatusBadge(staff.status, staff.status_notes)}
                    </td>

                    {/* ACTION (Edit & Delete) */}
                    <td className="px-5 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleEdit(staff)}
                          className="px-3 py-1 bg-[#0056b3] hover:bg-[#004494] text-white text-xs font-semibold rounded shadow-sm transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(staff.id || staff.staff_id)}
                          className="px-3 py-1 bg-[#dc2626] hover:bg-[#b91c1c] text-white text-xs font-semibold rounded shadow-sm transition-colors cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={salaryFilter !== 'without_salary' ? 10 : 9}
                    className="px-5 py-12 text-center text-slate-400 font-medium"
                  >
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <i className="fa-solid fa-users-slash text-3xl text-slate-300" />
                      <p className="text-sm">No {activeTab} staff members found.</p>
                      {search && (
                        <p className="text-xs text-slate-400">
                          Try clearing the search filter &ldquo;{search}&rdquo;
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer & Pagination */}
        <div className="px-5 py-3.5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing {totalRecords > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + pageSize, totalRecords)} of {totalRecords} entries
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-100 text-slate-600 transition-colors font-medium cursor-pointer disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1))
              .map((p, idx, arr) => {
                const prev = arr[idx - 1];
                return (
                  <React.Fragment key={p}>
                    {prev && p - prev > 1 && <span className="px-1 text-slate-400">...</span>}
                    <button
                      onClick={() => setCurrentPage(p)}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        currentPage === p
                          ? 'bg-[#0056b3] text-white shadow-sm'
                          : 'border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                );
              })}

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-100 text-slate-600 transition-colors font-medium cursor-pointer disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
