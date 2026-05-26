import { User } from '../types';
import { LogOut, LayoutDashboard, FileText, Compass, Briefcase, Award } from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  currentView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
  onOpenLogin: () => void;
}

export default function Navbar({ currentUser, currentView, onNavigate, onLogout, onOpenLogin }: NavbarProps) {
  return (
    <nav className="h-20 px-6 sm:px-12 flex items-center justify-between border-b border-slate-200/50 bg-white/40 backdrop-blur-md sticky top-0 z-40">
      <div 
        onClick={() => onNavigate('landing')} 
        className="flex items-center gap-3 cursor-pointer group select-none"
      >
        <div className="w-10 h-10 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform duration-200">
          <span className="text-white font-extrabold text-xl">E</span>
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold text-lg tracking-tight text-slate-800 leading-none">
            EXPOSYS
          </span>
          <span className="text-xs text-cyan-600 font-semibold tracking-wider">
            DATA LABS
          </span>
        </div>
      </div>

      {/* Nav Actions */}
      <div className="flex items-center gap-2 sm:gap-6">
        <button 
          onClick={() => onNavigate('landing')}
          className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
            currentView === 'landing' ? 'text-cyan-600 bg-cyan-50/70 font-bold' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
          }`}
        >
          Portal Summary
        </button>

        <button 
          onClick={() => onNavigate('apply')}
          className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
            currentView === 'apply' ? 'text-indigo-600 bg-indigo-50/70 font-bold' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
          }`}
        >
          Form & Fees
        </button>

        {currentUser ? (
          <div className="flex items-center gap-2 sm:gap-4 pl-2 border-l border-slate-200">
            {currentUser.role === 'admin' ? (
              <button
                onClick={() => onNavigate('admin')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  currentView === 'admin' ? 'text-purple-700 bg-purple-50' : 'text-purple-600 hover:bg-purple-50/50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden md:inline">Coordinator Console</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigate('dashboard')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  currentView === 'dashboard' ? 'text-blue-700 bg-blue-50' : 'text-blue-600 hover:bg-blue-50/50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden md:inline">Student Area</span>
              </button>
            )}

            <div className="hidden lg:flex flex-col text-right">
              <span className="text-xs font-bold text-slate-800 leading-tight block truncate max-w-[120px]">
                {currentUser.name}
              </span>
              <span className="text-[10px] text-slate-400 capitalize font-medium">
                {currentUser.role} Account
              </span>
            </div>

            <button 
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
              title="Logout session"
            >
              <LogOut className="w-4 h-4 sm:w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 sm:gap-3">
            <button 
              onClick={() => onNavigate('apply')}
              className="px-4 py-2 rounded-xl btn-gradient text-white text-xs sm:text-sm font-semibold shadow-md shrink-0"
            >
              Register Track
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
