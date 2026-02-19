 import { useState } from 'react';
 import { useNavigate, useLocation } from 'react-router-dom';
 import { motion } from 'framer-motion';
 import { Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';
 import { useAuth } from '@/contexts/AuthContext';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 
 export default function Login() {
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [showPassword, setShowPassword] = useState(false);
   const [error, setError] = useState('');
   const { login, isLoading } = useAuth();
   const navigate = useNavigate();
   const location = useLocation();
 
   const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     setError('');
 
     if (!email || !password) {
       setError('Please enter both email and password');
       return;
     }
 
     const success = await login(email, password);
     
     if (success) {
       navigate(from, { replace: true });
     } else {
       setError('Invalid credentials. Use admin@snigdhawomensworld.com / admin123');
     }
   };
 
   return (
     <div className="min-h-screen flex">
       {/* Left side - Branding */}
       <div className="hidden lg:flex lg:w-1/2 bg-gradient-gold relative overflow-hidden">
         <div className="absolute inset-0 bg-charcoal/20" />
         <div className="relative z-10 flex flex-col justify-center items-center w-full px-12 text-center">
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.6 }}
           >
             <h1 className="text-5xl font-serif font-bold text-primary-foreground mb-4">
               Snigdha
             </h1>
             <p className="text-xl text-primary-foreground/90 mb-2">Women's World</p>
             <div className="w-24 h-0.5 bg-primary-foreground/50 mx-auto my-6" />
             <p className="text-primary-foreground/80 text-lg font-light">
               Authentic Panchaloha Jewelry
             </p>
             <p className="text-primary-foreground/60 text-sm mt-4">
               Since 1975 • Sri Sai Kamakshi Panchaloham Metal Works
             </p>
           </motion.div>
         </div>
         {/* Decorative elements */}
         <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-charcoal/30 to-transparent" />
         <div className="absolute top-10 right-10 w-32 h-32 border border-primary-foreground/20 rounded-full" />
         <div className="absolute bottom-20 left-10 w-20 h-20 border border-primary-foreground/10 rounded-full" />
       </div>
 
       {/* Right side - Login form */}
       <div className="flex-1 flex items-center justify-center px-6 py-12 bg-background">
         <motion.div
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 0.5, delay: 0.2 }}
           className="w-full max-w-md"
         >
           {/* Mobile logo */}
           <div className="lg:hidden text-center mb-8">
             <h1 className="text-3xl font-serif font-bold text-gradient-gold">Snigdha</h1>
             <p className="text-muted-foreground">Women's World</p>
           </div>
 
           <div className="text-center mb-8">
             <h2 className="text-2xl font-serif font-semibold text-foreground">Admin Portal</h2>
             <p className="text-muted-foreground mt-2">Sign in to manage your store</p>
           </div>
 
           <form onSubmit={handleSubmit} className="space-y-6">
             {error && (
               <motion.div
                 initial={{ opacity: 0, y: -10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="flex items-center gap-2 p-4 rounded-lg bg-destructive/10 text-destructive border border-destructive/20"
               >
                 <AlertCircle className="h-4 w-4 shrink-0" />
                 <p className="text-sm">{error}</p>
               </motion.div>
             )}
 
             <div className="space-y-2">
               <Label htmlFor="email">Email Address</Label>
               <Input
                 id="email"
                 type="email"
                 placeholder="admin@snigdhawomensworld.com"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 className="h-12 bg-card border-border focus:border-primary focus:ring-primary"
                 disabled={isLoading}
               />
             </div>
 
             <div className="space-y-2">
               <Label htmlFor="password">Password</Label>
               <div className="relative">
                 <Input
                   id="password"
                   type={showPassword ? 'text' : 'password'}
                   placeholder="Enter your password"
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   className="h-12 pr-12 bg-card border-border focus:border-primary focus:ring-primary"
                   disabled={isLoading}
                 />
                 <button
                   type="button"
                   onClick={() => setShowPassword(!showPassword)}
                   className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                 >
                   {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                 </button>
               </div>
             </div>
 
             <div className="flex items-center justify-end">
               <button type="button" className="text-sm text-primary hover:underline">
                 Forgot password?
               </button>
             </div>
 
             <Button
               type="submit"
               className="w-full h-12 bg-gradient-gold hover:opacity-90 text-primary-foreground font-medium shadow-gold transition-all duration-200"
               disabled={isLoading}
             >
               {isLoading ? (
                 <>
                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                   Signing in...
                 </>
               ) : (
                 'Sign In'
               )}
             </Button>
           </form>
 
           <div className="mt-8 p-4 rounded-lg bg-muted/50 border border-border">
             <p className="text-xs text-muted-foreground text-center">
               <strong>Demo credentials:</strong><br />
               admin@snigdhawomensworld.com / admin123
             </p>
           </div>
 
           <p className="text-center text-xs text-muted-foreground mt-8">
             © 2025 Sri Sai Kamakshi Panchaloham Metal Works
           </p>
         </motion.div>
       </div>
     </div>
   );
 }