import React, { useState } from 'react';
import api from '@/lib/api';
import { BRANDS } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  User as UserIcon, 
  Lock, 
  Eye, 
  EyeOff,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';

const LoginPage: React.FC = () => {
  const { loginUser } = useAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await api.post('/auth/login', { username, password });
      const { user, token } = response;
      
      localStorage.setItem('token', token);
      loginUser(user);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid username or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-[#FDFCFB] font-sans overflow-hidden">
      {/* Left Side - Promotional */}
      <div className="relative hidden md:flex flex-col items-center justify-center p-12 bg-[#F27D26] text-white">
        <div className="relative z-10 text-center max-w-md">
          {/* Logo Box */}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-40 h-40 bg-white/20 backdrop-blur-xl border-2 border-white/30 rounded-[3rem] flex items-center justify-center mx-auto mb-12 shadow-2xl"
          >
            <span className="text-4xl font-[900] tracking-tighter uppercase">Offers</span>
          </motion.div>

          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-5xl font-black tracking-tight leading-[1.1] mb-6"
          >
            Promotional Offers Management System
          </motion.h1>

          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-white/80 text-xl font-medium leading-relaxed mb-12"
          >
            A professional platform built to plan, publish, and track promotional offers across every brand in the group.
          </motion.p>

          {/* Brand Circles */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-2"
          >
            {BRANDS.slice(0, 5).map((brand, i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-[10px] font-black uppercase">
                {brand.charAt(0)}
              </div>
            ))}
            <div className="w-8 h-8 rounded-full bg-white text-[#F27D26] flex items-center justify-center text-[10px] font-black">
              +4
            </div>
            <span className="ml-2 text-sm font-semibold opacity-80">Managing 9 brands</span>
          </motion.div>
        </div>

        {/* Abstract background effects */}
        <div className="absolute top-0 left-0 w-full h-full">
           <div className="absolute top-[10%] left-[10%] w-64 h-64 bg-white/10 rounded-full blur-[100px]"></div>
           <div className="absolute bottom-[10%] right-[10%] w-80 h-80 bg-black/10 rounded-full blur-[120px]"></div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex items-center justify-center p-8 bg-white md:bg-transparent">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md space-y-12"
        >
          <div className="text-center md:text-left">
            <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-3">Sign in to Swish Offers</h2>
            <p className="text-gray-500 font-medium text-lg leading-relaxed">Enter your credentials to access your account</p>
          </div>

          {error && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-3 text-rose-700 text-sm font-semibold"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 pl-1">Username</Label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#F27D26] transition-colors">
                  <UserIcon className="w-5 h-5" />
                </div>
                <Input 
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-16 pl-12 bg-blue-50/50 border-none rounded-2xl text-lg font-semibold placeholder:text-gray-300 focus-visible:ring-2 focus-visible:ring-[#F27D26]/20 transition-all"
                  placeholder="admin"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 pl-1">Password</Label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#F27D26] transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <Input 
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-16 pl-12 pr-12 bg-blue-50/50 border-none rounded-2xl text-lg font-semibold placeholder:text-gray-300 focus-visible:ring-2 focus-visible:ring-[#F27D26]/20 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-16 bg-[#F27D26] hover:bg-[#D96C1E] text-white rounded-2xl text-lg font-black shadow-xl shadow-orange-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </Button>
          </form>

          <div className="pt-12 text-center">
            <p className="text-xs text-gray-400 font-bold tracking-widest uppercase mb-1">
              &copy; {new Date().getFullYear()} Swish Offers
            </p>
            <p className="text-[10px] text-gray-300 font-medium">All rights reserved</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
