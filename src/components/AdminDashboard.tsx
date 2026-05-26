import { useState, useMemo } from 'react';
import { Search, Filter, ShieldCheck, Download, Trash2, Eye, Award, CheckCircle2, XCircle, BarChart3, TrendingUp, DollarSign } from 'lucide-react';
import { User, InternshipApplication, AdminLog } from '../types';

interface AdminDashboardProps {
  currentUser: User;
  applications: InternshipApplication[];
  logs: AdminLog[];
  onApproveApplication: (id: string, name: string) => void;
  onRejectApplication: (id: string, name: string) => void;
  onMarkCompleted: (id: string, name: string) => void;
  onDeleteApplication: (id: string) => void;
  onShowToast: (text: string, type: 'success' | 'error' | 'info') => void;
}

export default function AdminDashboard({
  currentUser,
  applications,
  logs,
  onApproveApplication,
  onRejectApplication,
  onMarkCompleted,
  onDeleteApplication,
  onShowToast
}: AdminDashboardProps) {
  // Filter settings
  const [searchTerm, setSearchTerm] = useState('');
  const [domainFilter, setDomainFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedApp, setSelectedApp] = useState<InternshipApplication | null>(null);

  const domainsList = [
    'All',
    'Software Development',
    'Frontend Development',
    'Backend Development',
    'Full Stack Development',
    'Data Science',
    'Artificial Intelligence',
    'Machine Learning',
    'Cyber Security',
    'Cloud Computing',
    'UI/UX Design'
  ];

  // Derive dynamic analytics
  const stats = useMemo(() => {
    const total = applications.length;
    const pending = applications.filter(a => a.status === 'Pending').length;
    const approved = applications.filter(a => a.status === 'Approved').length;
    const completed = applications.filter(a => a.status === 'Completed').length;
    
    // Revenue from Stripe (Each approved/completed app represents ₹999 Stripe sub charge)
    const totalStripeRevenue = (approved + completed) * 999;

    return { total, pending, approved, completed, totalStripeRevenue };
  }, [applications]);

  // Handle lists filtering
  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      const matchSearch =
        app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.college.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchDomain = domainFilter === 'All' || app.internshipDomain === domainFilter;
      const matchStatus = statusFilter === 'All' || app.status === statusFilter;

      return matchSearch && matchDomain && matchStatus;
    });
  }, [applications, searchTerm, domainFilter, statusFilter]);

  // Export CSV handler
  const handleExportCSV = () => {
    if (filteredApps.length === 0) {
      onShowToast('No application files exist to export.', 'error');
      return;
    }

    const headers = 'ID,Name,Email,College,Domain,Duration,Status,StripeID,CreatedTime\n';
    const rows = filteredApps.map(app => 
      `"${app.id}","${app.name}","${app.email}","${app.college}","${app.internshipDomain}","${app.internshipDuration}","${app.status}","${app.paymentId || 'N/A'}","${app.createdAt}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `exposys_registrations_${Date.now()}.csv`);
    a.click();
    onShowToast(`Dispatched ${filteredApps.length} student application formats via CSV sheet!`, 'success');
  };

  const statusTags = {
    Pending: 'bg-amber-50 text-amber-700 border-amber-200',
    Approved: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    Rejected: 'bg-rose-50 text-rose-700 border-rose-220/40',
    Completed: 'bg-emerald-50 text-emerald-700 border-emerald-150',
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-8 space-y-8 text-left">
      
      {/* Coordinator Dashboard Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/50 pb-5">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-cyan-500" />
            Exposys Administrator Console
          </h2>
          <p className="text-slate-500 text-sm">
            Overview student enrollments, perform system analytics, and audit real-time Stripe automated subscriptions.
          </p>
        </div>
        
        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 shrink-0"
        >
          <Download className="w-4 h-4" />
          Export CSV Records
        </button>
      </div>

      {/* Stats Counter Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="glass-card rounded-2xl p-5 border border-white/60 shadow-md">
          <span className="text-[10px] font-black uppercase text-slate-400">Total Applicants</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-black text-slate-800">{stats.total}</span>
            <span className="text-xs text-slate-500 font-bold">files</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-white/60 shadow-md">
          <span className="text-[10px] font-black uppercase text-amber-500">Pending Review</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-black text-amber-600">{stats.pending}</span>
            <span className="text-xs text-amber-500 font-bold">actions</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-white/60 shadow-md">
          <span className="text-[10px] font-black uppercase text-indigo-500 font-medium">Active Interns</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-black text-indigo-600">{stats.approved}</span>
            <span className="text-xs text-indigo-500 font-bold">subs active</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-cyan-500/10 shadow-lg" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.7), rgba(224,242,254,0.3))' }}>
          <span className="text-[10px] font-black uppercase text-cyan-700 flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5" />
            Stripe Revenue
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl sm:text-3xl font-black text-cyan-800">₹{stats.totalStripeRevenue}</span>
            <span className="text-[9px] text-cyan-600 font-black uppercase tracking-wider">INR</span>
          </div>
        </div>
      </div>

      {/* Grid: 2 Columns - Table Filters list & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Table & Filtering: occuping 2 column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-3xl p-6 border border-slate-200/50 space-y-4">
            
            {/* Realtime Filters block search */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  placeholder="Search students, college university, or emails..."
                  className="w-full h-11 pl-9 pr-4 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-cyan-500 text-slate-700 transition"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <select
                  value={domainFilter}
                  onChange={(e) => setDomainFilter(e.target.value)}
                  className="h-11 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-500 focus:outline-none cursor-pointer"
                >
                  {domainsList.map(dom => (
                    <option key={dom} value={dom}>{dom === 'All' ? 'All Domains' : dom}</option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-11 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-500 focus:outline-none cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            {/* Application Data Table list */}
            <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white">
              <table className="w-full text-left border-collapse text-xs select-none">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-100 text-[10px] text-slate-400 font-black uppercase">
                    <th className="p-4">Candidate & Track</th>
                    <th className="p-4">College</th>
                    <th className="p-4">Stripe Bill ID</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                  {filteredApps.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        No applications matched the specified filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredApps.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="p-4">
                          <p className="font-bold text-slate-800">{app.name}</p>
                          <p className="text-[10px] text-cyan-600 font-semibold">{app.internshipDomain} • {app.internshipDuration}</p>
                        </td>
                        <td className="p-4 font-normal text-slate-500 truncate max-w-[140px]" title={app.college}>
                          {app.college}
                        </td>
                        <td className="p-4 font-mono text-[9px] text-slate-400">
                          {app.paymentId ? app.paymentId.substring(0, 14) + '...' : 'Missing'}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${statusTags[app.status]}`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="p-4 text-right flex justify-end gap-1.5 pt-4">
                          <button
                            onClick={() => setSelectedApp(app)}
                            className="p-1 px-2 border hover:bg-slate-50 text-slate-400 hover:text-slate-700 rounded-lg transition-all"
                            title="Inspect application file"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right column: SVG Program Distribution and Admin Audit Logs */}
        <div className="space-y-6">
          
          {/* Reactive program Distribution chart using beautiful responsive pure SVG */}
          <div className="glass-card rounded-3xl p-6 border border-slate-200/50 space-y-4 text-left">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-cyan-500" />
              Domain distribution metrics
            </h3>

            <div className="space-y-4 pt-2">
              {[
                { name: 'Data Science', color: 'bg-gradient-to-r from-pink-500 to-fuchsia-600', text: 'text-pink-650' },
                { name: 'Artificial Intelligence', color: 'bg-gradient-to-r from-violet-500 to-purple-650', text: 'text-violet-650' },
                { name: 'Software Development', color: 'bg-gradient-to-r from-cyan-500 to-blue-600', text: 'text-cyan-705' },
                { name: 'UI/UX Design', color: 'bg-gradient-to-r from-amber-500 to-orange-600', text: 'text-amber-705' }
              ].map((domainItem) => {
                const count = applications.filter(a => a.internshipDomain === domainItem.name).length;
                const totalCount = applications.length || 1;
                const percentage = Math.round((count / totalCount) * 100);

                return (
                  <div key={domainItem.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${domainItem.color}`}></span>
                        {domainItem.name}
                      </span>
                      <span className="text-slate-400">{count} of {totalCount} ({percentage}%)</span>
                    </div>
                    {/* Responsive progress bar with corresponding colorful color map */}
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                      <div 
                        className={`h-full ${domainItem.color} rounded-full transition-all duration-500`} 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Core Coordinator Audit logs */}
          <div className="glass-card rounded-3xl p-6 border border-slate-200/50 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-150 pb-2.5">
              <h3 className="text-sm font-bold text-slate-800">Live Operation Stream</h3>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>

            <div className="space-y-3 max-h-[220px] overflow-y-auto custom-scrollbar text-left text-[11px] font-medium leading-relaxed">
              {logs.length === 0 ? (
                <p className="text-slate-400 text-xs py-4 text-center">No system events logged today.</p>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="p-2 bg-slate-50 rounded-xl space-y-1">
                    <p className="text-[10px] text-slate-400">{new Date(log.createdAt).toLocaleTimeString()}</p>
                    <p className="text-slate-700">
                      <strong className="text-indigo-600">{log.action}:</strong> {log.targetUser}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Inspect application file details viewer Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-slate-100 shadow-2xl space-y-6 text-left transform scale-100 transition-all">
            
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded-md">
                  Applicant Detail Profile File
                </span>
                <h3 className="text-lg font-bold text-slate-800 mt-1">{selectedApp.name}</h3>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-slate-400 hover:text-slate-600 p-1 bg-slate-50 hover:bg-slate-100 rounded-lg text-xs"
              >
                ✕ Close
              </button>
            </div>

            {/* Profile Content grids */}
            <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-600 leading-relaxed overflow-y-auto max-h-[350px] custom-scrollbar p-1">
              <p><strong>E-Mail Address:</strong> {selectedApp.email}</p>
              <p><strong>Phone Number:</strong> {selectedApp.phone}</p>
              <p><strong>Selected college:</strong> {selectedApp.college}</p>
              <p><strong>Branch / Major:</strong> {selectedApp.branch}</p>
              <p><strong>Current location:</strong> {selectedApp.location}</p>
              <p><strong>Selected Target Domain:</strong> <strong className="text-cyan-600">{selectedApp.internshipDomain}</strong></p>
              <p><strong>Duration requested:</strong> {selectedApp.internshipDuration}</p>
              <p><strong>10th Matriculation %:</strong> {selectedApp.tenthPercentage}%</p>
              <p><strong>12th Matriculation %:</strong> {selectedApp.twelfthPercentage}%</p>
              <p><strong>Undergrad GPA/Degree:</strong> {selectedApp.ug}</p>
              <p className="col-span-2"><strong>Postgraduate stats:</strong> {selectedApp.pg || 'N/A'}</p>
              <p className="col-span-2"><strong>Key skills tags:</strong> {selectedApp.skills || 'N/A'}</p>
              <p className="col-span-2"><strong>Why Hire Statement:</strong> <span className="block italic text-slate-500 font-normal mt-1 bg-slate-50 p-3 rounded-xl">{selectedApp.whyHire || 'None specified'}</span></p>
              <p><strong>Stripe Payment token:</strong> <code className="bg-slate-50 font-mono text-[10px] text-slate-500">{selectedApp.paymentId || 'MOCK'}</code></p>
              <p><strong>Active Stripe Status:</strong> <code className="bg-emerald-50 text-slate-500 font-mono text-[10px] px-1 rounded">active</code></p>
            </div>

            {/* Decision Actions Bottom Buttons container */}
            <div className="pt-4 border-t border-slate-100 flex justify-between items-center gap-2">
              <button
                onClick={() => {
                  onDeleteApplication(selectedApp.id);
                  setSelectedApp(null);
                }}
                className="px-3 py-2 text-rose-600 hover:bg-rose-50 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                title="Remove permanent applicant rows"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Discard File
              </button>

              <div className="flex gap-2.5">
                {selectedApp.status === 'Pending' && (
                  <>
                    <button
                      onClick={() => {
                        onRejectApplication(selectedApp.id, selectedApp.name);
                        setSelectedApp(null);
                      }}
                      className="px-4 py-2 border border-rose-200 hover:bg-rose-50 text-rose-700 font-bold text-xs rounded-xl transition-all"
                    >
                      Reject application
                    </button>

                    <button
                      onClick={() => {
                        onApproveApplication(selectedApp.id, selectedApp.name);
                        setSelectedApp(null);
                      }}
                      className="px-5 py-2.5 bg-indigo-65 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-md"
                    >
                      Approve & Onboard
                    </button>
                  </>
                )}

                {selectedApp.status === 'Approved' && (
                  <button
                    onClick={() => {
                      onMarkCompleted(selectedApp.id, selectedApp.name);
                      setSelectedApp(null);
                    }}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5"
                  >
                    <Award className="w-4 h-4" />
                    Issue Gold Certification
                  </button>
                )}

                {selectedApp.status === 'Completed' && (
                  <p className="text-xs text-emerald-600 font-bold flex items-center gap-1 px-3 py-1 bg-emerald-50/70 border border-emerald-100 rounded-lg">
                    <CheckCircle2 className="w-4 h-4" />
                    Passed Completion Criteria
                  </p>
                )}

                {selectedApp.status === 'Rejected' && (
                  <p className="text-xs text-rose-600 font-bold flex items-center gap-1 px-3 py-1 bg-rose-50 border border-rose-105 rounded-lg">
                    <XCircle className="w-4 h-4" />
                    File Rejected
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
