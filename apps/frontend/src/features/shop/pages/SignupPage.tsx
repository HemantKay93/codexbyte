import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button, Input, Card } from '@byteevolvr/ui';
import { Loader2 } from 'lucide-react';

export function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        }
      }
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
    } else {
      navigate('/shop/dashboard');
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-6 pt-32">
      <Card className="w-full max-w-md bg-[#070D1A] p-8 border border-white/10">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-bold text-white">Create Account</h1>
          <p className="mt-2 text-brand-muted">Join the ByteeVolvr Shop</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-500/10 p-4 text-sm text-red-500 border border-red-500/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-6">
          <Input
            label="Full Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="John Doe"
          />
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
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create Account'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-brand-muted">
          Already have an account?{' '}
          <Link to="/shop/login" className="font-semibold text-accent hover:underline">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
