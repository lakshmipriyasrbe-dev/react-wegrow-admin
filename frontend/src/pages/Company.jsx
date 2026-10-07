import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function Company() {
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'form'
  const [editId, setEditId] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [formData, setFormData] = useState({
    company_name: '',
    company_email: '',
    company_mobile: '',
    gst: '',
    branch: '',
    company_address: '',
    logo_image: null,
    logo_preview: ''
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchCompanies = () => {
    setLoading(true);
    api.get('/companies')
      .then((res) => {
        if (Array.isArray(res.data)) {
          setCompanies(res.data);
        }
      })
      .catch((err) => {
        console.error("Error fetching companies:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const validateField = (name, value) => {
    let error = '';
    const trimmed = typeof value === 'string' ? value.trim() : '';

    switch (name) {
      case 'company_name':
        if (!trimmed) {
          error = 'enter company name';
        } else if (!/^[a-zA-Z][a-zA-Z0-9\s@&.,'-]*$/.test(trimmed)) {
          error = 'Company name must start with a letter (e.g. We Grow @ Sivakasi)';
        } else if (trimmed.length < 2) {
          error = 'Company name must be at least 2 characters';
        }
        break;

      case 'company_email':
        if (!trimmed) {
          error = 'enter company email';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
          error = 'enter a valid email address';
        }
        break;

      case 'company_mobile':
        if (!trimmed) {
          error = 'enter mobile number';
        } else if (!/^\d{10}$/.test(trimmed)) {
          error = 'enter 10-digit mobile number';
        }
        break;

      case 'gst':
        if (!trimmed) {
          error = 'enter gst number';
        } else if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i.test(trimmed)) {
          error = 'enter valid 15-character GST number (e.g., 33AAAAA0000A1Z5)';
        }
        break;

      case 'branch':
        if (!trimmed) {
          error = 'select a branch';
        }
        break;

      case 'company_address':
        if (!trimmed) {
          error = 'enter company address';
        } else if (trimmed.length < 3) {
          error = 'enter complete company address';
        }
        break;

      default:
        break;
    }
    return error;
  };

  const validateAll = () => {
    const newErrors = {};
    const fields = ['company_name', 'company_email', 'company_mobile', 'gst', 'branch', 'company_address'];
    fields.forEach(field => {
      const err = validateField(field, formData[field]);
      if (err) newErrors[field] = err;
    });
    setErrors(newErrors);

    const errorKeys = Object.keys(newErrors);
    if (errorKeys.length > 0) {
      const firstField = document.querySelector(`[name="${errorKeys[0]}"]`);
      if (firstField) {
        firstField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstField.focus();
      }
      return false;
    }
    return true;
  };

  const handleChange = (name, value) => {
    let val = value;
    if (name === 'gst') {
      val = value.toUpperCase();
    } else if (name === 'company_mobile') {
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
    setFormData({
      company_name: '',
      company_email: '',
      company_mobile: '',
      gst: '',
      branch: '',
      company_address: '',
      logo_image: null,
      logo_preview: ''
    });
    setErrors({});
    setTouched({});
    setViewMode('form');
  };

  const handleEdit = (comp) => {
    setEditId(comp.company_id || comp.id);
    setFormData({
      company_name: comp.company_name || '',
      company_email: comp.company_email || '',
      company_mobile: comp.company_mobile || '',
      gst: comp.gst || '',
      branch: comp.branch || '',
      company_address: comp.company_address || '',
      logo_image: null,
      logo_preview: comp.logo_image || ''
    });
    setErrors({});
    setTouched({});
    setViewMode('form');
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        logo_image: file,
        logo_preview: URL.createObjectURL(file)
      }));
    }
  };

  const handleDelete = async (comp) => {
    if (window.confirm(`Are you sure you want to delete company "${comp.company_name}"?`)) {
      try {
        await api.delete(`/companies/${comp.company_id || comp.id}`);
        fetchCompanies();
      } catch (err) {
        console.error("Delete company error:", err);
        alert(err.response?.data?.detail || "Failed to delete company.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields as touched
    const allTouched = {
      company_name: true,
      company_email: true,
      company_mobile: true,
      gst: true,
      branch: true,
      company_address: true
    };
    setTouched(allTouched);

    if (!validateAll()) {
      return;
    }

    setLoading(true);

    const payload = {
      company_name: formData.company_name.trim(),
      company_email: formData.company_email.trim(),
      company_mobile: formData.company_mobile.trim(),
      gst: formData.gst.trim().toUpperCase(),
      branch: formData.branch.trim(),
      company_address: formData.company_address.trim(),
      logo_image: formData.logo_preview || ''
    };

    try {
      if (editId) {
        await api.put(`/companies/${editId}`, payload);
      } else {
        await api.post('/companies', payload);
      }
      fetchCompanies();
      setViewMode('list');
    } catch (err) {
      console.error("Save company error:", err);
      let errMsg = "Failed to save company in database.";
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          // Pydantic validation error array
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

  const filtered = companies.filter(c =>
    (c.company_name && c.company_name.toLowerCase().includes(search.toLowerCase())) ||
    (c.company_email && c.company_email.toLowerCase().includes(search.toLowerCase())) ||
    (c.branch && c.branch.toLowerCase().includes(search.toLowerCase())) ||
    (c.gst && c.gst.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Page Title Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">Company</h2>
      </div>

      {viewMode === 'form' ? (
        /* ================= EXACT COMPANY FORM (MATCHING USER SCREENSHOT) ================= */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 max-w-6xl mx-auto">
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            {/* Row 1: Company Name, Email, Mobile Number */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Company Name <span className="text-slate-700">*</span>
                </label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={(e) => handleChange('company_name', e.target.value)}
                  onBlur={() => handleBlur('company_name')}
                  placeholder="e.g. WeGrow Skill Campus"
                  className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg outline-none transition-all text-slate-800 placeholder-slate-400 ${errors.company_name
                      ? 'border-red-400 focus:border-red-600 focus:ring-1 focus:ring-red-600 bg-red-50/20'
                      : 'border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600'
                    }`}
                />
                {errors.company_name && (
                  <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.company_name}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Email <span className="text-slate-700">*</span>
                </label>
                <input
                  type="email"
                  name="company_email"
                  value={formData.company_email}
                  onChange={(e) => handleChange('company_email', e.target.value)}
                  onBlur={() => handleBlur('company_email')}
                  placeholder="e.g. info@wegrow.edu"
                  className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg outline-none transition-all text-slate-800 placeholder-slate-400 ${errors.company_email
                      ? 'border-red-400 focus:border-red-600 focus:ring-1 focus:ring-red-600 bg-red-50/20'
                      : 'border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600'
                    }`}
                />
                {errors.company_email && (
                  <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.company_email}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Mobile Number <span className="text-slate-700">*</span>
                </label>
                <input
                  type="text"
                  name="company_mobile"
                  value={formData.company_mobile}
                  maxLength={10}
                  onChange={(e) => handleChange('company_mobile', e.target.value)}
                  onBlur={() => handleBlur('company_mobile')}
                  placeholder="e.g. 9876543210"
                  className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg outline-none transition-all text-slate-800 placeholder-slate-400 ${errors.company_mobile
                      ? 'border-red-400 focus:border-red-600 focus:ring-1 focus:ring-red-600 bg-red-50/20'
                      : 'border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600'
                    }`}
                />
                {errors.company_mobile && (
                  <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.company_mobile}</p>
                )}
              </div>
            </div>

            {/* Row 2: GST Number, Branch, Company Logo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  GST Number <span className="text-slate-700">*</span>
                </label>
                <input
                  type="text"
                  name="gst"
                  maxLength={15}
                  value={formData.gst}
                  onChange={(e) => handleChange('gst', e.target.value)}
                  onBlur={() => handleBlur('gst')}
                  placeholder="e.g. 33AAAAA0000A1Z5"
                  className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg outline-none uppercase transition-all text-slate-800 placeholder-slate-400 ${errors.gst
                      ? 'border-red-400 focus:border-red-600 focus:ring-1 focus:ring-red-600 bg-red-50/20'
                      : 'border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600'
                    }`}
                />
                {errors.gst && (
                  <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.gst}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Branch <span className="text-slate-700">*</span>
                </label>
                <select
                  name="branch"
                  value={formData.branch}
                  onChange={(e) => handleChange('branch', e.target.value)}
                  onBlur={() => handleBlur('branch')}
                  className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg outline-none transition-all text-slate-800 ${errors.branch
                      ? 'border-red-400 focus:border-red-600 focus:ring-1 focus:ring-red-600 bg-red-50/20'
                      : 'border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600'
                    }`}
                >
                  <option value="">Select Branch</option>
                  <option value="Sivakasi">Sivakasi</option>
                  <option value="Srivilliputhur">Srivilliputhur</option>
                  <option value="Virudhunagar">Virudhunagar</option>
                  <option value="Madurai">Madurai</option>
                  <option value="Chennai">Chennai</option>
                </select>
                {errors.branch && (
                  <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.branch}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Company Logo
                </label>
                <div className="flex items-center">
                  <input
                    type="file"
                    name="logo_image"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3.5 file:rounded-md file:border file:border-slate-300 file:text-xs file:font-semibold file:bg-slate-100 hover:file:bg-slate-200 cursor-pointer border border-slate-300 rounded-lg p-1"
                  />
                </div>
                {formData.logo_preview && (
                  <img src={formData.logo_preview} alt="Logo preview" className="h-12 w-auto mt-2 object-contain border rounded p-1 bg-slate-50" />
                )}
              </div>
            </div>

            {/* Row 3: Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Address <span className="text-slate-700">*</span>
              </label>
              <textarea
                rows={4}
                name="company_address"
                value={formData.company_address}
                onChange={(e) => handleChange('company_address', e.target.value)}
                onBlur={() => handleBlur('company_address')}
                placeholder="e.g. 123 Main Road, Sivakasi"
                className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg outline-none transition-all text-slate-800 placeholder-slate-400 resize-y ${errors.company_address
                    ? 'border-red-400 focus:border-red-600 focus:ring-1 focus:ring-red-600 bg-red-50/20'
                    : 'border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600'
                  }`}
              />
              {errors.company_address && (
                <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.company_address}</p>
              )}
            </div>

            {/* Form Action Buttons (Matching Screenshot Blue Button) */}
            <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-[#0056b3] hover:bg-[#004494] text-white text-sm font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                {editId ? 'Update Company' : 'Add Company'}
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
        /* ================= ACTIVE COMPANIES LIST VIEW ================= */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-bold text-slate-800">Active Companies</h3>
            </div>
            <button
              onClick={handleAddNew}
              className="px-4 py-2 bg-[#0056b3] hover:bg-[#004494] text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-2"
            >
              <i className="fa-solid fa-plus text-xs"></i>
              <span>Add New Company</span>
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
                placeholder="Search companies..."
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
                  <th className="px-4 py-3">Company Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Mobile</th>
                  <th className="px-4 py-3">Branch</th>
                  <th className="px-4 py-3">GST</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length > 0 ? (
                  filtered.map((comp, idx) => (
                    <tr key={comp.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 font-medium">{idx + 1}</td>
                      <td className="px-4 py-3 font-bold text-[#0056b3]">{comp.company_name}</td>
                      <td className="px-4 py-3">{comp.company_email}</td>
                      <td className="px-4 py-3">{comp.company_mobile}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{comp.branch}</td>
                      <td className="px-4 py-3 font-mono">{comp.gst}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(comp)}
                            title="Edit Company"
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <i className="fa-solid fa-pen-to-square text-sm"></i>
                          </button>
                          {/* <button
                            onClick={() => handleDelete(comp)}
                            title="Delete Company"
                            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <i className="fa-solid fa-trash-can text-sm"></i>
                          </button> */}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-400 font-medium">
                      No companies found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination info */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Showing {filtered.length > 0 ? 1 : 0} to {filtered.length} of {filtered.length} entries</span>
          </div>
        </div>
      )}
    </div>
  );
}
