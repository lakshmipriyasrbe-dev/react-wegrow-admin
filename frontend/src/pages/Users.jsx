import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'form'
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Search & Pagination
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    role_id: '',
    username: '',
    password: '',
    company_id: '1'
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Field refs for auto-focus on error
  const nameRef = useRef(null);
  const mobileRef = useRef(null);
  const roleRef = useRef(null);
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await api.get('/roles');
      if (Array.isArray(res.data)) {
        setRoles(res.data);
        if (res.data.length > 0 && !formData.role_id) {
          setFormData(prev => ({ ...prev, role_id: res.data[0].role_id || res.data[0].id.toString() }));
        }
      }
    } catch (err) {
      console.error("Error fetching roles:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  // Validation functions matching reference
  const validateField = (field, value) => {
    const val = typeof value === 'string' ? value.trim() : (value || '');

    switch (field) {
      case 'name':
        if (!val) return "Enter the Full Name";
        if (!/^[a-zA-Z\s]+$/.test(val)) return "Full Name should only contain letters and spaces";
        return "";

      case 'mobile':
        if (!val) return "Enter the Mobile Number";
        if (!/^[0-9]{10}$/.test(val)) return "Mobile Number should be exactly 10 digits";
        return "";

      case 'role_id':
        if (!val) return "Select the Role";
        return "";

      case 'username':
        if (!val) return "Enter Username";
        return "";

      case 'password':
        if (!editId && !val) return "Enter the Password";
        if (val) {
          if (val.length < 8) return "Password should be at least 8 characters";
          if (!/[A-Z]/.test(val) || !/[0-9]/.test(val) || !/[\W_]/.test(val)) {
            return "Password must include at least one capital letter, one number, and one special character";
          }
        }
        return "";

      default:
        return "";
    }
  };

  const validateAll = () => {
    const fields = ['name', 'mobile', 'role_id', 'username', 'password'];
    const newErrors = {};

    fields.forEach(field => {
      const err = validateField(field, formData[field]);
      if (err) newErrors[field] = err;
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      if (newErrors.name && nameRef.current) {
        nameRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        nameRef.current.focus();
      } else if (newErrors.mobile && mobileRef.current) {
        mobileRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        mobileRef.current.focus();
      } else if (newErrors.role_id && roleRef.current) {
        roleRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        roleRef.current.focus();
      } else if (newErrors.username && usernameRef.current) {
        usernameRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        usernameRef.current.focus();
      } else if (newErrors.password && passwordRef.current) {
        passwordRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        passwordRef.current.focus();
      }
      return false;
    }
    return true;
  };

  const handleChange = (name, value) => {
    let val = value;
    if (name === 'mobile') {
      val = value.replace(/\D/g, '').slice(0, 10);
    }

    setFormData(prev => ({ ...prev, [name]: val }));

    if (touched[name]) {
      const err = validateField(name, val);
      setErrors(prev => ({ ...prev, [name]: err }));
    }
  };

  const handleBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const err = validateField(name, formData[name]);
    setErrors(prev => ({ ...prev, [name]: err }));
  };

  const handleAddNew = () => {
    setEditId(null);
    const defaultRole = roles.length > 0 ? (roles[0].role_id || roles[0].id.toString()) : '';
    setFormData({
      name: '',
      mobile: '',
      role_id: defaultRole,
      username: '',
      password: '',
      company_id: '1'
    });
    setErrors({});
    setTouched({});
    setShowPassword(false);
    setViewMode('form');
  };

  const handleEdit = (u) => {
    const userIdentifier = u.user_id || u.id;
    setEditId(userIdentifier);
    setFormData({
      name: u.name || '',
      mobile: u.mobile || '',
      role_id: u.role_id || (roles.length > 0 ? (roles[0].role_id || roles[0].id.toString()) : ''),
      username: u.username || '',
      password: '',
      company_id: u.company_id || '1'
    });
    setErrors({});
    setTouched({});
    setShowPassword(false);
    setViewMode('form');
  };

  const handleDelete = async (u) => {
    const userIdentifier = u.user_id || u.id;
    if (window.confirm(`Are you sure you want to delete user "${u.name || u.username}"?`)) {
      try {
        await api.delete(`/users/${userIdentifier}`);
        fetchUsers();
      } catch (err) {
        console.error("Error deleting user:", err);
        alert(err.response?.data?.detail || "Failed to delete user.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setTouched({
      name: true,
      mobile: true,
      role_id: true,
      username: true,
      password: true
    });

    if (!validateAll()) {
      return;
    }

    setLoading(true);

    const payload = {
      name: formData.name.trim(),
      mobile: formData.mobile.trim(),
      username: formData.username.trim(),
      role_id: formData.role_id,
      company_id: formData.company_id || "1"
    };

    if (formData.password && formData.password.trim()) {
      payload.password = formData.password.trim();
    }

    try {
      if (editId) {
        await api.put(`/users/${editId}`, payload);
      } else {
        await api.post('/users', payload);
      }
      fetchUsers();
      setViewMode('list');
    } catch (err) {
      console.error("Save user error:", err);
      let errMsg = "Failed to save user in database.";
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
          if (errMsg.toLowerCase().includes("username") || errMsg.toLowerCase().includes("mobile")) {
            setErrors(prev => ({ ...prev, username: errMsg }));
          }
        }
      }
      alert(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Filtered and paginated list
  const filteredUsers = users.filter(u =>
    (u.name && u.name.toLowerCase().includes(search.toLowerCase())) ||
    (u.username && u.username.toLowerCase().includes(search.toLowerCase())) ||
    (u.mobile && u.mobile.toLowerCase().includes(search.toLowerCase())) ||
    (u.role && u.role.toLowerCase().includes(search.toLowerCase()))
  );

  const totalRecords = filteredUsers.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + pageSize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800">User Management</h2>
        </div>
      </div>

      {viewMode === 'form' ? (
        /* Form Section matching screenshot */
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 max-w-4xl">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-800">
              {editId ? "Update User Details" : "Create New User"}
            </h3>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Full Name (Full Width) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                ref={nameRef}
                type="text"
                name="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                onBlur={() => handleBlur('name')}
                placeholder="Enter Full Name"
                className={`w-full px-3.5 py-2 text-sm border rounded-lg outline-none transition-all ${
                  errors.name && touched.name
                    ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/20'
                    : 'border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600'
                }`}
              />
              {errors.name && touched.name && (
                <p className="text-red-500 text-xs mt-1 font-medium">{errors.name}</p>
              )}
            </div>

            {/* Grid for Mobile and Role */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Mobile */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Mobile <span className="text-red-500">*</span>
                </label>
                <input
                  ref={mobileRef}
                  type="text"
                  name="mobile"
                  value={formData.mobile}
                  onChange={(e) => handleChange('mobile', e.target.value)}
                  onBlur={() => handleBlur('mobile')}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  className={`w-full px-3.5 py-2 text-sm border rounded-lg outline-none transition-all ${
                    errors.mobile && touched.mobile
                      ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/20'
                      : 'border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600'
                  }`}
                />
                {errors.mobile && touched.mobile && (
                  <p className="text-red-500 text-xs mt-1 font-medium">{errors.mobile}</p>
                )}
              </div>

              {/* Role Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  ref={roleRef}
                  name="role_id"
                  value={formData.role_id}
                  onChange={(e) => handleChange('role_id', e.target.value)}
                  onBlur={() => handleBlur('role_id')}
                  className={`w-full px-3.5 py-2 text-sm border rounded-lg outline-none transition-all bg-white cursor-pointer ${
                    errors.role_id && touched.role_id
                      ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/20'
                      : 'border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600'
                  }`}
                >
                  <option value="">Select Role</option>
                  {roles.map((r) => (
                    <option key={r.role_id || r.id} value={r.role_id || r.id.toString()}>
                      {r.role_name ? r.role_name.charAt(0).toUpperCase() + r.role_name.slice(1) : r.role_name}
                    </option>
                  ))}
                </select>
                {errors.role_id && touched.role_id && (
                  <p className="text-red-500 text-xs mt-1 font-medium">{errors.role_id}</p>
                )}
              </div>
            </div>

            {/* Grid for Username and Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Username */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  ref={usernameRef}
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={(e) => handleChange('username', e.target.value)}
                  onBlur={() => handleBlur('username')}
                  placeholder="Enter Username"
                  className={`w-full px-3.5 py-2 text-sm border rounded-lg outline-none transition-all ${
                    errors.username && touched.username
                      ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/20'
                      : 'border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600'
                  }`}
                />
                {errors.username && touched.username && (
                  <p className="text-red-500 text-xs mt-1 font-medium">{errors.username}</p>
                )}
              </div>

              {/* Password with Eye Toggle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Password {editId ? <span className="font-normal text-slate-500">(Leave blank to keep unchanged)</span> : <span className="text-red-500">*</span>}
                </label>
                <div className="relative flex items-center">
                  <input
                    ref={passwordRef}
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    onBlur={() => handleBlur('password')}
                    placeholder={editId ? "••••••••" : "Min 8 chars, 1 uppercase, 1 number, 1 special"}
                    className={`w-full pl-3.5 pr-10 py-2 text-sm border rounded-lg outline-none transition-all ${
                      errors.password && touched.password
                        ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/20'
                        : 'border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer focus:outline-none"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
                {errors.password && touched.password && (
                  <p className="text-red-500 text-xs mt-1 font-medium">{errors.password}</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-[#0056b3] hover:bg-blue-700 text-white font-bold rounded-lg text-xs shadow-sm transition-all cursor-pointer flex items-center gap-2"
              >
                {loading && <i className="fa-solid fa-circle-notch fa-spin text-xs"></i>}
                {editId ? "Update User" : "Create User"}
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="px-5 py-2 bg-[#ef4444] hover:bg-red-600 text-white font-bold rounded-lg text-xs shadow-sm transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* List Section matching reference users.php */
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h3 className="text-base font-bold text-slate-800">Active Users</h3>
              <button
                onClick={handleAddNew}
                className="px-4 py-1.5 bg-[#0056b3] hover:bg-blue-700 text-white font-semibold rounded-lg text-xs shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
              >
                <i className="fa-solid fa-plus text-[10px]"></i>
                Add New User
              </button>
            </div>

            {/* Search and Limit Controls */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <span>Show</span>
                <select
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                  className="px-2 py-1 border border-slate-300 rounded-md text-xs outline-none focus:border-blue-600"
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
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                  placeholder="Search users..."
                  className="pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-xs w-48 sm:w-56"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-y border-slate-200">
                <tr>
                  <th className="px-4 py-3">Sno</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Username</th>
                  <th className="px-4 py-3">Mobile</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedUsers.length > 0 ? (
                  paginatedUsers.map((u, idx) => (
                    <tr key={u.user_id || u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 font-medium">{startIndex + idx + 1}</td>
                      <td className="px-4 py-3 font-bold text-[#0056b3]">{u.name || u.username}</td>
                      <td className="px-4 py-3 font-mono text-slate-600">{u.username}</td>
                      <td className="px-4 py-3">{u.mobile || '-'}</td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-[#0056b3] capitalize">
                          {u.role || 'Staff'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(u)}
                            title="Edit User"
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <i className="fa-solid fa-pen-to-square text-sm"></i>
                          </button>
                          <button
                            onClick={() => handleDelete(u)}
                            title="Delete User"
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
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400 font-medium">
                      {loading ? "Loading users..." : "No users found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <span>
              Showing {totalRecords > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + pageSize, totalRecords)} of {totalRecords} entries
            </span>

            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="px-2.5 py-1 border border-slate-200 rounded text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <i className="fa-solid fa-chevron-left text-[10px]"></i>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                  <button
                    key={num}
                    onClick={() => setCurrentPage(num)}
                    className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
                      currentPage === num
                        ? 'bg-[#0056b3] text-white'
                        : 'border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {num}
                  </button>
                ))}
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="px-2.5 py-1 border border-slate-200 rounded text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <i className="fa-solid fa-chevron-right text-[10px]"></i>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
