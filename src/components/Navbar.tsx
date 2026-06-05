'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  GraduationCap, 
  LayoutDashboard, 
  FileText, 
  Building2, 
  Map, 
  Calendar, 
  BookOpen, 
  MessageSquare, 
  User, 
  LogOut, 
  ShieldAlert,
  Menu,
  X,
  Search,
  HelpCircle,
  Briefcase
} from 'lucide-react';

interface UserSession {
  id: string;
  email: string;
  name: string;
  role: 'STUDENT' | 'ADMIN' | 'RECRUITER' | 'COLLEGE_ADMIN';
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  // Fetch session on load
  const fetchSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser({
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            role: data.user.role,
          });
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (e) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
    // Listen to custom event for login updates
    window.addEventListener('auth-change', fetchSession);
    return () => {
      window.removeEventListener('auth-change', fetchSession);
    };
  }, [pathname]);

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        setUser(null);
        router.push('/login');
        // Dispatch event
        window.dispatchEvent(new Event('auth-change'));
      }
    } catch (e) {
      console.error('Logout failed:', e);
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Tests', path: '/tests', icon: FileText },
    { name: 'Company Prep', path: '/company-hub', icon: Building2 },
    { name: 'PYQs', path: '/pyq', icon: HelpCircle },
    { name: 'Roadmaps', path: '/roadmaps', icon: Map },
    { name: 'Daily Practice', path: '/practice', icon: Calendar },
    { name: 'Revision Notes', path: '/notes', icon: BookOpen },
    { name: 'Experiences', path: '/interview-experiences', icon: MessageSquare },
    { name: 'Search', path: '/search', icon: Search },
  ];

  const isActive = (path: string) => pathname?.startsWith(path);

  if (loading) {
    return (
      <header className="w-full h-16 border-b border-slate-200 bg-white/95 backdrop-blur-md flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-8 w-8 text-indigo-650" />
          <span className="font-bold text-xl text-slate-900 tracking-tight">Placement<span className="text-indigo-650">Hub</span></span>
        </div>
        <div className="h-5 w-32 bg-slate-100 animate-pulse rounded"></div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="flex h-16 items-center justify-between px-6">
        
        {/* Logo */}
        <div className="flex items-center gap-6">
          <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2 group">
            <div className="p-1.5 bg-indigo-50 border border-indigo-100 rounded-lg group-hover:bg-indigo-100 transition">
              <GraduationCap className="h-6 w-6 text-indigo-600" />
            </div>
            <span className="font-bold text-xl text-slate-900 tracking-tight">
              Placement<span className="text-indigo-600">Hub</span>
            </span>
          </Link>
 
          {/* Desktop Nav Links */}
          {user && (
            <nav className="hidden xl:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                      active 
                        ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100/60' 
                        : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        {/* Right Area */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Admin Portal Button */}
              {user.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border transition ${
                    pathname?.startsWith('/admin')
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-950'
                  }`}
                >
                  <ShieldAlert className="h-4 w-4 text-amber-500" />
                  Admin Portal
                </Link>
              )}

              {/* Recruiter Portal Button */}
              {user.role === 'RECRUITER' && (
                <Link
                  href="/recruiter"
                  className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border transition ${
                    pathname?.startsWith('/recruiter')
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-150'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-950'
                  }`}
                >
                  <Briefcase className="h-4 w-4 text-indigo-650" />
                  Recruiter Portal
                </Link>
              )}

              {/* College Admin Portal Button */}
              {user.role === 'COLLEGE_ADMIN' && (
                <Link
                  href="/college-admin"
                  className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border transition ${
                    pathname?.startsWith('/college-admin')
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-150'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-950'
                  }`}
                >
                  <GraduationCap className="h-4 w-4 text-indigo-650" />
                  Campus Portal
                </Link>
              )}

              {/* User Menu */}
              <div className="flex items-center gap-2">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition border border-transparent hover:border-slate-200"
                >
                  <div className="h-6 w-6 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white uppercase">
                    {user.name.charAt(0)}
                  </div>
                  <span className="hidden sm:inline font-medium max-w-[120px] truncate text-slate-700">{user.name}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>

              {/* Mobile menu trigger */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="xl:hidden p-2 text-slate-500 hover:text-slate-950 hover:bg-slate-50 rounded-lg transition"
              >
                {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-950 transition"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition shadow-sm"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer (Only shown when user is logged in) */}
      {user && menuOpen && (
        <div className="xl:hidden border-t border-slate-200 bg-white px-4 py-3 flex flex-col gap-1.5 animate-in slide-in-from-top duration-200 shadow-lg">
          {user.role === 'ADMIN' && (
            <Link
              href="/admin"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-amber-700 bg-amber-50 border border-amber-200"
            >
              <ShieldAlert className="h-4 w-4 text-amber-500" />
              Admin Portal
            </Link>
          )}

          {user.role === 'RECRUITER' && (
            <Link
              href="/recruiter"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-indigo-700 bg-indigo-50 border border-indigo-150"
            >
              <Briefcase className="h-4 w-4 text-indigo-600" />
              Recruiter Portal
            </Link>
          )}

          {user.role === 'COLLEGE_ADMIN' && (
            <Link
              href="/college-admin"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-indigo-700 bg-indigo-50 border border-indigo-150"
            >
              <GraduationCap className="h-4 w-4 text-indigo-600" />
              Campus Portal
            </Link>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  active 
                    ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-150' 
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
