import React, { useState, useEffect } from 'react';
import api from '../services/api';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';

export default function Feedback() {
  const [data, setData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchData = () => {
    api.get('/feedback')
      .then((res) => setData(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/feedback', formData);
      setModalOpen(false);
      setFormData({});
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
              { header: "ID", accessor: "id" },
              { header: "Created Date", accessor: "created_date_time" },
              { header: "Status", accessor: "status", render: (r) => <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800">{r.status || 'Active'}</span> },
            ];

  return (
    <div className="space-y-6">
      <DataTable
        title="Student Feedback"
        columns={columns}
        data={data}
        onAdd={() => { setFormData({}); setModalOpen(true); }}
        addLabel="Add New"
      />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add New Student Feedback">
        <form onSubmit={handleSubmit} className="space-y-4">
          
            <div><label className="form-label">Title / Description</label><input required className="form-input" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} /></div>
            
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-accent-600 hover:bg-accent-700 text-white text-xs font-bold rounded-lg"
            >
              {loading ? 'Saving...' : 'Save Record'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
