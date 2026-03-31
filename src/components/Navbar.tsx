import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Menu, X, Github, Linkedin, Mail, LayoutDashboard, User as UserIcon, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import { auth, onAuthStateChanged, User, logout } from '../firebase';
import { toast } from 'sonner';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Projects', path: '/projects' },
  { name: 'Certificates', path: '/#certificates' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const isAdmin = user?.email === "nchorohesbon96@gmail.com";

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-display font-bold text-gradient">Nchoro TechHub</span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "px-4 py-2 text-sm font-medium transition-all rounded-full hover:bg-white/5",
                  location.pathname === link.path ? "text-brand-primary bg-white/5" : "text-gray-400 hover:text-white"
                )}
              >
                {link.name}
              </Link>
            ))}
            
            {isAdmin && (
              <Link
                to="/admin"
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all rounded-full hover:bg-white/5",
                  location.pathname === '/admin' ? "text-brand-primary bg-white/5" : "text-gray-400 hover:text-white"
                )}
              >
                <LayoutDashboard size={14} /> Dashboard
              </Link>
            )}

            {!user && (
              <Link
                to="/admin"
                className="text-sm font-medium text-gray-400 hover:text-brand-primary transition-colors"
              >
                Login
              </Link>
            )}

            {user && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-red-400 transition-colors"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            )}

            <div className="flex items-center space-x-4 border-l border-white/10 pl-8">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <Github size={20} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin size={20} />
              </a>
              {user && (
                <div className="flex items-center gap-2 pl-2 border-l border-white/10">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full border border-brand-primary" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                      <UserIcon size={16} className="text-gray-400" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-2">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full border border-brand-primary" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <UserIcon size={16} className="text-gray-400" />
                  </div>
                )}
              </div>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-400 hover:text-white p-2"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden glass border-b border-white/5"
        >
          <div className="px-2 pt-2 pb-6 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "block px-3 py-4 rounded-2xl text-base font-medium transition-colors",
                  location.pathname === link.path ? "text-brand-primary bg-white/5" : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                {link.name}
              </Link>
            ))}

            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-2 px-3 py-4 rounded-2xl text-base font-medium transition-colors",
                  location.pathname === '/admin' ? "text-brand-primary bg-white/5" : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                <LayoutDashboard size={18} /> Dashboard
              </Link>
            )}

            {!user && (
              <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-4 rounded-2xl text-base font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                Login
              </Link>
            )}

            {user && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-4 rounded-2xl text-base font-medium text-gray-400 hover:text-red-400 hover:bg-white/5 transition-colors"
              >
                <LogOut size={18} /> Logout
              </button>
            )}

            <div className="flex items-center space-x-6 px-3 pt-4 border-t border-white/10">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <Github size={24} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin size={24} />
              </a>
              <a href="mailto:nchorohesbon96@gmail.com" className="text-gray-400 hover:text-white transition-colors">
                <Mail size={24} />
              </a>
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  );
}
