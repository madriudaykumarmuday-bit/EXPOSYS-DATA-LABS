import { useState, FormEvent } from 'react';
import { CreditCard, CheckCircle2, ShieldAlert, BadgeCheck, HelpCircle } from 'lucide-react';
import { User, StripeSubscription } from '../types';

interface LandingHeroProps {
  currentUser: User | null;
  onNavigate: (view: string) => void;
  onQuickSignUpAndPay: (name: string, email: string, domain: string, subscription: StripeSubscription) => void;
  onOpenLogin: () => void;
}

const DOMAINS = [
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

export default function LandingHero({ currentUser, onNavigate, onQuickSignUpAndPay, onOpenLogin }: LandingHeroProps) {
  // Stripe form fields
  const [testName, setTestName] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [testDomain, setTestDomain] = useState('Data Science');
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardExpiry, setCardExpiry] = useState('12 / 28');
  const [cardCvc, setCardCvc] = useState('123');
  const [billingCycle, setBillingCycle] = useState<'month' | 'one-time'>('month');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [successPaid, setSuccessPaid] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleSimulatedStripePay = (e: FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (currentUser) {
      setValidationError('You are already logged in. Please use the "Apply Now" navigation tab to file an application from your existing student account.');
      return;
    }

    if (!testName.trim()) {
      setValidationError('Please specify your full name for enrollment.');
      return;
    }

    if (!testEmail.trim() || !testEmail.includes('@')) {
      setValidationError('Please input a valid email address.');
      return;
    }

    if (cardNumber.replace(/\s/g, '').length < 16) {
      setValidationError('Please enter a valid 16-digit credit card number.');
      return;
    }

    setIsProcessing(true);

    // Simulate Stripe payment pipeline latency
    setTimeout(() => {
      setIsProcessing(false);
      setSuccessPaid(true);

      const generatedSub: StripeSubscription = {
        id: `sub_stripe_${Math.random().toString(36).substr(2, 9)}`,
        status: 'active',
        planName: billingCycle === 'month' ? 'Professional Research Track (Recurring)' : 'Premium Fast-Track Onboarding',
        amount: billingCycle === 'month' ? 999 : 2499,
        currency: 'INR',
        interval: billingCycle,
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cardBrand: cardNumber.startsWith('4') ? 'visa' : 'mastercard',
        cardLast4: cardNumber.substring(cardNumber.length - 4),
        createdAt: new Date().toISOString()
      };

      onQuickSignUpAndPay(testName, testEmail, testDomain, generatedSub);
    }, 1800);
  };

  return (
    <div className="relative overflow-hidden flex-1 flex flex-col items-center">
      {/* Dynamic Visual Gradient Background Orbs */}
      <div className="blob w-[320px] h-[320px] bg-cyan-200 -top-10 -left-10 md:w-[450px] md:h-[450px]"></div>
      <div className="blob w-[350px] h-[350px] bg-purple-200 -bottom-20 -right-10 md:w-[500px] md:h-[500px]"></div>
      <div className="blob w-[250px] h-[250px] bg-emerald-100 top-1/2 left-1/3"></div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-12 py-12 md:py-20 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
        
        {/* Left Copy block */}
        <div className="w-full lg:w-7/12 space-y-6 md:space-y-8 text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-50 border border-cyan-100/70 text-cyan-800 text-xs font-bold uppercase tracking-widest select-none">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            December 2026 COHORT ACTIVE
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.08] tracking-tight text-slate-900">
            Experience, Explore <br/>
            & <span className="gradient-text animate-pulse">Evolve.</span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-slate-600 leading-relaxed max-w-xl">
            Join **Exposys Data Labs** and participate in engineering industry-certified tracks. Bridge your collegiate theory with scalable systems, live mentorship, and practical expertise.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <button 
              onClick={() => onNavigate('apply')}
              className="px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-indigo-600 font-bold text-white rounded-2xl shadow-lg hover:shadow-cyan-100 hover:scale-[1.01] transition-all"
            >
              Start Full Application
            </button>
            <button 
              onClick={() => {
                const formField = document.getElementById('enroll-form');
                if (formField) {
                  formField.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="px-6 py-3.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 transition-all shadow-sm"
            >
              Quick Subscribe Track
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-6 sm:gap-10 pt-6 border-t border-slate-200/50">
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black text-slate-800">50K+</span>
              <span className="text-[11px] sm:text-xs text-slate-500 font-semibold uppercase tracking-wider">Students Guided</span>
            </div>
            <div className="h-8 w-[1px] bg-slate-200"></div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black text-slate-800">10+</span>
              <span className="text-[11px] sm:text-xs text-slate-500 font-semibold uppercase tracking-wider">Research Domains</span>
            </div>
            <div className="h-8 w-[1px] bg-slate-200"></div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black text-slate-800">100%</span>
              <span className="text-[11px] sm:text-xs text-slate-500 font-semibold uppercase tracking-wider">Verified Creds</span>
            </div>
          </div>
        </div>

        {/* Right Stripe Simulated widget block */}
        <div id="enroll-form" className="w-full lg:w-5/12">
          <div className="glass-card rounded-[32px] p-6 sm:p-8 relative overflow-hidden border border-white/60 shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider mb-2">
                  Stripe Checkout Block
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-800">Professional Cohort</h3>
                <p className="text-xs text-slate-500 font-medium">Auto-creates student profile</p>
              </div>
              <div className="text-right">
                <div className="flex items-baseline justify-end gap-1">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 leading-none">
                    {billingCycle === 'month' ? '₹999' : '₹2,499'}
                  </span>
                </div>
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                  {billingCycle === 'month' ? 'per month charge' : 'one-time pay'}
                </span>
              </div>
            </div>

            {/* Toggle Billing Period Options */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl mb-6 select-none border border-slate-200/50">
              <button
                type="button"
                onClick={() => setBillingCycle('month')}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  billingCycle === 'month' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Monthly Plan (₹999)
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('one-time')}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  billingCycle === 'one-time' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Full Access (₹2,499)
              </button>
            </div>

            {successPaid ? (
              <div className="py-8 text-center sm:py-10 space-y-4">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-500 shadow-lg shadow-emerald-50 animate-bounce">
                  <BadgeCheck className="w-9 h-9" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-lg font-bold text-slate-800">Simulated Stripe Success!</h4>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                    Woohoo! We processed your card & generated user credentials. An authorization email has been dispatched. Log in or view your dashboard directly!
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setSuccessPaid(false);
                      setTestName('');
                      setTestEmail('');
                      onNavigate('dashboard');
                    }}
                    className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-md"
                  >
                    Enter Student Dashboard
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSimulatedStripePay} className="space-y-4 text-left">
                {validationError && (
                  <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-xs font-medium flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                    <span>{validationError}</span>
                  </div>
                )}

                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Rahul Sharma"
                    value={testName}
                    onChange={(e) => setTestName(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white/60 focus:outline-none focus:border-cyan-500 text-sm font-medium text-slate-800 transition-all"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="student@college.edu"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white/60 focus:outline-none focus:border-cyan-500 text-sm font-medium text-slate-800 transition-all"
                  />
                </div>

                {/* Domain selector preview */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Intern Domain
                    </label>
                    <select
                      value={testDomain}
                      onChange={(e) => setTestDomain(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-cyan-500 text-xs font-semibold text-slate-700 transition-all"
                    >
                      {DOMAINS.map((dom) => (
                        <option key={dom} value={dom}>{dom}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Stripe Test Mode
                    </label>
                    <div className="h-11 border border-amber-100 bg-amber-50/50 rounded-xl px-3 flex items-center gap-1.5 text-[10px] font-bold text-amber-800">
                      <CreditCard className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Simulated API</span>
                    </div>
                  </div>
                </div>

                {/* Credit Card simulated lines */}
                <div className="space-y-3 pt-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>Card details (Visa / Master)</span>
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400" title="Any 16 digits will work in mockup mode." />
                  </div>
                  
                  <div className="stripe-input rounded-xl h-12 flex items-center px-4 justify-between border border-slate-200/50 bg-white shadow-sm">
                    <div className="flex items-center gap-2 w-full">
                      <CreditCard className="w-4 h-4 text-cyan-600" />
                      <input
                        type="text"
                        placeholder="4242 4242 4242 4242"
                        className="bg-transparent focus:outline-none text-slate-700 placeholder-slate-400 text-sm tracking-wider w-full"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <div className="w-6 h-4 bg-indigo-100 rounded-[2px] text-[8px] font-extrabold text-indigo-700 flex items-center justify-center select-none" style={{ fontSize: '7px' }}>VISA</div>
                      <div className="w-6 h-4 bg-purple-100 rounded-[2px] text-[8px] font-extrabold text-purple-700 flex items-center justify-center select-none" style={{ fontSize: '7px' }}>MC</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="stripe-input rounded-xl h-12 flex items-center px-4 border border-slate-200/50 bg-white shadow-sm">
                      <input
                        type="text"
                        placeholder="MM / YY"
                        className="bg-transparent focus:outline-none text-slate-700 placeholder-slate-400 text-sm w-full"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                      />
                    </div>
                    <div className="stripe-input rounded-xl h-12 flex items-center px-4 border border-slate-200/50 bg-white shadow-sm">
                      <input
                        type="password"
                        placeholder="CVC"
                        maxLength={4}
                        className="bg-transparent focus:outline-none text-slate-700 placeholder-slate-400 text-sm w-full"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full h-13 btn-gradient text-white rounded-2xl font-extrabold text-sm shadow-xl shadow-cyan-100/50 mt-4 flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <span className="flex items-center gap-2 justify-center">
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Securing Stripe Merchant ID...
                      </span>
                    ) : (
                      <span>Complete Registration & Pay Securely</span>
                    )}
                  </button>
                </div>

                <div className="mt-4 flex items-center justify-center gap-2 select-none">
                  <svg className="w-3..5 h-3.5 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path>
                  </svg>
                  <span className="text-[10px] text-slate-400 font-bold tracking-wide">
                    SECURED BY <span className="font-extrabold text-slate-500 tracking-tighter">stripe</span>
                  </span>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
