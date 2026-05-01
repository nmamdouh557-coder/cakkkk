import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Tag, 
  LayoutDashboard, 
  Users, 
  LogOut, 
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import NotificationBell from './NotificationBell';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, isAdmin, logoutUser } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems = [
    { name: 'Offers', path: '/', icon: Tag },
    ...(isAdmin ? [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { name: 'Users', path: '/users', icon: Users },
    ] : []),
  ];

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#F27D26] rounded-lg flex items-center justify-center">
                <Tag className="text-white w-5 h-5 translate-y-[1px]" />
              </div>
              <span className="text-xl font-bold tracking-tight text-[#F27D26]">Swish Offers</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    location.pathname === item.path
                      ? 'bg-[#F27D26]/10 text-[#F27D26]'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <NotificationBell />
            {profile && (
              <div className="flex items-center gap-3 pr-4 border-r">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-gray-900 leading-none">{profile.displayName}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#F27D26] mt-1">
                    {profile.role}
                  </p>
                </div>
                <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.id}`} />
                  <AvatarFallback>{profile.displayName?.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => logoutUser()}
              className="text-gray-500 hover:text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-5 h-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed inset-0 z-30 bg-white pt-20 px-4"
          >
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`p-4 rounded-xl text-lg font-medium flex items-center gap-3 ${
                    location.pathname === item.path
                      ? 'bg-[#F27D26] text-white shadow-lg shadow-[#F27D26]/20'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="w-6 h-6" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        {children}
      </main>

      {/* Footer */}
      <footer className="py-6 border-t bg-gray-50 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Swish Offers. Professional Brand Management System.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
