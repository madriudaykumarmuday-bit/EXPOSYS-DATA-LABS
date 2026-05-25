import { useState, ChangeEvent, FormEvent } from 'react';
import { CreditCard, BadgeCheck, FileCheck, Check, ShieldCheck, X, Sparkles, HelpCircle } from 'lucide-react';
import { User, InternshipApplication, StripeSubscription } from '../types';

interface ApplicationFormProps {
  currentUser: User | null;
  onSubmitApplication: (applicationData: Partial<InternshipApplication>) => void;
  onNavigate: (view: string) => void;
  onOpenLogin: () => void;
}

const DOMAINS = [
  'Software Development',
  'Web Development',
  'App Development',
  'Data Science',
  'Machine Learning',
  'Artificial Intelligence',
  'Cyber Security',
  'Cloud Computing',
  'UI/UX Design',
  'Content Writing',
  'Digital Marketing'
];

const DURATIONS = ['1W', '2W', '1M', '2M', '3M', '6M'];

export default function ApplicationForm({ currentUser, onSubmitApplication, onNavigate, onOpenLogin }: ApplicationFormProps) {
  // Application form data mapped to exact screenshot representation
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    branch: '',
    email: currentUser?.email || '',
    college: '',
    phone: '',
    tenthPercentage: '',
    twelfthPercentage: '',
    ug: '',
    pg: '',
    location: '',
    internshipDomain: 'Software Development',
    internshipDuration: '1W',
    paymentId: ''
  });

  // Modal control & Credit card input states
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardExpiry, setCardExpiry] = useState('12 / 29');
  const [cardCvc, setCardCvc] = useState('123');
  
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [paymentSuccessMessage, setPaymentSuccessMessage] = useState('');

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setFormData({
      name: currentUser?.name || '',
      branch: '',
      email: currentUser?.email || '',
      college: '',
      phone: '',
      tenthPercentage: '',
      twelfthPercentage: '',
      ug: '',
      pg: '',
      location: '',
      internshipDomain: 'Software Development',
      internshipDuration: '1W',
      paymentId: ''
    });
    setFormError('');
    setPaymentSuccessMessage('');
  };

  const handleSimulatePayment = (e: FormEvent) => {
    e.preventDefault();
    setIsProcessingPayment(true);

    setTimeout(() => {
      setIsProcessingPayment(false);
      const randomPaymentId = `pay_EDL_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      setFormData(prev => ({ ...prev, paymentId: randomPaymentId }));
      setPaymentSuccessMessage(`Payment Successful! Rs. 999 received securely. ID loaded.`);
      setShowStripeModal(false);
    }, 1500);
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Field-level mandatory validations as visually outlined in screenshot with '*'
    if (!formData.name.trim()) return setFormError('Name is required.');
    if (!formData.branch.trim()) return setFormError('Branch is required.');
    if (!formData.email.trim()) return setFormError('Email is required.');
    if (!formData.college.trim()) return setFormError('College is required.');
    if (!formData.phone.trim()) return setFormError('Phone is required.');
    if (!formData.tenthPercentage.trim()) return setFormError('10th Percentage is required.');
    if (!formData.twelfthPercentage.trim()) return setFormError('12th Percentage is required.');
    if (!formData.ug.trim()) return setFormError('UG is required.');
    if (!formData.location.trim()) return setFormError('Location is required.');
    if (!formData.internshipDomain) return setFormError('Internship Core Domain is required.');
    if (!formData.internshipDuration) return setFormError('Internship Period is required.');
    if (!formData.paymentId.trim()) {
      return setFormError('Registration Payment Id is mandatory. Click the link above to generate or process Rs. 999/-.');
    }

    setIsSubmitting(true);

    // Simulate database record queuing
    setTimeout(() => {
      setIsSubmitting(false);

      const mockSubscription: StripeSubscription = {
        id: `sub_exposys_${Math.random().toString(36).substr(2, 8)}`,
        status: 'active',
        planName: `${formData.internshipDomain} - ${formData.internshipDuration} Slot`,
        amount: 999,
        currency: 'INR',
        interval: 'one-time',
        currentPeriodEnd: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        cardBrand: 'visa',
        cardLast4: cardNumber.replace(/\s/g, '').slice(-4) || '4242',
        createdAt: new Date().toISOString()
      };

      onSubmitApplication({
        ...formData,
        subscription: mockSubscription
      });
    }, 1200);
  };

  return (
    <div className="w-full bg-[#f8fafc] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Quick Navigation Alert Banner */}
        <div className="mb-8 flex flex-col sm:flex-row items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm gap-4">
          <div className="text-left">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Onboarding Channel
            </h2>
            <p className="text-slate-500 text-xs mt-0.5">
              Fill the exact verified details requested below to request live placement keys.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('landing')}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-750 text-xs font-bold rounded-xl transition duration-150 shrink-0"
          >
            ← Back to Front Door
          </button>
        </div>

        {/* Detailed Application Container */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-6 sm:p-10 text-left">
          
          <form onSubmit={handleFormSubmit} className="space-y-6">
            
            {/* Visual Error Logs */}
            {formError && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-xs font-bold transition duration-150">
                ⚠️ {formError}
              </div>
            )}

            {/* Quick success message indicating Payment populated */}
            {paymentSuccessMessage && (
              <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 transition duration-150">
                <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{paymentSuccessMessage}</span>
              </div>
            )}

            {/* Field Grid representing the screenshot */}
            <div className="space-y-5">
              
              {/* Name field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center">
                  Name <span className="text-red-500 ml-1 font-bold">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full h-11 px-4 rounded-lg bg-white border border-slate-300 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm text-slate-800 transition-colors"
                  placeholder=""
                />
              </div>

              {/* Branch field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center">
                  Branch <span className="text-red-500 ml-1 font-bold">*</span>
                </label>
                <input
                  type="text"
                  name="branch"
                  value={formData.branch}
                  onChange={handleInputChange}
                  className="w-full h-11 px-4 rounded-lg bg-white border border-slate-300 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm text-slate-800 transition-colors"
                  placeholder=""
                />
              </div>

              {/* Email field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center">
                  Email <span className="text-red-500 ml-1 font-bold">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full h-11 px-4 rounded-lg bg-white border border-slate-300 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm text-slate-800 transition-colors"
                  placeholder=""
                />
              </div>

              {/* College field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center">
                  College <span className="text-red-500 ml-1 font-bold">*</span>
                </label>
                <input
                  type="text"
                  name="college"
                  value={formData.college}
                  onChange={handleInputChange}
                  className="w-full h-11 px-4 rounded-lg bg-white border border-slate-300 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm text-slate-800 transition-colors"
                  placeholder=""
                />
              </div>

              {/* Phone field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center">
                  Phone <span className="text-red-500 ml-1 font-bold">*</span>
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full h-11 px-4 rounded-lg bg-white border border-slate-300 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm text-slate-800 transition-colors"
                  placeholder=""
                />
              </div>

              {/* Grid for percentages */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* 10th percentage */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center">
                    10th Percentage <span className="text-red-500 ml-1 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    name="tenthPercentage"
                    value={formData.tenthPercentage}
                    onChange={handleInputChange}
                    className="w-full h-11 px-4 rounded-lg bg-white border border-slate-300 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm text-slate-800 transition-colors"
                    placeholder=""
                  />
                </div>

                {/* 12th percentage */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center">
                    12th Percentage <span className="text-red-500 ml-1 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    name="twelfthPercentage"
                    value={formData.twelfthPercentage}
                    onChange={handleInputChange}
                    className="w-full h-11 px-4 rounded-lg bg-white border border-slate-300 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm text-slate-800 transition-colors"
                    placeholder=""
                  />
                </div>
              </div>

              {/* Grid for degrees */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* UG Degree */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center">
                    UG <span className="text-red-500 ml-1 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    name="ug"
                    value={formData.ug}
                    onChange={handleInputChange}
                    className="w-full h-11 px-4 rounded-lg bg-white border border-slate-300 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm text-slate-800 transition-colors"
                    placeholder=""
                  />
                </div>

                {/* PG Degree */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center">
                    PG
                  </label>
                  <input
                    type="text"
                    name="pg"
                    value={formData.pg}
                    onChange={handleInputChange}
                    className="w-full h-11 px-4 rounded-lg bg-white border border-slate-300 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm text-slate-800 transition-colors"
                    placeholder=""
                  />
                </div>
              </div>

              {/* Location field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center">
                  Location <span className="text-red-500 ml-1 font-bold">*</span>
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full h-11 px-4 rounded-lg bg-white border border-slate-300 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm text-slate-800 transition-colors"
                  placeholder=""
                />
              </div>

              {/* Internship dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center">
                  Internship <span className="text-red-500 ml-1 font-bold">*</span>
                </label>
                <div className="relative">
                  <select
                    name="internshipDomain"
                    value={formData.internshipDomain}
                    onChange={handleInputChange}
                    className="w-full h-11 pl-4 pr-10 rounded-lg bg-white border border-slate-300 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm text-slate-850 appearance-none cursor-pointer"
                  >
                    {DOMAINS.map(domainOption => (
                      <option key={domainOption} value={domainOption}>
                        {domainOption}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-500">
                    ▼
                  </div>
                </div>
              </div>

              {/* Internship Looking For(months) dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center">
                  Internship Looking For(months) <span className="text-red-500 ml-1 font-bold">*</span>
                </label>
                <div className="relative">
                  <select
                    name="internshipDuration"
                    value={formData.internshipDuration}
                    onChange={handleInputChange}
                    className="w-full h-11 pl-4 pr-10 rounded-lg bg-white border border-slate-300 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm text-slate-850 appearance-none cursor-pointer"
                  >
                    {DURATIONS.map(durOption => (
                      <option key={durOption} value={durOption}>
                        {durOption}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-500">
                    ▼
                  </div>
                </div>
              </div>

              {/* Click Here (Registration Fee Rs. 999/-) label link & input */}
              <div>
                <label className="block text-xs mb-1.5">
                  <span 
                    onClick={() => {
                      setFormError('');
                      setShowStripeModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-800 font-bold hover:underline cursor-pointer transition select-none inline-flex items-center gap-1"
                  >
                    Click Here (Registration Fee Rs. 999/-)
                  </span>
                  <span className="text-red-500 ml-1 font-bold">*</span>
                </label>
                <input
                  type="text"
                  name="paymentId"
                  value={formData.paymentId}
                  onChange={handleInputChange}
                  placeholder="Payment Id"
                  className="w-full h-11 px-4 rounded-lg bg-white border border-slate-300 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm text-slate-800 font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  💡 <em>Don't have a Payment Id? Click the Blue link above to test pay ₹999 securely via mock Stripe window!</em>
                </p>
              </div>

            </div>

            {/* Buttons Row exactly like layout: SUBMIT in green, RESET in orange/yellow */}
            <div className="pt-6 flex items-center justify-center gap-4">
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-36 h-11 rounded-md bg-[#28a745] hover:bg-[#218838] transition-all text-white font-extrabold uppercase text-xs tracking-wider shadow-sm flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-1">
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Filing...
                  </span>
                ) : (
                  'SUBMIT'
                )}
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="w-36 h-11 rounded-md bg-[#ffc107] hover:bg-[#e0a800] transition-all text-white font-extrabold uppercase text-xs tracking-wider shadow-sm"
              >
                RESET
              </button>

            </div>

          </form>

        </div>

      </div>

      {/* Pop-up Interactive Stripe Sandbox Sheet */}
      {showStripeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-100 shadow-2xl overflow-hidden text-left relative">
            
            {/* Header */}
            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="text-sm font-bold tracking-wider">STRIPE SECURE GATEWAY</h3>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Exposys Premium Sandbox</p>
                </div>
              </div>
              <button 
                onClick={() => setShowStripeModal(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-600">Total Registration Charge</span>
                <span className="text-lg font-black text-slate-900">₹999.00 <span className="text-xs font-normal text-slate-400">INR</span></span>
              </div>

              {/* Card Form */}
              <form onSubmit={handleSimulatePayment} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    disabled
                    className="w-full bg-slate-50 h-10 px-3 border border-slate-200 rounded-lg text-xs font-semibold text-slate-500 cursor-not-allowed uppercase"
                    value={formData.name || 'Student Candidate'}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Card Numbers
                  </label>
                  <div className="h-10 border border-slate-300 rounded-lg px-3 flex items-center justify-between bg-white focus-within:border-cyan-500">
                    <input
                      type="text"
                      className="bg-transparent focus:outline-none text-slate-700 text-xs tracking-wider w-full font-mono"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                    />
                    <span className="text-[8px] font-black tracking-tight text-cyan-600 bg-cyan-50 px-1.5 py-0.5 rounded uppercase">Stripe</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      className="w-full h-10 px-3 border border-slate-300 rounded-lg text-xs font-mono"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      CVC Pin
                    </label>
                    <input
                      type="password"
                      className="w-full h-10 px-3 border border-slate-300 rounded-lg text-xs font-mono"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                    />
                  </div>
                </div>

                <div className="bg-amber-50 rounded-lg p-3 border border-amber-100 text-[10px] text-amber-900 leading-relaxed">
                  🔒 <strong>Test Credentials Active:</strong> You can leave the default values intact to run a mock authorized billing loop securely. No real funds are moved.
                </div>

                <button
                  type="submit"
                  disabled={isProcessingPayment}
                  className="w-full h-11 bg-slate-900 hover:bg-slate-850 text-white font-bold text-xs tracking-wider rounded-lg transition duration-150 shadow-md flex items-center justify-center gap-2"
                >
                  {isProcessingPayment ? (
                    <span className="flex items-center gap-1">
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      AUTHORIZING ₹999...
                    </span>
                  ) : (
                    <span>AUTHORIZE & LOCK DEPOSIT</span>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
