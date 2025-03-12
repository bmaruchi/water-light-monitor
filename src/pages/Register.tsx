
import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/context/AuthContext';
import { UserPlus, ArrowLeft } from 'lucide-react';
import { ThemeToggle } from "@/components/theme/ThemeToggle";

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { register, loading, user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (password !== confirmPassword) {
      setPasswordError('As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      setPasswordError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    await register(email, password, name);
  };

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Criar Conta</CardTitle>
          <CardDescription>
            Preencha os dados abaixo para criar sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input 
                id="name" 
                placeholder="Seu nome" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="seu.email@exemplo.com" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input 
                id="password" 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input 
                id="confirmPassword" 
                type="password" 
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {passwordError && (
                <p className="text-sm text-red-500">{passwordError}</p>
              )}
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? 'Criando conta...' : 'Criar conta'} <UserPlus className="ml-2 h-4 w-4" />
            </Button>
          </form>
          
          <div className="mt-4 text-center text-sm">
            <Link to="/login" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium flex items-center justify-center">
              <ArrowLeft className="mr-1 h-4 w-4" /> Voltar para o login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
