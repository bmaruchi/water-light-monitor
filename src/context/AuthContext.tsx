
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  email: string;
  name: string | null;
}

interface AuthContextType {
  user: User | null;
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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Check if user is already logged in
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      // Simulate authentication delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes - in a real app, you would validate with a backend
      if (email === 'demo@example.com' && password === 'password') {
        const user = { id: '1', email, name: 'Demo User' };
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        toast({
          title: "Login bem-sucedido",
          description: "Bem-vindo de volta!"
        });
        navigate('/');
      } else {
        toast({
          variant: "destructive",
          title: "Falha no login",
          description: "Email ou senha incorretos"
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro no login",
        description: "Ocorreu um erro durante o login"
      });
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      // Simulate registration delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes - in a real app, you would register with a backend
      const user = { id: Date.now().toString(), email, name };
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      toast({
        title: "Registro bem-sucedido",
        description: "Sua conta foi criada"
      });
      navigate('/');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro no registro",
        description: "Ocorreu um erro durante o registro"
      });
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      // Simulate logout delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      localStorage.removeItem('user');
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
