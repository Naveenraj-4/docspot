import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { UserRole, User } from '../types';
import { 
  Stethoscope, 
  LogOut, 
  LayoutDashboard, 
  Menu, 
  X,
  Sun,
  Moon,
  User as UserIcon,
  AlertTriangle,
  Zap
} from 'lucide-react';
import clsx from 'clsx';
import { mockDb } from '../services/mockDb';
import { GlobalAIChat } from './GlobalAIChat';
import { IncomingCallOverlay } from './IncomingCallOverlay';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  setUser: (u: User | null) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, setUser }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Hide footer on chat page for immersive feel
  const isChatPage = location.pathname.startsWith('/chat/');
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Scroll listener for Dynamic Dock
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const confirmLogout = () => {
    mockDb.logout();
    setUser(null);
    setShowLogoutConfirm(false);
    navigate('/login');
  };

  const navLinks = [
    { 
      name: 'Dashboard', 
      path: user?.role === UserRole.DOCTOR ? '/doctor-dashboard' : user?.role === UserRole.ADMIN ? '/admin-dashboard' : '/patient-dashboard',
      roles: [UserRole.PATIENT, UserRole.DOCTOR, UserRole.ADMIN],
      icon: LayoutDashboard 
    },
    { 
      name: 'Find Doctors', 
      path: '/book', 
      roles: [UserRole.PATIENT],
      icon: Stethoscope 
    },
  ];

  const canShowLink = (roles: string[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-900 dark:text-slate-100 selection:bg-emerald-500/30">
      
      {/* Aurora Background Effect */}
      <div className="aurora-bg"></div>

      {/* Floating Dynamic Navbar */}
      <nav className={clsx(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] px-4 sm:px-6 lg:px-8 flex justify-center",
          scrolled ? "pt-4" : "pt-0"
      )}>
        <div className={clsx(
           "w-full max-w-7xl transition-all duration-500 backdrop-blur-2xl flex items-center justify-between",
           scrolled 
            ? "bg-white/70 dark:bg-black/60 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/20 dark:border-white/5 py-3 px-6" 
            : "bg-transparent border-b border-transparent py-5 px-0"
        )}>
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center gap-3 group">
                <div className="relative">
                    <div className="absolute inset-0 bg-emerald-500 rounded-xl blur opacity-40 group-hover:opacity-60 transition-opacity"></div>
                    <div className="relative bg-gradient-to-tr from-emerald-500 to-teal-400 p-2 rounded-xl shadow-lg">
                        <Stethoscope className="h-5 w-5 text-white" />
                    </div>
                </div>
                <span className={clsx(
                    "font-bold text-xl tracking-tight transition-colors",
                    scrolled ? "text-slate-800 dark:text-white" : "text-slate-900 dark:text-white"
                )}>DocSpot</span>
              </Link>

              {/* Desktop Links */}
              <div className="hidden md:ml-12 md:flex md:space-x-1">
                {navLinks.filter(l => canShowLink(l.roles)).map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={clsx(
                      "inline-flex items-center px-4 py-2 text-sm font-semibold rounded-full transition-all duration-300 relative group",
                      location.pathname === link.path 
                        ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-500/10" 
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    )}
                  >
                    {link.name}
                    {location.pathname === link.path && (
                        <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-500 rounded-full"></span>
                    )}
                  </Link>
                ))}
              </div>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className="p-2.5 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-all active:scale-95"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {user ? (
                <div className="flex items-center gap-4 pl-4 border-l border-slate-200 dark:border-white/10">
                   <div className="flex items-center gap-3 group cursor-default">
                     <div className="text-right hidden lg:block">
                        <p className="text-sm font-bold leading-none">{user.name}</p>
                        <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-1">{user.role}</p>
                     </div>
                     <div className="relative">
                         <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full blur opacity-0 group-hover:opacity-50 transition-opacity"></div>
                         <img src={user.avatar} className="relative w-10 h-10 rounded-full border-2 border-white dark:border-slate-800 object-cover" />
                     </div>
                   </div>
                   <button 
                     onClick={() => setShowLogoutConfirm(true)}
                     className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all active:scale-90"
                   >
                     <LogOut className="w-5 h-5" />
                   </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link 
                    to="/login"
                    className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-bold text-sm px-4"
                  >
                    Log In
                  </Link>
                  <Link 
                    to="/signup"
                    className="relative group px-6 py-2.5 rounded-full overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-slate-900 dark:bg-white transition-all group-hover:scale-105"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-20 transition-opacity"></div>
                    <span className="relative text-white dark:text-slate-900 text-sm font-bold flex items-center gap-2">
                        Get Started <Zap className="w-3 h-3 fill-current" />
                    </span>
                  </Link>
                </div>
              )}
            </div>

            <div className="flex items-center md:hidden gap-3">
              <button onClick={() => setDarkMode(!darkMode)} className="p-2 text-slate-500 dark:text-slate-400">
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 text-slate-900 dark:text-white bg-slate-100 dark:bg-white/10 rounded-xl"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
        </div>
      </nav>

      {/* Full Screen Mobile Menu */}
      <div className={clsx(
          "fixed inset-0 z-[60] bg-white/95 dark:bg-black/95 backdrop-blur-3xl transition-all duration-500 flex flex-col justify-center items-center",
          isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )}>
          <button onClick={() => setIsMobileMenuOpen(false)} className="absolute top-8 right-8 p-3 bg-slate-100 dark:bg-white/10 rounded-full">
              <X className="w-6 h-6" />
          </button>

          <div className="flex flex-col gap-6 text-center">
              {navLinks.filter(l => canShowLink(l.roles)).map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className="text-3xl font-bold text-slate-900 dark:text-white hover:text-emerald-500 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
              ))}
              <div className="w-12 h-1 bg-slate-200 dark:bg-white/10 mx-auto my-4 rounded-full"></div>
              {!user ? (
                 <>
                   <Link to="/login" className="text-xl font-medium text-slate-500" onClick={() => setIsMobileMenuOpen(false)}>Sign In</Link>
                   <Link to="/signup" className="text-xl font-bold text-emerald-500" onClick={() => setIsMobileMenuOpen(false)}>Create Account</Link>
                 </>
              ) : (
                <button onClick={() => { setShowLogoutConfirm(true); setIsMobileMenuOpen(false); }} className="text-xl font-bold text-red-500">
                  Log Out
                </button>
              )}
          </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in p-4">
          <div className="bg-white dark:bg-[#0A0A0A] p-8 rounded-[2rem] shadow-2xl max-w-sm w-full border border-white/20 dark:border-white/5 animate-scale-in">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6">
                 <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Sign Out?</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">Are you sure you want to end your session securely?</p>
              
              <div className="flex gap-4 w-full">
                <button 
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-3.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmLogout}
                  className="flex-1 py-3.5 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Apps */}
      {user && !isAuthPage && <GlobalAIChat user={user} />}
      {user && !isAuthPage && <IncomingCallOverlay currentUser={user} />}

      {/* Main Content Area */}
      <main className={clsx("flex-grow relative", isChatPage ? "pt-20 h-screen" : "pt-24 pb-12")}>
        <div className={clsx("max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", isChatPage ? "h-full" : "")}>
          {children}
        </div>
      </main>

      {!isChatPage && (
        <footer className="border-t border-slate-200 dark:border-white/5 bg-white/50 dark:bg-black/50 backdrop-blur-xl py-12 mt-auto">
            <div className="max-w-7xl mx-auto px-4 text-center">
                <div className="flex justify-center items-center gap-2 mb-6">
                    <div className="p-2 bg-emerald-500/10 rounded-lg">
                        <Stethoscope className="w-5 h-5 text-emerald-500" />
                    </div>
                    <span className="font-bold text-lg text-slate-800 dark:text-white">DocSpot</span>
                </div>
                <div className="flex justify-center gap-8 mb-8 text-sm text-slate-500 dark:text-slate-400 font-medium">
                    <a href="#" className="hover:text-emerald-500 transition-colors">Privacy</a>
                    <a href="#" className="hover:text-emerald-500 transition-colors">Terms</a>
                    <a href="#" className="hover:text-emerald-500 transition-colors">Support</a>
                </div>
                <p className="text-slate-400 dark:text-slate-600 text-sm">
                    © {new Date().getFullYear()} DocSpot Health Inc. 
                    <span className="block sm:inline mt-2 sm:mt-0 opacity-70">
                        <span className="hidden sm:inline mx-3">•</span>
                        Engineered by <span className="font-bold text-slate-900 dark:text-white">ALEX</span>
                    </span>
                </p>
            </div>
        </footer>
      )}
    </div>
  );
};