import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import * as XLSX from 'xlsx';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'form'
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Form State
  const initialForm = {
    course_name: '',
    duration: '',
    fees: '',
    status: 'Active',
    tutorial_videos: [],
    syllabus_files: []
  };

  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Tutorial Video Subform State
  const [videoInput, setVideoInput] = useState({
    name: '',
    url: '',
    description: ''
  });
  const [videoError, setVideoError] = useState('');

  // File Upload Ref
  const fileInputRef = useRef(null);
  const courseNameRef = useRef(null);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/courses');
      setCourses(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching courses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Validation
  const validateField = (field, value) => {
    const val = typeof value === 'string' ? value.trim() : (value || '');
    switch (field) {
      case 'course_name':
        if (!val) return "Course Name is required";
        if (val.length < 2) return "Course Name must be at least 2 characters";
        return "";
      default:
        return "";
    }
  };

  const validateAll = () => {
    const newErrors = {};
    const err = validateField('course_name', formData.course_name);
    if (err) newErrors.course_name = err;

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      if (newErrors.course_name && courseNameRef.current) {
        courseNameRef.current.focus();
      }
      return false;
    }
    return true;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (touched[field]) {
      const err = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: err }));
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const err = validateField(field, formData[field]);
    setErrors(prev => ({ ...prev, [field]: err }));
  };

  // Video management
  const handleAddVideo = () => {
    if (!videoInput.name.trim() && !videoInput.url.trim()) {
      setVideoError("Please provide at least Video Name or Video URL");
      return;
    }

    const newVideo = {
      name: videoInput.name.trim() || 'Untitled Video',
      url: videoInput.url.trim(),
      description: videoInput.description.trim()
    };

    setFormData(prev => ({
      ...prev,
      tutorial_videos: [...(prev.tutorial_videos || []), newVideo]
    }));

    setVideoInput({ name: '', url: '', description: '' });
    setVideoError('');
  };

  const handleRemoveVideo = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      tutorial_videos: prev.tutorial_videos.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  // Syllabus file management
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const fileNames = files.map(f => f.name);
    setFormData(prev => ({
      ...prev,
      syllabus_files: [...(prev.syllabus_files || []), ...fileNames]
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      syllabus_files: prev.syllabus_files.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleAddNew = () => {
    setFormData(initialForm);
    setVideoInput({ name: '', url: '', description: '' });
    setVideoError('');
    setErrors({});
    setTouched({});
    setEditId(null);
    setViewMode('form');
  };

  const handleEdit = (course) => {
    setEditId(course.id || course.course_id);
    setFormData({
      course_name: course.course_name || '',
      duration: course.duration || course.course_duration || '',
      fees: course.fees !== undefined && course.fees !== null ? course.fees : (course.course_fee || ''),
      status: course.status || 'Active',
      tutorial_videos: Array.isArray(course.tutorial_videos) ? course.tutorial_videos : [],
      syllabus_files: Array.isArray(course.syllabus_files) ? course.syllabus_files : []
    });
    setVideoInput({ name: '', url: '', description: '' });
    setVideoError('');
    setErrors({});
    setTouched({});
    setViewMode('form');
  };

  const handleDelete = async (courseIdentifier) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        await api.delete(`/courses/${courseIdentifier}`);
        fetchCourses();
      } catch (err) {
        console.error("Error deleting course:", err);
        alert(err.response?.data?.detail || "Failed to delete course.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setTouched({ course_name: true });
    if (!validateAll()) {
      return;
    }

    setLoading(true);

    const payload = {
      course_name: formData.course_name.trim(),
      duration: (formData.duration || '').toString().trim(),
      course_duration: (formData.duration || '').toString().trim(),
      fees: formData.fees ? Number(formData.fees) : 0,
      course_fee: formData.fees ? Number(formData.fees) : 0,
      status: formData.status || 'Active',
      tutorial_videos: formData.tutorial_videos || [],
      syllabus_files: formData.syllabus_files || []
    };

    try {
      if (editId) {
        await api.put(`/courses/${editId}`, payload);
      } else {
        await api.post('/courses', payload);
      }
      fetchCourses();
      setViewMode('list');
    } catch (err) {
      console.error("Save course error:", err);
      alert(err.response?.data?.detail || "Failed to save course record.");
    } finally {
      setLoading(false);
    }
  };

  // Filter Courses
  const filteredCourses = courses.filter(c => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const matchId = (c.course_id || '').toLowerCase().includes(q);
    const matchName = (c.course_name || '').toLowerCase().includes(q);
    const matchDur = (c.duration || c.course_duration || '').toLowerCase().includes(q);
    return matchId || matchName || matchDur;
  });

  // Export to Excel
  const handleExportExcel = () => {
    if (filteredCourses.length === 0) {
      alert("No courses to export.");
      return;
    }

    const exportData = filteredCourses.map((c, idx) => ({
      "SNO": idx + 1,
      "COURSE ID": c.course_id || `CRS${String(c.id).padStart(3, '0')}`,
      "COURSE NAME": c.course_name || '',
      "DURATION (MONTHS)": c.duration || c.course_duration || '',
      "TOTAL FEES (INR)": c.fees ? Number(c.fees) : 0,
      "TUTORIAL VIDEOS COUNT": Array.isArray(c.tutorial_videos) ? c.tutorial_videos.length : 0,
      "SYLLABUS FILES COUNT": Array.isArray(c.syllabus_files) ? c.syllabus_files.length : 0,
      "STATUS": c.status || 'Active'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    ws['!cols'] = [
      { wch: 6 },
      { wch: 14 },
      { wch: 38 },
      { wch: 18 },
      { wch: 16 },
      { wch: 22 },
      { wch: 22 },
      { wch: 12 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Courses_Curriculum");
    XLSX.writeFile(wb, `Courses_Curriculum_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Print PDF
  const handlePrint = () => {
    window.print();
  };

  // Pagination calculations
  const totalRecords = filteredCourses.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const currentCourses = filteredCourses.slice(startIndex, startIndex + pageSize);

  // FORM VIEW (Matching reference attachment)
  if (viewMode === 'form') {
    return (
      <div className="space-y-6 pb-16">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            {editId ? 'Edit Course' : 'New Course'}
          </h1>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 max-w-6xl">
          <form onSubmit={handleSubmit} noValidate className="space-y-8">
            
            {/* 1. Basic Course Info Section */}
            <div className="space-y-6">
              {/* Row 1: Course Name, Duration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Course Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    ref={courseNameRef}
                    type="text"
                    value={formData.course_name}
                    onChange={e => handleInputChange('course_name', e.target.value)}
                    onBlur={() => handleBlur('course_name')}
                    placeholder=""
                    className={`w-full px-3.5 py-2.5 text-sm rounded-lg border outline-none transition-colors ${
                      errors.course_name && touched.course_name
                        ? 'border-red-500 bg-red-50/20 focus:border-red-500'
                        : 'border-slate-300 focus:border-sky-600 focus:ring-1 focus:ring-sky-600'
                    }`}
                  />
                  {errors.course_name && touched.course_name && (
                    <p className="mt-1 text-xs text-red-600">{errors.course_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Duration (Months)
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={e => handleInputChange('duration', e.target.value)}
                    placeholder=""
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:border-sky-600 focus:ring-1 focus:ring-sky-600 outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Row 2: Total Course Fee, Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Total Course Fee
                  </label>
                  <input
                    type="number"
                    value={formData.fees}
                    onChange={e => handleInputChange('fees', e.target.value)}
                    placeholder=""
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:border-sky-600 focus:ring-1 focus:ring-sky-600 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={e => handleInputChange('status', e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:border-sky-600 focus:ring-1 focus:ring-sky-600 outline-none bg-white transition-colors"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 2. Tutorial Videos Section */}
            <div className="pt-6 border-t border-slate-100 space-y-4">
              <h2 className="text-base font-bold text-[#0056b3] tracking-tight">
                Tutorial Videos
              </h2>

              {/* Video sub-inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Video Name
                  </label>
                  <input
                    type="text"
                    value={videoInput.name}
                    onChange={e => setVideoInput({ ...videoInput, name: e.target.value })}
                    placeholder="e.g. Introduction"
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:border-sky-600 focus:ring-1 focus:ring-sky-600 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Video URL
                  </label>
                  <input
                    type="text"
                    value={videoInput.url}
                    onChange={e => setVideoInput({ ...videoInput, url: e.target.value })}
                    placeholder="e.g. https://youtube.com/..."
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:border-sky-600 focus:ring-1 focus:ring-sky-600 outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Video Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Video Description
                </label>
                <textarea
                  rows={2}
                  value={videoInput.description}
                  onChange={e => setVideoInput({ ...videoInput, description: e.target.value })}
                  placeholder="e.g. Overview of course structure and goals"
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:border-sky-600 focus:ring-1 focus:ring-sky-600 outline-none transition-colors resize-y"
                />
              </div>

              {videoError && (
                <p className="text-xs text-red-600">{videoError}</p>
              )}

              {/* Add Video Button */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleAddVideo}
                  className="px-6 py-2 bg-[#0056b3] hover:bg-[#004494] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <i className="fa-solid fa-plus text-xs" />
                  <span>Add Video</span>
                </button>
              </div>

              {/* Videos Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden mt-4">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[#0056b3] text-[11px] font-bold uppercase tracking-wider bg-slate-50/70">
                      <th className="px-4 py-3 font-bold w-16">S.NO</th>
                      <th className="px-4 py-3 font-bold">VIDEO NAME</th>
                      <th className="px-4 py-3 font-bold">VIDEO URL</th>
                      <th className="px-4 py-3 font-bold">DESCRIPTION</th>
                      <th className="px-4 py-3 font-bold text-center w-24">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {formData.tutorial_videos && formData.tutorial_videos.length > 0 ? (
                      formData.tutorial_videos.map((vid, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 text-slate-500 font-medium">{idx + 1}</td>
                          <td className="px-4 py-3 font-semibold text-slate-800">{vid.name}</td>
                          <td className="px-4 py-3 text-sky-600 max-w-xs truncate">
                            {vid.url ? (
                              <a
                                href={vid.url}
                                target="_blank"
                                rel="noreferrer"
                                className="hover:underline flex items-center gap-1"
                              >
                                <span>{vid.url}</span>
                                <i className="fa-solid fa-arrow-up-right-from-square text-[10px]" />
                              </a>
                            ) : '-'}
                          </td>
                          <td className="px-4 py-3 text-slate-600">{vid.description || '-'}</td>
                          <td className="px-4 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveVideo(idx)}
                              className="px-2.5 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded text-xs font-semibold transition-colors cursor-pointer"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-slate-400 font-medium">
                          No tutorial videos added yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. Course Syllabus Section */}
            <div className="pt-6 border-t border-slate-100 space-y-4">
              <h2 className="text-base font-bold text-[#0056b3] tracking-tight">
                Course Syllabus
              </h2>

              <label className="block text-xs font-semibold text-slate-700">
                Upload Syllabus (Supports Multiple Files)
              </label>

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-sky-300 hover:border-sky-500 bg-sky-50/20 hover:bg-sky-50/40 rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-2"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center mb-1">
                  <i className="fa-solid fa-cloud-arrow-up text-xl" />
                </div>
                <p className="text-sm font-semibold text-slate-700">
                  Click to browse or drag & drop syllabus files here
                </p>
                <p className="text-xs text-slate-400">
                  Allowed: PDF, DOC, DOCX
                </p>
              </div>

              {/* Uploaded Files List */}
              {formData.syllabus_files && formData.syllabus_files.length > 0 && (
                <div className="space-y-2 mt-4">
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Attached Files ({formData.syllabus_files.length})
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {formData.syllabus_files.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-700"
                      >
                        <div className="flex items-center gap-2 truncate mr-2">
                          <i className="fa-solid fa-file-lines text-sky-600 text-sm" />
                          <span className="font-medium truncate">{file}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(idx)}
                          className="text-slate-400 hover:text-red-600 p-1 transition-colors"
                          title="Remove file"
                        >
                          <i className="fa-solid fa-xmark text-sm" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-slate-100 flex items-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-[#0056b3] hover:bg-[#004494] text-white text-sm font-semibold rounded-lg shadow-sm transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {loading ? 'Saving...' : (editId ? 'Update Course' : 'Add Course')}
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
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
          Courses
        </h1>
        <button
          onClick={handleAddNew}
          className="px-5 py-2.5 bg-[#0056b3] hover:bg-[#004494] text-white text-sm font-semibold rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>Add New Course</span>
        </button>
      </div>

      {/* Controls & Filter Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left Controls */}
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
              placeholder="Search courses..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 bg-white outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600 transition-all text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* Course Data Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[#0056b3] text-[11px] font-bold uppercase tracking-wider bg-slate-50/50">
                <th className="px-5 py-3.5 font-bold">SNO</th>
                <th className="px-5 py-3.5 font-bold">COURSE ID</th>
                <th className="px-5 py-3.5 font-bold">COURSE NAME</th>
                <th className="px-5 py-3.5 font-bold">DURATION (MONTHS)</th>
                <th className="px-5 py-3.5 font-bold">TOTAL FEES</th>
                <th className="px-5 py-3.5 font-bold">VIDEOS</th>
                <th className="px-5 py-3.5 font-bold">SYLLABUS</th>
                <th className="px-5 py-3.5 font-bold">STATUS</th>
                <th className="px-5 py-3.5 font-bold text-center">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {currentCourses.length > 0 ? (
                currentCourses.map((c, idx) => (
                  <tr key={c.id || c.course_id} className="hover:bg-slate-50/70 transition-colors">
                    {/* SNO */}
                    <td className="px-5 py-3.5 text-slate-500 font-medium">
                      {startIndex + idx + 1}
                    </td>

                    {/* COURSE ID */}
                    <td className="px-5 py-3.5">
                      <span className="inline-block px-2.5 py-1 text-xs font-bold text-slate-800 bg-[#eef2f6] rounded-md tracking-wide">
                        {c.course_id || `CRS${String(c.id).padStart(3, '0')}`}
                      </span>
                    </td>

                    {/* COURSE NAME */}
                    <td className="px-5 py-3.5 font-medium text-slate-900">
                      {c.course_name || '-'}
                    </td>

                    {/* DURATION */}
                    <td className="px-5 py-3.5 text-slate-600 font-normal">
                      {c.duration || c.course_duration ? `${c.duration || c.course_duration} Months` : '-'}
                    </td>

                    {/* TOTAL FEES */}
                    <td className="px-5 py-3.5 font-semibold text-slate-800">
                      ₹{Number(c.fees || c.course_fee || 0).toLocaleString('en-IN')}
                    </td>

                    {/* VIDEOS */}
                    <td className="px-5 py-3.5">
                      {Array.isArray(c.tutorial_videos) && c.tutorial_videos.length > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                          <i className="fa-brands fa-youtube text-red-500 text-xs" />
                          <span>{c.tutorial_videos.length} Videos</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* SYLLABUS */}
                    <td className="px-5 py-3.5">
                      {Array.isArray(c.syllabus_files) && c.syllabus_files.length > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <i className="fa-solid fa-file-lines text-emerald-600 text-xs" />
                          <span>{c.syllabus_files.length} Files</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* STATUS */}
                    <td className="px-5 py-3.5">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-semibold border ${
                        (c.status || 'Active').toLowerCase() === 'active'
                          ? 'bg-[#e6f9ed] text-[#16a34a] border-emerald-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {c.status || 'Active'}
                      </span>
                    </td>

                    {/* ACTION (Edit & Delete) */}
                    <td className="px-5 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleEdit(c)}
                          className="px-3 py-1 bg-[#0056b3] hover:bg-[#004494] text-white text-xs font-semibold rounded shadow-sm transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(c.id || c.course_id)}
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
                  <td colSpan={9} className="px-5 py-12 text-center text-slate-400 font-medium">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <i className="fa-solid fa-book-open text-3xl text-slate-300" />
                      <p className="text-sm">No courses found matching your criteria.</p>
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
