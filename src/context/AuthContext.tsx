
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AuthError, Session, User } from '@supabase/supabase-js';

interface UserData {
  id: string;
  email: string;
  name: string | null;
}

interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Function to transform Supabase User to our UserData format
  const getUserData = async (user: User): Promise<UserData> => {
    // Fetch the user's profile data
    const { data, error } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', user.id)
      .single();
    
    if (error) {
      console.error('Error fetching user profile:', error);
    }

    return {
      id: user.id,
      email: user.email || '',
      name: data?.name || null
    };
  };

  // Handle auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setLoading(true);
        if (session?.user) {
          const userData = await getUserData(session.user);
          setUser(userData);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    // Check for initial session
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const userData = await getUserData(session.user);
        setUser(userData);
      }
      setLoading(false);
    };

    checkUser();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleAuthError = (error: AuthError) => {
    let message = 'Ocorreu um erro durante a autenticação';
    
    // Handle common auth errors
    if (error.message.includes('Email not confirmed')) {
      message = 'Por favor, confirme seu email antes de fazer login';
    } else if (error.message.includes('Invalid login credentials')) {
      message = 'Email ou senha incorretos';
    } else if (error.message.includes('Email already registered')) {
      message = 'Este email já está registrado';
    } else if (error.message.includes('Password should be at least 6 characters')) {
      message = 'A senha deve ter pelo menos 6 caracteres';
    }
    
    toast({
      variant: "destructive",
      title: "Erro na autenticação",
      description: message
    });
    
    console.error('Auth error:', error);
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      if (data?.user) {
        const userData = await getUserData(data.user);
        setUser(userData);
        toast({
          title: "Login bem-sucedido",
          description: "Bem-vindo de volta!"
        });
        navigate('/');
      }
    } catch (error) {
      handleAuthError(error as AuthError);
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      
      // Sign up the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      });
      
      if (error) throw error;
      
      // If user is created successfully
      if (data?.user) {
        toast({
          title: "Registro bem-sucedido",
          description: "Sua conta foi criada. Verifique seu email para confirmar seu registro."
        });
        
        // Check if email confirmation is required
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // If auto-confirmed, perform login
          const userData = await getUserData(data.user);
          setUser(userData);
          navigate('/');
        } else {
          // If confirmation is required
          navigate('/login');
        }
      }
    } catch (error) {
      handleAuthError(error as AuthError);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      setUser(null);
      toast({
        title: "Logout realizado",
        description: "Você saiu da sua conta"
      });
      navigate('/login');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao sair",
        description: "Ocorreu um erro durante o logout"
      });
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
