import React from 'react';

interface Company {
  id: string;
  name: string;
  logo: React.ReactNode;
}

const companies: Company[] = [
  {
    id: 'google',
    name: 'Google',
    logo: (
      <div className="flex items-center gap-1.5">
        <svg className="w-5 h-5 text-red-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.24 10.285V14.4h6.887c-.648 2.43-2.502 4.13-5.26 4.13-3.324 0-6.023-2.699-6.023-6.023 0-3.324 2.699-6.022 6.022-6.022 1.487 0 2.846.545 3.901 1.442l3.056-3.056C19.006 1.157 15.82 0 12.24 0 5.483 0 0 5.483 0 12.24s5.483 12.24 12.24 12.24c6.72 0 12.133-5.413 12.133-12.24 0-.825-.098-1.585-.278-2.316H12.24z" />
        </svg>
        <span className="font-extrabold text-slate-800 text-sm tracking-tight">Google</span>
      </div>
    )
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    logo: (
      <div className="flex items-center gap-2">
        <div className="grid grid-cols-2 gap-0.5 shrink-0 w-4 h-4">
          <div className="bg-[#F25022] w-1.5 h-1.5"></div>
          <div className="bg-[#7FBA00] w-1.5 h-1.5"></div>
          <div className="bg-[#00A4EF] w-1.5 h-1.5"></div>
          <div className="bg-[#FFB900] w-1.5 h-1.5"></div>
        </div>
        <span className="font-black text-slate-700 text-xs tracking-tight">Microsoft</span>
      </div>
    )
  },
  {
    id: 'amazon',
    name: 'Amazon',
    logo: (
      <div className="flex items-center gap-1">
        <span className="font-black text-slate-800 text-xs lowercase italic tracking-tighter">amazon</span>
        <svg className="w-3.5 h-3.5 text-amber-500 mt-1 shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21c-4.418 0-8-1.79-8-4a1 1 0 112 0c0 1.105 2.686 2 6 2s6-.895 6-2a1 1 0 112 0c0 2.21-3.582 4-8 4z" />
        </svg>
      </div>
    )
  },
  {
    id: 'accenture',
    name: 'Accenture',
    logo: (
      <span className="font-extrabold font-mono text-slate-800 hover:text-purple-600 transition-colors text-xs tracking-tighter">
        &gt; accenture
      </span>
    )
  },
  {
    id: 'intel',
    name: 'Intel',
    logo: (
      <span className="font-serif italic font-extrabold text-blue-600 tracking-widest text-sm">
        intel.
      </span>
    )
  },
  {
    id: 'cisco',
    name: 'Cisco',
    logo: (
      <div className="flex items-center gap-1.5">
        <svg className="w-5 h-4 text-sky-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 14v-4h1v4H3zm3 3V7h1v10H6zm3 1V5h1v13H9zm3 1V3h1v16h-1zm3-1V5h1v13h-1zm3-1V7h1v10h-1zm3-3v-4h1v4h-1z" />
        </svg>
        <span className="font-extrabold text-slate-700 text-[10px] tracking-wide uppercase">Cisco</span>
      </div>
    )
  },
  {
    id: 'oracle',
    name: 'Oracle',
    logo: (
      <span className="font-black font-sans uppercase tracking-widest text-[#F80000] text-xs">
        ORACLE
      </span>
    )
  },
  {
    id: 'tcs',
    name: 'TCS',
    logo: (
      <span className="font-bold font-sans text-slate-700 tracking-tight text-[11px]">
        TATA <span className="text-sky-600 font-black">CONSULTANCY</span>
      </span>
    )
  },
  {
    id: 'cognizant',
    name: 'Cognizant',
    logo: (
      <span className="font-bold tracking-tight text-indigo-950 text-xs">
        cognizant
      </span>
    )
  },
  {
    id: 'infosys',
    name: 'Infosys',
    logo: (
      <span className="font-extrabold text-sky-600 tracking-tight text-xs">
        Infosys
      </span>
    )
  },
  {
    id: 'wipro',
    name: 'Wipro',
    logo: (
      <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-blue-500 to-amber-500 text-[10px] tracking-wider uppercase">
        Wipro
      </span>
    )
  },
  {
    id: 'ibm',
    name: 'IBM',
    logo: (
      <div className="flex flex-col leading-none scale-90">
        <span className="font-black font-sans text-blue-600 text-[11px] tracking-widest uppercase border-y border-blue-600 py-0.5 px-1">
          IBM
        </span>
      </div>
    )
  }
];

// Duplicate the array so scrolling has absolutely seamless transitions without gaps
const repeatedLogoList = [...companies, ...companies, ...companies, ...companies];

export default function CompanyLogosTrain() {
  return (
    <div className="w-full bg-slate-50/80 border-y border-slate-200/60 py-4 overflow-hidden relative select-none">
      {/* Sleek edge shadow fades */}
      <div className="absolute top-0 left-0 w-16 sm:w-32 h-full bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-16 sm:w-32 h-full bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-6 mb-2 flex items-center">
        <span className="text-[10px] sm:text-xs font-black text-indigo-600 bg-indigo-50 border border-indigo-200/50 px-2 py-0.5 rounded-md uppercase tracking-wider">
          OUR CLIENTS
        </span>
      </div>

      <div className="relative flex items-center w-full">
        {/* Infinite CSS Train marquee container */}
        <div className="animate-marquee flex items-center gap-12 sm:gap-16 py-1.5">
          {repeatedLogoList.map((item, index) => (
            <div 
              key={`${item.id}-${index}`}
              className="flex items-center justify-center min-w-[120px] h-10 px-4 bg-white/70 hover:bg-white rounded-xl border border-slate-100/80 hover:border-indigo-200 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105"
              title={`${item.name} Placement Partner`}
            >
              {item.logo}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
