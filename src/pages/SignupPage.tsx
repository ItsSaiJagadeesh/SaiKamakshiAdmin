import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signUp } from '../services/firebaseAuth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const SignupPage: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      await signUp(formData.email, formData.password);
      navigate('/signin');
    } catch (err: any) {
      setError(err.message || 'Failed to sign up.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="font-serif text-3xl font-semibold text-foreground">
            Create an Account
          </h2>
          <p className="text-muted-foreground mt-2">
            Sign up to get started with Sai Kamakshi Admin
          </p>
        </div>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          <Button type="submit" variant="gold" size="xl" className="w-full">
            Sign Up
          </Button>
        </form>
        <div className="text-center mt-4">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <a href="/login" className="text-primary hover:underline">
              Sign In
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;