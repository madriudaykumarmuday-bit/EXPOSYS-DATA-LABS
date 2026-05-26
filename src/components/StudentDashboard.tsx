import { useState, FormEvent } from 'react';
import { CreditCard, BadgeCheck, FileText, Calendar, Bell, Download, RefreshCw, XCircle, HeartHandshake, FileCheck, Landmark, Award } from 'lucide-react';
import { User, InternshipApplication, Notification, StripeSubscription } from '../types';

interface StudentDashboardProps {
  currentUser: User;
  application: InternshipApplication | null;
  notifications: Notification[];
  onMarkNotificationRead: (id: string) => void;
  onClearNotifications: () => void;
  onUpdateSubscription: (updatedSub: StripeSubscription | null) => void;
  onUpdateAppStatus: (status: 'Pending' | 'Approved' | 'Rejected' | 'Completed') => void;
  onShowToast: (text: string, type: 'success' | 'error' | 'info') => void;
  onNavigate: (view: string) => void;
}

export default function StudentDashboard({
  currentUser,
  application,
  notifications,
  onMarkNotificationRead,
  onClearNotifications,
  onUpdateSubscription,
  onUpdateAppStatus,
  onShowToast,
  onNavigate
}: StudentDashboardProps) {
  // Local state for modals and card management
  const [showCertificate, setShowCertificate] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [newCardNumber, setNewCardNumber] = useState('4111 1111 1111 9900');
  const [newCardExpiry, setNewCardExpiry] = useState('09 / 30');
  const [newCardBrand, setNewCardBrand] = useState<'visa' | 'mastercard' | 'amex'>('visa');
  const [isUpdatingCard, setIsUpdatingCard] = useState(false);

  const myNotifications = notifications.filter(n => n.userId === currentUser.id);

  // Quick Stripe handlers
  const handleUpdateCardSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!application || !application.subscription) return;

    setIsUpdatingCard(true);

    setTimeout(() => {
      setIsUpdatingCard(false);
      setShowCardModal(false);

      const modifiedSub: StripeSubscription = {
        ...application.subscription,
        cardBrand: newCardBrand,
        cardLast4: newCardNumber.trim().substring(newCardNumber.trim().length - 4)
      };

      onUpdateSubscription(modifiedSub);
      onShowToast('Payment card updated on Stripe secure vault!', 'success');
    }, 1500);
  };

  const handleCancelSubscription = () => {
    if (!application || !application.subscription) return;

    const modifiedSub: StripeSubscription = {
      ...application.subscription,
      status: 'canceled'
    };

    onUpdateSubscription(modifiedSub);
    onShowToast('Recurring Stripe subscription paused. Benefits will end soon.', 'info');
  };

  const handleReactivateSubscription = () => {
    if (!application || !application.subscription) return;

    const modifiedSub: StripeSubscription = {
      ...application.subscription,
      status: 'active',
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };

    onUpdateSubscription(modifiedSub);
    onShowToast('Woohoo! Stripe subscription successfully reactivated.', 'success');
  };

  const handleUpgradeCycle = () => {
    if (!application || !application.subscription) return;

    const currentlyAnnual = application.subscription.interval === 'year';
    const modifiedSub: StripeSubscription = {
      ...application.subscription,
      interval: currentlyAnnual ? 'month' : 'year',
      amount: currentlyAnnual ? 999 : 9999,
      planName: currentlyAnnual ? 'Professional Research Track (Recurring)' : 'Premium Annual Research Track (Discounted)',
      currentPeriodEnd: new Date(Date.now() + (currentlyAnnual ? 30 : 365) * 24 * 60 * 60 * 1000).toISOString()
    };

    onUpdateSubscription(modifiedSub);
    onShowToast(
      currentlyAnnual 
        ? 'Switched back to Monthly Plan (₹999/mo charge).' 
        : 'Upgraded to Premium Annual Plan (₹9,999/yr charge)! You saved 15%.', 
      'success'
    );
  };

  const statusColors = {
    Pending: 'bg-amber-50 text-amber-700 border-amber-200',
    Approved: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    Rejected: 'bg-rose-50 text-rose-700 border-rose-220/40',
    Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-8 space-y-8 text-left">
      
      {/* Header Profile Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/50 pb-5">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Hi, {currentUser.name}! 👋
          </h2>
          <p className="text-slate-500 text-sm">
            Welcome to the Exposys Data Labs Candidate area. Manage your internship applications and Stripe subscriptions in real time.
          </p>
        </div>
        
        {application && (
          <div className="flex gap-2.5">
            <span className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${statusColors[application.status]}`}>
              Status: {application.status}
            </span>
            {application.status === 'Completed' ? (
              <button
                onClick={() => setShowCertificate(true)}
                className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-1.5 hover:scale-[1.01] transition-transform"
              >
                <Award className="w-4 h-4" />
                Intern Certificate
              </button>
            ) : application.status === 'Approved' ? (
              <button
                onClick={() => setShowCertificate(true)}
                className="px-4 py-1.5 bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-amber-600 transition-colors"
              >
                <Award className="w-4 h-4" />
                View Verification Draft
              </button>
            ) : null}
          </div>
        )}
      </div>

      {/* Main Grid: Left column dashboard stats & Stripe, Right columns Notification and overview */}
      {!application ? (
        <div className="glass-card rounded-3xl p-8 text-center border border-slate-200/50 max-w-2xl mx-auto space-y-6">
          <Landmark className="w-14 h-14 text-cyan-500 mx-auto" />
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-800">No active application file detected</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed">
              Your student profile exists, but you have not filed an internship form for the December cohort. Launch your application track on our Stripe gate!
            </p>
          </div>
          <button
            onClick={() => onNavigate('apply')}
            className="px-6 py-3.5 btn-gradient text-white rounded-2xl font-bold text-sm shadow-md"
          >
            Open Application Form & Pay Fee
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Block: Stripe Auto-Subscriptions Module (occupies 2 columns on lg) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Stripe Billing Box with custom indigo-purple gradient glow */}
            <div className="glass-card rounded-3xl p-6 sm:p-8 border-2 border-indigo-100 shadow-xl space-y-6 relative overflow-hidden bg-white/95 colorful-card-purple">
              <div className="blob w-[250px] h-[250px] bg-purple-300 top-[-50px] right-[-50px] opacity-30 blur-[100px] pointer-events-none"></div>
              
              <div className="flex justify-between items-start border-b border-indigo-100 pb-4 relative z-10">
                <div>
                  <span className="text-[10px] font-black text-purple-700 uppercase tracking-widest bg-purple-100/80 px-2.5 py-1 rounded-md shadow-sm">
                    Active Stripe Subscription
                  </span>
                  <h3 className="text-lg font-black text-slate-800 mt-2.5 tracking-tight">
                    {application.subscription?.planName || 'Professional Track Premium Plan'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5 font-bold">
                    Subscription ID: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-purple-600 font-mono text-[10px]">{application.subscription?.id || 'sub_stripe_mock'}</code>
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
                    ₹{application.subscription?.amount || 999}
                  </span>
                  <span className="block text-[9px] text-slate-400 uppercase font-black tracking-wider mt-1">
                    per {application.subscription?.interval === 'year' ? 'year' : 'month'}
                  </span>
                </div>
              </div>

              {/* Subscription Status details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
                <div className="p-4 bg-gradient-to-br from-purple-50/70 to-indigo-50/50 rounded-2xl border border-purple-100/55">
                  <span className="block text-[10px] uppercase tracking-wider font-extrabold text-purple-500">
                    Billing Status
                  </span>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className={`w-3 h-3 rounded-full ${
                      application.subscription?.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                    }`}></span>
                    <span className="text-xs font-black text-slate-700 capitalize">
                      {application.subscription?.status === 'active' ? 'Active Recurring' : 'Paused / Canceled'}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-cyan-50/60 to-blue-50/40 rounded-2xl border border-cyan-100/55">
                  <span className="block text-[10px] uppercase tracking-wider font-extrabold text-cyan-600">
                    Stripe Card on file
                  </span>
                  <div className="flex items-center gap-1.5 mt-1.5 text-slate-700 text-xs font-bold">
                    <span className="text-slate-400">••••</span>
                    <span className="font-mono">{application.subscription?.cardLast4 || '4242'}</span>
                    <span className="text-[9px] uppercase text-indigo-700 px-1.5 py-0.5 bg-indigo-50 rounded-md font-black shadow-sm animate-pulse">
                      {application.subscription?.cardBrand || 'visa'}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-amber-50/60 to-yellow-50/40 rounded-2xl border border-amber-100/55">
                  <span className="block text-[10px] uppercase tracking-wider font-extrabold text-amber-600">
                    Renewal Timestamp
                  </span>
                  <span className="block text-xs font-bold text-slate-700 mt-1.5">
                    {application.subscription?.status === 'active' 
                      ? new Date(application.subscription.currentPeriodEnd).toLocaleDateString()
                      : 'Suspended cycle'}
                  </span>
                </div>
              </div>

              {/* Subscription Action Controllers */}
              <div className="bg-gradient-to-r from-purple-50/50 to-indigo-50/40 p-4 rounded-2xl gap-3 flex flex-wrap items-center justify-between relative z-10 border border-purple-100/30">
                <div className="text-xs text-slate-500 font-bold">
                  {application.subscription?.status === 'active' ? (
                    <span className="text-purple-700">✓ Automated recurring invoice active via Stripe secure token.</span>
                  ) : (
                    <span className="text-rose-600 font-black">Stripe recurring charge is currently suspended.</span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={() => setShowCardModal(true)}
                    className="px-4 py-2 bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-indigo-400 text-slate-700 font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
                    Change Card
                  </button>

                  <button
                    onClick={handleUpgradeCycle}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    {application.subscription?.interval === 'year' ? 'Switch to Monthly (₹999)' : 'Upgrade to Annual (Save 15%)'}
                  </button>

                  {application.subscription?.status === 'active' ? (
                    <button
                      onClick={handleCancelSubscription}
                      className="px-4 py-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 font-black text-xs rounded-xl transition-all cursor-pointer"
                    >
                      Pause Subscription
                    </button>
                  ) : (
                    <button
                      onClick={handleReactivateSubscription}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer"
                    >
                      Restore Billing
                    </button>
                  )}
                </div>
              </div>

              {/* Simulated Invoices List */}
              <div className="space-y-3.5 pt-2">
                <span className="block text-xs font-black text-slate-400 uppercase tracking-widest">
                  Secure Recurring Invoice Logs
                </span>
                <div className="border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-sm">
                  <div className="p-3 bg-slate-50/70 flex justify-between text-[10px] text-slate-400 uppercase font-black">
                    <span>Invoice Timestamp / ID</span>
                    <span>Amount</span>
                    <span>Status</span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    <div className="p-3 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-extrabold text-slate-700">June 2026 Installment - #INV-001</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-semibold">Stripe Gateway (Visa card •••• {application.subscription?.cardLast4 || '4242'})</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-black text-purple-700">₹{application.subscription?.amount || 999}</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black shadow-sm">Paid</span>
                        <button 
                          onClick={() => onShowToast('Invoice PDF generated successfully! Starting download...', 'success')}
                          className="p-1 px-2 border hover:bg-slate-55 rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                          title="Download Invoice"
                        >
                          <Download className="w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Application Overview Summary card styled as colorful-card-cyan */}
            <div className="glass-card rounded-3xl p-6 border border-slate-200/50 space-y-4 colorful-card-cyan bg-white/95">
              <h3 className="text-base font-black text-slate-805 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-cyan-500" />
                Submitted Internship Profile details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-slate-650">
                <p><strong>Intern Domain:</strong> <span className="text-cyan-600 font-black">{application.internshipDomain}</span></p>
                <p><strong>Duration:</strong> <span className="text-indigo-600 font-bold">{application.internshipDuration}</span></p>
                <p><strong>College Name:</strong> {application.college}</p>
                <p><strong>Branch/Major:</strong> {application.branch}</p>
                <p><strong>E-Mail:</strong> {application.email}</p>
                <p><strong>Phone:</strong> {application.phone}</p>
                <p><strong>Location:</strong> {application.location}</p>
                <p><strong>Uploaded File / CV:</strong> <code className="bg-slate-100 text-slate-700 px-1 rounded truncate">{application.resumeUrl || 'resume.pdf'}</code></p>
              </div>
            </div>
          </div>

          {/* Right Block: Status summary / Notifications */}
          <div className="space-y-6">
            
            {/* Short Student Notification stream */}
            <div className="glass-card rounded-3xl p-6 border border-slate-200/50 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-150 pb-3">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-slate-400" />
                  <h3 className="text-sm font-bold text-slate-800 text-left">Notification Area</h3>
                </div>
                {myNotifications.length > 0 && (
                  <button
                    onClick={onClearNotifications}
                    className="text-[10px] font-bold text-rose-500 hover:text-rose-600"
                  >
                    Reset Inbox
                  </button>
                )}
              </div>

              {myNotifications.length === 0 ? (
                <p className="text-slate-400 text-xs py-4 text-center">No alerts in your dashboard yet.</p>
              ) : (
                <div className="space-y-3.5 text-left max-h-[300px] overflow-y-auto custom-scrollbar">
                  {myNotifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      className={`p-3.5 rounded-2xl border text-xs relative ${
                        notif.type === 'success' 
                          ? 'bg-emerald-50/50 border-emerald-100 text-emerald-900' 
                          : 'bg-cyan-50/60 border-cyan-100 text-cyan-900'
                      }`}
                    >
                      <p className="font-bold pr-4">{notif.title}</p>
                      <p className="text-slate-500 mt-1 leading-relaxed text-[11px]">{notif.message}</p>
                      <button
                        onClick={() => onMarkNotificationRead(notif.id)}
                        className="absolute top-2.5 right-2 text-slate-400 hover:text-slate-600"
                        title="Dismiss"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick help banner */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-6 text-white text-left space-y-4 shadow-xl">
              <Landmark className="w-8 h-8 text-cyan-400" />
              <div className="space-y-1">
                <h4 className="font-bold text-sm">Need Help or Support?</h4>
                <p className="text-[11px] text-indigo-200 leading-relaxed">
                  Feel free to contact the Exposys Labs registrar via <strong className="text-cyan-400">hr@exposysdata.com</strong> or phone helpline at +91 7795207065.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Credit Card Modal Updater */}
      {showCardModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full border border-slate-100 shadow-2xl space-y-6 text-left transform scale-100 transition-all">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Change Stripe Billing Card</h3>
              <p className="text-slate-400 text-xs mt-0.5">Vault details update automatically</p>
            </div>

            <form onSubmit={handleUpdateCardSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Select Card Type
                </label>
                <div className="flex gap-2.5 select-none">
                  {(['visa', 'mastercard', 'amex'] as const).map((brand) => (
                    <button
                      key={brand}
                      type="button"
                      onClick={() => setNewCardBrand(brand)}
                      className={`flex-1 py-1 px-3 border rounded-xl text-xs font-black uppercase transition-all ${
                        newCardBrand === brand 
                          ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50' 
                          : 'border-slate-200 text-slate-400 hover:bg-slate-50'
                      }`}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  16-Digit Card Number
                </label>
                <input
                  type="text"
                  required
                  value={newCardNumber}
                  onChange={(e) => setNewCardNumber(e.target.value)}
                  className="w-full h-11 px-3 border border-slate-200 focus:outline-none focus:border-cyan-500 rounded-xl text-sm font-semibold tracking-wider text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Expiry Year
                  </label>
                  <input
                    type="text"
                    required
                    value={newCardExpiry}
                    onChange={(e) => setNewCardExpiry(e.target.value)}
                    className="w-full h-11 px-3 border border-slate-200 focus:outline-none focus:border-cyan-500 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Security Key (CVC)
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="***"
                    maxLength={4}
                    className="w-full h-11 px-3 border border-slate-200 focus:outline-none focus:border-cyan-500 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3.5 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCardModal(false)}
                  className="px-4 py-2 text-slate-400 font-semibold hover:text-slate-600 transition-all text-xs"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingCard}
                  className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  {isUpdatingCard ? 'Contacting Stripe...' : 'Update Card'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Gold Standard Internship Certificate view modal */}
      {showCertificate && application && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-10 max-w-3xl w-full border border-slate-100 shadow-2xl relative space-y-8 text-center my-8">
            {/* Background elements for certificate style */}
            <div className="absolute top-0 inset-x-0 h-4 bg-gradient-to-r from-cyan-500 via-indigo-500 to-amber-500 rounded-t-3xl"></div>
            
            <button
              onClick={() => setShowCertificate(false)}
              className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-600 transition-colors"
            >
              <XCircle className="w-5 h-5" />
            </button>

            {/* Certificate Header */}
            <div className="space-y-2 pt-4">
              <span className="text-[10px] font-black text-amber-600 tracking-widest uppercase block bg-amber-50/65 py-1 px-3 rounded-full max-w-max mx-auto border border-amber-100">
                EXPOSYS DATA PORTAL CREDENTIAL
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-slate-800">
                Certificate of Internship Completion
              </h2>
            </div>

            <p className="text-slate-400 text-xs italic">
              Verification Code: <code className="bg-slate-50 font-mono text-slate-600 px-1 py-0.5 rounded text-[10px]">EDL-DEC26-{application.id.toUpperCase()}</code>
            </p>

            {/* Certificate body template */}
            <div className="my-8 max-w-xl mx-auto space-y-4 border-y border-slate-100 py-6 text-sm text-slate-600 font-medium leading-relaxed leading-7">
              <p>This document hereby certifies, that the student candidate</p>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 border-b border-dashed border-slate-200 pb-1 max-w-md mx-auto">
                {application.name}
              </h3>
              <p>
                From <strong className="text-slate-800">{application.college}</strong> has effectively completed a comprehensive engineering practice in the target domain of 
              </p>
              <h4 className="text-lg font-bold text-cyan-600">
                {application.internshipDomain} ({application.internshipDuration})
              </h4>
              <p className="text-xs text-slate-400">
                Authorized with secure Stripe verification code <strong className="text-slate-600">{application.paymentId || 'MOCK_TOKEN'}</strong> on 
                {new Date(application.createdAt).toLocaleDateString()}.
              </p>
            </div>

            {/* Verification Signatures block */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-4 max-w-lg mx-auto">
              <div className="text-center font-bold">
                <p className="font-serif italic text-slate-700 text-sm">Y. R. Reddy</p>
                <div className="h-[1px] w-28 bg-slate-200 my-1 mx-auto"></div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold">Principal Director</p>
              </div>

              {/* Gold Digital Verification Seal */}
              <div className="w-14 h-14 bg-amber-50 rounded-full border border-amber-200/55 flex items-center justify-center text-amber-500 shadow-md">
                <BadgeCheck className="w-8 h-8" />
              </div>

              <div className="text-center font-bold">
                <p className="font-serif italic text-slate-700 text-sm">Onboarding Operations</p>
                <div className="h-[1px] w-28 bg-slate-200 my-1 mx-auto"></div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold">Verification Team</p>
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => onShowToast('Initiating printer stream...', 'info')}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
              <button
                onClick={() => setShowCertificate(false)}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl text-xs font-black shadow-lg"
              >
                Done / Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
