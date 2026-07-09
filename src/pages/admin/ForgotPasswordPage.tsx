import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Loader2, ArrowLeft } from 'lucide-react';
import { doPasswordReset } from '@/lib/auth.services';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await doPasswordReset(email);
      toast({
        title: 'Email Sent',
        description: 'If an account exists with this email, you will receive a password reset link.',
      });
      navigate('/login');
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send reset email',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-background relative">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/login')}
        className="absolute top-8 left-8"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
      </Button>

      <div className="w-full max-w-md animate-fade-in bg-card border border-border p-8 rounded-xl shadow-lg">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <span className="font-serif text-2xl text-primary">SK</span>
          </div>
          <h2 className="font-serif text-3xl font-semibold text-foreground">
            Reset Password
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Enter your email address and we'll send you a link to reset your password.
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
          
          <Button
            type="submit"
            variant="gold"
            size="xl"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Sending...
              </>
            ) : (
              'Send Reset Link'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
