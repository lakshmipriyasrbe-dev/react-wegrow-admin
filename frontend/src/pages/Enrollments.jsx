import React, { useState, useEffect } from 'react';
import api from '../services/api';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';

export default function Enrollments({ isInternship = false }) {
  const [enrollments, setEnrollments] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    student_name: '',
    father_spouse_name: '',
    gender: 'Male',
    email: '',
    address: '',
    mobile_number: '',
    parent_contact_no: '',
    course_id: 'Full Stack Web Development',
    duration: isInternship ? '90 Days' : '6 Months',
    from_time: '10:00 AM',
    to_time: '01:00 PM',
    staff_id: 'Dr. K. Ramesh',
    lead_source: 'Walk-in',
    fees_type: 'Installment',
    fees_amount: '45000',
    paid_amount: '15000',
    balance_amount: '30000',
    num_installments: 3,
    dob: '2002-05-15',
    doj: new Date().toISOString().slice(0, 10),
    blood_group: 'O+',
    student_status: 'Active'
  });
  const [loading, setLoading] = useState(false);

  const fetchEnrollments = () => {
    api.get('/enrollments')
      .then((res) => {
        if (!res.data || res.data.length === 0) {
          setEnrollments([
            { id: 1, student_id: "WG260001", student_name: "Aakash Kumar", mobile_number: "9876543210", course_id: "Full Stack Dev", fees_amount: 45000, paid_amount: 25000, balance_amount: 20000, doj: "2026-02-10", student_status: "Active" },
            { id: 2, student_id: "WG260002", student_name: "Sneha Reddy", mobile_number: "9876501234", course_id: "Data Science AI", fees_amount: 55000, paid_amount: 55000, balance_amount: 0, doj: "2026-01-15", student_status: "Active" },
          ]);
        } else {
          setEnrollments(res.data);
        }
      })
      .catch(() => {
        setEnrollments([
          { id: 1, student_id: "WG260001", student_name: "Aakash Kumar", mobile_number: "9876543210", course_id: "Full Stack Dev", fees_amount: 45000, paid_amount: 25000, balance_amount: 20000, doj: "2026-02-10", student_status: "Active" }
        ]);
      });
  };

  useEffect(() => {
    fetchEnrollments();
  }, [isInternship]);

  const handleFeeChange = (total, paid) => {
    const t = Number(total || 0);
    const p = Number(paid || 0);
    const b = Math.max(0, t - p);
    setFormData(prev => ({ ...prev, fees_amount: total, paid_amount: paid, balance_amount: b }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/enrollments', formData);
      setModalOpen(false);
      fetchEnrollments();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to submit enrollment');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: "Student ID", accessor: "student_id", render: (r) => <span className="font-mono font-bold text-accent-600">{r.student_id}</span> },
    { header: "Student Name", accessor: "student_name", render: (r) => <span className="font-bold text-brand-900">{r.student_name}</span> },
    { header: "Course Track", accessor: "course_id" },
    { header: "Contact", accessor: "mobile_number" },
    { header: "Course Fees", accessor: "fees_amount", render: (r) => `₹${Number(r.fees_amount || 0).toLocaleString()}` },
    { header: "Paid", accessor: "paid_amount", render: (r) => <span className="text-emerald-700 font-semibold">₹{Number(r.paid_amount || 0).toLocaleString()}</span> },
    { header: "Balance", accessor: "balance_amount", render: (r) => (
      Number(r.balance_amount) > 0
        ? <span className="font-bold text-red-600">₹{Number(r.balance_amount).toLocaleString()}</span>
        : <span className="text-emerald-600 font-bold">Cleared</span>
    )},
    { header: "Status", accessor: "student_status", render: (r) => (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800">{r.student_status || 'Active'}</span>
    )}
  ];

  return (
    <div className="space-y-6">
      <DataTable
        title={isInternship ? "Internship Admissions & Enrollments" : "Student Admissions & Training Enrollments"}
        columns={columns}
        data={enrollments}
        onAdd={() => setModalOpen(true)}
        addLabel={isInternship ? "New Internship Admission" : "New Student Admission"}
      />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Student Admission Application Form">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="form-label">Student Full Name *</label>
              <input required className="form-input" value={formData.student_name} onChange={e => setFormData({...formData, student_name: e.target.value})} placeholder="Candidate name" />
            </div>
            <div>
              <label className="form-label">Father / Spouse Name *</label>
              <input required className="form-input" value={formData.father_spouse_name} onChange={e => setFormData({...formData, father_spouse_name: e.target.value})} placeholder="Parent / guardian name" />
            </div>
            <div>
              <label className="form-label">Gender *</label>
              <select className="form-input" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="form-label">Student Contact Number *</label>
              <input required className="form-input" value={formData.mobile_number} onChange={e => setFormData({...formData, mobile_number: e.target.value})} placeholder="10-digit mobile" />
            </div>
            <div>
              <label className="form-label">Parent Contact Number</label>
              <input className="form-input" value={formData.parent_contact_no} onChange={e => setFormData({...formData, parent_contact_no: e.target.value})} placeholder="Parent contact" />
            </div>
            <div>
              <label className="form-label">Email Address</label>
              <input type="email" className="form-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="student@email.com" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="form-label">Course Program *</label>
              <select className="form-input" value={formData.course_id} onChange={e => setFormData({...formData, course_id: e.target.value})}>
                <option value="Full Stack Web Development">Full Stack Web Development</option>
                <option value="Python Data Science & AI">Python Data Science & AI</option>
                <option value="Cloud Computing & DevOps">Cloud Computing & DevOps</option>
                <option value="Digital Marketing & Analytics">Digital Marketing & Analytics</option>
                <option value="UI/UX Design Masterclass">UI/UX Design Masterclass</option>
              </select>
            </div>
            <div>
              <label className="form-label">Duration</label>
              <input className="form-input" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} placeholder="e.g. 6 Months" />
            </div>
            <div>
              <label className="form-label">Assigned Faculty / Mentor</label>
              <input className="form-input" value={formData.staff_id} onChange={e => setFormData({...formData, staff_id: e.target.value})} placeholder="Trainer name" />
            </div>
          </div>

          {/* Fees Calculation Section */}
          <div className="p-4 bg-surface-ground rounded-xl border border-surface-border space-y-3">
            <span className="text-xs font-extrabold uppercase text-brand-900 tracking-wider">Fee Structure & Installment Schedule</span>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="form-label">Total Course Fee (₹) *</label>
                <input type="number" required className="form-input font-bold text-brand-950" value={formData.fees_amount} onChange={e => handleFeeChange(e.target.value, formData.paid_amount)} />
              </div>
              <div>
                <label className="form-label">Initial Paid Amount (₹)</label>
                <input type="number" className="form-input font-bold text-emerald-700" value={formData.paid_amount} onChange={e => handleFeeChange(formData.fees_amount, e.target.value)} />
              </div>
              <div>
                <label className="form-label">Pending Balance (₹)</label>
                <input type="number" readOnly className="form-input font-bold text-red-600 bg-slate-100" value={formData.balance_amount} />
              </div>
              <div>
                <label className="form-label">Number of Installments</label>
                <input type="number" className="form-input" value={formData.num_installments} onChange={e => setFormData({...formData, num_installments: e.target.value})} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="form-label">Date of Birth</label>
              <input type="date" className="form-input" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
            </div>
            <div>
              <label className="form-label">Date of Joining *</label>
              <input type="date" required className="form-input" value={formData.doj} onChange={e => setFormData({...formData, doj: e.target.value})} />
            </div>
            <div>
              <label className="form-label">Blood Group</label>
              <select className="form-input" value={formData.blood_group} onChange={e => setFormData({...formData, blood_group: e.target.value})}>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
          </div>

          <div>
            <label className="form-label">Permanent Address *</label>
            <textarea required rows="2" className="form-input" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Complete residential address..." />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg">Cancel</button>
            <button type="submit" disabled={loading} className="px-5 py-2 bg-accent-600 hover:bg-accent-700 text-white text-xs font-bold rounded-lg">{loading ? 'Saving...' : 'Submit Admission'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
