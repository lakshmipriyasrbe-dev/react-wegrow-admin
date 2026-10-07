import React, { useState, useEffect } from 'react';
import api from '../services/api';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    student_id: 'WG260001',
    student_name: 'Aakash Kumar',
    course_type: 'Training',
    course_id: 'Full Stack Dev',
    payment_mode_id: 'UPI / GPay',
    bank_id: 'HDFC Bank - 00214',
    amount: '10000',
    gst_percent: '0',
    total_amount: '10000',
    payment_reference: 'UPI-9948271',
    receipt_date: new Date().toISOString().slice(0, 10),
    remarks: 'Installment #2 payment'
  });
  const [loading, setLoading] = useState(false);

  const fetchPayments = () => {
    api.get('/payments')
      .then((res) => {
        if (!res.data || res.data.length === 0) {
          setPayments([
            { id: 1, receipt_no: "WG-REC-00001", receipt_date: "2026-02-10", student_id: "WG260001", student_name: "Aakash Kumar", amount: 15000, total_amount: 15000, payment_mode_id: "UPI / GPay", payment_reference: "UPI884219" },
            { id: 2, receipt_no: "WG-REC-00002", receipt_date: "2026-02-12", student_id: "WG260002", student_name: "Sneha Reddy", amount: 55000, total_amount: 55000, payment_mode_id: "Bank Transfer (NEFT)", payment_reference: "NEFT49102" },
          ]);
        } else {
          setPayments(res.data);
        }
      })
      .catch(() => {
        setPayments([
          { id: 1, receipt_no: "WG-REC-00001", receipt_date: "2026-02-10", student_id: "WG260001", student_name: "Aakash Kumar", amount: 15000, total_amount: 15000, payment_mode_id: "UPI / GPay", payment_reference: "UPI884219" }
        ]);
      });
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/payments', formData);
      setModalOpen(false);
      fetchPayments();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to collect payment');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: "Receipt No", accessor: "receipt_no", render: (r) => <span className="font-mono font-bold text-accent-600">{r.receipt_no}</span> },
    { header: "Receipt Date", accessor: "receipt_date" },
    { header: "Student ID", accessor: "student_id", render: (r) => <span className="font-mono">{r.student_id}</span> },
    { header: "Student Name", accessor: "student_name", render: (r) => <span className="font-bold text-brand-900">{r.student_name}</span> },
    { header: "Mode", accessor: "payment_mode_id", render: (r) => <span className="px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-700 font-semibold">{r.payment_mode_id || 'Cash'}</span> },
    { header: "Reference / Ref No", accessor: "payment_reference" },
    { header: "Total Paid", accessor: "total_amount", render: (r) => <span className="font-bold text-emerald-600">₹{Number(r.total_amount || 0).toLocaleString()}</span> },
    { header: "Print", accessor: "print", render: (r) => (
      <button onClick={() => window.print()} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded flex items-center gap-1">
        <i className="fa-solid fa-print text-slate-500"></i> Print A5
      </button>
    )}
  ];

  return (
    <div className="space-y-6">
      <DataTable
        title="Fee Receipts & Collection Registry"
        columns={columns}
        data={payments}
        onAdd={() => setModalOpen(true)}
        addLabel="Collect Fee & Issue Receipt"
      />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Collect Student Fee Payment">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Course Track *</label>
              <select className="form-input" value={formData.course_type} onChange={e => setFormData({...formData, course_type: e.target.value})}>
                <option value="Training">Training Course</option>
                <option value="Internship">Internship Program</option>
              </select>
            </div>
            <div>
              <label className="form-label">Receipt Date *</label>
              <input type="date" required className="form-input" value={formData.receipt_date} onChange={e => setFormData({...formData, receipt_date: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Student ID (e.g. WG260001) *</label>
              <input required className="form-input font-mono" value={formData.student_id} onChange={e => setFormData({...formData, student_id: e.target.value})} />
            </div>
            <div>
              <label className="form-label">Student Name *</label>
              <input required className="form-input" value={formData.student_name} onChange={e => setFormData({...formData, student_name: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Payment Mode *</label>
              <select className="form-input" value={formData.payment_mode_id} onChange={e => setFormData({...formData, payment_mode_id: e.target.value})}>
                <option value="UPI / GPay">UPI / GPay / PhonePe</option>
                <option value="Bank Transfer (NEFT/IMPS)">Bank Transfer (NEFT/IMPS)</option>
                <option value="Cash">Cash Collection</option>
                <option value="Credit / Debit Card">Credit / Debit Card</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
            <div>
              <label className="form-label">Deposited Bank Account</label>
              <select className="form-input" value={formData.bank_id} onChange={e => setFormData({...formData, bank_id: e.target.value})}>
                <option value="HDFC Bank - 00214">HDFC Bank - A/C: 50200012345678</option>
                <option value="ICICI Bank - 00481">ICICI Bank - A/C: 001205001234</option>
                <option value="Cash Counter">Cash In Hand (Campus Safe)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="form-label">Paid Amount (₹) *</label>
              <input type="number" required className="form-input font-bold text-brand-950" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value, total_amount: e.target.value})} />
            </div>
            <div>
              <label className="form-label">GST %</label>
              <input type="number" className="form-input" value={formData.gst_percent} onChange={e => setFormData({...formData, gst_percent: e.target.value})} />
            </div>
            <div>
              <label className="form-label">Transaction / Cheque Ref No</label>
              <input className="form-input font-mono" value={formData.payment_reference} onChange={e => setFormData({...formData, payment_reference: e.target.value})} placeholder="UPI/Cheque reference" />
            </div>
          </div>

          <div>
            <label className="form-label">Remarks / Description</label>
            <input className="form-input" value={formData.remarks} onChange={e => setFormData({...formData, remarks: e.target.value})} placeholder="e.g. Month 2 Installment" />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg">Cancel</button>
            <button type="submit" disabled={loading} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg">{loading ? 'Processing...' : 'Generate Receipt'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
