import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthService } from '@byteevolvr/api-client';
import { useUserStore } from '@byteevolvr/store';
import { Button, Input, Card } from '@byteevolvr/ui';
import { Loader2 } from 'lucide-react';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setToken, setUser } = useUserStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { user, token } = await AuthService.login(email, password);
      setToken(token);
      setUser(user);
      navigate('/shop/dashboard');
    } catch (signInError: unknown) {
      const error = signInError as any;
      setError(error.customMessage || error.message || 'An unexpected error occurred');

      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-6 pt-32">
      <Card className="w-full max-w-md bg-[#070D1A] p-8 border border-white/10">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-bold text-white">Welcome Back</h1>
          <p className="mt-2 text-brand-muted">Sign in to your account</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-500/10 p-4 text-sm text-red-500 border border-red-500/20">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />
          <Button type="submit" variant="primary" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Sign In'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-brand-muted">
          Don't have an account?{' '}
          <Link to="/shop/signup" className="font-semibold text-accent hover:underline">
            Sign up
          </Link>
        </p>
      </Card>
    </div>
  );
}
