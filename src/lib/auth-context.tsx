import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from './types';

interface AuthContextType {
  user: User | null;
  profile: User | null;
  loading: boolean;
  isAdmin: boolean;
  isEmployee: boolean;
  loginUser: (user: User) => void;
  logoutUser: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  isEmployee: false,
  loginUser: () => {},
  logoutUser: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for saved session
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (savedUser && token) {
      try {
        const user = JSON.parse(savedUser);
        setProfile(user);
      } catch (e) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const loginUser = (user: User) => {
    setProfile(user);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const logoutUser = () => {
    setProfile(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const isAdmin = profile?.role === 'admin';
  const isEmployee = profile?.role === 'employee' || profile?.role === 'admin';

  return (
    <AuthContext.Provider value={{ 
      user: profile, 
      profile, 
      loading, 
      isAdmin, 
      isEmployee, 
      loginUser, 
      logoutUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
