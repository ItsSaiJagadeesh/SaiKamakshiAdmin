import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { resetPassword } from '../services/firebaseAuth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const ResetPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    try {
      await resetPassword(email);
      setMessage('Password reset email sent. Please check your inbox.');
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="font-serif text-3xl font-semibold text-foreground">
            Reset Password
          </h2>
          <p className="text-muted-foreground mt-2">
            Enter your email to receive a password reset link
          </p>
        </div>
        {message && <p className="text-green-500 text-sm mb-4">{message}</p>}
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" variant="gold" size="xl" className="w-full">
            Send Reset Email
          </Button>
        </form>
        <div className="text-center mt-4">
          <p className="text-sm text-muted-foreground">
            Remembered your password?{' '}
            <a href="/login" className="text-primary hover:underline">
              Sign In
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;