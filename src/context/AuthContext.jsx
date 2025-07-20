import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../lib/supabase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const storedUser = localStorage.getItem('loanpro_user');
    const storedUserData = localStorage.getItem('loanpro_userData');
    
    if (storedUser && storedUserData) {
      try {
        setUser(JSON.parse(storedUser));
        setUserData(JSON.parse(storedUserData));
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('loanpro_user');
        localStorage.removeItem('loanpro_userData');
      }
    }
    
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      console.log('Attempting login with email:', email);
      
      // Check if user exists in our custom table
      const { data, error } = await supabase
        .from('users_admin_x94d2')
        .select('*')
        .ilike('email', email.trim())
        .single();

      console.log('Database response:', { data, error });

      if (error || !data) {
        console.error('User not found:', error);
        throw new Error('Invalid email or password. Please check your credentials.');
      }

      // Check password
      if (data.password !== password) {
        console.error('Password mismatch');
        throw new Error('Invalid email or password. Please check your credentials.');
      }

      // Create user session
      const userSession = { 
        id: data.id, 
        email: data.email,
        user_metadata: { username: data.username }
      };

      // Store in state and localStorage
      setUser(userSession);
      setUserData(data);
      
      localStorage.setItem('loanpro_user', JSON.stringify(userSession));
      localStorage.setItem('loanpro_userData', JSON.stringify(data));

      console.log('Login successful:', data);
      return { success: true, data };
      
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      setUserData(null);
      localStorage.removeItem('loanpro_user');
      localStorage.removeItem('loanpro_userData');
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error.message);
    }
  };

  const isAdmin = () => {
    return userData?.role === 'admin';
  };

  const value = {
    user,
    userData,
    loading,
    login,
    logout,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}