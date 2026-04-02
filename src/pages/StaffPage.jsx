import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { staffAPI } from '../hooks/useApi';
import {
  Users, UserPlus, Trash2, X,
  Eye, EyeOff, Loader2, CheckCircle, AlertCircle, RefreshCw,
} from 'lucide-react';

/*  Add Staff Modal  */
function AddStaffModal({ onClose, onAdded }) {
  const [step,            setStep]            = useState(1);
  const [username,        setUsername]        = useState('');
  const [fullName,        setFullName]        = useState('');
  const [email,           setEmail]           = useState('');
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass,        setShowPass]        = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);
  const [saving,          setSaving]          = useState(false);
  const [err,             setErr]             = useState('');

  const inputCls = "w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all";
  const labelCls = "block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-tight";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim())             { setErr('Username is required.'); return; }
    if (!fullName.trim())             { setErr('Full name is required.'); return; }
    if (!email.trim())                { setErr('Email is required.'); return; }
    if (password.length < 6)          { setErr('Password must be at least 6 characters.'); return; }
    if (password !== confirmPassword) { setErr('Passwords do not match.'); return; }

    setSaving(true); setErr('');
    try {
      await staffAPI.add({
        username:  username.trim(),
        fullName:  fullName.trim(),
        email:     email.trim(),
        password,
      });
      setStep(2);
      onAdded();
    } catch (err) {
      const d = err.response?.data;
      setErr(typeof d === 'string' ? d : d?.message || 'Failed to add staff. Please try again.');
    } finally { setSaving(false); }
  };

  const resetForm = () => {
    setUsername(''); setFullName(''); setEmail('');
    setPassword(''); setConfirmPassword(''); setErr(''); setStep(1);
  };

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-100 flex items-center justify-center">
              <UserPlus size={15} className="text-teal-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">
              {step === 1 ? 'Add Staff Member' : 'Staff Added!'}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400"><X size={18} /></button>
        </div>

        <div className="p-6">
          {err && (
            <div className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 rounded-xl px-4 py-3 text-sm font-medium mb-4">
              <AlertCircle size={15} className="flex-shrink-0" />{err}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-slate-500">Staff members can log in and help manage your store.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Username</label>
                  <input className={inputCls} value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="e.g. staff_john" required autoFocus />
                </div>
                <div>
                  <label className={labelCls}>Full Name</label>
                  <input className={inputCls} value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="e.g. John Doe" required />
                </div>
              </div>

              <div>
                <label className={labelCls}>Email</label>
                <input className={inputCls} type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. john@example.com" required />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Password</label>
                  <div className="relative">
                    <input className={inputCls + " pr-11"} type={showPass ? 'text' : 'password'}
                      value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="Min. 6 chars" required />
                    <button type="button" onClick={() => setShowPass(s => !s)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Confirm Password</label>
                  <div className="relative">
                    <input className={inputCls + " pr-11"} type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password" required />
                    <button type="button" onClick={() => setShowConfirm(s => !s)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-red-500 mt-1.5 ml-1">Passwords do not match.</p>
                  )}
                  {confirmPassword && password === confirmPassword && password.length >= 6 && (
                    <p className="text-xs text-teal-600 mt-1.5 ml-1 flex items-center gap-1">
                      <CheckCircle size={11} />Passwords match.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose}
                  className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-sm font-semibold text-white transition-colors disabled:opacity-70 flex items-center justify-center gap-2">
                  {saving ? <><Loader2 size={15} className="animate-spin" />Adding…</> : 'Add Staff'}
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-teal-600" />
              </div>
              <h4 className="text-lg font-bold text-slate-800 mb-1">Staff Member Added!</h4>
              <p className="text-sm text-slate-500 mb-1">
                <span className="font-semibold text-slate-700">{fullName}</span> has been added successfully.
              </p>
              <p className="text-xs text-slate-400 mb-6">
                Login username:{' '}
                <span className="font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-lg">{username}</span>
              </p>
              <div className="flex gap-3">
                <button onClick={resetForm}
                  className="flex-1 py-3 rounded-xl border-2 border-teal-200 text-sm font-semibold text-teal-600 hover:bg-teal-50 transition-colors">
                  Add Another
                </button>
                <button onClick={onClose}
                  className="flex-1 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-sm font-semibold text-white transition-colors">
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/*  Delete Confirm  */
function DeleteConfirmModal({ staff, onConfirm, onCancel, deleting }) {
  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
          <Trash2 size={24} className="text-red-500" />
        </div>
        <h4 className="text-lg font-bold text-slate-800 text-center mb-1">Remove Staff Member?</h4>
        <p className="text-sm text-slate-500 text-center mb-6">
          Are you sure you want to remove{' '}
          <span className="font-semibold text-slate-700">{staff.fullName}</span>?
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} disabled={deleting}
            className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={deleting}
            className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-sm font-semibold text-white transition-colors disabled:opacity-70 flex items-center justify-center gap-2">
            {deleting ? <><Loader2 size={14} className="animate-spin" />Removing…</> : 'Yes, Remove'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* Staff Card  */
function StaffCard({ staff, onDelete }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-base flex-shrink-0 shadow-sm">
            {staff.fullName?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate">{staff.fullName}</p>
            <p className="text-xs text-slate-400 truncate">{staff.email}</p>
          </div>
        </div>
        <button onClick={() => onDelete(staff)}
          className="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
          title="Remove staff">
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}

/*  Staff Page  */
export default function StaffPage() {
  const { token, loading: authLoading } = useAuth();
  const [staffList,    setStaffList]    = useState([]);
  const [fetching,     setFetching]     = useState(true);
  const [error,        setError]        = useState('');
  const [showAdd,      setShowAdd]      = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting,     setDeleting]     = useState(false);
  const [deleteErr,    setDeleteErr]    = useState('');

  const fetchStaff = useCallback(async () => {
    setFetching(true); setError('');
    try {
      const res = await staffAPI.getAll();
      setStaffList(res.data || []);
    } catch {
      setError('Failed to load staff members.');
    } finally { setFetching(false); }
  }, []);

  useEffect(() => {
    if (!authLoading && token) fetchStaff();
  }, [authLoading, token, fetchStaff]);

  const handleDeleteConfirm = async () => {
    setDeleting(true); setDeleteErr('');
    try {
      await staffAPI.delete(deleteTarget.id);
      setDeleteTarget(null);
      fetchStaff();
    } catch (err) {
      const d = err.response?.data;
      setDeleteErr(typeof d === 'string' ? d : d?.message || 'Failed to remove staff.');
      setDeleting(false);
    }
  };

  return (
    <div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-teal-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-teal-200">
            <Users size={22} className="text-white" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-800">Staff Members</h3>
            <p className="text-sm text-slate-500 mt-0.5">
              {fetching ? 'Loading…' : staffList.length === 0 ? 'No staff members yet' : `${staffList.length} staff member${staffList.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button onClick={fetchStaff} disabled={fetching}
            className="flex items-center gap-2 text-sm font-semibold text-teal-600 border-2 border-teal-200 hover:border-teal-400 bg-teal-50 hover:bg-teal-100 px-4 py-2.5 rounded-xl transition-all disabled:opacity-50">
            <RefreshCw size={15} className={fetching ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95">
            <UserPlus size={16} />
            Add Staff
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl px-5 py-3.5 mb-5 text-base font-medium bg-red-50 text-red-800 border border-red-200">
          <AlertCircle size={18} className="text-red-500 flex-shrink-0" />{error}
        </div>
      )}
      {deleteErr && (
        <div className="flex items-center gap-3 rounded-2xl px-5 py-3.5 mb-5 text-base font-medium bg-red-50 text-red-800 border border-red-200">
          <AlertCircle size={18} className="text-red-500 flex-shrink-0" />{deleteErr}
        </div>
      )}

      {fetching ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-teal-600" />
        </div>
      ) : staffList.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-slate-200">
          <div className="w-20 h-20 rounded-3xl bg-teal-50 flex items-center justify-center mx-auto mb-5">
            <Users size={36} className="text-teal-400" />
          </div>
          <h4 className="text-lg font-bold text-slate-700 mb-2">No staff members yet</h4>
          <p className="text-sm text-slate-400 mb-8 max-w-xs mx-auto">
            Add staff members to let them log in and help manage your store.
          </p>
          <button onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 px-6 py-3 rounded-xl transition-all shadow-sm active:scale-95">
            <UserPlus size={16} />
            Add First Staff Member
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {staffList.map(staff => (
            <StaffCard key={staff.id} staff={staff} onDelete={setDeleteTarget} />
          ))}
        </div>
      )}

      {showAdd && (
        <AddStaffModal
          onClose={() => setShowAdd(false)}
          onAdded={() => { setShowAdd(false); fetchStaff(); }}
        />
      )}
      {deleteTarget && (
        <DeleteConfirmModal
          staff={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => { setDeleteTarget(null); setDeleteErr(''); }}
          deleting={deleting}
        />
      )}
    </div>
  );
}