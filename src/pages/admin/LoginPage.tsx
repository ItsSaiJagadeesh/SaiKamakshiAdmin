import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, Loader2 } from 'lucide-react';
import { doSignInWithEmailAndPassWord } from '@/lib/auth.services';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await doSignInWithEmailAndPassWord(email, password);
      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.',
      });
      navigate('/');
    } catch (error) {
      toast({
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'Invalid credentials',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-sidebar relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sidebar via-sidebar to-sidebar-accent" />
        
        {/* Decorative Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 border border-sidebar-primary rounded-full" />
          <div className="absolute top-1/3 left-1/3 w-72 h-72 border border-sidebar-primary rounded-full" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 border border-sidebar-primary rounded-full" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-center">
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto rounded-full bg-sidebar-primary/20 flex items-center justify-center mb-6">
              <img src='/logo.jpeg' alt='Sai Kamakshi logo' className='w-20 h-20 rounded-full'/>
            </div>
            <h1 className="font-serif text-4xl font-semibold text-sidebar-foreground mb-4">
              Sai Kamakshi Jewellery
            </h1>
            <p className="text-sidebar-foreground/70 text-lg max-w-md">
              Crafting timeless beauty since 1975
            </p>
          </div>
          
          <div className="mt-12 text-sidebar-foreground/50 text-sm">
            <p>Admin Portal</p>
            <p className="mt-1">Sri Sai Kamakshi Panchaloham Metal Works</p>
          </div>
        </div>
      </div>
      
      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-10">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <span className="font-serif text-2xl text-primary">SK</span>
            </div>
            <h1 className="font-serif text-2xl font-semibold text-foreground">
              Sai Kamakshi Jewellery
            </h1>
          </div>
          
          <div className="text-center mb-8">
            <h2 className="font-serif text-3xl font-semibold text-foreground">
              Welcome Back
            </h2>
            <p className="text-muted-foreground mt-2">
              Sign in to access your admin dashboard
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@saikamakshi.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 input-luxury"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-12 input-luxury"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-sm font-medium text-primary hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            
            <Button
              type="submit"
              variant="gold"
              size="xl"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
          
        </div>
      </div>
    </div>
  );
}
